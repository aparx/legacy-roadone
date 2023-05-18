import { remark } from 'remark';
import remarkHtml from 'remark-html';

export function renderMarkdown(
  value: string,
  sanitize?: boolean
): Promise<string> {
  return remark()
    .use(remarkHtml, { sanitize })
    .process(value)
    .then((p) => p.toString());
}
