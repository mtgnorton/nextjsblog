'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
  { name: 'Home', href: '/home'},
  {
    name: 'Blog',
    href: '/all',
  },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'text-link border-b-underline border-b-2 hover:text-hover',
              {
                'text-visited': pathname === link.href,
              }
            )}
          >
            <p className="">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
