import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ScriptAnalyzer } from '@/lib/script/analysis';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { createClient } from '@supabase/supabase/ssr';
import { ScriptAnalysisOptions } from '@/lib/ai/types/analysis';

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
    const { script, reportType, persona, title, genre, targetAudience, options } = await req.json();
    
    if (!script) {
      return new NextResponse('Script content is required', { status: 400 });
    }
    
    // Set analysis options
    const analysisOptions: ScriptAnalysisOptions = {
      analyzeStructure: true,
      analyzeDialogue: true,
      analyzeCharacters: true,
      analyzeSentiment: true,
      checkFormatting: true,
      genre,
      targetAudience,
      ...options
    };

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

    try {
      // Initialize script analyzer
      const analyzer = new ScriptAnalyzer(script);
      
      // Perform analysis
      const analysisResult = await analyzer.analyze(analysisOptions);
      
      // If report type is specified, generate a more detailed report using AI
      if (reportType) {
        const aiService = AIService.getInstance();
        const prompt = `Generate a ${reportType} report for the following script analysis:
        
Script Title: ${title || 'Untitled'}
Genre: ${genre || 'Not specified'}
Target Audience: ${targetAudience || 'General'}

Analysis Summary:
${JSON.stringify(analysisResult.metrics, null, 2)}

Please provide a detailed ${reportType} report focusing on ${persona || 'general'} perspective.`;

        const response = await aiService.generateText({
          messages: [
            {
              role: 'system',
              content: 'You are a professional script analyst. Provide a detailed report based on the script analysis.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          modelConfig: {
            provider: 'openai',
            model: 'gpt-4',
            temperature: 0.7,
            maxTokens: 2000,
          },
        });

        // Combine analysis with AI-generated report
        analysisResult.summary = response.content;
      }

    // Deduct credit if not on subscription
    if (!hasActiveSubscription) {
      const { error: creditError } = await supabaseAdmin.rpc('decrement_credits', {
        user_id: session.user.id,
        amount: 1,
      });
      
      if (creditError) {
        console.error('Error deducting credits:', creditError);
        // Continue with the response even if credit deduction fails
        // Log this for admin review
      }
    }

    // Log the analysis
    await supabaseAdmin.from('analyses').insert({
      user_id: session.user.id,
      script_title: title || 'Untitled',
      report_type: reportType,
      persona: persona || 'general',
      content: analysisResult,
      credits_used: hasActiveSubscription ? 0 : 1,
    });

    return NextResponse.json(analysisResult);
    
  } catch (error: any) {
    console.error('Analysis error:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to analyze script',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } 
}
