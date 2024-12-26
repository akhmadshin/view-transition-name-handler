import { LazyLoadImageProps } from 'react-lazy-load-image-component';

import React, { forwardRef, useEffect, useRef, useState } from 'react';

type Props = LazyLoadImageProps & {
  priority?: boolean;
  alt?: string;
}

export const Image = forwardRef<HTMLImageElement, Props>(({
  priority,
  height,
  width,
  alt,
  title,
  className = '',
  src,
  children,
  ...props
}, ref) => {
  return (
    <img
      src={src}
      key={String(src)}
      className={`bg-no-repeat object-cover rounded-2xl ${className}`}
      draggable={'false'}
      alt={alt ?? ''}
      title={title ?? ''}
      height={height}
      width={width}
      // placeholderSrc={blurDataURL as `data:image/${string}`}
      {...props}
    />
  )
})

Image.displayName = 'Image';