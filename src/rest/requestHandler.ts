import { SequentialBucket } from './sequentialBucket';
import { Request } from './request';
import type { Agent } from 'undici';
import { API_BASE_URL } from '../constants';
import type { BaseSlashCreator } from '../creator';

export interface RESTOptions {
  /** The dispatcher to use for undici. */
  agent?: Agent;
  /** The base URL to use for API requests. */
  baseURL?: string;
  /** A number of milliseconds to offset the ratelimit timing calculations by. */
  ratelimiterOffset?: number;
  /** A number of milliseconds before requests are considered timed out. */
  requestTimeout?: number;
  /** The amount of times it will retry to send the request. */
  retryLimit?: number;
}

export interface HashData {
  value: string;
  lastAccess: number;
}

export interface RequestOptions {
  /** Whether to add the "Authorization" header. */
  auth?: boolean;
  /** The data to be set for the request body. */
  body?: Record<string, any>;
  /** The headers to attach to the request. */
  headers?: Record<string, string>;
  /** The files to attach to the request body. */
  files?: FileContent[];
  /** An object of query keys and their values. */
  query?: Record<string, any>;
  /** The reason to display in the audit log. */
  reason?: string;
}

/** @private */
export interface FileContent {
  file: any;
  name: string;
}

/**
 * Represents a class to handle requests.
 */
export class RequestHandler {
  /** The creator that instansiated this handler. */
  creator?: BaseSlashCreator;

  /** A map with SequentialBuckets. */
  buckets = new Map<string, SequentialBucket>();

  /** Whether we are currently globally limited. */
  globalBlock = false;

  /** The timestamp of the next reset. */
  globalReset = 0;

  /** A promise that will resolve as soon we are no longer limited. */
  globalTimeout?: Promise<void>;

  /** A map with bucket hash data. */
  hashes = new Map<string, HashData>();

  /** Options for the RequestHandler. */
  options: RESTOptions;

  /** The authentication token. */
  #token?: string;

  /** Overrides for requests. */
  #overrides?: any;

  /**
   * Represents a class to handle requests.
   * @arg creator The creator that created the handler, if any.
   * @arg options Options for the RequestHandler.
   */
  constructor(creator?: BaseSlashCreator, options: RESTOptions & { token?: string; overrides?: any } = {}) {
    this.creator = creator;

    this.options = {
      agent: options.agent,
      baseURL: options.baseURL ?? API_BASE_URL,
      ratelimiterOffset: options.ratelimiterOffset ?? 0,
      requestTimeout: options.requestTimeout ?? 15000,
      retryLimit: options.retryLimit ?? 3
    };

    if (options.token) this.#token = options.token;
    if (options.overrides) this.#overrides = options.overrides;
  }

  /**
   * Whether we are currently globally limited.
   * @readonly
   */
  get limited() {
    return this.globalBlock && Date.now() < this.globalReset;
  }

  /**
   * Makes a request to the API.
   * @arg method An uppercase HTTP method.
   * @arg path The endpoint to make the request to.
   * @arg options Data regarding the request.
   * @returns Resolves with the returned JSON data.
   */
  async request<T = unknown>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
    const request = new Request(this, method, path, options, this.#overrides);
    if (options.auth) {
      if (!this.#token) throw new Error('Missing required token');
      request.headers['Authorization'] = this.#token;
    }

    const hash = this.hashes.get(request.id)?.value ?? request.id;

    const bucket = this.#getBucket(hash, request.majorParameter);
    return bucket.add<T>(request);
  }

  /**
   * Get or create a SequentialBucket for the request.
   * @arg {String} hash The hash of bucket.
   * @arg {String} majorParameter The major parameter of the bucket.
   * @returns {SequentialBucket}
   */
  #getBucket(hash: string, majorParameter: string) {
    const bucket = this.buckets.get(`${hash}:${majorParameter}`);
    if (bucket) return bucket;

    const newBucket = new SequentialBucket(this, hash, majorParameter);
    this.buckets.set(newBucket.id, newBucket);

    return newBucket;
  }
}
