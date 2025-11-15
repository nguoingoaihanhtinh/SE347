// src/utils/logger.ts
import winston from "winston";

const { combine, timestamp, printf } = winston.format;

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "cyan",
};

winston.addColors(colors);

const logger = winston.createLogger({
  level: "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    printf(({ timestamp, level, message }) => {
      const coloredLevel = winston.format.colorize().colorize(
        level,
        level.toUpperCase()
      );
      return `${timestamp} [${coloredLevel}]: ${message}`;
    })
  ),
  transports: [new winston.transports.Console()],
});

export default logger;
