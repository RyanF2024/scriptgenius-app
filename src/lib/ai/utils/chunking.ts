import { ChunkingOptions } from '../types';

const DEFAULT_OPTIONS: ChunkingOptions = {
  maxChunkSize: 4000,  // Default to 4000 tokens (leaving room for prompts)
  overlap: 200,        // Overlap chunks by 200 tokens for context
  separator: '\n\n',  // Default to double newline as a natural break point
};

export class ScriptChunker {
  private options: ChunkingOptions;
  
  constructor(options: Partial<ChunkingOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Split text into chunks based on the provided options
   */
  public chunkText(text: string, customOptions?: Partial<ChunkingOptions>): string[] {
    const options = customOptions ? { ...this.options, ...customOptions } : this.options;
    
    // If the text is smaller than max chunk size, return it as a single chunk
    if (this.estimateTokenCount(text) <= options.maxChunkSize) {
      return [text];
    }

    // First, try to split by scenes (common in script formats)
    const sceneSplits = this.splitByScenes(text);
    if (sceneSplits.length > 1) {
      return this.mergeChunks(sceneSplits, options);
    }

    // If no scene markers, try to split by sequences
    const sequenceSplits = this.splitBySequences(text);
    if (sequenceSplits.length > 1) {
      return this.mergeChunks(sequenceSplits, options);
    }

    // Fall back to paragraph-based splitting
    const paragraphSplits = text.split(/\n\s*\n/);
    return this.mergeChunks(paragraphSplits, options);
  }

  /**
   * Split script by scene headings (e.g., INT. LOCATION - DAY)
   */
  private splitByScenes(script: string): string[] {
    const sceneRegex = new RegExp(
      '(?:^|\\n)(INT\\.|EXT\\.|INT/EXT\\.|I/E\\.|INT -|EXT -|INT/EXT -|I/E -).*?' +
      '(?=\\n(?:INT\\.|EXT\\.|INT/EXT\\.|I/E\\.|INT -|EXT -|INT/EXT -|I/E -|$))',
      'gs'
    );
    const matches = script.match(sceneRegex) || [];
    
    if (matches.length <= 1) {
      return [script];
    }
    
    // Reconstruct the full scenes with their content
    const scenes: string[] = [];
    let lastIndex = 0;
    
    for (const match of matches) {
      const index = script.indexOf(match, lastIndex);
      if (index > lastIndex) {
        scenes.push(script.substring(lastIndex, index).trim());
      }
      lastIndex = index;
    }
    
    if (lastIndex < script.length) {
      scenes.push(script.substring(lastIndex).trim());
    }
    
    return scenes.filter(scene => scene.trim().length > 0);
  }

  /**
   * Split script by sequences (marked by # or similar)
   */
  private splitBySequences(script: string): string[] {
    const sequenceRegex = /(?:^|\n)(#+\s+.*?)(?=\n#|$)/gs;
    const matches = script.match(sequenceRegex) || [];
    
    if (matches.length <= 1) {
      return [script];
    }
    
    // Reconstruct the full sequences with their content
    const sequences: string[] = [];
    let lastIndex = 0;
    
    for (const match of matches) {
      const index = script.indexOf(match, lastIndex);
      if (index > lastIndex) {
        sequences.push(script.substring(lastIndex, index).trim());
      }
      lastIndex = index;
    }
    
    if (lastIndex < script.length) {
      sequences.push(script.substring(lastIndex).trim());
    }
    
    return sequences.filter(seq => seq.trim().length > 0);
  }

  /**
   * Merge smaller chunks into appropriately sized chunks with overlap
   */
  private mergeChunks(chunks: string[], options: ChunkingOptions): string[] {
    const result: string[] = [];
    let currentChunk = '';
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i].trim();
      if (!chunk) continue;
      
      const chunkWithSeparator = currentChunk ? options.separator + chunk : chunk;
      
      if (this.estimateTokenCount(currentChunk + chunkWithSeparator) <= options.maxChunkSize) {
        currentChunk = currentChunk ? currentChunk + chunkWithSeparator : chunk;
      } else {
        if (currentChunk) {
          result.push(currentChunk);
        }
        
        // Add some context from the previous chunk if overlap is specified
        if (options.overlap > 0 && i > 0) {
          const previousChunk = chunks[i - 1].trim();
          const overlapText = this.getOverlapText(previousChunk, options.overlap);
          currentChunk = overlapText + options.separator + chunk;
        } else {
          currentChunk = chunk;
        }
      }
    }
    
    if (currentChunk) {
      result.push(currentChunk);
    }
    
    return result;
  }
  
  /**
   * Get overlapping text from the end of a chunk
   */
  private getOverlapText(text: string, overlapTokens: number): string {
    const words = text.split(/\s+/);
    const tokens = [];
    let tokenCount = 0;
    
    // Simple token estimation (1 token ≈ 4 characters)
    for (const word of words) {
      const wordTokens = Math.ceil(word.length / 4) + 1; // +1 for the space
      if (tokenCount + wordTokens > overlapTokens) break;
      tokens.push(word);
      tokenCount += wordTokens;
    }
    
    return tokens.join(' ');
  }
  
  /**
   * Simple token estimation (1 token ≈ 4 characters)
   */
  private estimateTokenCount(text: string): number {
    return Math.ceil(text.length / 4);
  }
  
  /**
   * Get the current chunking options
   */
  public getOptions(): ChunkingOptions {
    return { ...this.options };
  }
  
  /**
   * Update chunking options
   */
  public updateOptions(options: Partial<ChunkingOptions>): void {
    this.options = { ...this.options, ...options };
  }
}
