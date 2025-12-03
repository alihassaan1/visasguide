import winston from 'winston';
import path from 'path';

const logFile = process.env.LOG_FILE || './logs/app.log';
const logLevel = process.env.LOG_LEVEL || 'info';

// Ensure log directory exists
const logDir = path.dirname(logFile);

export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'file-server' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ 
      filename: logFile,
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true
    })
  ]
});
