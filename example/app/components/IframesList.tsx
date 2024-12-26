import { MOCK_THUMBNAILS } from '@/constants/MOCK_THUMBNAILS';
import React from 'react';
import { Container } from '@/components/Container';
import { Image } from '@/components/image';
import { Link } from '@/components/Link';
import { MOCK_YOUTUBE_IFRAMES } from '@/constants/MOCK_YOUTUBE_IFRAMES';
import { YouTubeEmbed } from '@/components/YouTubeEmbed';

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
          <div
            data-src={iframe.content.thumbnail}
          >
            <YouTubeEmbed
              id={youTubeId}
              thumbnail={iframe.content.thumbnail}
              title={iframe.content.title}

            />
          </div>
        )}

        <div className="my-10 block grid grid-rows-2 grid-cols-2 lg:grid-rows-1 lg:grid-cols-4 gap-4">
          {nextIframes.map((iframe, index) => {
            return (
              <Link href={`/${id + index + 1}`}>
                <Image
                  data-src={iframe.content.thumbnail}
                  id="transition-img"
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