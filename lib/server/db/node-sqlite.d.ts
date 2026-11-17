/**
 * Minimal typings for the `node:sqlite` module (Node.js >= 22.5).
 * @types/node 20 does not ship them yet, so we declare only what the driver uses.
 */
declare module "node:sqlite" {
  export interface StatementSync {
    run(...params: unknown[]): unknown;
    get(...params: unknown[]): unknown;
    all(...params: unknown[]): unknown[];
  }

  export class DatabaseSync {
    constructor(path: string, options?: Record<string, unknown>);
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
    close(): void;
  }
}
