'use client';

import { useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';

interface Heading {
  id: string;
  text: string;
  level: number;
  children: Heading[];
}

export function useHeadings() {
  const [headings, setHeadings] = useState<Heading[]>([]);

  useEffect(() => {
    const headingElements = Array.from(
      document.querySelector('.blog-content')?.querySelectorAll('h1, h2, h3, h4, h5, h6') || []
    ) as HTMLElement[];

    const getLevel = (tagName: string) => parseInt(tagName[1]);

    const buildHeadingTree = (headings: HTMLElement[]): Heading[] => {
      const tree: Heading[] = [];
      const stack: Heading[] = [];

      headings.forEach((heading) => {
        const level = getLevel(heading.tagName);
        const node: Heading = {
          id: heading.id,
          text: heading.innerText,
          level,
          children: []
        };

        while (stack.length > 0 && stack[stack.length - 1].level >= level) {
          stack.pop();
        }

        if (stack.length === 0) {
          tree.push(node);
        } else {
          stack[stack.length - 1].children.push(node);
        }

        stack.push(node);
      });

      return tree;
    };

    const headingTree = buildHeadingTree(headingElements);
    setHeadings(headingTree);
  }, []);

  return headings;
}

const HeadingItem = ({ heading, onClick }: { heading: Heading; onClick?: () => void }) => {
  return (
    <li>
      <a
        href={`#${heading.id}`}
        className="text-link hover:text-hover transition-colors text-sm"
        onClick={() => {
          // 移动端点击后关闭目录
          onClick?.();
        }}
      >
        {heading.text}
      </a>
      {heading.children.length > 0 && (
        <ul className="space-y-2 ml-4 mt-2">
          {heading.children.map((child) => (
            <HeadingItem key={child.id} heading={child} onClick={onClick} />
          ))}
        </ul>
      )}
    </li>
  );
};

export default function TOC() {
  const headings = useHeadings();
  const isMobile = useMediaQuery({ maxWidth: 1023 }); // lg breakpoint
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


  return (
    <>
      {/* Mobile Toggle Button - 只在移动端显示 */}
      {isMobile && (
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="fixed bottom-4 left-4 z-50 p-2 bg-background/80 backdrop-blur-sm rounded-full shadow-lg lg:hidden"
          aria-label="Toggle table of contents"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      )}

      {/* Mobile TOC */}
      {isMobile && (
        <nav
          className={`lg:hidden fixed top-0 bottom-0 left-0 w-[280px] overflow-y-scroll scrollbar-none 
            bg-background/95 backdrop-blur z-40 p-4 transition-transform duration-300 
            border-r border-border shadow-lg [scrollbar-width:none] [-ms-overflow-style:none]
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <ul className="space-y-2">
            {headings.map((heading) => (
              <HeadingItem 
                key={heading.id} 
                heading={heading}
                onClick={() => setIsMobileMenuOpen(false)}
              />
            ))}
          </ul>
        </nav>
      )}

      {/* Desktop TOC */}
      {!isMobile && (
        <nav className="hidden lg:block fixed p-2 top-[90px] left-10 h-[calc(100vh-80px)] overflow-y-auto w-[170px] styled-scrollbar">
          <ul className="space-y-2">
            {headings.map((heading) => (
              <HeadingItem key={heading.id} heading={heading} />
            ))}
          </ul>
        </nav>
      )}
    </>
  );
}