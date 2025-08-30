// 性能测试和验证工具

/**
 * 动画性能测试工具
 */
export class AnimationPerformanceTester {
  private testResults: {
    fps: number[];
    memoryUsage: Array<{used: number; total: number; limit: number}>;
    animationCount: number;
    testDuration: number;
    timestamp: number;
  } = {
    fps: [],
    memoryUsage: [],
    animationCount: 0,
    testDuration: 0,
    timestamp: Date.now()
  };

  private isRunning = false;
  private startTime = 0;
  private frameCount = 0;
  private lastTime = 0;

  /**
   * 开始性能测试
   */
  startTest(duration: number = 10000): Promise<{
    fps: { average: number; min: number; max: number; stability: number };
    memory: { average: number; max: number; min: number; growth: number } | null;
    animationCount: number;
    testDuration: number;
    timestamp: number;
    performance: string;
  }> {
    return new Promise((resolve) => {
      if (this.isRunning) {
        console.warn('性能测试已在运行中');
        return;
      }

      this.isRunning = true;
      this.startTime = performance.now();
      this.frameCount = 0;
      this.lastTime = this.startTime;
      this.testResults = {
        fps: [],
        memoryUsage: [],
        animationCount: this.countAnimatedElements(),
        testDuration: duration,
        timestamp: Date.now()
      };

      console.log(`开始性能测试，持续时间: ${duration}ms`);

      const testFrame = () => {
        if (!this.isRunning) return;

        const now = performance.now();
        this.frameCount++;

        // 每秒记录一次FPS和内存使用
        if (now - this.lastTime >= 1000) {
          const fps = Math.round((this.frameCount * 1000) / (now - this.lastTime));
          this.testResults.fps.push(fps);
          
          // 记录内存使用（如果可用）
          if ('memory' in performance) {
            const memory = (performance as unknown as { 
              memory: {
                usedJSHeapSize: number;
                totalJSHeapSize: number;
                jsHeapSizeLimit: number;
              }
            }).memory;
            this.testResults.memoryUsage.push({
              used: memory.usedJSHeapSize,
              total: memory.totalJSHeapSize,
              limit: memory.jsHeapSizeLimit
            });
          }

          this.frameCount = 0;
          this.lastTime = now;
        }

        // 检查是否达到测试时间
        if (now - this.startTime >= duration) {
          this.stopTest();
          resolve(this.getTestResults());
          return;
        }

        requestAnimationFrame(testFrame);
      };

      requestAnimationFrame(testFrame);
    });
  }

  /**
   * 停止性能测试
   */
  stopTest(): void {
    this.isRunning = false;
    console.log('性能测试完成');
  }

  /**
   * 计算当前动画元素数量
   */
  private countAnimatedElements(): number {
    const animatedElements = document.querySelectorAll('.star[class*="twinkle"], .star[class*="float"]');
    return animatedElements.length;
  }

  /**
   * 获取测试结果
   */
  getTestResults() {
    const avgFPS = this.testResults.fps.reduce((a, b) => a + b, 0) / this.testResults.fps.length;
    const minFPS = Math.min(...this.testResults.fps);
    const maxFPS = Math.max(...this.testResults.fps);

    let memoryStats = null;
    if (this.testResults.memoryUsage.length > 0) {
      const memoryData = this.testResults.memoryUsage;
      const avgMemory = memoryData.reduce((a, b) => a + b.used, 0) / memoryData.length;
      const maxMemory = Math.max(...memoryData.map(m => m.used));
      const minMemory = Math.min(...memoryData.map(m => m.used));
      
      memoryStats = {
        average: Math.round(avgMemory / 1024 / 1024), // MB
        max: Math.round(maxMemory / 1024 / 1024), // MB
        min: Math.round(minMemory / 1024 / 1024), // MB
        growth: Math.round((maxMemory - minMemory) / 1024 / 1024) // MB
      };
    }

    return {
      fps: {
        average: Math.round(avgFPS),
        min: minFPS,
        max: maxFPS,
        stability: this.calculateFPSStability()
      },
      memory: memoryStats,
      animationCount: this.testResults.animationCount,
      testDuration: this.testResults.testDuration,
      timestamp: this.testResults.timestamp,
      performance: this.evaluatePerformance(avgFPS, minFPS)
    };
  }

  /**
   * 计算FPS稳定性
   */
  private calculateFPSStability(): number {
    if (this.testResults.fps.length < 2) return 100;

    const mean = this.testResults.fps.reduce((a, b) => a + b, 0) / this.testResults.fps.length;
    const variance = this.testResults.fps.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / this.testResults.fps.length;
    const standardDeviation = Math.sqrt(variance);
    
    // 稳定性评分：标准差越小，稳定性越高
    return Math.max(0, 100 - (standardDeviation / mean) * 100);
  }

  /**
   * 评估性能等级
   */
  private evaluatePerformance(avgFPS: number, minFPS: number): string {
    if (avgFPS >= 55 && minFPS >= 45) return '优秀';
    if (avgFPS >= 45 && minFPS >= 35) return '良好';
    if (avgFPS >= 30 && minFPS >= 25) return '一般';
    if (avgFPS >= 20 && minFPS >= 15) return '较差';
    return '很差';
  }
}

/**
 * 内存泄漏检测工具
 */
export class MemoryLeakDetector {
  private initialMemory: number = 0;
  private checkInterval: number | null = null;
  private memoryHistory: number[] = [];
  private isMonitoring = false;

  /**
   * 开始内存监控
   */
  startMonitoring(intervalMs: number = 5000): void {
    if (this.isMonitoring) {
      console.warn('内存监控已在运行中');
      return;
    }

    if (!('memory' in performance)) {
      console.warn('浏览器不支持内存监控API');
      return;
    }

    this.isMonitoring = true;
    this.initialMemory = (performance as unknown as { 
      memory: { usedJSHeapSize: number }
    }).memory.usedJSHeapSize;
    this.memoryHistory = [this.initialMemory];

    console.log('开始内存泄漏监控');

    this.checkInterval = window.setInterval(() => {
      const currentMemory = (performance as unknown as { 
        memory: { usedJSHeapSize: number }
      }).memory.usedJSHeapSize;
      this.memoryHistory.push(currentMemory);

      // 保持历史记录在合理范围内
      if (this.memoryHistory.length > 100) {
        this.memoryHistory.shift();
      }

      // 检测内存泄漏
      this.detectLeak();
    }, intervalMs);
  }

  /**
   * 停止内存监控
   */
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isMonitoring = false;
    console.log('停止内存泄漏监控');
  }

  /**
   * 检测内存泄漏
   */
  private detectLeak(): void {
    if (this.memoryHistory.length < 10) return;

    const recent = this.memoryHistory.slice(-10);
    const older = this.memoryHistory.slice(-20, -10);

    if (older.length === 0) return;

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

    const growthRate = (recentAvg - olderAvg) / olderAvg;

    // 如果内存增长超过10%，发出警告
    if (growthRate > 0.1) {
      console.warn(`检测到可能的内存泄漏，增长率: ${(growthRate * 100).toFixed(2)}%`);
      console.warn(`当前内存使用: ${Math.round(recentAvg / 1024 / 1024)}MB`);
    }
  }

  /**
   * 获取内存使用报告
   */
  getMemoryReport() {
    if (!('memory' in performance)) {
      return { error: '浏览器不支持内存监控API' };
    }

    const memory = (performance as unknown as { 
      memory: {
        usedJSHeapSize: number;
        totalJSHeapSize: number;
        jsHeapSizeLimit: number;
      }
    }).memory;
    const current = memory.usedJSHeapSize;
    const growth = current - this.initialMemory;
    const growthPercent = (growth / this.initialMemory) * 100;

    return {
      initial: Math.round(this.initialMemory / 1024 / 1024), // MB
      current: Math.round(current / 1024 / 1024), // MB
      growth: Math.round(growth / 1024 / 1024), // MB
      growthPercent: Math.round(growthPercent * 100) / 100,
      total: Math.round(memory.totalJSHeapSize / 1024 / 1024), // MB
      limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024), // MB
      history: this.memoryHistory.map(m => Math.round(m / 1024 / 1024))
    };
  }
}

/**
 * 可访问性测试工具
 */
export class AccessibilityTester {
  /**
   * 检查颜色对比度
   */
  checkColorContrast(): { 
    passed: boolean; 
    results: Array<{
      element: string;
      color: string;
      backgroundColor: string;
      contrast: number;
      passed: boolean;
      wcagLevel: string;
    }>
  } {
    const results: Array<{
      element: string;
      color: string;
      backgroundColor: string;
      contrast: number;
      passed: boolean;
      wcagLevel: string;
    }> = [];
    let allPassed = true;

    // 检查主要文本元素的对比度
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, a, span, div');
    
    textElements.forEach((element, index) => {
      if (index > 20) return; // 限制检查数量

      const styles = window.getComputedStyle(element);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;

      if (color && backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        const contrast = this.calculateContrast(color, backgroundColor);
        const passed = contrast >= 4.5; // WCAG AA标准

        results.push({
          element: element.tagName.toLowerCase(),
          color,
          backgroundColor,
          contrast: Math.round(contrast * 100) / 100,
          passed,
          wcagLevel: contrast >= 7 ? 'AAA' : (contrast >= 4.5 ? 'AA' : 'Failed')
        });

        if (!passed) allPassed = false;
      }
    });

    return { passed: allPassed, results };
  }

  /**
   * 计算颜色对比度
   */
  private calculateContrast(color1: string, color2: string): number {
    const rgb1 = this.parseColor(color1);
    const rgb2 = this.parseColor(color2);

    if (!rgb1 || !rgb2) return 0;

    const l1 = this.getLuminance(rgb1);
    const l2 = this.getLuminance(rgb2);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * 解析颜色值
   */
  private parseColor(color: string): { r: number; g: number; b: number } | null {
    const div = document.createElement('div');
    div.style.color = color;
    document.body.appendChild(div);
    
    const computedColor = window.getComputedStyle(div).color;
    document.body.removeChild(div);

    const match = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3])
      };
    }

    return null;
  }

  /**
   * 计算亮度
   */
  private getLuminance(rgb: { r: number; g: number; b: number }): number {
    const { r, g, b } = rgb;
    
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  /**
   * 检查动画偏好设置
   */
  checkAnimationPreferences(): { 
    respectsPreferences: boolean; 
    details: {
      prefersReducedMotion: boolean;
      animatedElementsCount: number;
      shouldDisableAnimations: boolean;
    }
  } {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animatedElements = document.querySelectorAll('.star[class*="twinkle"], .star[class*="float"]');
    
    let respectsPreferences = true;
    
    if (prefersReducedMotion && animatedElements.length > 0) {
      // 检查动画是否被正确禁用
      animatedElements.forEach(element => {
        const styles = window.getComputedStyle(element);
        if (styles.animationName !== 'none') {
          respectsPreferences = false;
        }
      });
    }

    return {
      respectsPreferences,
      details: {
        prefersReducedMotion,
        animatedElementsCount: animatedElements.length,
        shouldDisableAnimations: prefersReducedMotion
      }
    };
  }
}

// 导出测试工具实例
export const performanceTester = new AnimationPerformanceTester();
export const memoryLeakDetector = new MemoryLeakDetector();
export const accessibilityTester = new AccessibilityTester();