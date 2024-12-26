import { createFileRoute } from '@tanstack/react-router'
import { ImagesList } from '@/components/ImagesList';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [{ title: `Title-0`, }],
  }),
  component: HomePageComponent,
})

function HomePageComponent() {
  return (
    <ImagesList id={0} />
  )
}
