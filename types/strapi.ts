export interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiEntity<T> {
  id: number;
  attributes: T & {
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
  };
}

// Flat format (newer Strapi versions)
export interface FlatStrapiEntity<_T = Record<string, unknown>> {
  id: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

// Flat article type
export type FlatArticle = FlatArticleData & {
  id: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
};

// Union type to support both formats
export type StrapiArticleEntity = StrapiEntity<Article> | FlatArticle;

// Type guards for distinguishing between formats
export function isNestedArticle(
  article: StrapiArticleEntity,
): article is StrapiEntity<Article> {
  return "attributes" in article && article.attributes !== undefined;
}

export function isFlatArticle(
  article: StrapiArticleEntity,
): article is FlatArticle {
  return !isNestedArticle(article);
}

// Dynamic Zone Components
export interface MediaBlock {
  __component: "shared.media";
  file: {
    data: StrapiEntity<{
      url: string;
      alternativeText?: string;
      width: number;
      height: number;
    }>;
  };
}

export interface QuoteBlock {
  __component: "shared.quote";
  title?: string;
  body?: string;
}

export interface RichTextBlock {
  __component: "shared.rich-text";
  body: string;
}

export interface SliderBlock {
  __component: "shared.slider";
  files: {
    data: StrapiEntity<{
      url: string;
      alternativeText?: string;
      width: number;
      height: number;
    }>[];
  };
}

export type DynamicZoneBlock =
  | MediaBlock
  | QuoteBlock
  | RichTextBlock
  | SliderBlock;

// Flat media type
export interface FlatMedia {
  url: string;
  alternativeText?: string;
  width?: number;
  height?: number;
  mime?: string;
}

// Flat author type
export interface FlatAuthor {
  name: string;
  email?: string;
  avatar?: FlatMedia;
}

// Flat category type
export interface FlatCategory {
  name: string;
  slug: string;
}

// Nested format article (original)
export interface NestedArticle {
  title: string;
  slug: string;
  description: string;
  cover?: {
    data: StrapiEntity<{
      url: string;
      alternativeText?: string;
      width: number;
      height: number;
      mime?: string;
    }> | null;
  };
  author?: {
    data: StrapiEntity<{
      name: string;
      email?: string;
      avatar?: {
        data: StrapiEntity<{
          url: string;
        }>;
      };
    }> | null;
  };
  category?: {
    data: StrapiEntity<{
      name: string;
      slug: string;
    }> | null;
  };
  blocks?: DynamicZoneBlock[];
}

// Flat format article
export interface FlatArticleData {
  title: string;
  slug: string;
  description: string;
  cover?: FlatMedia;
  author?: FlatAuthor;
  category?: FlatCategory;
  blocks?: DynamicZoneBlock[];
}

// Use the nested format as the main Article interface for backward compatibility
export interface Article extends NestedArticle {}
