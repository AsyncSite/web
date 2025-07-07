export interface PerformanceMetrics {
  executionTime: number;
  memoryUsage?: number;
  validationTime?: number;
  workerCreationTime?: number;
}

export interface DetailedMetrics extends PerformanceMetrics {
  timestamp: number;
  playerId: number;
  success: boolean;
  errorType?: string;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metricsHistory: DetailedMetrics[] = [];
  private readonly MAX_HISTORY_SIZE = 1000;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  async measureExecution<T>(
    executor: () => Promise<T>,
    metadata?: { playerId?: number },
  ): Promise<[T, PerformanceMetrics]> {
    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();

    try {
      const result = await executor();

      const endTime = performance.now();
      const endMemory = this.getMemoryUsage();

      const metrics: PerformanceMetrics = {
        executionTime: endTime - startTime,
        memoryUsage: endMemory && startMemory ? endMemory - startMemory : undefined,
      };

      // Record successful execution
      if (metadata?.playerId !== undefined) {
        this.recordMetrics({
          ...metrics,
          timestamp: Date.now(),
          playerId: metadata.playerId,
          success: true,
        });
      }

      return [result, metrics];
    } catch (error: any) {
      const endTime = performance.now();
      const endMemory = this.getMemoryUsage();

      const metrics: PerformanceMetrics = {
        executionTime: endTime - startTime,
        memoryUsage: endMemory && startMemory ? endMemory - startMemory : undefined,
      };

      // Record failed execution
      if (metadata?.playerId !== undefined) {
        this.recordMetrics({
          ...metrics,
          timestamp: Date.now(),
          playerId: metadata.playerId,
          success: false,
          errorType: error.constructor.name,
        });
      }

      throw { error, metrics };
    }
  }

  measureSync<T>(executor: () => T): [T, PerformanceMetrics] {
    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();

    const result = executor();

    const endTime = performance.now();
    const endMemory = this.getMemoryUsage();

    const metrics: PerformanceMetrics = {
      executionTime: endTime - startTime,
      memoryUsage: endMemory && startMemory ? endMemory - startMemory : undefined,
    };

    return [result, metrics];
  }

  private getMemoryUsage(): number | undefined {
    // Check if memory API is available (Chrome/Edge)
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return undefined;
  }

  private recordMetrics(metrics: DetailedMetrics): void {
    this.metricsHistory.push(metrics);

    // Keep history size under control
    if (this.metricsHistory.length > this.MAX_HISTORY_SIZE) {
      this.metricsHistory = this.metricsHistory.slice(-this.MAX_HISTORY_SIZE);
    }
  }

  getPlayerStats(playerId: number): {
    totalExecutions: number;
    successRate: number;
    averageExecutionTime: number;
    maxExecutionTime: number;
    recentErrors: string[];
  } {
    const playerMetrics = this.metricsHistory.filter((m) => m.playerId === playerId);

    if (playerMetrics.length === 0) {
      return {
        totalExecutions: 0,
        successRate: 0,
        averageExecutionTime: 0,
        maxExecutionTime: 0,
        recentErrors: [],
      };
    }

    const successful = playerMetrics.filter((m) => m.success);
    const totalTime = playerMetrics.reduce((sum, m) => sum + m.executionTime, 0);
    const maxTime = Math.max(...playerMetrics.map((m) => m.executionTime));

    const recentErrors = playerMetrics
      .filter((m) => !m.success && m.errorType)
      .slice(-5)
      .map((m) => m.errorType!);

    return {
      totalExecutions: playerMetrics.length,
      successRate: successful.length / playerMetrics.length,
      averageExecutionTime: totalTime / playerMetrics.length,
      maxExecutionTime: maxTime,
      recentErrors,
    };
  }

  getGlobalStats(): {
    totalExecutions: number;
    averageSuccessRate: number;
    averageExecutionTime: number;
    peakExecutionTime: number;
    activePlayerCount: number;
  } {
    if (this.metricsHistory.length === 0) {
      return {
        totalExecutions: 0,
        averageSuccessRate: 0,
        averageExecutionTime: 0,
        peakExecutionTime: 0,
        activePlayerCount: 0,
      };
    }

    const successful = this.metricsHistory.filter((m) => m.success);
    const totalTime = this.metricsHistory.reduce((sum, m) => sum + m.executionTime, 0);
    const peakTime = Math.max(...this.metricsHistory.map((m) => m.executionTime));

    const uniquePlayers = new Set(this.metricsHistory.map((m) => m.playerId));

    return {
      totalExecutions: this.metricsHistory.length,
      averageSuccessRate: successful.length / this.metricsHistory.length,
      averageExecutionTime: totalTime / this.metricsHistory.length,
      peakExecutionTime: peakTime,
      activePlayerCount: uniquePlayers.size,
    };
  }

  clearHistory(): void {
    this.metricsHistory = [];
  }
}
