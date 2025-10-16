"use client";

import { useState } from "react";

export default function ApiDebugPage() {
  const [testResults, setTestResults] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runDiagnostics = async () => {
    setIsLoading(true);
    setTestResults(null);

    try {
      const response = await fetch("/api/test-strapi", {
        method: "POST",
      });
      const data = await response.json();
      setTestResults(data);
    } catch (error) {
      setTestResults({
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">API Diagnostics</h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">
          Environment Check
        </h2>
        <div className="space-y-2 text-sm">
          <div>
            <strong>NEXT_PUBLIC_STRAPI_URL:</strong>{" "}
            <code className="bg-blue-100 px-2 py-1 rounded">
              {process.env.NEXT_PUBLIC_STRAPI_URL || "Not set"}
            </code>
          </div>
          <div>
            <strong>NODE_ENV:</strong>{" "}
            <code className="bg-blue-100 px-2 py-1 rounded">
              {process.env.NODE_ENV}
            </code>
          </div>
          <div>
            <strong>NEXT_PUBLIC_STRAPI_API_TOKEN:</strong>{" "}
            <code className="bg-blue-100 px-2 py-1 rounded">
              {process.env.NEXT_PUBLIC_STRAPI_API_TOKEN
                ? "Set (hidden)"
                : "Not set"}
            </code>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Connection Test</h2>

        <button
          type="button"
          onClick={runDiagnostics}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          {isLoading ? "Testing..." : "Run Connection Test"}
        </button>

        {testResults && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Test Results:</h3>

            {testResults.success ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <svg
                    className="w-5 h-5 text-green-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-label="Success icon"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-green-800 font-semibold">
                    Connection Successful!
                  </span>
                </div>

                <div className="space-y-2">
                  <div>
                    <strong>Status:</strong> {String(testResults.status)}
                  </div>
                  <div>
                    <strong>Response Time:</strong>{" "}
                    {String(testResults.responseTime)}ms
                  </div>
                  {testResults.articlesCount !== undefined && (
                    <div>
                      <strong>Articles Found:</strong>{" "}
                      {String(testResults.articlesCount)}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <svg
                    className="w-5 h-5 text-red-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-label="Error icon"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-red-800 font-semibold">
                    Connection Failed
                  </span>
                </div>

                <div className="space-y-2">
                  <div>
                    <strong>Error:</strong> {String(testResults.error)}
                  </div>
                  {testResults.status !== undefined && (
                    <div>
                      <strong>Status:</strong> {String(testResults.status)}
                    </div>
                  )}
                  {testResults.url !== undefined && (
                    <div>
                      <strong>Attempted URL:</strong>
                      <code className="bg-red-100 px-2 py-1 rounded ml-2">
                        {String(testResults.url)}
                      </code>
                    </div>
                  )}
                </div>
              </div>
            )}

            {testResults.details !== undefined && (
              <details className="mt-4 bg-gray-50 rounded-lg p-4">
                <summary className="cursor-pointer font-semibold text-gray-700">
                  Raw Response Details
                </summary>
                <pre className="mt-3 text-xs bg-gray-100 p-3 rounded overflow-auto">
                  {JSON.stringify(testResults.details, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          Common Issues & Solutions
        </h3>
        <ul className="space-y-2 text-sm text-yellow-700">
          <li>
            • <strong>Connection refused:</strong> Make sure your Strapi server
            is running
          </li>
          <li>
            • <strong>401 Unauthorized:</strong> Check your
            NEXT_PUBLIC_STRAPI_API_TOKEN in .env.local
          </li>
          <li>
            • <strong>404 Not Found:</strong> Verify your NEXT_PUBLIC_STRAPI_URL
            is correct
          </li>
          <li>
            • <strong>CORS errors:</strong> Configure CORS settings in your
            Strapi backend
          </li>
          <li>
            • <strong>SSL errors:</strong> Use http:// for local development,
            https:// for production
          </li>
        </ul>
      </div>
    </div>
  );
}
