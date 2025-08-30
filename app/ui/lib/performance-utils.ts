// 性能优化和监控工具函数

/**
 * 性能监控类 - 用于监控动画性能和智能降级
 */
export class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = 0;
  private fps = 60;
  private isMonitoring = false;
  private callbacks: Array<(fps: number) => void> = [];
  private animationId: number | null = null;

  constructor() {
    // 只在客户端初始化
    if (typeof window !== 'undefined') {
      this.checkInitialPerformance();
    }
  }

  /**
   * 检测初始性能状态
   */
  private checkInitialPerformance(): boolean {
    // 服务器端渲染时返回默认值
    if (typeof window === 'undefined') {
      return true;
    }

    // 检测用户偏好
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return false;
    }

    // 检测设备性能指标
    const deviceMemory = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
    const hardwareConcurrency = navigator.hardwareConcurrency;
    const connection = (navigator as unknown as { connection?: { effectiveType: string } }).connection;

    // 内存检测
    if (deviceMemory && deviceMemory < 4) {
      return false;
    }

    // CPU核心数检测
    if (hardwareConcurrency && hardwareConcurrency < 4) {
      return false;
    }

    // 网络连接检测
    if (connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')) {
      return false;
    }

    // 移动设备检测
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      return false;
    }

    return true;
  }

  /**
   * 开始FPS监控
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.monitorFrame();
  }

  /**
   * 停止FPS监控
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * 监控帧率
   */
  private monitorFrame = (): void => {
    if (!this.isMonitoring) return;

    const now = performance.now();
    this.frameCount++;

    // 每秒计算一次FPS
    if (now - this.lastTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastTime));
      this.frameCount = 0;
      this.lastTime = now;

      // 通知所有回调函数
      this.callbacks.forEach(callback => callback(this.fps));
    }

    this.animationId = requestAnimationFrame(this.monitorFrame);
  };

  /**
   * 添加FPS变化回调
   */
  onFPSChange(callback: (fps: number) => void): void {
    this.callbacks.push(callback);
  }

  /**
   * 移除FPS变化回调
   */
  removeFPSCallback(callback: (fps: number) => void): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  /**
   * 获取当前FPS
   */
  getCurrentFPS(): number {
    return this.fps;
  }

  /**
   * 判断是否应该降级动画
   */
  shouldReduceAnimations(): boolean {
    return this.fps < 30 || !this.checkInitialPerformance();
  }
}

/**
 * 动画内存泄漏防护工具
 */
export class AnimationCleanup {
  private animatedElements = new Set<HTMLElement>();
  private observers = new Map<HTMLElement, MutationObserver>();

  /**
   * 注册需要监控的动画元素
   */
  registerElement(element: HTMLElement): void {
    this.animatedElements.add(element);
    this.setupObserver(element);
  }

  /**
   * 设置DOM变化观察器
   */
  private setupObserver(element: HTMLElement): void {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.removedNodes.forEach((node) => {
            if (node instanceof HTMLElement && this.animatedElements.has(node)) {
              this.cleanupElement(node);
            }
          });
        }
      });
    });

    observer.observe(element.parentNode || document.body, {
      childList: true,
      subtree: true
    });

    this.observers.set(element, observer);
  }

  /**
   * 清理元素的动画
   */
  private cleanupElement(element: HTMLElement): void {
    // 停止所有动画
    element.style.animation = 'none';
    element.style.willChange = 'auto';
    
    // 移除硬件加速
    element.style.transform = 'none';
    element.style.backfaceVisibility = 'visible';

    // 从监控集合中移除
    this.animatedElements.delete(element);

    // 清理观察器
    const observer = this.observers.get(element);
    if (observer) {
      observer.disconnect();
      this.observers.delete(element);
    }
  }

  /**
   * 清理所有注册的元素
   */
  cleanupAll(): void {
    this.animatedElements.forEach(element => {
      this.cleanupElement(element);
    });
  }

  /**
   * 暂停所有动画
   */
  pauseAll(): void {
    this.animatedElements.forEach(element => {
      element.style.animationPlayState = 'paused';
    });
  }

  /**
   * 恢复所有动画
   */
  resumeAll(): void {
    this.animatedElements.forEach(element => {
      element.style.animationPlayState = 'running';
    });
  }
}

/**
 * 智能动画配置
 */
export interface SmartAnimationConfig {
  starsCount: number;
  animationDuration: number;
  enableTwinkle: boolean;
  enableFloat: boolean;
  enableHardwareAcceleration: boolean;
}

/**
 * 根据设备性能生成智能动画配置
 */
export function generateSmartAnimationConfig(): SmartAnimationConfig {
  const monitor = new PerformanceMonitor();
  const shouldReduce = monitor.shouldReduceAnimations();

  // 检测设备类型
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isTablet = /iPad|Android.*Tablet/i.test(navigator.userAgent);
  const isLowEnd = (navigator as unknown as { deviceMemory?: number }).deviceMemory && (navigator as unknown as { deviceMemory?: number }).deviceMemory! < 4;

  let config: SmartAnimationConfig = {
    starsCount: 60,
    animationDuration: 4,
    enableTwinkle: true,
    enableFloat: true,
    enableHardwareAcceleration: true
  };

  // 根据设备性能调整配置
  if (shouldReduce || isLowEnd) {
    config = {
      starsCount: 20,
      animationDuration: 6,
      enableTwinkle: true,
      enableFloat: false,
      enableHardwareAcceleration: false
    };
  } else if (isMobile && !isTablet) {
    config = {
      starsCount: 30,
      animationDuration: 5,
      enableTwinkle: true,
      enableFloat: true,
      enableHardwareAcceleration: true
    };
  } else if (isTablet) {
    config = {
      starsCount: 45,
      animationDuration: 4.5,
      enableTwinkle: true,
      enableFloat: true,
      enableHardwareAcceleration: true
    };
  }

  // 检测用户偏好
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    config.enableTwinkle = false;
    config.enableFloat = false;
    config.starsCount = 0;
  }

  return config;
}

/**
 * 电池状态监控（如果支持）
 */
export class BatteryOptimizer {
  private battery: {
    level: number;
    charging: boolean;
    addEventListener: (event: string, callback: () => void) => void;
  } | null = null;
  private isOptimizing = false;

  constructor() {
    // 只在客户端初始化
    if (typeof window !== 'undefined') {
      this.initBatteryAPI();
    }
  }

  private async initBatteryAPI(): Promise<void> {
    try {
      if ('getBattery' in navigator) {
        this.battery = await (navigator as unknown as { getBattery: () => Promise<{
          level: number;
          charging: boolean;
          addEventListener: (event: string, callback: () => void) => void;
        }> }).getBattery();
        this.setupBatteryListeners();
      }
    } catch (error) {
      console.warn('电池API不可用:', error);
    }
  }

  private setupBatteryListeners(): void {
    if (!this.battery) return;

    const checkBatteryStatus = () => {
      if (!this.battery) return;
      
      const isLowBattery = this.battery.level < 0.2;
      const isCharging = this.battery.charging;

      // 低电量且未充电时启用优化
      this.isOptimizing = isLowBattery && !isCharging;
    };

    this.battery.addEventListener('levelchange', checkBatteryStatus);
    this.battery.addEventListener('chargingchange', checkBatteryStatus);
    
    // 初始检查
    checkBatteryStatus();
  }

  shouldOptimizeForBattery(): boolean {
    return this.isOptimizing;
  }

  getBatteryLevel(): number {
    return this.battery ? this.battery.level : 1;
  }

  isCharging(): boolean {
    return this.battery ? this.battery.charging : true;
  }
}

// 导出单例实例
export const performanceMonitor = new PerformanceMonitor();
export const animationCleanup = new AnimationCleanup();
export const batteryOptimizer = new BatteryOptimizer();