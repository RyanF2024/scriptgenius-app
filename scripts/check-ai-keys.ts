console.log('🔍 Checking AI Environment Variables...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Not set');
console.log('ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? '✅ Set' : '❌ Not set');
console.log('GOOGLE_AI_KEY:', process.env.GOOGLE_AI_KEY ? '✅ Set' : '❌ Not set');

// Simple test of environment variables
if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY && !process.env.GOOGLE_AI_KEY) {
  console.error('\n❌ No AI API keys found in environment variables.');
  console.log('\nPlease make sure to:');
  console.log('1. Add your API keys to .env.local');
  console.log('2. Restart your development server with `npm run dev`');
  process.exit(1);
}

console.log('\n✅ Environment check complete. To test the AI integration, run the development server with:');
console.log('   npm run dev');
