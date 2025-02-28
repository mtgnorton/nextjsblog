import type { MDXComponents } from 'mdx/types'
import MDXImageZoom from '@/app/ui/components/mdx-image-zoom';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    img: (props) => <MDXImageZoom {...props} />,
  }
}
