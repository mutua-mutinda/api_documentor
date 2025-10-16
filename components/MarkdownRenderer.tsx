"use client";

import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkBreaks from "remark-breaks";
import remarkEmoji from "remark-emoji";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({
  content,
  className = "",
}: MarkdownRendererProps) {
  return (
    <div className={`markdown-content max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks, remarkEmoji]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Enhanced link handling
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-blue-600 hover:text-blue-800 underline transition-colors"
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {children}
            </a>
          ),
          // Code block with language detection
          code: ({ className, children }) => {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : "";
            const isInline = !className;

            if (isInline) {
              return <code className="inline">{children}</code>;
            }

            return (
              <code className={`${className} hljs`} data-language={language}>
                {children}
              </code>
            );
          },
          // Custom table styling
          table: ({ children }) => (
            <div className="flow-root mt-4">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <div className="overflow-hidden outline-1 -outline-offset-1 outline-white/10 sm:rounded-lg">
                    <table className="relative min-w-full divide-y divide-white/15">
                      {children}
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2.5 text-left text-sm font-semibold text-lightgray-100">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2.5 whitespace-nowrap text-sm text-lightgray-100">
              {children}
            </td>
          ),
          // Enhanced blockquote
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-lightgray-50 bg-lightgray-800 text-lightgray-50 pl-4 py-2 my-4 italic">
              {children}
            </blockquote>
          ),
          // Image with better styling
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt}
              className="rounded-lg shadow-md max-w-full h-auto my-4"
            />
          ),
          // Horizontal rule
          hr: () => <hr className="border-gray-300 my-8" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
