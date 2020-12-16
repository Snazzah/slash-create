/* eslint-disable @typescript-eslint/no-unused-vars */

import { AllRequestData } from './constants';

export interface ServerOptions {
  // Whether or not the server is already listening to a port
  alreadyListening: boolean;
}

export interface TransformedRequest {
  headers: { [key: string]: string | string[] | undefined };
  body: any;
  request: any;
  response: any;
}

export interface Response {
  status?: number;
  headers?: { [key: string]: string | string[] | undefined };
  body?: any;
}

export type RespondFunction = (response: Response) => Promise<void>;

export type RequestHandler = (treq: TransformedRequest, respond: RespondFunction) => void;

export type InteractionHandler = (interaction: AllRequestData) => void;

class Server {
  alreadyListening: boolean;
  isWebserver: boolean;

  constructor(opts: ServerOptions = { alreadyListening: false }, isWebserver = true) {
    if (this.constructor.name === 'Server') throw new Error('The base Server cannot be instantiated.');

    this.alreadyListening = opts.alreadyListening;
    this.isWebserver = isWebserver;
  }

  addMiddleware(middleware: Function) {
    throw new Error(`${this.constructor.name} doesn't have a addMiddleware method.`);
  }

  createEndpoint(path: string, handler: RequestHandler) {
    throw new Error(`${this.constructor.name} doesn't have a createEndpoint method.`);
  }

  handleInteraction(handler: InteractionHandler) {
    throw new Error(`${this.constructor.name} doesn't have a handleInteraction method.`);
  }

  async listen(port = 80, host = 'localhost') {
    throw new Error(`${this.constructor.name} doesn't have a listen method.`);
  }
}

export default Server;
