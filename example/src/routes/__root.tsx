import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute, useRouter,
} from '@tanstack/react-router'
import * as React from 'react'
import { DefaultCatchBoundary } from '~/components/DefaultCatchBoundary'
import { NotFound } from '~/components/NotFound'
import appCss from '~/styles/app.css?url'
import ytEmbed from '~/styles/yt-embed.css?url'
import { seo } from '~/utils/seo'
import { useEffect } from 'react';
import { Layout } from '~/components/Layout';
import { handleHistoryTransitionStarted, handleRouteChangeComplete } from 'view-transition-name-handler';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      ...seo({
        title:
          'TanStack Start | Type-Safe, Client-First, Full-Stack React Framework',
        description: `TanStack Start is a type-safe, client-first, full-stack React framework. `,
      }),
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'stylesheet', href: ytEmbed },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png',
      },
      { rel: 'manifest', href: '/site.webmanifest', color: '#fffff' },
      { rel: 'icon', href: '/favicon.ico' },
    ],
  }),
  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    )
  },
  notFoundComponent: () => <NotFound />,
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    router.subscribe('onLoad', () => {
      if (router.history.location.state.key) {
        handleRouteChangeComplete(router.history.location.state.key);
      }
    })

    router.history.subscribe((prop) => {
      if (prop.action.type === 'FORWARD' || prop.action.type === 'BACK') {
        if (prop.location.state.key) {
          handleHistoryTransitionStarted(prop.location.state.key);
        }
      }
    })
  }, []);

  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        <Layout>
          {children}
        </Layout>
        <Scripts />
      </body>
    </html>
  )
}
