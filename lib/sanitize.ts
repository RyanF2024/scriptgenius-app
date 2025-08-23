import xss from 'xss';
import { z } from 'zod';

// Configure XSS filter with safe defaults
const xssOptions: xss.IFilterXSSOptions = {
  whiteList: {
    // Allow common HTML elements
    a: ['href', 'title', 'target', 'rel'],
    b: [],
    blockquote: ['cite'],
    br: [],
    code: [],
    del: [],
    em: [],
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: [],
    hr: [],
    i: [],
    li: [],
    ol: [],
    p: [],
    pre: [],
    s: [],
    strong: [],
    sub: [],
    sup: [],
    table: ['border', 'cellpadding', 'cellspacing'],
    tbody: [],
    td: ['colspan', 'rowspan'],
    th: ['colspan', 'rowspan'],
    thead: [],
    tr: [],
    ul: [],
  },
  stripIgnoreTag: true, // Remove non-whitelisted HTML tags
  stripIgnoreTagBody: ['script', 'style', 'iframe'], // Remove these tags and their content
  allowCommentTag: false,
  safeAttrValue: (tag, name, value) => {
    // Only allow safe URLs in href and src attributes
    if (name === 'href' || name === 'src') {
      try {
        const url = new URL(value, 'http://relative');
        const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
        
        // Only allow certain URL protocols
        if (!allowedProtocols.includes(url.protocol)) {
          return '#';
        }
        
        // Additional security checks for specific protocols
        if (url.protocol === 'javascript:') {
          return '#';
        }
      } catch {
        return '#';
      }
    }
    return xss.escapeAttrValue(value);
  },
};

// Create XSS filter with our options
const xssFilter = new xss.FilterXSS(xssOptions);

/**
 * Sanitizes a string to prevent XSS attacks
 */
export function sanitize(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  return xssFilter.process(input).trim();
}

/**
 * Sanitizes an object's string properties
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const result = { ...obj };
  
  for (const key in result) {
    if (typeof result[key] === 'string') {
      result[key] = sanitize(result[key]) as any;
    } else if (Array.isArray(result[key])) {
      result[key] = (result[key] as any[]).map(item => 
        typeof item === 'string' ? sanitize(item) : item
      ) as any;
    } else if (result[key] && typeof result[key] === 'object') {
      result[key] = sanitizeObject(result[key]);
    }
  }
  
  return result;
}

/**
 * Creates a Zod string schema with sanitization
 */
export const sanitizedString = (schema: z.ZodString) => 
  schema.transform((val) => sanitize(val));

/**
 * Middleware to sanitize request body, query, and params
 */
export function sanitizeRequest(req: any, res: any, next: () => void) {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  
  next();
}

// Example usage with Zod schema:
/*
import { z } from 'zod';
import { sanitizedString } from './sanitize';

const userSchema = z.object({
  username: sanitizedString(z.string().min(3).max(50)),
  bio: sanitizedString(z.string().max(500).optional()),
  email: sanitizedString(z.string().email()),
  website: sanitizedString(z.string().url().optional()),
});
*/

// Example usage in Next.js API route:
/*
import { sanitizeRequest } from '@/lib/sanitize';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Apply sanitization middleware
  sanitizeRequest(req, res, () => {
    // Your handler logic here
  });
};
*/
