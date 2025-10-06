"use client";

import { ApiReferenceReact } from "@scalar/api-reference-react";
import { useState, useEffect } from "react";
import { getStrapiMedia } from "@/lib/strapi";

interface PostmanCollection {
  info: {
    name: string;
    description?: string;
    version?: string;
    schema: string;
  };
  item: PostmanItem[];
  variable?: PostmanVariable[];
}

interface PostmanItem {
  name: string;
  request?: PostmanRequest;
  item?: PostmanItem[];
  description?: string;
}

interface PostmanRequest {
  method: string;
  header?: Array<{ key: string; value: string }>;
  url:
    | {
        raw: string;
        host: string[];
        path: string[];
        query?: Array<{ key: string; value: string }>;
      }
    | string;
  body?: {
    mode: string;
    raw?: string;
    formdata?: Array<{ key: string; value: string }>;
  };
  description?: string;
}

interface PostmanVariable {
  key: string;
  value: string;
}

interface OpenAPITabProps {
  article: any;
  className?: string;
}

export default function OpenAPITab({
  article,
  className = "",
}: OpenAPITabProps) {
  const [specContent, setSpecContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert Postman Collection to OpenAPI
  const convertPostmanToOpenAPI = (postmanCollection: PostmanCollection) => {
    const openApiSpec = {
      openapi: "3.0.3",
      info: {
        title: postmanCollection.info.name || "API Documentation",
        description:
          postmanCollection.info.description ||
          "Converted from Postman Collection",
        version: postmanCollection.info.version || "1.0.0",
      },
      servers: [
        {
          url: "https://api.example.com",
          description: "Base URL (extracted from Postman collection)",
        },
      ],
      paths: {} as any,
      components: {
        schemas: {},
        parameters: {},
      },
    };

    const extractBaseUrl = (items: PostmanItem[]): string => {
      for (const item of items) {
        if (item.request?.url) {
          const url =
            typeof item.request.url === "string"
              ? item.request.url
              : item.request.url.raw;

          try {
            const urlObj = new URL(url.replace(/{{.*?}}/g, "placeholder"));
            return `${urlObj.protocol}//${urlObj.host}`;
          } catch (e) {
            // Continue to next item
          }
        }
        if (item.item) {
          const baseUrl = extractBaseUrl(item.item);
          if (baseUrl !== "https://api.example.com") return baseUrl;
        }
      }
      return "https://api.example.com";
    };

    openApiSpec.servers[0].url = extractBaseUrl(postmanCollection.item);

    const processItems = (items: PostmanItem[], basePath = "") => {
      items.forEach((item) => {
        if (item.request) {
          const method = item.request.method.toLowerCase();
          let path = `/${item.name.toLowerCase().replace(/\s+/g, "-")}`;

          if (item.request.url) {
            const url =
              typeof item.request.url === "string"
                ? item.request.url
                : item.request.url.raw;

            try {
              const urlObj = new URL(url.replace(/{{.*?}}/g, "placeholder"));
              path = urlObj.pathname || path;
            } catch (e) {
              // Use fallback path
            }
          }

          const fullPath = basePath + path;

          if (!openApiSpec.paths[fullPath]) {
            openApiSpec.paths[fullPath] = {};
          }

          const operation: any = {
            summary: item.name,
            description:
              item.description ||
              item.request.description ||
              `${method.toUpperCase()} ${fullPath}`,
            responses: {
              "200": {
                description: "Successful response",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        message: {
                          type: "string",
                          example: "Success",
                        },
                      },
                    },
                  },
                },
              },
              "400": { description: "Bad request" },
              "500": { description: "Internal server error" },
            },
          };

          if (
            item.request.url &&
            typeof item.request.url === "object" &&
            item.request.url.query
          ) {
            operation.parameters = item.request.url.query.map((q: any) => ({
              name: q.key,
              in: "query",
              required: false,
              schema: {
                type: "string",
                example: q.value,
              },
            }));
          }

          if (["post", "put", "patch"].includes(method) && item.request.body) {
            operation.requestBody = {
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: {
                        type: "string",
                        example: item.request.body.raw || "Request body data",
                      },
                    },
                  },
                },
              },
            };
          }

          openApiSpec.paths[fullPath][method] = operation;
        } else if (item.item) {
          processItems(
            item.item,
            basePath + `/${item.name.toLowerCase().replace(/\s+/g, "-")}`,
          );
        }
      });
    };

    processItems(postmanCollection.item);
    return openApiSpec;
  };

  useEffect(() => {
    // Extract OpenAPI spec from article's openapi file attachment
    const extractOpenAPISpec = async () => {
      try {
        // Check if article has openapi file attachment
        if (article?.openapi && article.openapi.url) {
          // Check if it's a valid OpenAPI file type
          const validExtensions = [".yaml", ".yml", ".json"];
          const fileExtension = article.openapi.ext?.toLowerCase();

          if (validExtensions.includes(fileExtension)) {
            // Get the full URL for the OpenAPI file
            const openapiUrl = getStrapiMedia(article.openapi.url);

            try {
              // Fetch the actual file content
              const response = await fetch(openapiUrl);
              console.log("response", response);
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }

              let finalSpec;
              let content;
              if (fileExtension === ".json") {
                content = await response.json();
                if (content.info?.schema?.includes("getpostman.com")) {
                  console.log(
                    "Detected Postman Collection, converting to OpenAPI...",
                  );
                  finalSpec = convertPostmanToOpenAPI(
                    content as PostmanCollection,
                  );
                } else if (content.openapi || content.swagger) {
                  finalSpec = content;
                } else {
                  finalSpec = content;
                }
              } else {
                // For YAML files, we'll pass the URL directly to ApiReferenceReact
                // as it can handle YAML URLs directly
                finalSpec = openapiUrl;
              }

              setSpecContent(finalSpec);
              setIsLoading(false);
              return;
            } catch (fetchError) {
              console.error("Error fetching OpenAPI spec:", fetchError);
              setError(`Failed to fetch OpenAPI specification: ${fetchError}`);
              setIsLoading(false);
              return;
            }
          } else {
            setError(
              `Unsupported file type: ${fileExtension}. Please upload a .yaml, .yml, or .json file.`,
            );
            setIsLoading(false);
            return;
          }
        }

        // No OpenAPI file found
        setSpecContent(null);
        setIsLoading(false);
      } catch (err) {
        console.error("Error processing OpenAPI spec:", err);
        setError("Failed to load OpenAPI specification");
        setIsLoading(false);
      }
    };

    extractOpenAPISpec();
  }, [article]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-96 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading OpenAPI documentation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}
      >
        <div className="flex items-center mb-2">
          <svg
            className="w-5 h-5 text-red-500 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <h3 className="text-red-800 font-semibold">
            Error Loading OpenAPI Spec
          </h3>
        </div>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!specContent) {
    return (
      <div
        className={`bg-yellow-50 border border-yellow-200 rounded-lg p-6 ${className}`}
      >
        <div className="flex items-center mb-2">
          <svg
            className="w-5 h-5 text-yellow-500 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <h3 className="text-yellow-800 font-semibold">
            No OpenAPI Specification Found
          </h3>
        </div>
        <p className="text-yellow-700">
          No OpenAPI specification was found in this article. Please upload an
          OpenAPI file (.yaml, .yml, or .json) to the openapi field.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="overflow-hidden">
        <ApiReferenceReact
          configuration={{
            theme: "default",
            layout: "modern",
            showSidebar: true,
            ...(typeof specContent === "string"
              ? { url: specContent }
              : { content: specContent }),
          }}
        />
      </div>
    </div>
  );
}
