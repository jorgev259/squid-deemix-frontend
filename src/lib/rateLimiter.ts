import { setTimeout } from "timers/promises";

const intervalMs = 10 * 1000
const maxRequests = 50

class RateLimiter {
  private _remainingRequests = maxRequests;
  private _intervalRef: ReturnType<typeof setInterval> & { _idleStart: number, _idleTimeout: number };

  constructor() {
    // @ts-expect-error Access underlying variable
    this._intervalRef = setInterval(() => {
      this._remainingRequests = maxRequests

    }, intervalMs)
  }

  private get _nextIntervalMs() {
    return (this._intervalRef._idleStart + this._intervalRef._idleTimeout) - (process.uptime() * 1000)
  }

  async handle() {
    if (this._remainingRequests === 0) {
      await setTimeout(this._nextIntervalMs + (1 * 1000))
      while (this._remainingRequests === 0) {
        await setTimeout(100)
      }
    }
    this._remainingRequests -= 1
  }
}

const rateLimiter = new RateLimiter()

export default rateLimiter