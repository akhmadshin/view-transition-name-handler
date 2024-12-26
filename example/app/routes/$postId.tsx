import { createFileRoute } from '@tanstack/react-router'
import React, { useMemo } from 'react'
import { ImagesList } from '@/components/ImagesList'

export const Route = createFileRoute('/$postId')({
  loader: async ({ params: { postId } }) => {
    return {
      title: `Title-${postId}`,
    }
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [{ title: loaderData.title }] : undefined,
  }),
  component: PostComponent,
})

const r = /\d+/

function PostComponent() {
  const { postId } = Route.useParams()

  const id = useMemo(() => {
    const slugInt = postId ? parseInt(postId.match(r)![0]) : 0
    return slugInt ?? 0
  }, [postId])
  return <ImagesList id={id} />
}
