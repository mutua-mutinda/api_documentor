import BackButton from "@/components/BackButton";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import Navbar from "@/components/Navbar";
import OpenAPITab from "@/components/OpenAPITab";
import Tabs, { type Tab } from "@/components/Tabs";
import { getArticleBySlug } from "@/lib/api/articles";
import { getStrapiMedia, StrapiError } from "@/lib/strapi";
import type { Metadata } from "next";
import Image from "next/image";
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
        title: "Documentation Not Found",
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
      title: "Documentation Error",
    };
  }
}

// Component to render dynamic zone blocks
function BlockRenderer({ blocks }: { blocks: DynamicZoneBlock[] }) {
  return (
    <div className="mt-4 space-y-8">
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
          <h1 className="text-4xl font-bold text-gray-100">
            Documentation Not Found
          </h1>
          <p className="text-gray-600 mt-4">
            The API documentation guide you're looking for doesn't exist or has
            been removed.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
            <h3 className="font-semibold text-yellow-800">Debug Info:</h3>
            <p className="text-yellow-700 text-sm">
              Slug: "{slug}" | Documentation:{" "}
              {article ? "Found" : "null/undefined"}
            </p>
          </div>
        </div>
      );
    }

    // Handle both nested and flat formats
    const isFlat = !(article as any).attributes;
    const data = isFlat ? (article as any) : (article as any).attributes;

    // Define tabs
    const tabs: Tab[] = [
      {
        id: "docs",
        label: "API Guide",
        content: (
          <div className="max-w-7xl mx-auto w-full">
            {data.blocks && data.blocks.length > 0 ? (
              <article className="my-4 space-y-4">
                <h1 className="text-lg lg:text-5xl font-bold mb-4 text-gray-100">
                  {data.title}
                </h1>
                {data.description && (
                  <p className="text-base lg:text-xl text-gray-200">
                    {data.description}
                  </p>
                )}
                {data.category?.name && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {data.category.name}
                  </span>
                )}
                <BlockRenderer blocks={data.blocks} />
              </article>
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
        <div className="p-4 sm:p-6">
          {/* Back Button */}
          <BackButton
            href="/"
            label="Back"
            className=" py-2 rounded-lg transition-colors"
          />
          {/* Tabs for OpenAPI and Docs */}
          <Tabs tabs={tabs} defaultTab="docs" className="mt-4" />
        </div>
      </>
    );
  } catch (error) {
    console.error("Error loading documentation:", error);

    let errorMessage = "Failed to load documentation. Please try again later.";
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
              href="/"
              label="Back"
              className="px-3 py-2 rounded-lg transition-colors"
            />
          </div>
          <h1 className="text-4xl font-bold mb-8 text-zinc-300">
            Error Loading Documentation API guide
          </h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 font-semibold">
              Unable to Load Documentation API guide
            </p>
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
