'use client';
import React, { useState, useEffect } from 'react';
import { 
  performanceTester, 
  memoryLeakDetector, 
  accessibilityTester 
} from '../lib/performance-test';

interface TestResults {
  fps: {
    average: number;
    min: number;
    max: number;
    stability: number;
  };
  memory: {
    average: number;
    max: number;
    min: number;
    growth: number;
  } | null;
  animationCount: number;
  testDuration: number;
  timestamp: number;
  performance: string;
}

interface MemoryReport {
  initial?: number;
  current?: number;
  growth?: number;
  growthPercent?: number;
  total?: number;
  limit?: number;
  history?: number[];
  error?: string;
}

interface AccessibilityReport {
  colorContrast: {
    passed: boolean;
    results: Array<{
      element: string;
      color: string;
      backgroundColor: string;
      contrast: number;
      passed: boolean;
      wcagLevel: string;
    }>;
  };
  animationPreferences: {
    respectsPreferences: boolean;
    details: {
      prefersReducedMotion: boolean;
      animatedElementsCount: number;
      shouldDisableAnimations: boolean;
    };
  };
}

// 性能监控组件内部实现
function PerformanceMonitorContent() {
  const [isVisible, setIsVisible] = useState(false);
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [memoryReport, setMemoryReport] = useState<MemoryReport | null>(null);
  const [accessibilityReport, setAccessibilityReport] = useState<AccessibilityReport | null>(null);
  const [isTestRunning, setIsTestRunning] = useState(false);

  useEffect(() => {
    // 启动内存监控
    memoryLeakDetector.startMonitoring(3000);

    // 定期更新内存报告
    const memoryInterval = setInterval(() => {
      const report = memoryLeakDetector.getMemoryReport();
      setMemoryReport(report);
    }, 5000);

    return () => {
      memoryLeakDetector.stopMonitoring();
      clearInterval(memoryInterval);
    };
  }, []);

  const runPerformanceTest = async () => {
    setIsTestRunning(true);
    try {
      const results = await performanceTester.startTest(10000); // 10秒测试
      setTestResults(results);
    } catch (error) {
      console.error('性能测试失败:', error);
    } finally {
      setIsTestRunning(false);
    }
  };

  const runAccessibilityTest = () => {
    const contrastResults = accessibilityTester.checkColorContrast();
    const animationResults = accessibilityTester.checkAnimationPreferences();
    
    setAccessibilityReport({
      colorContrast: contrastResults,
      animationPreferences: animationResults
    });
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm z-50 hover:bg-blue-700 transition-colors"
        style={{ fontSize: '12px' }}
      >
        性能监控
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg max-w-md z-50 text-xs">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-sm">性能监控面板</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* 内存监控 */}
      <div className="mb-3">
        <h4 className="font-semibold mb-1">内存使用情况</h4>
        {memoryReport ? (
          memoryReport.error ? (
            <div className="text-red-400">{memoryReport.error}</div>
          ) : (
            <div className="space-y-1">
              <div>当前: {memoryReport.current || 0}MB</div>
              <div>增长: {memoryReport.growth || 0}MB ({memoryReport.growthPercent || 0}%)</div>
              <div className={`${(memoryReport.growthPercent || 0) > 20 ? 'text-red-400' : 'text-green-400'}`}>
                状态: {(memoryReport.growthPercent || 0) > 20 ? '可能存在内存泄漏' : '正常'}
              </div>
            </div>
          )
        ) : (
          <div>加载中...</div>
        )}
      </div>

      {/* 性能测试 */}
      <div className="mb-3">
        <h4 className="font-semibold mb-1">性能测试</h4>
        <button
          onClick={runPerformanceTest}
          disabled={isTestRunning}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-2 py-1 rounded text-xs mr-2"
        >
          {isTestRunning ? '测试中...' : '运行测试'}
        </button>
        {testResults && (
          <div className="mt-2 space-y-1">
            <div>平均FPS: {testResults.fps.average}</div>
            <div>最低FPS: {testResults.fps.min}</div>
            <div>稳定性: {Math.round(testResults.fps.stability)}%</div>
            <div className={`${testResults.performance === '优秀' || testResults.performance === '良好' ? 'text-green-400' : 'text-yellow-400'}`}>
              性能等级: {testResults.performance}
            </div>
            <div>动画数量: {testResults.animationCount}</div>
          </div>
        )}
      </div>

      {/* 可访问性测试 */}
      <div className="mb-3">
        <h4 className="font-semibold mb-1">可访问性测试</h4>
        <button
          onClick={runAccessibilityTest}
          className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs mr-2"
        >
          检查可访问性
        </button>
        {accessibilityReport && (
          <div className="mt-2 space-y-1">
            <div className={`${accessibilityReport.colorContrast.passed ? 'text-green-400' : 'text-red-400'}`}>
              颜色对比度: {accessibilityReport.colorContrast.passed ? '通过' : '未通过'}
            </div>
            <div className={`${accessibilityReport.animationPreferences.respectsPreferences ? 'text-green-400' : 'text-red-400'}`}>
              动画偏好: {accessibilityReport.animationPreferences.respectsPreferences ? '遵循' : '未遵循'}
            </div>
            {accessibilityReport.animationPreferences.details.prefersReducedMotion && (
              <div className="text-yellow-400">
                用户偏好减少动画
              </div>
            )}
          </div>
        )}
      </div>

      {/* 快速操作 */}
      <div className="border-t border-gray-600 pt-2">
        <h4 className="font-semibold mb-1">快速操作</h4>
        <div className="space-x-2">
          <button
            onClick={() => {
              const stars = document.querySelectorAll('.star');
              stars.forEach(star => {
                (star as HTMLElement).style.animationPlayState = 'paused';
              });
            }}
            className="bg-yellow-600 hover:bg-yellow-700 px-2 py-1 rounded text-xs"
          >
            暂停动画
          </button>
          <button
            onClick={() => {
              const stars = document.querySelectorAll('.star');
              stars.forEach(star => {
                (star as HTMLElement).style.animationPlayState = 'running';
              });
            }}
            className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs"
          >
            恢复动画
          </button>
        </div>
      </div>
    </div>
  );
}

// 性能监控组件 - 仅在开发环境显示
export default function PerformanceMonitor() {
  // 仅在开发环境显示
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return <PerformanceMonitorContent />;
}