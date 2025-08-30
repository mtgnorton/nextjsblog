'use client';
import React, { useMemo, useRef } from 'react';

// 星空背景组件属性接口
interface StarryBackgroundProps {
  starsCount?: number;
  animationDuration?: number;
  enableTwinkle?: boolean;
  enableFloat?: boolean;
}



// 星空背景组件 - 简化版本
export default function StarryBackground({
  starsCount = 60,
  animationDuration = 4,
  enableTwinkle = true,
  enableFloat = true
}: StarryBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // 检查用户是否偏好减少动画
  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  // 使用useMemo缓存星星数据，避免重复计算
  const stars = useMemo(() => {
    // 如果用户偏好减少动画，减少星星数量
    const adjustedStarsCount = prefersReducedMotion ? Math.min(starsCount, 20) : starsCount;

    const starsArray = [];
    for (let i = 0; i < adjustedStarsCount; i++) {
      const star = {
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 3 + 1,
        animationDelay: Math.random() * animationDuration,
        opacity: Math.random() * 0.8 + 0.2,
      };
      starsArray.push(star);
    }
    return starsArray;
  }, [starsCount, animationDuration, prefersReducedMotion]);

  // 获取动画类名
  const getAnimationClasses = () => {
    if (prefersReducedMotion) {
      return ''; // 禁用所有动画
    }

    const classes = [];
    if (enableTwinkle) classes.push('twinkle');
    if (enableFloat) classes.push('float');
    return classes.join(' ');
  };

  // 获取星星样式
  const getStarStyle = (star: {
    id: number;
    left: number;
    top: number;
    size: number;
    animationDelay: number;
    opacity: number;
  }) => {
    return {
      left: `${star.left}%`,
      top: `${star.top}%`,
      width: `${star.size}px`,
      height: `${star.size}px`,
      animationDelay: `${star.animationDelay}s`,
      opacity: star.opacity,
    };
  };

  return (
    <div className="starry-background" ref={containerRef}>
      {/* 星云背景渐变 */}
      <div className={`nebula-gradient ${prefersReducedMotion ? 'static' : ''}`} />

      {/* 星星层 */}
      <div className="stars-container">
        {stars.map((star) => (
          <div
            key={star.id}
            className={`star ${getAnimationClasses()}`}
            style={getStarStyle(star)}
          />
        ))}
      </div>

      {/* 圆月 */}
      <div className="moon" />

    </div>
  );
}