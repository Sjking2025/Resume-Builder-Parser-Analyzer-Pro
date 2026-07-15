const STATE = { CLOSED: 'CLOSED', OPEN: 'OPEN', HALF_OPEN: 'HALF_OPEN' }

class CircuitBreaker {
    constructor(failureThreshold = 3, resetTimeoutMs = 30000) {
        this.failureThreshold = failureThreshold
        this.resetTimeoutMs = resetTimeoutMs
        this.state = STATE.CLOSED
        this.failureCount = 0
        this.lastFailureTime = null
    }

    async call(fn) {
        if (this.state === STATE.OPEN) {
            if (Date.now() - this.lastFailureTime >= this.resetTimeoutMs) {
                this.state = STATE.HALF_OPEN
            } else {
                throw new Error('AI service is temporarily unavailable (circuit open)')
            }
        }

        try {
            const result = await fn()
            this._onSuccess()
            return result
        } catch (err) {
            this._onFailure()
            throw err
        }
    }

    _onSuccess() {
        this.failureCount = 0
        this.state = STATE.CLOSED
    }

    _onFailure() {
        this.failureCount++
        this.lastFailureTime = Date.now()
        if (this.failureCount >= this.failureThreshold) {
            this.state = STATE.OPEN
        }
    }

    getStatus() {
        return {
            state: this.state,
            failureCount: this.failureCount,
            failureThreshold: this.failureThreshold
        }
    }
}

module.exports = CircuitBreaker
