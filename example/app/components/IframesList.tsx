import { MOCK_THUMBNAILS } from '@/constants/MOCK_THUMBNAILS';
import React from 'react';
import { Container } from '@/components/Container';
import { Image } from '@/components/image';
import { Link } from '@/components/Link';
import { MOCK_YOUTUBE_IFRAMES } from '@/constants/MOCK_YOUTUBE_IFRAMES';
import { YouTubeEmbed } from '@/components/YouTubeEmbed';
import { useRouterState } from '@tanstack/react-router';

interface Props {
  id: number
}

export const getYoutubeIdFromUrl = (url: string) => {
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length == 11) {
    return match[2];
  }
}

export const IframesList: React.FC<Props> =  ({ id }) => {
  const iframe = MOCK_YOUTUBE_IFRAMES[id % 4];
  const routerState = useRouterState();

  const nextIframes = [
    MOCK_YOUTUBE_IFRAMES[(id + 1) % 4],
    MOCK_YOUTUBE_IFRAMES[(id + 2) % 4],
    MOCK_YOUTUBE_IFRAMES[(id + 3) % 4],
    MOCK_YOUTUBE_IFRAMES[(id + 4) % 4],
  ];
  const youTubeId = getYoutubeIdFromUrl(iframe.content.url);

  return (
    <>
      <Container>
        {youTubeId && (
          <div>
            <div
              id="transition-title"
              data-title={iframe.content.thumbnail}
            >
              <h1 className="text-4xl lg:text-6xl font-bold py-4">Title - {id}</h1>
            </div>
            <div
              id="transition-video"
              data-src={iframe.content.thumbnail}
            >
              <YouTubeEmbed
                id={youTubeId}
                thumbnail={iframe.content.thumbnail}
                title={iframe.content.title}
              />
            </div>
          </div>
        )}

        <div className="my-4 block grid grid-rows-2 grid-cols-2 gap-4">
          {nextIframes.map((iframe, index) => {
            return (
              <Link href={`/${id + index + 1}`}>
                <h3
                  data-title={iframe.content.thumbnail}
                  className="text-lg lg:text-3xl font-bold pt-2 transitionable-title">
                  Title - {id + index + 1}
                </h3>
                <Image
                  data-src={iframe.content.thumbnail}
                  className="aspect-[16/9] transitionable-img"
                  priority
                  sizes="100vw"
                  src={iframe.content.thumbnail}
                  width={1600}
                  height={900}
                />
              </Link>
            )
          })}
        </div>
      </Container>
    </>
  )
}