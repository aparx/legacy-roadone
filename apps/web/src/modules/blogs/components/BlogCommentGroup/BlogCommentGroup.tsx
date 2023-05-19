/** @jsxImportSource @emotion/react */
import * as style from './BlogCommentGroup.style';
import type { BlogCommentGroup } from '@/modules/blogs/schemas';

export type BlogCommentGroupProps = {
  group: BlogCommentGroup;
};

export default function BlogCommentGroup(props: BlogCommentGroupProps) {
  const { group } = props;
  return <div css={style.blogCommentGroup}></div>;
}