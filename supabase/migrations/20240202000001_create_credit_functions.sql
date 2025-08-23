-- Function to safely add credits to a user's balance
CREATE OR REPLACE FUNCTION add_user_credits(
  p_user_id UUID,
  p_amount INTEGER
) 
RETURNS TABLE (user_id UUID, balance INTEGER) 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  -- Insert or update the user's credit balance
  INSERT INTO user_credits (user_id, balance)
  VALUES (p_user_id, p_amount)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    balance = user_credits.balance + EXCLUDED.balance,
    last_updated = NOW()
  RETURNING user_credits.user_id, user_credits.balance;
  
  RETURN QUERY 
  SELECT user_id, balance 
  FROM user_credits 
  WHERE user_id = p_user_id;
END;
$$;

-- Function to safely use credits from a user's balance
CREATE OR REPLACE FUNCTION use_user_credits(
  p_user_id UUID,
  p_amount INTEGER
)
RETURNS TABLE (user_id UUID, balance INTEGER, success BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  -- Get current balance
  SELECT balance INTO current_balance
  FROM user_credits
  WHERE user_id = p_user_id
  FOR UPDATE; -- Lock the row for update
  
  -- Check if user has enough credits
  IF current_balance IS NULL OR current_balance < p_amount THEN
    -- Not enough credits, return current balance and failure status
    RETURN QUERY
    SELECT 
      p_user_id as user_id,
      COALESCE(current_balance, 0) as balance,
      false as success;
  ELSE
    -- Deduct credits and update balance
    UPDATE user_credits
    SET 
      balance = balance - p_amount,
      last_updated = NOW()
    WHERE user_id = p_user_id
    RETURNING user_id, balance, true as success
    INTO user_id, balance, success;
    
    RETURN NEXT;
  END IF;
END;
$$;

-- Function to get user's credit balance with lock
CREATE OR REPLACE FUNCTION get_user_credits(
  p_user_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance INTEGER;
BEGIN
  -- Get current balance with lock
  SELECT balance INTO v_balance
  FROM user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;
  
  -- If no record exists, create one with 0 balance
  IF v_balance IS NULL THEN
    INSERT INTO user_credits (user_id, balance)
    VALUES (p_user_id, 0)
    RETURNING balance INTO v_balance;
  END IF;
  
  RETURN v_balance;
END;
$$;

-- Function to check if user can perform an action based on credits
CREATE OR REPLACE FUNCTION can_perform_action(
  p_user_id UUID,
  p_required_credits INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_balance INTEGER;
BEGIN
  -- Get current balance with lock
  SELECT balance INTO v_balance
  FROM user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;
  
  -- If no record exists, create one with 0 balance
  IF v_balance IS NULL THEN
    INSERT INTO user_credits (user_id, balance)
    VALUES (p_user_id, 0)
    RETURNING balance INTO v_balance;
  END IF;
  
  -- Check if user has enough credits
  RETURN v_balance >= p_required_credits;
END;
$$;
