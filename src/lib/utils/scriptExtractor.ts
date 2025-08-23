import { readFile } from 'fs/promises';
import { DOMParser } from '@xmldom/xmldom';
import { isFDXFile, isFountainFile } from './fileValidation';

export interface ScriptContent {
  title: string;
  content: string;
  metadata: {
    pages?: number;
    scenes?: number;
    characters?: string[];
    [key: string]: any;
  };
}

export async function extractScriptContent(
  file: File | Buffer,
  filename: string,
  mimeType: string
): Promise<ScriptContent> {
  try {
    let content: string;
    let buffer: Buffer;

    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      buffer = file;
    }

    content = buffer.toString('utf-8');

    if (isFDXFile(filename, mimeType)) {
      return extractFromFDX(content, filename);
    } else if (isFountainFile(filename, mimeType)) {
      return extractFromFountain(content, filename);
    } else if (mimeType === 'application/pdf') {
      return extractFromPDF(buffer, filename);
    } else {
      // Default to plain text extraction
      return {
        title: filename.replace(/\.[^/.]+$/, ''), // Remove extension
        content,
        metadata: {},
      };
    }
  } catch (error) {
    console.error('Error extracting script content:', error);
    throw new Error(`Failed to extract content from ${filename}: ${error.message}`);
  }
}

async function extractFromFDX(content: string, filename: string): Promise<ScriptContent> {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, 'text/xml');
    
    // Extract title
    const title = 
      xmlDoc.getElementsByTagName('Title')[0]?.textContent || 
      filename.replace(/\.fdx$/i, '');
    
    // Extract content (dialogue and action)
    const contentNodes = [
      ...Array.from(xmlDoc.getElementsByTagName('Paragraph')),
      ...Array.from(xmlDoc.getElementsByTagName('Text'))
    ];
    
    const extractedContent = contentNodes
      .map(node => node.textContent?.trim() || '')
      .filter(Boolean)
      .join('\n');
    
    // Extract metadata
    const scenes = xmlDoc.getElementsByTagName('Scene').length;
    const characters = Array.from(
      new Set(
        Array.from(xmlDoc.getElementsByTagName('Character'))
          .map(c => c.textContent?.trim())
          .filter(Boolean)
      )
    ) as string[];

    return {
      title,
      content: extractedContent,
      metadata: {
        scenes,
        characters,
        format: 'FDX',
      },
    };
  } catch (error) {
    console.error('Error parsing FDX file:', error);
    throw new Error('Invalid FDX file format');
  }
}

async function extractFromFountain(content: string, filename: string): Promise<ScriptContent> {
  try {
    // Simple Fountain parser - can be enhanced with a dedicated library
    const lines = content.split('\n');
    const title = lines.find(line => line.startsWith('Title:'))?.replace('Title:', '').trim() || 
                 filename.replace(/\.fountain$/i, '');
    
    // Basic content extraction (can be enhanced with proper Fountain parsing)
    const extractedContent = content;
    
    // Simple scene and character extraction
    const scenes = (content.match(/^INT\.|^EXT\./gim) || []).length;
    const characters = Array.from(
      new Set(
        [...content.matchAll(/^\s*([A-Z][A-Z\s]+?)(\^|$)/gm)]
          .map(match => match[1].trim())
          .filter(name => name.length > 2 && !name.match(/^(INT|EXT|INT\.|EXT\.|I\.|E\.|INT/))
      )
    ) as string[];

    return {
      title,
      content: extractedContent,
      metadata: {
        scenes,
        characters,
        format: 'Fountain',
      },
    };
  } catch (error) {
    console.error('Error parsing Fountain file:', error);
    throw new Error('Invalid Fountain file format');
  }
}

async function extractFromPDF(buffer: Buffer, filename: string): Promise<ScriptContent> {
  try {
    // Use pdf-lib for PDF text extraction
    const { PDFDocument } = await import('pdf-lib');
    const pdfDoc = await PDFDocument.load(buffer);
    
    let extractedText = '';
    for (let i = 0; i < pdfDoc.getPageCount(); i++) {
      const page = pdfDoc.getPage(i);
      const text = await page.getText();
      extractedText += text + '\n';
    }
    
    return {
      title: filename.replace(/\.pdf$/i, ''),
      content: extractedText,
      metadata: {
        pages: pdfDoc.getPageCount(),
        format: 'PDF',
      },
    };
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}
