import { AIService } from '../src/lib/ai';
import { PromptManager } from '../src/lib/ai/prompts';

async function testAIIntegration() {
  try {
    console.log('🚀 Testing AI Integration...');
    
    // Initialize AI Service
    const aiService = AIService.getInstance();
    console.log('✅ AI Service initialized');
    
    // Test OpenAI
    console.log('\n🔍 Testing OpenAI...');
    const openaiResponse = await aiService.generateText({
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say "Hello, ScriptGenius!"' },
      ],
      modelConfig: {
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxTokens: 50,
      },
    });
    console.log('✅ OpenAI Response:', JSON.stringify(openaiResponse, null, 2));

    // Test Prompt Manager
    console.log('\n📝 Testing Prompt Manager...');
    const prompt = PromptManager.prepareMessages(
      'This is a test script.',
      'coverage',
      'general',
      { title: 'Test Script', genre: 'Drama' }
    );
    console.log('✅ Prompt generated:', JSON.stringify(prompt, null, 2));
    
    console.log('\n🎉 AI Integration Test Completed Successfully!');
    
  } catch (error) {
    console.error('❌ Error testing AI integration:');
    console.error(error);
    process.exit(1);
  }
}

testAIIntegration();
