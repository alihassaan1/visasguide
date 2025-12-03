import { Router, Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import { validatePath, isAllowedFileType, getProjectRoot } from '../utils/pathValidator';
import { logger } from '../utils/logger';
import { createBackup } from './backup';

const router = Router();

// List files in a directory
router.get('/list', async (req: Request, res: Response) => {
  try {
    const folderPath = (req.query.path as string) || '';
    const validation = validatePath(folderPath);
    
    if (!validation.valid) {
      return res.status(403).json({ error: validation.error });
    }

    const stats = await fs.stat(validation.resolvedPath);
    
    if (!stats.isDirectory()) {
      return res.status(400).json({ error: 'Path is not a directory' });
    }

    const entries = await fs.readdir(validation.resolvedPath, { withFileTypes: true });
    
    const files = entries
      .filter(entry => {
        // Filter out hidden files and forbidden directories
        if (entry.name.startsWith('.')) return false;
        if (entry.name === 'node_modules') return false;
        return true;
      })
      .map(entry => ({
        name: entry.name,
        type: entry.isDirectory() ? 'directory' : 'file',
        path: path.join(folderPath, entry.name)
      }))
      .sort((a, b) => {
        // Directories first, then alphabetically
        if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });

    logger.info(`Listed directory: ${folderPath}`);
    res.json({ files, path: folderPath });
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: 'Directory not found' });
    }
    logger.error('Error listing files:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

// Read a file
router.get('/read', async (req: Request, res: Response) => {
  try {
    const filePath = req.query.path as string;
    
    if (!filePath) {
      return res.status(400).json({ error: 'File path required' });
    }

    const validation = validatePath(filePath);
    
    if (!validation.valid) {
      return res.status(403).json({ error: validation.error });
    }

    if (!isAllowedFileType(filePath)) {
      return res.status(403).json({ error: 'File type not allowed' });
    }

    const stats = await fs.stat(validation.resolvedPath);
    
    if (!stats.isFile()) {
      return res.status(400).json({ error: 'Path is not a file' });
    }

    // Limit file size to 1MB
    if (stats.size > 1024 * 1024) {
      return res.status(413).json({ error: 'File too large (max 1MB)' });
    }

    const content = await fs.readFile(validation.resolvedPath, 'utf-8');
    
    logger.info(`Read file: ${filePath}`);
    res.json({ 
      content, 
      path: filePath,
      size: stats.size,
      modified: stats.mtime
    });
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: 'File not found' });
    }
    logger.error('Error reading file:', error);
    res.status(500).json({ error: 'Failed to read file' });
  }
});

// Search for text in files
router.get('/search', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    const searchPath = (req.query.path as string) || '';
    
    if (!query) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const validation = validatePath(searchPath);
    
    if (!validation.valid) {
      return res.status(403).json({ error: validation.error });
    }

    // Find all matching files
    const pattern = path.join(validation.resolvedPath, '**/*.{ts,tsx,js,jsx,json,css,html,md}');
    const files = await glob(pattern, { 
      ignore: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**'],
      nodir: true
    });

    const results: Array<{
      file: string;
      matches: Array<{ line: number; content: string }>;
    }> = [];

    const searchRegex = new RegExp(query, 'gi');

    for (const file of files.slice(0, 100)) { // Limit to 100 files
      try {
        const content = await fs.readFile(file, 'utf-8');
        const lines = content.split('\n');
        const matches: Array<{ line: number; content: string }> = [];

        lines.forEach((line, index) => {
          if (searchRegex.test(line)) {
            matches.push({
              line: index + 1,
              content: line.trim().slice(0, 200) // Truncate long lines
            });
          }
          searchRegex.lastIndex = 0; // Reset regex
        });

        if (matches.length > 0) {
          const relativePath = path.relative(getProjectRoot(), file);
          results.push({ file: relativePath, matches: matches.slice(0, 10) }); // Limit matches per file
        }
      } catch {
        // Skip files that can't be read
      }
    }

    logger.info(`Search completed for: "${query}" - ${results.length} files matched`);
    res.json({ 
      query, 
      results: results.slice(0, 50), // Limit total results
      totalFiles: files.length,
      matchedFiles: results.length
    });
  } catch (error) {
    logger.error('Error searching files:', error);
    res.status(500).json({ error: 'Failed to search files' });
  }
});

// Write/update a file
router.post('/write', async (req: Request, res: Response) => {
  try {
    const { path: filePath, content, description } = req.body;
    
    if (!filePath || content === undefined) {
      return res.status(400).json({ error: 'File path and content required' });
    }

    const validation = validatePath(filePath);
    
    if (!validation.valid) {
      return res.status(403).json({ error: validation.error });
    }

    if (!isAllowedFileType(filePath)) {
      return res.status(403).json({ error: 'File type not allowed for writing' });
    }

    // Check if file exists and create backup
    let originalContent: string | null = null;
    try {
      originalContent = await fs.readFile(validation.resolvedPath, 'utf-8');
      await createBackup(filePath, originalContent, description || 'Auto-backup before change');
    } catch {
      // File doesn't exist yet, that's ok
    }

    // Ensure directory exists
    const dir = path.dirname(validation.resolvedPath);
    await fs.mkdir(dir, { recursive: true });

    // Write the file
    await fs.writeFile(validation.resolvedPath, content, 'utf-8');

    logger.info(`Written file: ${filePath}`, { description });
    res.json({ 
      success: true, 
      path: filePath,
      backedUp: originalContent !== null,
      message: `File ${originalContent ? 'updated' : 'created'} successfully`
    });
  } catch (error) {
    logger.error('Error writing file:', error);
    res.status(500).json({ error: 'Failed to write file' });
  }
});

// Get file info/stats
router.get('/info', async (req: Request, res: Response) => {
  try {
    const filePath = req.query.path as string;
    
    if (!filePath) {
      return res.status(400).json({ error: 'File path required' });
    }

    const validation = validatePath(filePath);
    
    if (!validation.valid) {
      return res.status(403).json({ error: validation.error });
    }

    const stats = await fs.stat(validation.resolvedPath);
    
    res.json({
      path: filePath,
      type: stats.isDirectory() ? 'directory' : 'file',
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      accessed: stats.atime
    });
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: 'Path not found' });
    }
    logger.error('Error getting file info:', error);
    res.status(500).json({ error: 'Failed to get file info' });
  }
});

export { router as fileRoutes };
