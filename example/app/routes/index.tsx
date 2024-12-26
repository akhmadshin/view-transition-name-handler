import { createFileRoute } from '@tanstack/react-router'
import { ImagesList } from '@/components/ImagesList';
import { IframesList } from '@/components/IframesList';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [{ title: `Title-0`, }],
  }),
  component: HomePageComponent,
})

function HomePageComponent() {
  return (
    <IframesList id={0} />
  )
}
