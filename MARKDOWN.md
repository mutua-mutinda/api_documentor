# Markdown Rendering in API Documentor

This project uses a custom `MarkdownRenderer` component to render Markdown content from Strapi rich text blocks.

## Features

### ✅ Core Markdown Support
- **Headers** (H1-H6) with proper styling and hierarchy
- **Paragraphs** with proper spacing and line height
- **Lists** (ordered and unordered) with proper indentation
- **Links** with external link detection and security attributes
- **Emphasis** (bold, italic) and strong text
- **Code blocks** with syntax highlighting
- **Inline code** with distinct styling
- **Blockquotes** with left border and background
- **Tables** with responsive design
- **Images** with responsive sizing and shadows
- **Horizontal rules** for content separation

### 🚀 Enhanced Features
- **GitHub Flavored Markdown (GFM)** support
- **Syntax highlighting** for code blocks using `rehype-highlight`
- **Emoji support** with `remark-emoji` 
- **Line breaks** preserved with `remark-breaks`
- **External link handling** (opens in new tab with security attributes)
- **Language detection** for code blocks
- **Responsive tables** with horizontal scroll
- **Custom styling** with Tailwind CSS classes

## Usage

### In React Components

```tsx
import MarkdownRenderer from "@/components/MarkdownRenderer";

// Basic usage
<MarkdownRenderer content={markdownString} />

// With custom CSS classes
<MarkdownRenderer 
  content={markdownString} 
  className="my-8 custom-class" 
/>
```

### In Strapi Rich Text Blocks

The component is automatically used in article detail pages for `shared.rich-text` blocks:

```tsx
case "shared.rich-text":
  const richText = block as RichTextBlock;
  return (
    <MarkdownRenderer
      key={index}
      content={richText.body}
      className="my-6"
    />
  );
```

## Supported Markdown Syntax

### Headers
```markdown
# H1 Header
## H2 Header  
### H3 Header
#### H4 Header
##### H5 Header
###### H6 Header
```

### Text Formatting
```markdown
**Bold text**
*Italic text*
~~Strikethrough~~
`Inline code`
```

### Lists
```markdown
- Unordered list item
- Another item
  - Nested item

1. Ordered list item
2. Another item
   1. Nested item
```

### Links and Images
```markdown
[Link text](https://example.com)
![Alt text](image-url.jpg)
```

### Code Blocks
```markdown
```javascript
function hello() {
  console.log("Hello, world!");
}
```
```

### Tables
```markdown
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
```

### Blockquotes
```markdown
> This is a blockquote
> It can span multiple lines
```

### Horizontal Rules
```markdown
---
```

### Emoji
```markdown
:smile: :heart: :rocket: 
👍 🎉 ✨
```

## Styling

The component uses several CSS classes for styling:

- `.markdown-content` - Main wrapper class
- `.prose` and `.prose-lg` - Typography utilities
- Custom component styles defined in `globals.css`
- Syntax highlighting styles for code blocks

## Syntax Highlighting

Code blocks support syntax highlighting for many languages including:

- JavaScript/TypeScript
- Python
- Java
- C/C++
- HTML/CSS
- JSON
- Bash/Shell
- SQL
- And many more...

Example:
```javascript
// This will be syntax highlighted
const greeting = (name) => {
  return `Hello, ${name}!`;
};
```

## Security Features

- **External links** automatically get `target="_blank"` and `rel="noopener noreferrer"`
- **XSS protection** through React's built-in sanitization
- **Safe HTML rendering** without `dangerouslySetInnerHTML`

## Performance

- **Client-side rendering** for interactive features
- **Optimized bundle size** with tree-shaking
- **Lazy loading** of syntax highlighting themes
- **Efficient re-rendering** with React's reconciliation

## Customization

### Adding New Plugins

To add new remark or rehype plugins:

1. Install the plugin: `npm install remark-plugin-name`
2. Import it in `MarkdownRenderer.tsx`
3. Add it to the appropriate plugins array

```tsx
import newPlugin from 'remark-plugin-name';

// Add to remarkPlugins or rehypePlugins array
remarkPlugins={[remarkGfm, remarkBreaks, remarkEmoji, newPlugin]}
```

### Custom Components

You can customize how specific markdown elements are rendered by modifying the `components` prop:

```tsx
components={{
  h1: ({ children }) => (
    <h1 className="custom-h1-class">{children}</h1>
  ),
  // ... other custom components
}}
```

### Custom Styling

Override default styles by adding CSS to `globals.css`:

```css
.markdown-content h1 {
  /* Custom H1 styles */
}

.markdown-content code {
  /* Custom inline code styles */
}
```

## Troubleshooting

### Common Issues

1. **Code highlighting not working**: Ensure `rehype-highlight` is properly installed
2. **Emoji not rendering**: Check that `remark-emoji` is in the plugins array
3. **Links not opening in new tab**: Verify external link detection logic
4. **Styling issues**: Check that `globals.css` is properly imported

### Debug Mode

In development, the component includes additional debugging information in the browser console.

## Dependencies

```json
{
  "react-markdown": "^8.0.7",
  "remark-gfm": "^3.0.1", 
  "remark-breaks": "^3.0.3",
  "remark-emoji": "^3.1.2",
  "rehype-highlight": "^6.0.0"
}
```

## Browser Support

- Modern browsers with ES6+ support
- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+