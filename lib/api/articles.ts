import {
  Article,
  type StrapiArticleEntity,
  StrapiEntity,
  type StrapiResponse,
} from "@/types/strapi";
import { fetchAPI } from "../strapi";

export async function getArticles(options?: {
  page?: number;
  pageSize?: number;
  sort?: string;
}) {
  const response = await fetchAPI<StrapiResponse<StrapiArticleEntity[]>>(
    "/articles",
    {
      params: {
        populate: {
          author: {
            populate: ["avatar"],
          },
          category: true,
          blocks: {
            populate: "*",
          },
          openapi: true,
        },
        pagination: {
          page: options?.page || 1,
          pageSize: options?.pageSize || 10,
        },
        sort: options?.sort || "publishedAt:desc",
      },
      next: {
        revalidate: 60, // Revalidate every 60 seconds
        tags: ["articles"],
      },
    },
  );

  // Debug logging
  console.log("getArticles API Response:", {
    dataLength: response.data?.length || 0,
    hasData: !!response.data,
    hasMeta: !!response.meta,
    firstItem: response.data?.[0],
    firstItemStructure: response.data?.[0] ? Object.keys(response.data[0]) : [],
    hasAttributes: !!(response.data?.[0] as any)?.attributes,
    dataFormat: (response.data?.[0] as any)?.attributes ? "NESTED" : "FLAT",
    sampleTitle:
      (response.data?.[0] as any)?.attributes?.title ||
      (response.data?.[0] as any)?.title,
    meta: response.meta,
  });

  return response;
}

export async function getArticleBySlug(slug: string) {
  const response = await fetchAPI<StrapiResponse<StrapiArticleEntity[]>>(
    "/articles",
    {
      params: {
        filters: { slug: { $eq: slug } },
        populate: {
          author: {
            populate: ["avatar"],
          },
          category: true,
          blocks: {
            populate: "*",
          },
          openapi: true,
        },
      },
      next: {
        revalidate: 60,
        tags: [`article-${slug}`],
      },
    },
  );

  // Debug logging for single article
  console.log("getArticleBySlug Response:", {
    slug,
    dataLength: response.data?.length || 0,
    hasData: !!response.data,
    firstItem: response.data?.[0],
    firstItemStructure: response.data?.[0] ? Object.keys(response.data[0]) : [],
    hasAttributes: !!(response.data?.[0] as any)?.attributes,
    dataFormat: (response.data?.[0] as any)?.attributes ? "NESTED" : "FLAT",
    sampleTitle:
      (response.data?.[0] as any)?.attributes?.title ||
      (response.data?.[0] as any)?.title,
  });

  return response.data[0] || null;
}

export async function getArticle(id: number) {
  return fetchAPI<StrapiResponse<StrapiArticleEntity>>(`/articles/${id}`, {
    params: {
      populate: {
        author: {
          populate: ["avatar"],
        },
        category: true,
        blocks: {
          populate: "*",
        },
        openapi: true,
      },
    },
    next: {
      revalidate: 60,
      tags: [`article-${id}`],
    },
  });
}
