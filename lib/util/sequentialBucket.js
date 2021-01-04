"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Ratelimit requests and release in sequence.
 * @private
 */
class SequentialBucket {
    /**
     * @param limit The max number of tokens the bucket can consume per interval
     * @param latencyRef The latency reference
     */
    constructor(limit, latencyRef = { latency: 0 }) {
        /** Whether the queue is being processed. */
        this.processing = false;
        /** Timestamp of next reset. */
        this.reset = 0;
        this._queue = [];
        this.limit = this.remaining = limit;
        this.latencyRef = latencyRef;
    }
    /**
     * Checks the bucket and runs through the functions.
     * @param override Whether to override the processing property
     */
    check(override = false) {
        if (this._queue.length === 0) {
            if (this.processing) {
                clearTimeout(this.processingTimeout);
                this.processing = false;
            }
            return;
        }
        if (this.processing && !override) {
            return;
        }
        const now = Date.now();
        const offset = this.latencyRef.latency + (this.latencyRef.offset || 0);
        if (!this.reset || this.reset < now - offset) {
            this.reset = now - offset;
            this.remaining = this.limit;
        }
        this.last = now;
        if (this.remaining <= 0) {
            this.processingTimeout = setTimeout(() => {
                this.processing = false;
                this.check(true);
            }, Math.max(0, (this.reset || 0) - now + offset) + 1);
            return;
        }
        --this.remaining;
        this.processing = true;
        this._queue.shift()(() => {
            if (this._queue.length > 0) {
                this.check(true);
            }
            else {
                this.processing = false;
            }
        });
    }
    /**
     * Queue something in the SequentialBucket
     * @param func A function to call when a token can be consumed. The function will be passed a callback argument, which must be called to allow the bucket to continue to work
     */
    queue(func, short = false) {
        if (short) {
            this._queue.unshift(func);
        }
        else {
            this._queue.push(func);
        }
        this.check();
    }
    toString() {
        return '[SequentialBucket]';
    }
}
exports.default = SequentialBucket;
