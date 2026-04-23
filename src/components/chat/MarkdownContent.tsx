import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark-dimmed.min.css";

type Props = {
  text: string;
};

export default function MarkdownContent({ text }: Props) {
  return <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{text}</ReactMarkdown>;
}
