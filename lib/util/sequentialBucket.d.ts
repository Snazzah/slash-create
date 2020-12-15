export interface LatencyRef {
    latency: number;
    offset?: number;
}
/** Ratelimit requests and release in sequence */
declare class SequentialBucket {
    /** How many tokens the bucket can consume in the current interval */
    limit: number;
    /** Whether the queue is being processed */
    processing: boolean;
    /** How many tokens the bucket has left in the current interval */
    remaining: number;
    /** Timestamp of next reset */
    reset: number;
    private latencyRef;
    private _queue;
    private processingTimeout;
    private last?;
    /**
     * Construct a SequentialBucket
     * @arg {Number} limit The max number of tokens the bucket can consume per interval
     * @arg {Object} [latencyRef] An object
     * @arg {Number} latencyRef.latency Interval between consuming tokens
     */
    constructor(limit: number, latencyRef?: LatencyRef);
    check(override?: boolean): void;
    /**
     * Queue something in the SequentialBucket
     * @param func A function to call when a token can be consumed. The function will be passed a callback argument, which must be called to allow the bucket to continue to work
     */
    queue(func: Function, short?: boolean): void;
    toString(): string;
}
export default SequentialBucket;
