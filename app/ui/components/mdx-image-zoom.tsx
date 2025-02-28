'use client';

import Image from 'next/image';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

const RenderImage = ({ src, alt, ...props }: { src: string; alt: string }) => (
  <div className="image-container">
    <Image
      {...props}
      src={src}
      width={0}
      height={0}
      alt={alt}
      sizes="100vw"
      style={{
        width: '100%',
        height: 'auto'
      }}
    />
  </div>
);

export default function MDXImageZoom(props: { src?: string; alt?: string }) {
  const { src = '', alt = '' } = props;

  // 统一处理空值情况
  if (!src.trim()) {
    console.error('Image source is empty');
    return null;
  }

  // 处理相对路径的图片
  if (src.startsWith('../') || src.startsWith('./')) {
      // 移除相对路径前缀,直接使用文件名
      const imagePath = src.replace(/^\.\.\//, '/');
      return (
        <Zoom>
          <RenderImage src={imagePath} alt={alt} />
        </Zoom>
      );
 
  }

  // 处理绝对URL
  if (src.startsWith('http')) {
      new URL(src); // 验证URL格式
      return (
        <Zoom>
          <RenderImage src={src} alt={alt} />
        </Zoom>
      );
 
  }

  // 其他情况直接渲染
  return (
    <Zoom>
      <RenderImage src={src} alt={alt} />
    </Zoom>
  );
}