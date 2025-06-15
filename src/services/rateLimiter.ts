class RateLimiter {
  private queue: Array<() => Promise<any>> = []
  private isProcessing = false
  private lastRequestTime = 0
  private readonly minInterval = 1000 // 1 second between requests

  async addRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await requestFn()
          resolve(result)
        } catch (error) {
          reject(error)
        }
      })

      this.processQueue()
    })
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return
    }

    this.isProcessing = true

    while (this.queue.length > 0) {
      const now = Date.now()
      const timeSinceLastRequest = now - this.lastRequestTime
      
      if (timeSinceLastRequest < this.minInterval) {
        const waitTime = this.minInterval - timeSinceLastRequest
        console.log(`Rate limiting: waiting ${waitTime}ms before next request`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }

      const request = this.queue.shift()
      if (request) {
        this.lastRequestTime = Date.now()
        console.log(`Processing request at ${new Date(this.lastRequestTime).toISOString()}`)
        await request()
      }
    }

    this.isProcessing = false
  }

  getQueueLength(): number {
    return this.queue.length
  }

  isQueueEmpty(): boolean {
    return this.queue.length === 0
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter()