import { readFileSync } from 'fs';
import { parse } from 'fountain-js';

export type ScriptElement = {
  type: 'scene_heading' | 'action' | 'character' | 'dialogue' | 'parenthetical' | 'transition' | 'lyrics' | 'section' | 'synopsis' | 'note' | 'page_break' | 'line_break' | 'dual_dialogue';
  text: string;
  sceneNumber?: string;
  lineNumber: number;
};

export class ScriptParser {
  private content: string;
  private elements: ScriptElement[] = [];

  constructor(scriptContent: string) {
    this.content = scriptContent;
  }

  public static fromFile(filePath: string): ScriptParser {
    const content = readFileSync(filePath, 'utf-8');
    return new ScriptParser(content);
  }

  public parse(): ScriptElement[] {
    try {
      const parsed = parse(this.content, { tokens: true });
      this.elements = this.transformTokens(parsed.tokens);
      return this.elements;
    } catch (error) {
      console.error('Error parsing script:', error);
      throw new Error(`Failed to parse script: ${error.message}`);
    }
  }

  private transformTokens(tokens: any[]): ScriptElement[] {
    return tokens.map((token, index) => ({
      type: this.mapTokenType(token.type),
      text: token.text,
      sceneNumber: token.scene_number,
      lineNumber: token.line_number || index + 1
    }));
  }

  private mapTokenType(type: string): ScriptElement['type'] {
    const typeMap: Record<string, ScriptElement['type']> = {
      'scene_heading': 'scene_heading',
      'action': 'action',
      'character': 'character',
      'dialogue': 'dialogue',
      'parenthetical': 'parenthetical',
      'transition': 'transition',
      'lyrics': 'lyrics',
      'section': 'section',
      'synopsis': 'synopsis',
      'note': 'note',
      'page_break': 'page_break',
      'line_break': 'line_break',
      'dual_dialogue': 'dual_dialogue'
    };
    
    return typeMap[type] || 'action';
  }

  public getElementsByType(type: ScriptElement['type']): ScriptElement[] {
    return this.elements.filter(element => element.type === type);
  }

  public getSceneCount(): number {
    return this.getElementsByType('scene_heading').length;
  }

  public getCharacterNames(): string[] {
    const characters = this.getElementsByType('character');
    const uniqueNames = new Set<string>();
    
    characters.forEach(char => {
      // Clean character name (remove numbers, extra spaces, etc.)
      const cleanName = char.text
        .replace(/\s*\(.*?\)/g, '') // Remove parentheticals
        .replace(/^[^a-zA-Z]+/, '')   // Remove leading non-letters
        .trim();
        
      if (cleanName) {
        uniqueNames.add(cleanName);
      }
    });
    
    return Array.from(uniqueNames);
  }

  public getDialogueMetrics() {
    const dialogues = this.getElementsByType('dialogue');
    const wordCounts = dialogues.map(d => d.text.split(/\s+/).length);
    const totalWords = wordCounts.reduce((sum, count) => sum + count, 0);
    
    return {
      totalDialogues: dialogues.length,
      totalWords,
      averageWordsPerDialogue: dialogues.length > 0 ? totalWords / dialogues.length : 0,
      maxWords: wordCounts.length > 0 ? Math.max(...wordCounts) : 0,
      minWords: wordCounts.length > 0 ? Math.min(...wordCounts) : 0
    };
  }
}
