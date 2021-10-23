import * as WS from 'ws';

/* eslint-disable no-unused-vars */
export {};

declare global {
  namespace Express {
    // Inject additional properties on express.Request
    interface Application {
      ws(route: string, callback: (ws: WS.WebSocket, req: Express.Request) => void): Express
    }
  }
}