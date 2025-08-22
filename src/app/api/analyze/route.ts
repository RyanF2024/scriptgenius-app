import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { AIService } from '@/lib/ai';
import { ScriptChunker } from '@/lib/ai/utils/chunking';
import { PromptManager } from '@/lib/ai/prompts';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { createClient } from '@supabase/supabase-js';

// Initialize rate limiter (5 requests per minute per user)
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  analytics: true,
});

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check rate limit
    const identifier = session.user.email;
    const { success } = await ratelimit.limit(identifier);
    if (!success) {
      return new NextResponse('Too many requests', { status: 429 });
    }

    // Parse request body
    const { script, reportType, persona, title, genre } = await req.json();
    
    if (!script || !reportType) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Check user's subscription status
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('subscription_status, credits')
      .eq('id', session.user.id)
      .single();

    if (error || !profile) {
      return new NextResponse('User profile not found', { status: 404 });
    }

    // Check if user has active subscription or enough credits
    const hasActiveSubscription = profile.subscription_status === 'active';
    const hasEnoughCredits = profile.credits > 0;
    
    if (!hasActiveSubscription && !hasEnoughCredits) {
      return new NextResponse('Insufficient credits or inactive subscription', { status: 402 });
    }

    // Initialize AI service and chunker
    const aiService = AIService.getInstance();
    const chunker = new ScriptChunker();
    
    // Chunk the script if needed
    const chunks = chunker.chunkText(script);
    let fullAnalysis = '';
    
    // Process each chunk
    for (const [index, chunk] of chunks.entries()) {
      const messages = PromptManager.prepareMessages(
        chunk,
        reportType,
        persona || 'general',
        { title, genre, chunk: `${index + 1}/${chunks.length}` }
      );

      const response = await aiService.generateText({
        messages,
        modelConfig: {
          provider: 'openai', // Default to OpenAI, can be made configurable
          model: 'gpt-4',
          temperature: 0.7,
          maxTokens: 2000,
        },
      });

      fullAnalysis += response.content + '\n\n';
    }

    // Deduct credit if not on subscription
    if (!hasActiveSubscription) {
      await supabaseAdmin.rpc('decrement_credits', {
        user_id: session.user.id,
        amount: 1,
      });
    }

    // Log the analysis
    await supabaseAdmin.from('analyses').insert({
      user_id: session.user.id,
      script_title: title || 'Untitled',
      report_type: reportType,
      persona: persona || 'general',
      content: fullAnalysis,
      credits_used: hasActiveSubscription ? 0 : 1,
    });

    return NextResponse.json({ analysis: fullAnalysis });
    
  } catch (error) {
    console.error('Analysis error:', error);
    return new NextResponse(
      error.message || 'Internal Server Error',
      { status: 500 }
    );
  }
}
