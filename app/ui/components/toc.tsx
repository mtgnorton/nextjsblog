'use client';

import { useEffect, useState, useRef } from 'react';

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
        onClick={() => onClick?.()}
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // 当菜单打开时，点击非导航区域且非按钮区域时关闭菜单
      if (
        isMenuOpen &&
        navRef.current &&
        buttonRef.current &&
        !navRef.current.contains(e.target as Node) &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMenuOpen]);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="fixed bottom-4 left-4 z-50 p-2 bg-background/80 backdrop-blur-sm rounded-full shadow-lg )]"
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

      <nav
        ref={navRef}
        className={`fixed top-0 bottom-0 left-0 overflow-y-scroll scrollbar-none 
          bg-background/95 backdrop-blur z-40 p-4 transition-transform duration-300 
           shadow-lg [scrollbar-width:none] [-ms-overflow-style:none]
          ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          w-[280px]`}
      >
        <ul className="space-y-2">
          {headings.map((heading) => (
            <HeadingItem 
              key={heading.id} 
              heading={heading}
              onClick={() => setIsMenuOpen(false)}
            />
          ))}
        </ul>
      </nav>
    </>
  );
}