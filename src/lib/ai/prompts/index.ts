import { ReportTemplate, AnalysisPersona, AIMessage } from '../types';

// Base system prompt template
const BASE_SYSTEM_PROMPT = `You are a professional script analyst with expertise in screenwriting and storytelling. 
Your task is to analyze the provided script and provide detailed, constructive feedback.`;

// Persona-specific instructions
const PERSONA_INSTRUCTIONS: Record<AnalysisPersona, string> = {
  general: 'Provide a balanced analysis covering all major aspects of the script.',
  hollywood: 'Focus on commercial viability, market trends, and blockbuster potential.',
  independent: 'Emphasize creative vision, character depth, and innovative storytelling.',
  character: 'Concentrate on character development, arcs, and dialogue authenticity.'
};

// Report type templates
const REPORT_TEMPLATES: Record<string, Omit<ReportTemplate, 'id'>> = {
  coverage: {
    name: 'Script Coverage',
    description: 'Comprehensive script analysis including logline, synopsis, and evaluation',
    systemPrompt: `You are a professional script reader. Provide detailed coverage including:
- Logline (1-2 sentences)
- Synopsis (1 paragraph)
- Strengths and Weaknesses
- Commercial Potential
- Overall Recommendation`,
    userPrompt: 'Please analyze the following script and provide professional coverage:',
    outputFormat: 'markdown',
  },
  structure: {
    name: 'Structure Analysis',
    description: 'Detailed breakdown of the script\'s narrative structure',
    systemPrompt: `Analyze the script's structure, including:
- Act Structure
- Plot Points
- Pacing
- Tension Arcs
- Recommended Improvements`,
    userPrompt: 'Analyze the structure of this script:',
    outputFormat: 'markdown',
  },
  character: {
    name: 'Character Analysis',
    description: 'In-depth analysis of characters and their development',
    systemPrompt: `Provide a detailed character analysis including:
- Character Arcs
- Motivations and Goals
- Relationships
- Dialogue Authenticity
- Development Opportunities`,
    userPrompt: 'Analyze the characters in this script:',
    outputFormat: 'markdown',
  },
  dialogue: {
    name: 'Dialogue Analysis',
    description: 'Evaluation of dialogue quality and authenticity',
    systemPrompt: `Evaluate the script's dialogue for:
- Authenticity
- Character Voice
- Subtext
- Pacing
- Areas for Improvement`,
    userPrompt: 'Analyze the dialogue in this script:',
    outputFormat: 'markdown',
  },
  market: {
    name: 'Market Analysis',
    description: 'Analysis of the script\'s market potential',
    systemPrompt: `Provide a market analysis including:
- Target Audience
- Comparable Titles
- Market Trends
- Budget Considerations
- Distribution Potential`,
    userPrompt: 'Analyze the market potential of this script:',
    outputFormat: 'markdown',
  },
};

export class PromptManager {
  static getReportTemplate(reportType: string, persona: AnalysisPersona = 'general'): ReportTemplate {
    const template = REPORT_TEMPLATES[reportType];
    if (!template) {
      throw new Error(`Report template not found: ${reportType}`);
    }

    return {
      ...template,
      id: reportType,
      systemPrompt: `${BASE_SYSTEM_PROMPT}\n\n${PERSONA_INSTRUCTIONS[persona]}\n\n${template.systemPrompt}`,
    };
  }

  static prepareMessages(
    scriptContent: string,
    reportType: string,
    persona: AnalysisPersona = 'general',
    additionalContext: Record<string, any> = {}
  ): AIMessage[] {
    const template = this.getReportTemplate(reportType, persona);
    
    const messages: AIMessage[] = [
      { role: 'system', content: template.systemPrompt },
      { role: 'user', content: template.userPrompt },
      { role: 'user', content: 'Script Title: ' + (additionalContext.title || 'Untitled') },
      { role: 'user', content: 'Genre: ' + (additionalContext.genre || 'Not specified') },
      { role: 'user', content: 'Script Content:\n' + scriptContent },
    ];

    return messages;
  }

  static getAvailableReportTypes(): Array<{id: string, name: string, description: string}> {
    return Object.entries(REPORT_TEMPLATES).map(([id, { name, description }]) => ({
      id,
      name,
      description,
    }));
  }
}
