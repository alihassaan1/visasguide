import { Router, Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import archiver from 'archiver';
import { createWriteStream } from 'fs';
import { logger } from '../utils/logger';
import { validatePath, getProjectRoot } from '../utils/pathValidator';

const router = Router();

const BACKUP_DIR = process.env.BACKUP_DIR || '/var/backups/visas-guide';
const MAX_BACKUPS = parseInt(process.env.MAX_BACKUPS || '50');

interface BackupMetadata {
  id: string;
  filePath: string;
  timestamp: string;
  description: string;
  size: number;
}

// Create a backup of a file
export async function createBackup(filePath: string, content: string, description: string): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupId = `${timestamp}_${path.basename(filePath)}`;
  
  // Create backup directory structure
  const fileBackupDir = path.join(BACKUP_DIR, 'files', filePath.replace(/\//g, '_'));
  await fs.mkdir(fileBackupDir, { recursive: true });
  
  // Save backup file
  const backupPath = path.join(fileBackupDir, backupId);
  await fs.writeFile(backupPath, content, 'utf-8');
  
  // Save metadata
  const metadata: BackupMetadata = {
    id: backupId,
    filePath,
    timestamp: new Date().toISOString(),
    description,
    size: content.length
  };
  
  const metadataPath = path.join(fileBackupDir, `${backupId}.meta.json`);
  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');
  
  logger.info(`Created backup: ${backupId} for ${filePath}`);
  
  // Cleanup old backups
  await cleanupOldBackups(fileBackupDir);
  
  return backupId;
}

// Cleanup old backups keeping only MAX_BACKUPS
async function cleanupOldBackups(backupDir: string): Promise<void> {
  try {
    const files = await fs.readdir(backupDir);
    const backupFiles = files.filter(f => !f.endsWith('.meta.json'));
    
    if (backupFiles.length > MAX_BACKUPS) {
      // Sort by name (which includes timestamp) and remove oldest
      const sortedFiles = backupFiles.sort();
      const filesToDelete = sortedFiles.slice(0, backupFiles.length - MAX_BACKUPS);
      
      for (const file of filesToDelete) {
        await fs.unlink(path.join(backupDir, file));
        await fs.unlink(path.join(backupDir, `${file}.meta.json`)).catch(() => {});
        logger.info(`Deleted old backup: ${file}`);
      }
    }
  } catch (error) {
    logger.error('Error cleaning up backups:', error);
  }
}

// List backups for a file
router.get('/list', async (req: Request, res: Response) => {
  try {
    const filePath = req.query.path as string;
    
    if (!filePath) {
      return res.status(400).json({ error: 'File path required' });
    }

    const fileBackupDir = path.join(BACKUP_DIR, 'files', filePath.replace(/\//g, '_'));
    
    try {
      const files = await fs.readdir(fileBackupDir);
      const metaFiles = files.filter(f => f.endsWith('.meta.json'));
      
      const backups: BackupMetadata[] = [];
      
      for (const metaFile of metaFiles) {
        try {
          const content = await fs.readFile(path.join(fileBackupDir, metaFile), 'utf-8');
          backups.push(JSON.parse(content));
        } catch {
          // Skip invalid metadata files
        }
      }
      
      // Sort by timestamp descending (newest first)
      backups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      res.json({ backups, path: filePath });
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return res.json({ backups: [], path: filePath });
      }
      throw error;
    }
  } catch (error) {
    logger.error('Error listing backups:', error);
    res.status(500).json({ error: 'Failed to list backups' });
  }
});

// Get backup content
router.get('/get', async (req: Request, res: Response) => {
  try {
    const { path: filePath, id } = req.query;
    
    if (!filePath || !id) {
      return res.status(400).json({ error: 'File path and backup ID required' });
    }

    const fileBackupDir = path.join(BACKUP_DIR, 'files', (filePath as string).replace(/\//g, '_'));
    const backupPath = path.join(fileBackupDir, id as string);
    const metadataPath = path.join(fileBackupDir, `${id}.meta.json`);
    
    const content = await fs.readFile(backupPath, 'utf-8');
    const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8'));
    
    res.json({ content, metadata });
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: 'Backup not found' });
    }
    logger.error('Error getting backup:', error);
    res.status(500).json({ error: 'Failed to get backup' });
  }
});

// Restore a backup
router.post('/restore', async (req: Request, res: Response) => {
  try {
    const { path: filePath, id } = req.body;
    
    if (!filePath || !id) {
      return res.status(400).json({ error: 'File path and backup ID required' });
    }

    const validation = validatePath(filePath);
    
    if (!validation.valid) {
      return res.status(403).json({ error: validation.error });
    }

    const fileBackupDir = path.join(BACKUP_DIR, 'files', filePath.replace(/\//g, '_'));
    const backupPath = path.join(fileBackupDir, id);
    
    // Read backup content
    const backupContent = await fs.readFile(backupPath, 'utf-8');
    
    // Create backup of current file before restoring
    try {
      const currentContent = await fs.readFile(validation.resolvedPath, 'utf-8');
      await createBackup(filePath, currentContent, `Pre-restore backup (restoring ${id})`);
    } catch {
      // Current file might not exist
    }
    
    // Restore the backup
    await fs.writeFile(validation.resolvedPath, backupContent, 'utf-8');
    
    logger.info(`Restored backup ${id} to ${filePath}`);
    res.json({ success: true, message: `Restored backup ${id} to ${filePath}` });
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: 'Backup not found' });
    }
    logger.error('Error restoring backup:', error);
    res.status(500).json({ error: 'Failed to restore backup' });
  }
});

// Create full project backup
router.post('/full', async (req: Request, res: Response) => {
  try {
    const { description } = req.body;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `full-backup-${timestamp}.zip`;
    const backupPath = path.join(BACKUP_DIR, 'full', backupName);
    
    // Ensure directory exists
    await fs.mkdir(path.join(BACKUP_DIR, 'full'), { recursive: true });
    
    // Create zip archive
    const output = createWriteStream(backupPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    archive.pipe(output);
    
    // Add project files (excluding node_modules, .git, etc.)
    archive.glob('**/*', {
      cwd: getProjectRoot(),
      ignore: ['node_modules/**', '.git/**', 'dist/**', 'build/**', '*.log']
    });
    
    await archive.finalize();
    
    // Save metadata
    const stats = await fs.stat(backupPath);
    const metadata = {
      name: backupName,
      timestamp: new Date().toISOString(),
      description: description || 'Full project backup',
      size: stats.size
    };
    
    await fs.writeFile(
      path.join(BACKUP_DIR, 'full', `${backupName}.meta.json`),
      JSON.stringify(metadata, null, 2)
    );
    
    logger.info(`Created full backup: ${backupName}`);
    res.json({ success: true, backup: metadata });
  } catch (error) {
    logger.error('Error creating full backup:', error);
    res.status(500).json({ error: 'Failed to create full backup' });
  }
});

// List full backups
router.get('/full/list', async (req: Request, res: Response) => {
  try {
    const fullBackupDir = path.join(BACKUP_DIR, 'full');
    
    try {
      const files = await fs.readdir(fullBackupDir);
      const metaFiles = files.filter(f => f.endsWith('.meta.json'));
      
      const backups = [];
      
      for (const metaFile of metaFiles) {
        try {
          const content = await fs.readFile(path.join(fullBackupDir, metaFile), 'utf-8');
          backups.push(JSON.parse(content));
        } catch {
          // Skip invalid files
        }
      }
      
      backups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      res.json({ backups });
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        return res.json({ backups: [] });
      }
      throw error;
    }
  } catch (error) {
    logger.error('Error listing full backups:', error);
    res.status(500).json({ error: 'Failed to list full backups' });
  }
});

export { router as backupRoutes, createBackup };
