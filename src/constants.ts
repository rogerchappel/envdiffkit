export const VERSION = "0.1.0";

export const DEFAULT_IGNORES = [
  ".git",
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".turbo",
  ".next",
  ".cache"
];

export const SCANNABLE_EXTENSIONS = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
  ".py",
  ".sh",
  ".bash",
  ".zsh",
  ".env.example",
  ".example",
  ".sample",
  ".md",
  ".markdown",
  ".yml",
  ".yaml",
  "Dockerfile"
]);

export const SECRET_HINTS = [
  "SECRET",
  "TOKEN",
  "KEY",
  "PASSWORD",
  "PASS",
  "PRIVATE",
  "CREDENTIAL",
  "AUTH",
  "WEBHOOK",
  "COOKIE",
  "SESSION"
];

export const LOW_SIGNAL_NAMES = new Set([
  "PATH",
  "HOME",
  "USER",
  "SHELL",
  "PWD",
  "OLDPWD",
  "TERM",
  "CI",
  "NODE_ENV",
  "DEBUG"
]);
