import { ScriptParser } from './parser';
import { AIService } from '../ai/AIService';
import { ScriptMetrics, ScriptAnalysisResult, ScriptAnalysisOptions } from '../ai/types/analysis';
import * as Sentiment from 'sentiment';

export class ScriptAnalyzer {
  private parser: ScriptParser;
  private aiService: AIService;
  private sentimentAnalyzer: any;

  constructor(scriptContent: string) {
    this.parser = new ScriptParser(scriptContent);
    this.aiService = AIService.getInstance();
    this.sentimentAnalyzer = new Sentiment();
    this.parser.parse();
  }

  public async analyze(options: ScriptAnalysisOptions = {}): Promise<ScriptAnalysisResult> {
    const defaultOptions: ScriptAnalysisOptions = {
      analyzeStructure: true,
      analyzeDialogue: true,
      analyzeCharacters: true,
      analyzeSentiment: true,
      checkFormatting: true,
      ...options
    };

    const metrics: ScriptMetrics = {};
    
    // Basic metrics
    metrics.sceneCount = this.parser.getSceneCount();
    
    // Character analysis
    if (defaultOptions.analyzeCharacters) {
      await this.analyzeCharacters(metrics);
    }

    // Dialogue analysis
    if (defaultOptions.analyzeDialogue) {
      await this.analyzeDialogue(metrics);
    }

    // Sentiment analysis
    if (defaultOptions.analyzeSentiment) {
      await this.analyzeSentiment(metrics);
    }

    // Format checking
    if (defaultOptions.checkFormatting) {
      await this.checkFormatting(metrics);
    }

    // Generate summary and recommendations using AI
    const { summary, strengths, weaknesses, suggestions } = await this.generateAnalysisSummary(
      metrics,
      defaultOptions
    );

    return {
      scriptId: this.generateScriptId(),
      metrics,
      summary,
      strengths,
      weaknesses,
      suggestions,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private async analyzeCharacters(metrics: ScriptMetrics): Promise<void> {
    const characterNames = this.parser.getCharacterNames();
    metrics.characterCount = characterNames.length;
    
    // Get dialogue for each character
    metrics.mainCharacters = await Promise.all(
      characterNames.slice(0, 10).map(async (name) => {
        const dialogues = this.parser.getElementsByType('character')
          .filter(char => char.text.trim() === name)
          .map(char => ({
            text: char.text,
            lineNumber: char.lineNumber
          }));
          
        return {
          name,
          dialogueCount: dialogues.length,
          wordCount: dialogues.reduce((sum, d) => sum + d.text.split(/\s+/).length, 0),
          scenes: [] // This would be populated with scene numbers
        };
      })
    );
  }

  private async analyzeDialogue(metrics: ScriptMetrics): Promise<void> {
    const dialogueMetrics = this.parser.getDialogueMetrics();
    metrics.averageDialogueLength = dialogueMetrics.averageWordsPerDialogue;
    
    // Additional dialogue analysis can be added here
    // For example, dialogue diversity, character-specific metrics, etc.
  }

  private async analyzeSentiment(metrics: ScriptMetrics): Promise<void> {
    const dialogues = this.parser.getElementsByType('dialogue');
    const allText = dialogues.map(d => d.text).join(' ');
    
    // Simple sentiment analysis
    const sentiment = this.sentimentAnalyzer.analyze(allText);
    metrics.overallSentiment = {
      score: sentiment.score,
      comparative: sentiment.comparative,
      positive: sentiment.positive.length,
      negative: sentiment.negative.length
    };
  }

  private async checkFormatting(metrics: ScriptMetrics): Promise<void> {
    // This would check for common formatting issues
    metrics.formatErrors = [];
    
    // Example: Check for scene headings without scene numbers
    const sceneHeadings = this.parser.getElementsByType('scene_heading');
    sceneHeadings.forEach((scene, index) => {
      if (!scene.sceneNumber) {
        metrics.formatErrors?.push({
          type: 'scene_heading',
          message: 'Scene heading missing scene number',
          lineNumber: scene.lineNumber,
          context: scene.text
        });
      }
    });
  }

  private async generateAnalysisSummary(
    metrics: ScriptMetrics,
    options: ScriptAnalysisOptions
  ): Promise<{ summary: string; strengths: string[]; weaknesses: string[]; suggestions: string[] }> {
    try {
      const prompt = this.createAnalysisPrompt(metrics, options);
      
      const response = await this.aiService.generateText({
        messages: [
          {
            role: 'system',
            content: 'You are a professional script analyst. Provide a detailed analysis of the script.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        modelConfig: {
          provider: 'openai',
          model: 'gpt-4',
          temperature: 0.7
        }
      });

      // Parse the AI response (this is a simplified example)
      const content = response.content;
      
      // In a real implementation, you would parse the AI response into structured data
      // For now, we'll return a simplified version
      return {
        summary: content.split('\n')[0] || 'No summary available',
        strengths: [
          'Well-developed characters',
          'Engaging dialogue',
          'Strong narrative structure'
        ],
        weaknesses: [
          'Pacing could be improved in the second act',
          'Some dialogue feels exposition-heavy'
        ],
        suggestions: [
          'Consider adding more visual storytelling',
          'Deepen character backstories',
          'Tighten the middle act'
        ]
      };
    } catch (error) {
      console.error('Error generating analysis summary:', error);
      return {
        summary: 'Analysis could not be generated',
        strengths: [],
        weaknesses: [],
        suggestions: []
      };
    }
  }

  private createAnalysisPrompt(metrics: ScriptMetrics, options: ScriptAnalysisOptions): string {
    return `Analyze this script with the following metrics:
      
Script Metrics:
- Scene Count: ${metrics.sceneCount}
- Character Count: ${metrics.characterCount}
- Average Dialogue Length: ${metrics.averageDialogueLength?.toFixed(2)} words
- Sentiment Score: ${metrics.overallSentiment?.score}

Analysis Options:
- Genre: ${options.genre || 'Not specified'}
- Target Audience: ${options.targetAudience || 'General'}

Please provide a detailed analysis including strengths, weaknesses, and suggestions for improvement.`;
  }

  private generateScriptId(): string {
    return 'script_' + Math.random().toString(36).substr(2, 9);
  }
}
