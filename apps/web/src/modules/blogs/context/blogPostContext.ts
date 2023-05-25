import { BlogPostProcessedData } from '@/modules/blogs/blogPost';
import { LocalState, LocalToggle } from '@/utils/localState';
import { createContext, useContext } from 'react';

/**
 * Base BlogPost-Context that can be used anywhere.
 */
export type BlogPostBaseContext = {
  /** The (already processed) blog data. */
  data: LocalState<BlogPostProcessedData>;

  /** Toggle that controls the visibility of replies at root level */
  showReplies: LocalToggle;
};

export type BlogPostContext = BlogPostBaseContext;

export const blogPostContext = createContext<BlogPostContext | null>(null);

export function useBlogPost(): BlogPostContext {
  const context = useContext(blogPostContext);
  if (context == null) throw new Error('BlogPostProvider is not present');
  return context;
}

export const BlogPostProvider = blogPostContext.Provider;
