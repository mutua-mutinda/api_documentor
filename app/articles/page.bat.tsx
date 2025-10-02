import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { getArticles } from "@/lib/api/articles";
import { StrapiError } from "@/lib/strapi";
import {
  type Article,
  type FlatArticleData,
  isFlatArticle,
  isNestedArticle,
} from "@/types/strapi";

export const metadata: Metadata = {
  title: "Articles",
  description: "Browse our latest articles",
};

export default async function ArticlesPage() {
  try {
    const { data: articles, meta } = await getArticles();

    return (
      <>
        <Navbar />
        <div className="container mx-auto prose-invert px-4 py-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Beautiful API Documentation Guide
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
              Use the Documentor Guide API to access contacts, conversations,
              group messages, and more and seamlessly integrate your product
              into the workflows of dozens of devoted users.
            </p>
          </div>
          <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Get Started
          </h3>

          {!articles || articles.length === 0 ? (
            <div className="mt-4 space-y-4">
              <p className="text-gray-200">No articles found.</p>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {/* Full card rendering */}
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                style={{ visibility: "visible", display: "grid", opacity: 1 }}
              >
                {articles.map((article, index) => {
                  console.log(`🔍 Processing article ${index}:`, {
                    hasArticle: !!article,
                    hasAttributes: isNestedArticle(article),
                    id: article?.id,
                    title: isNestedArticle(article)
                      ? article.attributes.title
                      : article.title,
                    flatFormat: isFlatArticle(article),
                  });

                  if (!article) {
                    return (
                      <div key={index} className="bg-red-50 p-4 rounded border">
                        <p className="text-red-600">
                          ❌ Article {index}: null/undefined
                        </p>
                      </div>
                    );
                  }

                  // Handle both nested and flat formats
                  const isFlat = isFlatArticle(article);
                  const data = isFlat ? article : article.attributes;
                  const id = article.id;

                  if (!data) {
                    return (
                      <div
                        key={id || index}
                        className="bg-yellow-50 p-4 rounded border"
                      >
                        <p className="text-yellow-600">
                          ⚠️ Article {index}: no data available
                        </p>
                      </div>
                    );
                  }

                  try {
                    return (
                      <Link
                        key={id}
                        href={`/articles/${data.slug}`}
                        className="relative group flex flex-col rounded-lg overflow-hidden hover:shadow-lg transition"
                        style={{
                          visibility: "visible",
                          opacity: 1,
                        }}
                      >
                        <div className="absolute inset-0 rounded-2xl ring-1 ring-zinc-900/7.5 ring-inset group-hover:ring-zinc-900/10 dark:ring-white/10 dark:group-hover:ring-white/20"></div>
                        <div className="p-4 flex-auto flex flex-col">
                          <h2 className="text-lg font-semibold mb-2 text-gray-100">
                            {data.title || `Article ${id}`}
                          </h2>
                          <p className="text-gray-200 line-clamp-3 text-sm">
                            {data.description || "No description available"}
                          </p>
                          <div className="mt-auto pt-2 flex items-center gap-2">
                            {isFlat
                              ? (data as FlatArticleData).author?.name && (
                                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                    {(data as FlatArticleData).category?.name}
                                  </span>
                                )
                              : (data as Article).category?.data?.attributes
                                  ?.name && (
                                  <p className="text-sm text-gray-300 mt-2">
                                    By{" "}
                                    {
                                      (data as Article).category?.data
                                        ?.attributes?.name
                                    }
                                  </p>
                                )}
                            {isFlat
                              ? (data as FlatArticleData).author?.name && (
                                  <p className="text-sm text-gray-300">
                                    By {(data as FlatArticleData).author?.name}
                                  </p>
                                )
                              : (data as Article).author?.data?.attributes
                                  ?.name && (
                                  <p className="text-sm text-gray-300 mt-2">
                                    By{" "}
                                    {
                                      (data as Article).author?.data?.attributes
                                        ?.name
                                    }
                                  </p>
                                )}
                          </div>
                        </div>
                      </Link>
                    );
                  } catch (renderError) {
                    console.error(
                      `Error rendering article ${index}:`,
                      renderError,
                    );
                    return (
                      <div
                        key={id || index}
                        className="bg-red-50 p-4 rounded border"
                      >
                        <p className="text-red-600">
                          💥 Render Error for Article {index}
                        </p>
                        <p className="text-xs text-red-500">
                          {String(renderError)}
                        </p>
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          )}

          {meta?.pagination && meta.pagination.pageCount > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {/* Add pagination controls here */}
            </div>
          )}
        </div>
      </>
    );
  } catch (error) {
    console.error("Error loading articles:", error);

    let errorMessage = "Failed to load articles. Please try again later.";
    let errorDetails = null;

    if (error instanceof StrapiError) {
      errorMessage = `${error.message} (Status: ${error.status})`;
      errorDetails = error.details;
    }

    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8">Articles</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 font-semibold">Error Loading Articles</p>
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
