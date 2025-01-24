'use client';

import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import Link from 'next/link';
import { generatePagination } from '@/app/ui/lib/utils';
import { usePathname, useSearchParams } from 'next/navigation';

export default function Pagination({ totalPages }: { totalPages: number }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentPage = Number(searchParams.get('page')) || 1;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const allPages = generatePagination(currentPage, totalPages);
  return (
    <div className="flex items-center justify-center gap-4 text-sm">
      {currentPage <= 1 ? (
        <span className="text-gray-300">上一页</span>
      ) : (
        <Link
          href={createPageURL(currentPage - 1)}
          className="text-link hover:text-hover transition-colors"
        >
          上一页
        </Link>
      )}

      <span className="text-link">
        {currentPage} / {totalPages}
      </span>

      {currentPage >= totalPages ? (
        <span className="text-gray-300">下一页</span>
      ) : (
        <Link
          href={createPageURL(currentPage + 1)}
          className="text-link hover:text-hover transition-colors"
        >
          下一页
        </Link>
      )}
    </div>
  );
}
