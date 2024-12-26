import { MOCK_THUMBNAILS } from '@/constants/MOCK_THUMBNAILS';
import React from 'react';
import { Container } from '@/components/Container';
import { Image } from '@/components/image';
import { Link } from '@/components/Link';

interface Props {
  id: number
}

export const ImagesList: React.FC<Props> =  ({ id }) => {
  const cover = MOCK_THUMBNAILS[id % 4];

  const nextImages = [
    MOCK_THUMBNAILS[(id + 1) % 4],
    MOCK_THUMBNAILS[(id + 2) % 4],
    MOCK_THUMBNAILS[(id + 3) % 4],
    MOCK_THUMBNAILS[(id + 4) % 4],
  ];

  return (
    <>
      <Container>
        <Image
          id="transition-el"
          className="aspect-[16/9] transitionable-img"
          priority
          sizes="100vw"
          src={`/uploads/${cover.data.attributes.name}`}
          data-src={`/uploads/${cover.data.attributes.name}`}
          alt={cover.data.attributes.alternativeText}
          width={cover.data.attributes.width}
          height={cover.data.attributes.height}
        />
        <div className="my-10 block grid grid-rows-2 grid-cols-2 lg:grid-rows-1 lg:grid-cols-4 gap-4">
          {nextImages && nextImages.map((img, index) => (
            <Link href={`/${id + index + 1}`}>
              <Image
                data-src={`/uploads/${img.data.attributes.name}`}
                className="aspect-[16/9] transitionable-img"
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                src={`/uploads/${img.data.attributes.name}`}
                alt={img.data.attributes.alternativeText}
                width={img.data.attributes.width}
                height={img.data.attributes.height}
              />
            </Link>
          ))}
        </div>
      </Container>
    </>
  )
}