import { NextResponse } from "next/server";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

export async function POST() {
  const startTime = Date.now();
  const testResults: Record<string, unknown> = {
    success: false,
    url: `${STRAPI_URL}/api/articles`,
    timestamp: new Date().toISOString(),
  };

  try {
    // Test basic connection first
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add authorization if token is available
    if (STRAPI_API_TOKEN) {
      headers.Authorization = `Bearer ${STRAPI_API_TOKEN}`;
    }

    const response = await fetch(`${STRAPI_URL}/api/articles`, {
      headers,
      method: "GET",
    });

    const responseTime = Date.now() - startTime;

    testResults.status = response.status;
    testResults.statusText = response.statusText;
    testResults.responseTime = responseTime;

    if (response.ok) {
      const data = await response.json();

      testResults.success = true;
      testResults.articlesCount = Array.isArray(data.data)
        ? data.data.length
        : 0;
      testResults.details = {
        hasData: !!data.data,
        hasMeta: !!data.meta,
        dataType: Array.isArray(data.data) ? "array" : typeof data.data,
        sampleStructure: data.data?.[0]
          ? {
              hasId: !!data.data[0].id,
              hasAttributes: !!data.data[0].attributes,
              attributeKeys: data.data[0].attributes
                ? Object.keys(data.data[0].attributes)
                : [],
            }
          : null,
      };
    } else {
      // Try to get error details
      try {
        const errorData = await response.json();
        testResults.error =
          errorData.error?.message ||
          `HTTP ${response.status}: ${response.statusText}`;
        testResults.details = errorData;
      } catch {
        testResults.error = `HTTP ${response.status}: ${response.statusText}`;
      }
    }
  } catch (error) {
    testResults.error =
      error instanceof Error ? error.message : "Unknown connection error";
    testResults.responseTime = Date.now() - startTime;

    // Determine error type for better debugging
    if (error instanceof TypeError && error.message.includes("fetch")) {
      testResults.errorType = "NETWORK_ERROR";
      testResults.suggestion =
        "Check if Strapi server is running and the URL is correct";
    } else if (
      error instanceof Error &&
      error.message.includes("ECONNREFUSED")
    ) {
      testResults.errorType = "CONNECTION_REFUSED";
      testResults.suggestion = "Strapi server is not running or not accessible";
    } else {
      testResults.errorType = "UNKNOWN_ERROR";
    }
  }

  // Add environment info
  testResults.environment = {
    strapiUrl: STRAPI_URL,
    hasToken: !!STRAPI_API_TOKEN,
    nodeEnv: process.env.NODE_ENV,
  };

  return NextResponse.json(testResults);
}
