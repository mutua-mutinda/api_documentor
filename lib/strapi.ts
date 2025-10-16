const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || "https://cms.documentor.evisa.go.ke";
const NEXT_PUBLIC_STRAPI_API_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

export class StrapiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: any,
  ) {
    super(message);
    this.name = "StrapiError";
  }
}

interface FetchOptions extends RequestInit {
  params?: Record<string, any>;
}

// Helper function to serialize params in qs format for Strapi
function serializeStrapiParams(obj: any, prefix = ""): string[] {
  const params: string[] = [];

  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    const encodedKey = prefix
      ? `${prefix}[${encodeURIComponent(key)}]`
      : encodeURIComponent(key);

    if (value === null || value === undefined) {
      return;
    }

    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      params.push(`${encodedKey}=${encodeURIComponent(value)}`);
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        const arrayKey = `${encodedKey}[${index}]`;
        if (typeof item === "object" && item !== null) {
          params.push(...serializeStrapiParams(item, arrayKey));
        } else {
          params.push(`${arrayKey}=${encodeURIComponent(item)}`);
        }
      });
    } else if (typeof value === "object" && value !== null) {
      params.push(...serializeStrapiParams(value, encodedKey));
    }
  });

  return params;
}

// Data transformers to convert Strapi responses to simplified format
function transformStrapiImage(strapiImageData: any) {
  if (!strapiImageData?.data?.attributes) return undefined;

  const { id, attributes } = strapiImageData.data;
  return {
    id,
    url: attributes.url,
    alternativeText: attributes.alternativeText,
    width: attributes.width,
    height: attributes.height,
    mime: attributes.mime,
  };
}

function transformStrapiAuthor(strapiAuthorData: any) {
  if (!strapiAuthorData?.data?.attributes) return undefined;

  const { id, attributes } = strapiAuthorData.data;
  return {
    id,
    name: attributes.name,
    email: attributes.email,
    avatar: transformStrapiImage(attributes.avatar),
    createdAt: attributes.createdAt,
    updatedAt: attributes.updatedAt,
    publishedAt: attributes.publishedAt,
  };
}

function transformStrapiCategory(strapiCategoryData: any) {
  if (!strapiCategoryData?.data?.attributes) return undefined;

  const { id, attributes } = strapiCategoryData.data;
  return {
    id,
    name: attributes.name,
    slug: attributes.slug,
    createdAt: attributes.createdAt,
    updatedAt: attributes.updatedAt,
    publishedAt: attributes.publishedAt,
  };
}

function transformDynamicBlock(block: any) {
  switch (block.__component) {
    case "shared.rich-text":
      return {
        __component: "shared.rich-text" as const,
        body: block.body,
      };
    case "shared.media":
      return {
        __component: "shared.media" as const,
        file: transformStrapiImage({ data: block.file?.data }) || {},
      };
    case "shared.quote":
      return {
        __component: "shared.quote" as const,
        title: block.title,
        body: block.body,
      };
    case "shared.slider":
      return {
        __component: "shared.slider" as const,
        files:
          block.files?.data?.map((file: any) => ({
            id: file.id,
            url: file.attributes.url,
            alternativeText: file.attributes.alternativeText,
            width: file.attributes.width,
            height: file.attributes.height,
          })) || [],
      };
    default:
      return block;
  }
}

function transformStrapiArticle(strapiArticle: any) {
  const { id, attributes } = strapiArticle;

  return {
    id,
    title: attributes.title,
    slug: attributes.slug,
    description: attributes.description,
    cover: transformStrapiImage(attributes.cover),
    author: transformStrapiAuthor(attributes.author),
    category: transformStrapiCategory(attributes.category),
    blocks: attributes.blocks?.map(transformDynamicBlock) || [],
    createdAt: attributes.createdAt,
    updatedAt: attributes.updatedAt,
    publishedAt: attributes.publishedAt,
  };
}

export async function fetchAPI<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { params, ...fetchOptions } = options;

  // Build query string using Strapi-compatible serialization
  const queryString = params
    ? "?" + serializeStrapiParams(params).join("&")
    : "";

  const url = `${STRAPI_URL}/api${endpoint}${queryString}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Add authorization for server-side requests
  if (NEXT_PUBLIC_STRAPI_API_TOKEN && typeof window === "undefined") {
    headers["Authorization"] = `Bearer ${NEXT_PUBLIC_STRAPI_API_TOKEN}`;
  }

  // Merge with any headers from options
  if (fetchOptions.headers) {
    Object.assign(headers, fetchOptions.headers);
  }

  try {
    const res = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));

      throw new StrapiError(
        error.error?.message || `HTTP ${res.status}: ${res.statusText}`,
        res.status,
        error.error?.details,
      );
    }

    const data = await res.json();

    // Debug logging for raw response
    if (process.env.NODE_ENV === "development") {
      console.log("Strapi Raw Response:", {
        endpoint,
        url,
        status: res.status,
        hasData: !!data.data,
        dataType: Array.isArray(data.data) ? "array" : typeof data.data,
        dataLength: Array.isArray(data.data) ? data.data.length : "not array",
        hasMeta: !!data.meta,
        data: data,
      });
    }

    // Temporarily disable transformation to debug
    return data;
  } catch (error) {
    if (error instanceof StrapiError) {
      throw error;
    }

    // More detailed error message
    const errorMessage =
      error instanceof Error
        ? `Failed to fetch from Strapi API: ${error.message}`
        : "Failed to fetch from Strapi API";

    throw new StrapiError(errorMessage);
  }
}

// Helper to get full image URL
export function getStrapiMedia(url: string | undefined): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${STRAPI_URL}${url}`;
}
