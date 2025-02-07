'use client';

import { useEffect, useState } from 'react';

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

const HeadingItem = ({ heading }: { heading: Heading }) => {
  return (
    <li>
      <a
        href={`#${heading.id}`}
        className="text-link hover:text-hover   transition-colors text-sm"
      >
        {heading.text}
      </a>
      {heading.children.length > 0 && (
        <ul className="space-y-2 ml-4 mt-2">
          {heading.children.map((child) => (
            <HeadingItem key={child.id} heading={child} />
          ))}
        </ul>
      )}
    </li>
  );
};

export default function TOC() {
  const headings = useHeadings();

  return (
    <nav className='fixed p-2 top-[90px] left-10 h-[calc(100vh-80px)] overflow-y-auto w-[170px] hidden lg:block styled-scrollbar' >
      <ul className="space-y-2">
        {headings.map((heading) => (
          <HeadingItem key={heading.id} heading={heading} />
        ))}
      </ul>
    </nav>
  );
}