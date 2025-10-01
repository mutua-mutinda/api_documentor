"use client";

import { ApiReferenceReact } from "@scalar/api-reference-react";
import { useState, useEffect } from "react";

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

  useEffect(() => {
    // Extract OpenAPI spec from article blocks or attachments
    const extractOpenAPISpec = () => {
      try {
        // Look for OpenAPI spec in article blocks
        if (article?.blocks) {
          for (const block of article.blocks) {
            // Check if block contains OpenAPI content
            if (block.__component === "shared.rich-text" && block.body) {
              // Try to parse as JSON or YAML
              const content = block.body.trim();
              if (
                content.startsWith("{") ||
                content.startsWith("openapi:") ||
                content.startsWith("swagger:")
              ) {
                setSpecContent(content);
                setIsLoading(false);
                return;
              }
            }
          }
        }

        // Fallback: Create a sample OpenAPI spec if none found
        const sampleSpec = {
          openapi: "3.0.0",
          info: {
            title: article?.title || "Sample API",
            description:
              article?.description ||
              "API documentation generated from article content",
            version: "1.0.0",
          },
          servers: [
            {
              url: "https://api.example.com/v1",
              description: "Production server",
            },
          ],
          paths: {
            "/example": {
              get: {
                summary: "Example endpoint",
                description:
                  "This is a sample endpoint for demonstration purposes",
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
                              example: "Hello World",
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        };

        setSpecContent(JSON.stringify(sampleSpec, null, 2));
        setIsLoading(false);
      } catch (err) {
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
          No OpenAPI specification was found in this article. A sample
          specification is being displayed instead.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="border rounded-lg overflow-hidden">
        <ApiReferenceReact
          configuration={{
            theme: "default",
            layout: "modern",
            content: specContent,
            customCss: `
              .scalar-api-reference {
                border: none;
              }
              .scalar-api-reference .section {
                margin: 0;
              }
            `,
          }}
        />
      </div>
    </div>
  );
}
