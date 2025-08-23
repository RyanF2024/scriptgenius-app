#!/bin/bash

# Test script for ScriptGenius billing API endpoints
# Make sure to run this from the project root directory

# Source environment variables
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

# Check if required environment variables are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "Error: Required environment variables not found. Make sure to set up your .env.local file."
  exit 1
fi

# Create a test user
create_test_user() {
  echo "Creating test user..."
  USER_EMAIL="test-$(date +%s)@example.com"
  PASSWORD="test-password-123"
  
  # Create user using Supabase Auth Admin API
  USER_JSON=$(curl -s -X POST "$NEXT_PUBLIC_SUPABASE_URL/auth/v1/admin/users" \
    -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"$USER_EMAIL\",
      \"password\": \"$PASSWORD\",
      \"email_confirm\": true
    }")
  
  USER_ID=$(echo $USER_JSON | jq -r '.id')
  
  if [ -z "$USER_ID" ] || [ "$USER_ID" = "null" ]; then
    echo "Error creating test user:"
    echo $USER_JSON | jq .
    exit 1
  fi
  
  echo "Created test user: $USER_EMAIL"
  
  # Get auth token
  AUTH_JSON=$(curl -s -X POST "$NEXT_PUBLIC_SUPABASE_URL/auth/v1/token?grant_type=password" \
    -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"$USER_EMAIL\",
      \"password\": \"$PASSWORD\"
    }")
  
  ACCESS_TOKEN=$(echo $AUTH_JSON | jq -r '.access_token')
  
  if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" = "null" ]; then
    echo "Error getting access token:"
    echo $AUTH_JSON | jq .
    exit 1
  fi
  
  echo "Obtained access token"
  
  # Set the access token for subsequent requests
  export ACCESS_TOKEN
  export USER_ID
}

# Test API endpoints
test_payment_methods() {
  echo "\nTesting payment methods API..."
  
  # Test getting payment methods
  echo "\nGET /api/billing/payment-methods"
  curl -s -X GET "http://localhost:3000/api/billing/payment-methods" \
    -H "Authorization: Bearer $ACCESS_TOKEN" | jq .
  
  # Test creating a setup intent
  echo "\nPOST /api/billing/payment-methods"
  curl -s -X POST "http://localhost:3000/api/billing/payment-methods" \
    -H "Authorization: Bearer $ACCESS_TOKEN" | jq .
}

test_invoices() {
  echo "\nTesting invoices API..."
  
  # Test getting invoices
  echo "\nGET /api/billing/invoices"
  curl -s -X GET "http://localhost:3000/api/billing/invoices" \
    -H "Authorization: Bearer $ACCESS_TOKEN" | jq .
}

test_subscription() {
  echo "\nTesting subscription API..."
  
  # Test getting subscription status
  echo "\nGET /api/billing/subscription"
  curl -s -X GET "http://localhost:3000/api/billing/subscription" \
    -H "Authorization: Bearer $ACCESS_TOKEN" | jq .
}

# Main test function
main() {
  # Create a test user and get auth token
  create_test_user
  
  # Test API endpoints
  test_payment_methods
  test_invoices
  test_subscription
  
  echo "\nTests completed!"
}

# Run the tests
main
