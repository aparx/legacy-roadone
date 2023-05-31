import { ProcessedBlogPostModel } from '@/modules/blog/blog';
import { LocalToggle } from '@/utils/localState';
import { createContext, useContext } from 'react';

export type BlogPostContext = {
  blogPost: ProcessedBlogPostModel;
  isLoading: boolean;
  isFetching: boolean;
  showReplies: LocalToggle;
};

export const blogPostContext = createContext<BlogPostContext | null>(null);

export const BlogPostContextProvider = blogPostContext.Provider;

export function useBlogPostContext(): BlogPostContext {
  const context = useContext(blogPostContext);
  if (context) return context;
  throw new Error('Cannot find blog post context');
}
