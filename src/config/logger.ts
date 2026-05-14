import winston from 'winston';

const level = process.env.LOG_LEVEL ?? 'info';

export const logger = winston.createLogger({
  level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp, ...meta }) => {
      const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
      return `${String(timestamp)} [${level}] ${String(message)}${extra}`;
    }),
  ),
  transports: [new winston.transports.Console({ stderrLevels: ['error'] })],
});
