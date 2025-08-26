import type { ReportTemplate, AnalysisPersona, AIMessage, AnalysisTone, AnalysisContext } from '../types';

// Base system prompt template
const BASE_SYSTEM_PROMPT = `You are a Senior Story Analyst with cross-industry expertise (Hollywood studio reader, indie development exec, and literary consultant).
Your analysis should be professional, constructive, and precise, balancing candor with encouragement.
Your objective is to deliver actionable insights that help either (a) screenwriters improve their scripts or (b) executives assess commercial and creative potential.`;

// Persona-specific instructions
const PERSONA_INSTRUCTIONS: Record<AnalysisPersona, string> = {
  general: 'Provide balanced coverage of strengths, weaknesses, and opportunities.',
  hollywood: 'Focus on commercial viability, market fit, franchise potential, and deal structures.',
  independent: 'Emphasize artistic voice, originality, cultural resonance, and awards potential.',
  character: 'Deep dive into character psychology, relationships, and dialogue authenticity.',
  execBuyer: 'Evaluate ROI, comparable projects, audience engagement, casting viability, and distribution pathways.',
  writerCoach: 'Provide practical rewrite strategies, scene-by-scene improvement notes, and writing exercises.'
} as const;

// Analysis tone settings
const TONE_SETTINGS = {
  optimistic: 'Emphasize strengths while still noting areas for improvement.',
  balanced: 'Provide an even-handed analysis of strengths and weaknesses.',
  critical: 'Be direct about issues while still being constructive.'
};

// Report type templates
const REPORT_TEMPLATES: Record<string, Omit<ReportTemplate, 'id'>> = {
  coverage: {
    name: 'Studio Coverage Report',
    description: 'Professional studio-style coverage including logline, synopsis, and evaluation',
    systemPrompt: `Provide comprehensive script coverage including:
- LOGLINE (1-2 sentences, high-concept clarity)
- SYNOPSIS (1 paragraph, capturing tone + hook)
- STRENGTHS (top 3-5)
- WEAKNESSES / RISKS (clear, actionable)
- COMMERCIAL POTENTIAL (box office/streaming viability, franchiseability)
- OVERALL RECOMMENDATION (Pass, Consider, Recommend) with clear rationale`,
    userPrompt: 'Please provide professional studio coverage for this script:',
    outputFormat: 'markdown',
  },
  structure: {
    name: 'Structure & Story Logic',
    description: 'In-depth analysis of narrative structure and story logic',
    systemPrompt: `Analyze the script's structure, including:
- ACT BREAKDOWN (I/II/III or 5-act for TV with page/timestamp markers)
- KEY PLOT POINTS (setup, inciting incident, midpoint, climax, resolution)
- NARRATIVE DRIVE (pace, tension, escalation, momentum)
- THEME & SUBTEXT (clarity, depth, integration with plot)
- REWRITE SUGGESTIONS (specific, actionable structural improvements)`,
    userPrompt: 'Provide a detailed structural analysis of this script:',
    outputFormat: 'markdown',
  },
  character: {
    name: 'Character & Dialogue Analysis',
    description: 'Comprehensive character and dialogue evaluation',
    systemPrompt: `Provide a detailed character and dialogue analysis including:
- CHARACTER ARCS (growth, change, or stagnation)
- MOTIVATIONS (clear, believable, aligned with stakes)
- RELATIONSHIPS (chemistry, conflict, emotional depth)
- DIALOGUE (distinct voices, subtext, rhythm, authenticity)
- OPPORTUNITIES (specific scenes/beats to enhance character work)`,
    userPrompt: 'Analyze the characters and dialogue in this script:',
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
    name: 'Market & Audience Positioning',
    description: 'Analysis of market potential and audience fit',
    systemPrompt: `Provide a comprehensive market analysis including:
- TARGET AUDIENCE (demographics, psychographics, size)
- COMPARABLE TITLES (tone, genre, box office comps with data)
- MARKET TRENDS (current relevance, forecasted demand, genre cycles)
- CASTING/PACKAGE POTENTIAL (talent attachments that would elevate the project)
- BUDGET & FORMAT FIT (optimal format and budget range)
- DISTRIBUTION PATHWAYS (theatrical, streaming, festival, niche markets)`,
    userPrompt: 'Analyze the market positioning of this script:',
    outputFormat: 'markdown',
  },
  
  executive: {
    name: 'Executive Lens',
    description: 'Business-focused analysis for executives and buyers',
    systemPrompt: `Provide an executive-level analysis including:
- ROI ASSESSMENT (budget vs. market ceiling, break-even analysis)
- PLATFORM FIT (which studio/streamer would be ideal and why)
- ATTACHMENTS VIABILITY (directors, actors, producers who could elevate this)
- DEAL POTENTIAL (option, outright sale, development partnership)
- RISK FACTORS (market saturation, censorship, audience fatigue)
- GREENLIGHT RECOMMENDATION (with financial and creative rationale)`,
    userPrompt: 'Provide an executive analysis of this script:',
    outputFormat: 'markdown',
  },
  
  writerDevelopment: {
    name: 'Writer Development Notes',
    description: 'Actionable notes for writers to improve their craft',
    systemPrompt: `Provide detailed writer-focused development notes including:
- REWRITE PRIORITIES (top 3-5 fixes with clear rationale)
- SCENE-LEVEL NOTES (specific beats needing work with page references)
- EXERCISES (practical craft prompts to improve specific aspects)
- NEXT DRAFT CHECKLIST (tangible milestones to aim for)
- STRENGTHS TO LEVERAGE (what works well and should be expanded)`,
    userPrompt: 'Provide development notes to help improve this script:',
    outputFormat: 'markdown',
  },
};

export class PromptManager {
  static getReportTemplate(
    reportType: string, 
    persona: AnalysisPersona = 'general',
    tone: AnalysisTone = 'balanced'
  ): ReportTemplate {
    const template = REPORT_TEMPLATES[reportType];
    if (!template) {
      throw new Error(`Report template not found: ${reportType}`);
    }

    const toneInstruction = TONE_SETTINGS[tone];
    return {
      ...template,
      id: reportType,
      systemPrompt: [
        BASE_SYSTEM_PROMPT,
        PERSONA_INSTRUCTIONS[persona],
        toneInstruction,
        template.systemPrompt
      ].join('\n\n'),
    };
  }

  static prepareMessages(
    scriptContent: string,
    reportType: string,
    persona: AnalysisPersona = 'general',
    additionalContext: AnalysisContext = {}
  ): AIMessage[] {
    const { tone = 'balanced', ...context } = additionalContext;
    const template = this.getReportTemplate(reportType, persona, tone);
    
    const messages: AIMessage[] = [
      { role: 'system', content: template.systemPrompt },
      { role: 'user', content: template.userPrompt },
      { role: 'user', content: 'Script Title: ' + (context.title || 'Untitled') },
      { role: 'user', content: 'Genre: ' + (context.genre || 'Not specified') },
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
