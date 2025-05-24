import React, { PropsWithChildren } from 'react';
import { Link as TanstackLink, LinkProps, useRouterState } from '@tanstack/react-router';
import { handleTransitionStarted } from 'view-transition-name-handler';

type Props = LinkProps & React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  placeholderData?: object;
}
export const Link: React.FC<PropsWithChildren<Props>> = ({ children, onClick, placeholderData, ...props }) => {
  const router = useRouterState();

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
    }

    const transitionImg = e.currentTarget.querySelector<HTMLImageElement>('.transitionable-img') || document.querySelector('#transition-video');
    const transitionTitle = e.currentTarget.querySelector<HTMLImageElement>('.transitionable-title') || document.querySelector('#transition-title');
    const src = transitionImg ? transitionImg.src.replace(location.origin || '', '') : '';

    const currentRouterKey = router.location.state.key;
    if (!currentRouterKey) {
      return;
    }
    handleTransitionStarted(currentRouterKey, [
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
      onClick={handleClick}
      {...props}
    >
      {children}
    </TanstackLink>
  )
}