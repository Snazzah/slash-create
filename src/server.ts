/* eslint-disable @typescript-eslint/no-unused-vars */

import { AnyRequestData } from './constants';
import type { FileContent } from './rest/requestHandler';

/**
 * The base Server for {@link SlashCreator}.
 * @private
 */
export class Server {
  /** Whether this server is already listening to a port. */
  alreadyListening: boolean;
  /** Whether this server is a webserver. */
  isWebserver: boolean;

  /**
   * @param opts The server options
   * @param isWebserver Whether this server is a webserver
   */
  constructor(opts: ServerOptions = { alreadyListening: false }, isWebserver = true) {
    if (this.constructor.name === 'Server') throw new Error('The base Server cannot be instantiated.');

    this.alreadyListening = opts.alreadyListening;
    this.isWebserver = isWebserver;
  }

  /** @private */
  addMiddleware(middleware: Function) {
    throw new Error(`${this.constructor.name} doesn't have a addMiddleware method.`);
  }

  /** @private */
  createEndpoint(path: string, handler: ServerRequestHandler) {
    throw new Error(`${this.constructor.name} doesn't have a createEndpoint method.`);
  }

  /** @private */
  handleInteraction(handler: InteractionHandler) {
    throw new Error(`${this.constructor.name} doesn't have a handleInteraction method.`);
  }

  /** @private */
  async listen(port = 8030, host = 'localhost') {
    throw new Error(`${this.constructor.name} doesn't have a listen method. You should remove \`.startServer()\`.`);
  }
}

/** Options for a {@link Server}. */
export interface ServerOptions {
  /** Whether or not the server is already listening to a port. */
  alreadyListening: boolean;
}

/** A general HTTP request. */
export interface TransformedRequest {
  /** The headers of the request. */
  headers: { [key: string]: string | string[] | undefined };
  /** The body of the request. */
  body: any;
  /** The request class from a Server, depending on what server it is. */
  request: any;
  /** The response class from a Server, depending on what server it is. */
  response: any;
}

/**
 * A general HTTP response.
 * @private
 */
export interface Response {
  /** The status code for the response. */
  status?: number;
  /** The headers for the response. */
  headers?: { [key: string]: string | string[] | undefined };
  /** The body of the response. */
  body?: any;
  /** The files of the response. */
  files?: FileContent[];
}

/**
 * The response function for a {@link Server}.
 * @private
 */
export type RespondFunction = (response: Response) => Promise<void>;

/**
 * The handler for pushing requests to a {@link SlashCreator}.
 * @private
 */
export type ServerRequestHandler = (treq: TransformedRequest, respond: RespondFunction) => Promise<void>;

/**
 * The handler for pushing interaction events to a {@link SlashCreator}.
 * @private
 */
export type InteractionHandler = (interaction: AnyRequestData) => void;
