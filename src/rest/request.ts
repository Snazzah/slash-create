import type { fetch as UndiciFetch, FormData as UndiciFormData, Response } from 'undici';
import type { FileContent, RequestHandler, RequestOptions } from './requestHandler';
import type { Blob as NodeBlob } from 'node:buffer';
import { getCreatedAt } from '../util';

// const fetch: typeof UndiciFetch = 'fetch' in globalThis ? globalThis.fetch : require('undici').fetch;
// const FormData: typeof UndiciFormData = 'FormData' in globalThis ? globalThis.FormData : require('undici').FormData;
// const Blob: typeof NodeBlob = 'Blob' in globalThis ? globalThis.Blob : require('node:buffer').Blob;

const USER_AGENT = `DiscordBot (https://github.com/Snazzah/slash-create, ${require('../../package.json').version})`;

/**
 * Represents the request.
 */
export class Request {
  /** The data to be set for the request body. */
  data?: UndiciFormData | string;

  /** The RequestHandler. */
  handler: RequestHandler;

  /**
   * The headers to attach to the request.
   * @type {Object}
   */
  headers: Record<string, string> = {
    'Accept-Encoding': 'gzip,deflate',
    'User-Agent': USER_AGENT
  };

  /** The major parameter of the request. */
  majorParameter: string;

  /** An uppercase HTTP method. */
  method: string;

  /** Data regarding the request. */
  options: RequestOptions;

  /** The endpoint to make the request to. */
  path: string;

  /** The route to make the request to. */
  route: string;

  /** The URL to make the request to. */
  url: URL;

  /** Overrides for requests. */
  #overrides?: any;

  /**
   * Represents the request.
   * @arg handler Represents the RequestHandler.
   * @arg method An uppercase HTTP method.
   * @arg path The endpoint to make the request to.
   * @arg options Data regarding the request.
   */
  constructor(
    handler: RequestHandler,
    method: string,
    path: string,
    options: RequestOptions,
    overrides?: { fetch?: typeof UndiciFetch; FormData?: typeof UndiciFormData; Blob?: typeof NodeBlob }
  ) {
    this.handler = handler;
    this.method = method;
    this.path = path;
    this.options = options;
    this.#overrides = overrides;

    this.url = new URL(handler.options.baseURL + path);
    if (typeof options.query === 'object') {
      for (const key in options.query) {
        if (options.query[key] !== undefined) this.url.searchParams.append(key, options.query[key]);
      }
    }

    if (typeof options.headers === 'object') {
      for (const key in options.headers) this.headers[key] = options.headers[key];
    }

    if (options.reason) {
      this.headers['X-Audit-Log-Reason'] = encodeURIComponent(options.reason);
    }

    this.setBody(options.body, options.files);
    this.majorParameter = this.#getMajorParameter();
    this.route = this.#getRoute();
  }

  /**
   * The identifier of the request.
   * @readonly
   */
  get id() {
    return `${this.method}:${this.route}`;
  }

  /**
   * Sends the request to Discord.
   * @returns The response.
   */
  async send(): Promise<Response> {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), this.handler.options.requestTimeout);

    return (this.#overrides?.fetch || fetch)(this.url, {
      body: this.data,
      dispatcher: this.handler.options.agent,
      headers: this.headers,
      method: this.method,
      signal: controller.signal
    });
  }

  /**
   * Attach data to the request.
   * @arg body Optional data to attach to the request.
   * @arg files Optional files to attach to the request.
   */
  setBody(body?: Record<string, any>, files?: FileContent[]): Request {
    if (files?.length) {
      const form: UndiciFormData = new (this.#overrides?.FormData || FormData)();
      for (let i = 0; i < files.length; i++) {
        if (files[i]) {
          let file = files[i].file;
          if ('Buffer' in globalThis && file instanceof Buffer) file = new (this.#overrides?.Blob || Blob)([file]);
          form.append(`files[${i}]`, file, files[i].name);
        }
      }

      if (body) form.append('payload_json', JSON.stringify(body));

      this.data = form;
    } else if (body) {
      this.data = JSON.stringify(body, (k, v) => (typeof v === 'bigint' ? v.toString() : v));
      this.headers['Content-Type'] = 'application/json';
    }

    return this;
  }

  /**
   * Returns the major parameter based of the request.
   * @returns The major parameter.
   */
  #getMajorParameter(): string {
    return /^\/(?:channels|guilds|webhooks)\/(\d{16,19})/.exec(this.path)?.[1] ?? 'global';
  }

  /**
   * Returns the route based of the request.
   * @returns The route of the request.
   */
  #getRoute(): string {
    const route = this.path
      .replace(/\/reactions\/.*/g, '/reactions/:id')
      .replace(/\d{16,19}/g, ':id')
      .replace(/[a-zA-Z0-9]{150,300}/g, ':token');

    let exceptions = '';
    if (this.method === 'DELETE' && route === '/channels/:id/messages/:id') {
      const messageID = this.path.slice(this.path.lastIndexOf('/') + 1);
      const createdAt = getCreatedAt(messageID);

      const diff = Date.now() - createdAt;
      if (diff >= 1_209_600_000) {
        exceptions += ';old';
      } else if (diff <= 10_000) {
        exceptions += ';new';
      }
    }

    return route + exceptions;
  }
}
