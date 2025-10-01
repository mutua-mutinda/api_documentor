interface DocsTabProps {
  imageUrl?: string;
  data: any;
  isFlat: boolean;
  blocks?: any[];
  className?: string;
}

import Image from "next/image";
import BlockRenderer from "@/components/BlockRenderer";

export default function DocsTab({
  imageUrl,
  data,
  isFlat,
  blocks,
  className = "",
}: DocsTabProps) {
  return (
    <div className={className}>
      {imageUrl && (
        <div className="relative h-96 w-full mb-8 rounded-lg overflow-hidden">
          <Image
            src={imageUrl}
            alt={
              isFlat
                ? data.cover?.alternativeText || data.title
                : data.cover?.data?.attributes?.alternativeText || data.title
            }
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <h1 className="text-5xl font-bold mb-4">{data.title}</h1>

      {data.description && (
        <p className="text-xl text-gray-600 mb-6">{data.description}</p>
      )}

      <div className="flex items-center gap-4 mb-8 text-gray-600">
        {isFlat
          ? data.author?.name && <span>By {data.author.name}</span>
          : data.author?.data && (
              <span>By {data.author.data.attributes.name}</span>
            )}
        {isFlat
          ? data.category?.name && (
              <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                {data.category.name}
              </span>
            )
          : data.category?.data && (
              <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                {data.category.data.attributes.name}
              </span>
            )}
        <span>
          {new Date(data.publishedAt || data.createdAt).toLocaleDateString()}
        </span>
      </div>

      {blocks && blocks.length > 0 && <BlockRenderer blocks={blocks} />}
    </div>
  );
}
