import type { Metadata } from "next";
import Image from "next/image";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import Tabs, { type Tab } from "@/components/Tabs";
import OpenAPITab from "@/components/OpenAPITab";
import { getArticleBySlug } from "@/lib/api/articles";
import { getStrapiMedia, StrapiError } from "@/lib/strapi";
import type {
  DynamicZoneBlock,
  MediaBlock,
  QuoteBlock,
  RichTextBlock,
  SliderBlock,
} from "@/types/strapi";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const article = await getArticleBySlug(slug);

    if (!article) {
      return {
        title: "Article Not Found",
      };
    }

    // Handle both nested and flat formats
    const isFlat = !(article as any).attributes;
    const data = isFlat ? (article as any) : (article as any).attributes;

    return {
      title: data.title,
      description: data.description,
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Article Error",
    };
  }
}

// Component to render dynamic zone blocks
function BlockRenderer({ blocks }: { blocks: DynamicZoneBlock[] }) {
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

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  try {
    const { slug } = await params;
    const article = await getArticleBySlug(slug);
    console.log(article);

    if (!article) {
      return (
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold">Article Not Found</h1>
          <p className="text-gray-600 mt-4">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
            <h3 className="font-semibold text-yellow-800">Debug Info:</h3>
            <p className="text-yellow-700 text-sm">
              Slug: "{slug}" | Article: {article ? "Found" : "null/undefined"}
            </p>
          </div>
        </div>
      );
    }

    // Handle both nested and flat formats
    const isFlat = !(article as any).attributes;
    const data = isFlat ? (article as any) : (article as any).attributes;
    const imageUrl = isFlat
      ? getStrapiMedia(data.cover?.url)
      : getStrapiMedia(data.cover?.data?.attributes?.url);

    // Define tabs
    const tabs: Tab[] = [
      {
        id: "docs",
        label: "Docs",
        content: (
          <div>
            {data.blocks && data.blocks.length > 0 ? (
              <BlockRenderer blocks={data.blocks} />
            ) : (
              <div className="text-gray-500 text-center py-8">
                No documentation content available.
              </div>
            )}
          </div>
        ),
      },
      {
        id: "openapi",
        label: "OpenAPI",
        content: <OpenAPITab article={data} className="min-h-96" />,
      },
    ];

    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Back Button */}
          <div className="mb-6">
            <BackButton
              href="/articles"
              label="Back to Articles"
              className="hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
            />
          </div>

          <article className="max-w-4xl">
            {imageUrl && (
              <div className="relative h-96 w-full mb-8 rounded-lg overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={
                    isFlat
                      ? data.cover?.alternativeText || data.title
                      : data.cover?.data?.attributes?.alternativeText ||
                        data.title
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
                {new Date(
                  data.publishedAt || data.createdAt,
                ).toLocaleDateString()}
              </span>
            </div>

            {/* Tabs for OpenAPI and Docs */}
            <Tabs tabs={tabs} defaultTab="docs" className="mt-8" />
          </article>
        </div>
      </>
    );
  } catch (error) {
    console.error("Error loading article:", error);

    let errorMessage = "Failed to load article. Please try again later.";
    let errorDetails = null;

    if (error instanceof StrapiError) {
      errorMessage = `${error.message} (Status: ${error.status})`;
      errorDetails = error.details;
    }

    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Back Button */}
          <div className="mb-6">
            <BackButton
              href="/articles"
              label="Back to Articles"
              className="hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
            />
          </div>
          <h1 className="text-4xl font-bold mb-8">Error Loading Article</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 font-semibold">Unable to Load Article</p>
            <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
            {process.env.NODE_ENV === "development" && errorDetails && (
              <details className="mt-4">
                <summary className="text-xs cursor-pointer text-red-600">
                  Debug Info
                </summary>
                <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
                  {JSON.stringify(errorDetails, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>
      </>
    );
  }
}
