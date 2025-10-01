import Image from "next/image";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { getStrapiMedia } from "@/lib/strapi";
import type {
  DynamicZoneBlock,
  MediaBlock,
  QuoteBlock,
  RichTextBlock,
  SliderBlock,
} from "@/types/strapi";

interface BlockRendererProps {
  blocks: DynamicZoneBlock[];
}

export function BlockRenderer({ blocks }: BlockRendererProps) {
  return (
    <div className="space-y-8">
      {blocks.map((block, index) => {
        switch (block.__component) {
          case "shared.rich-text": {
            const richText = block as RichTextBlock;
            return (
              <MarkdownRenderer
                key={index}
                content={richText.body}
                className="my-6"
              />
            );
          }

          case "shared.media": {
            const media = block as MediaBlock;
            const mediaUrl = getStrapiMedia(
              (media.file as any)?.data?.attributes?.url ||
                (media.file as any)?.url,
            );
            if (!mediaUrl) return null;
            return (
              <div
                key={index}
                className="relative w-full h-96 rounded-lg overflow-hidden"
              >
                <Image
                  src={mediaUrl}
                  alt={
                    (media.file as any)?.data?.attributes?.alternativeText ||
                    (media.file as any)?.alternativeText ||
                    "Media"
                  }
                  fill
                  className="object-cover"
                />
              </div>
            );
          }

          case "shared.quote": {
            const quote = block as QuoteBlock;
            return (
              <blockquote
                key={index}
                className="border-l-4 border-gray-300 pl-4 italic text-lg"
              >
                {quote.title && <p className="font-semibold">{quote.title}</p>}
                {quote.body && <p>{quote.body}</p>}
              </blockquote>
            );
          }

          case "shared.slider": {
            const slider = block as SliderBlock;
            return (
              <div key={index} className="grid grid-cols-2 gap-4">
                {((slider.files as any)?.data || (slider.files as any))?.map(
                  (file: any, i: number) => {
                    const url = getStrapiMedia(
                      file.attributes?.url || file.url,
                    );
                    return (
                      <div
                        key={i}
                        className="relative h-64 rounded-lg overflow-hidden"
                      >
                        <Image
                          src={url}
                          alt={
                            file.attributes?.alternativeText ||
                            file.alternativeText ||
                            `Slide ${i + 1}`
                          }
                          fill
                          className="object-cover"
                        />
                      </div>
                    );
                  },
                )}
              </div>
            );
          }

          default:
            return null;
        }
      })}
    </div>
  );
}

export default BlockRenderer;
