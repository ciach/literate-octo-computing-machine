declare module 'node:fs/promises' {
  export function mkdir(path: string, options?: { recursive?: boolean }): Promise<void>;
  export function readFile(path: string, encoding: string): Promise<string>;
  export function writeFile(path: string, data: string, encoding: string): Promise<void>;
}

declare module 'node:path' {
  export function join(...parts: string[]): string;
  export function resolve(...parts: string[]): string;
}

declare module 'node:url' {
  export function fileURLToPath(url: string): string;
}

declare module 'node:crypto' {
  export function createHash(algorithm: string): {
    update(value: string): { digest(encoding: 'hex'): string };
  };
}

declare const process: {
  env: Record<string, string | undefined>;
  argv: string[];
};

interface ImportMeta {
  url: string;
}
