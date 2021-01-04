/** @hidden */
export interface MinimalLatencyRef {
    /** Interval between consuming tokens. */
    latency: number;
    offset?: number;
}
/** @hidden */
declare type CallbackFunction = (callback: () => void) => unknown;
/**
 * Ratelimit requests and release in sequence.
 * @private
 */
declare class SequentialBucket {
    /** How many tokens the bucket can consume in the current interval. */
    limit: number;
    /** Whether the queue is being processed. */
    processing: boolean;
    /** How many tokens the bucket has left in the current interval. */
    remaining: number;
    /** Timestamp of next reset. */
    reset: number;
    private latencyRef;
    private _queue;
    private processingTimeout;
    private last?;
    /**
     * @param limit The max number of tokens the bucket can consume per interval
     * @param latencyRef The latency reference
     */
    constructor(limit: number, latencyRef?: MinimalLatencyRef);
    /**
     * Checks the bucket and runs through the functions.
     * @param override Whether to override the processing property
     */
    check(override?: boolean): void;
    /**
     * Queue something in the SequentialBucket
     * @param func A function to call when a token can be consumed. The function will be passed a callback argument, which must be called to allow the bucket to continue to work
     */
    queue(func: CallbackFunction, short?: boolean): void;
    toString(): string;
}
export default SequentialBucket;
