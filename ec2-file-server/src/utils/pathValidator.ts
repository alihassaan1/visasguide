import path from 'path';
import { logger } from './logger';

const PROJECT_ROOT = process.env.PROJECT_ROOT || '/var/www/visas.guide';

// Forbidden paths that should never be accessed
const FORBIDDEN_PATHS = [
  '.env',
  '.git',
  'node_modules',
  '.ssh',
  '.aws',
  'secrets',
  '.secrets',
  'credentials',
  '.credentials',
  'private',
  '.private'
];

// Allowed file extensions
const ALLOWED_EXTENSIONS = [
  '.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.scss', '.html',
  '.md', '.txt', '.yaml', '.yml', '.toml', '.sql', '.sh', '.env.example'
];

export function validatePath(requestedPath: string): { valid: boolean; resolvedPath: string; error?: string } {
  try {
    // Normalize and resolve the path
    const normalizedPath = path.normalize(requestedPath).replace(/^(\.\.(\/|\\|$))+/, '');
    const resolvedPath = path.resolve(PROJECT_ROOT, normalizedPath);
    
    // Ensure the resolved path is within PROJECT_ROOT (prevent directory traversal)
    if (!resolvedPath.startsWith(PROJECT_ROOT)) {
      logger.warn(`Path traversal attempt blocked: ${requestedPath}`);
      return { valid: false, resolvedPath: '', error: 'Access denied: path outside project root' };
    }

    // Check for forbidden paths
    const relativePath = path.relative(PROJECT_ROOT, resolvedPath);
    const pathParts = relativePath.split(path.sep);
    
    for (const forbidden of FORBIDDEN_PATHS) {
      if (pathParts.some(part => part === forbidden || part.startsWith(forbidden))) {
        logger.warn(`Forbidden path access attempt: ${requestedPath}`);
        return { valid: false, resolvedPath: '', error: `Access denied: ${forbidden} is restricted` };
      }
    }

    return { valid: true, resolvedPath };
  } catch (error) {
    logger.error('Path validation error:', error);
    return { valid: false, resolvedPath: '', error: 'Invalid path' };
  }
}

export function isAllowedFileType(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext) || ext === '';
}

export function getProjectRoot(): string {
  return PROJECT_ROOT;
}
