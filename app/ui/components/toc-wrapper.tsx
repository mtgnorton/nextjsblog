'use client';

import dynamic from 'next/dynamic';

const TOC = dynamic(() => import('@/app/ui/components/toc'), {
  // loading: () => <div className="min-w-[200px]">加载目录中...</div>
});

export default function TOCWrapper() {
  return <TOC />;
} 