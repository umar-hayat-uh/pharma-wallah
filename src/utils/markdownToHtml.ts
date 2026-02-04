import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm'; // For tables
import remarkToc from 'remark-toc'; // For table of contents
import { visit } from 'unist-util-visit';

export default async function markdownToHtml(markdown: string) {
  const result = await remark()
    .use(remarkGfm) // Add support for tables
    .use(remarkToc, { 
      heading: 'table of contents|contents|toc',
      tight: true 
    })
    .use(() => (tree) => {
      // Add IDs to headings for anchor links
      visit(tree, 'heading', (node: any) => {
        const data = node.data || (node.data = {});
        const props = data.hProperties || (data.hProperties = {});
        let id = '';
        
        // Generate ID from heading text
        if (node.children && node.children[0] && node.children[0].value) {
          id = node.children[0].value
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
        }
        
        if (id) {
          props.id = id;
        }
      });

      // Style tables with custom classes
      visit(tree, 'table', (node: any) => {
        const data = node.data || (node.data = {});
        const props = data.hProperties || (data.hProperties = {});
        props.className = 'styled-table';
      });
    })
    .use(html, { sanitize: false }) // Don't sanitize to allow custom classes
    .process(markdown);

  return result.toString();
}