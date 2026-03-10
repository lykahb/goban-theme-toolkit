export type LogLevel = "info" | "warn" | "error";

export interface RunLog {
  at: string;
  level: LogLevel;
  message: string;
}

export function makeLog(level: LogLevel, message: string): RunLog {
  return {
    at: new Date().toISOString(),
    level,
    message
  };
}
