import { ArticleClient } from "./article-client";

// Generate static params for static export
export async function generateStaticParams() {
  // Return the known article slugs
  return [
    { slug: "how-to-cultivate-discipline-7-science-backed-strategies" },
    { slug: "5-daily-habits-better-focus-productivity" },
    { slug: "psychology-motivation-what-really-drives-us" },
    { slug: "building-resilience-daily-inspiration" },
  ];
}

interface ArticlePageProps {
  params: {
    slug: string;
  };
}

export default function ArticlePage({ params }: ArticlePageProps) {
  return <ArticleClient slug={params.slug} />;
}