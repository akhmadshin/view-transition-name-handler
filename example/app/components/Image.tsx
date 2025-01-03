import React, { forwardRef, ImgHTMLAttributes } from 'react';
import { Component } from '@/types/general';

export const Image: Component<ImgHTMLAttributes<HTMLImageElement>> = ({
  height,
  width,
  alt,
  title,
  className = '',
  src,
  children,
  ...props
}) => {
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
      {...props}
    />
  )
}