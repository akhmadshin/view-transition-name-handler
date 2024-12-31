import React, { PropsWithChildren } from 'react';
import { Link as TanstackLink, LinkProps } from '@tanstack/react-router';
import { handleTransitionStarted } from 'view-transition-name-handler';

type Props = LinkProps & React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  placeholderData?: object;
}
export const Link: React.FC<PropsWithChildren<Props>> = ({ children, onClick, placeholderData, ...props }) => {
  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {

    if (onClick) {
      onClick(e);
    }
    window.placeholderData = placeholderData;

    const transitionImg = e.currentTarget.querySelector<HTMLImageElement>('.transitionable-img') || document.querySelector('#transition-video');
    const transitionTitle = e.currentTarget.querySelector<HTMLImageElement>('.transitionable-title') || document.querySelector('#transition-title');
    const src = transitionImg ? transitionImg.src.replace(location.origin || '', '') : '';

    handleTransitionStarted([
      {
        fromElement: transitionTitle,
        transitionName: 'transition-title',
        toAttributeName: 'data-title',
        toAttributeValue: src,
      },
      {
        fromElement: transitionImg,
        transitionName: 'transition-video',
        toAttributeName: 'data-src',
        toAttributeValue: src,
      },
    ]);
  }

  return (
    <TanstackLink
      viewTransition={true}
      onClick={handleClick}
      {...props}
    >
      {children}
    </TanstackLink>
  )
}