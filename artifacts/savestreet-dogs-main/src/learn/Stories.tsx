import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, BookOpen, Clock3, ImageOff, RefreshCw } from "lucide-react";
import { Link, useRoute } from "wouter";
import { storageImageUrl, storefrontJson } from "@/storefront/api";
import { illustrativeStories, learnArticles, type LearnArticle } from "./content";
import "./learn.css";

type Story = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  body?: string | null;
  imageUrl?: string | null;
  image_url?: string | null;
  imageUrls?: string[] | null;
  createdAt?: string | null;
  illustrative?: boolean;
  relatedLinks?: Array<{ label: string; href: string }>;
};

async function fetchStories(signal?: AbortSignal): Promise<Story[]> {
  const stories = await storefrontJson<Story[]>("/api/stories", { signal });
  if (!Array.isArray(stories)) throw new Error("The stories response was not a list.");
  return stories;
}

async function fetchStory(slug: string, signal?: AbortSignal): Promise<Story> {
  return storefrontJson<Story>(`/api/stories/${encodeURIComponent(slug)}`, { signal });
}

function storyImageSource(story: Story): string | undefined {
  const raw = story.imageUrl || story.image_url || story.imageUrls?.[0];
  if (!raw?.trim()) return undefined;
  const path = storageImageUrl(raw.trim());
  if (!path) return undefined;
  if (/^(https?:\/\/|data:image\/)/i.test(path)) return path;
  if (path.startsWith("//")) return `${window.location.protocol}${path}`;
  if (path.startsWith("/api/storage/")) return path;
  const base = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  return `${base}${path.replace(/^\/+/, "")}`;
}

function StoryImage({ story, detail = false }: { story: Story; detail?: boolean }) {
  const source = storyImageSource(story);
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [source]);

  if (!source || failed) {
    return (
      <div className={`story-image-fallback${detail ? " detail" : ""}`} role="img" aria-label={`Image unavailable for ${story.title}`}>
        <ImageOff aria-hidden="true" size={detail ? 28 : 24} />
        <span>Image unavailable</span>
      </div>
    );
  }

  return (
    <div className="story-image-wrap">
      <img
        src={source}
        alt={story.illustrative ? `Illustrative image for ${story.title}; not a case photograph.` : story.title}
        loading={detail ? "eager" : "lazy"}
        decoding="async"
        onError={() => setFailed(true)}
      />
      {story.illustrative && <span className="story-image-label">Illustrative image</span>}
    </div>
  );
}

function PageMeta({ title, description }: { title: string; description: string }) {
  useEffect(() => {
    const previousTitle = document.title;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = meta?.content;
    document.title = `${title} · SaveStreet Dogs`;
    meta?.setAttribute("content", description);
    return () => {
      document.title = previousTitle;
      if (meta && previousDescription !== undefined) meta.setAttribute("content", previousDescription);
    };
  }, [title, description]);
  return null;
}

function StoriesFeed({
  heading,
  description,
  id,
}: {
  heading: string;
  description: string;
  id?: string;
}) {
  const query = useQuery({
    queryKey: ["/api/stories"],
    queryFn: ({ signal }) => fetchStories(signal),
    staleTime: 60_000,
  });
  const publishedStories = query.data ?? [];
  const stories = publishedStories.length ? publishedStories : illustrativeStories;
  const showingIllustrativeStories = !query.isPending && publishedStories.length === 0;

  return (
    <section className="story-strip" id={id}>
      <div className="container">
        <div className="section-head story-section-head">
          <div>
            <span className="eyebrow">Stories</span>
            <h2>{heading}</h2>
            <p>{description}</p>
          </div>
        </div>

        {query.isPending ? (
          <p className="story-status" role="status">Loading published stories…</p>
        ) : (
          <>
            {showingIllustrativeStories && (
              <div className="story-illustrative-notice" role={query.isError ? "status" : undefined}>
                {query.isError
                  ? "Published stories could not be reached. These clearly labelled educational examples are not records of real rescues."
                  : "No case stories have been published yet. These clearly labelled educational examples are not records of real rescues."}
                {query.isError && (
                  <button className="story-retry" type="button" onClick={() => void query.refetch()} disabled={query.isFetching}>
                    <RefreshCw size={15} aria-hidden="true" />
                    {query.isFetching ? "Retrying…" : "Retry published stories"}
                  </button>
                )}
              </div>
            )}
            <div className="story-grid">
              {stories.map((story) => (
                <article className="story-card" key={story.id || story.slug}>
                  <Link href={`/stories/${encodeURIComponent(story.slug)}`} className="story-card-link" aria-label={`Read story: ${story.title}`}>
                    <div className="story-card-image">
                      <StoryImage story={story} />
                    </div>
                    <div className="story-card-content">
                      {story.illustrative && <span className="story-kind-label">Illustrative scenario</span>}
                      <h3>{story.title}</h3>
                      {story.excerpt && <p>{story.excerpt}</p>}
                      <span className="story-card-cta">Read story <ArrowRight size={15} aria-hidden="true" /></span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export function LearnPage() {
  return (
    <>
      <PageMeta title="Learn" description="Practical, responsible guidance for helping street dogs and supporting community care." />
      <main>
        <section className="learn-intro">
          <div className="container">
            <span className="eyebrow">Learning</span>
            <h1>Practical answers for more careful care.</h1>
            <p>Original guides on safety, fostering, adoption, and everyday community support. Urgent health concerns belong with a qualified veterinarian.</p>
            <a className="learn-intro-link" href="#learn-guides">Explore the guides <ArrowRight size={15} aria-hidden="true" /></a>
          </div>
        </section>
        <section className="learn-library" id="learn-guides">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="eyebrow">Nine practical guides</span>
                <h2>Care starts with clear information.</h2>
              </div>
              <p className="section-intro">These educational articles are general guidance, not a substitute for veterinary advice or local rules.</p>
            </div>
            <div className="learn-card-grid">
              {learnArticles.map((article) => (
                <LearnCard article={article} key={article.slug} />
              ))}
            </div>
            <div className="learn-stories-link">
              <BookOpen size={18} aria-hidden="true" />
              <p>Looking for community-care scenarios? Our Stories page clearly distinguishes illustrative examples from verified case records.</p>
              <Link className="btn btn-ghost" href="/stories">Read Stories <ArrowRight size={15} aria-hidden="true" /></Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export function StoriesPage() {
  return (
    <>
      <PageMeta title="Stories" description="Published SaveStreet Dogs stories." />
      <main>
        <section className="learn-intro compact">
          <div className="container">
            <span className="eyebrow">Stories</span>
            <h1>Stories and community-care scenarios.</h1>
            <p>Published case stories appear when available. Educational scenarios are clearly labelled and are not presented as real rescue records.</p>
          </div>
        </section>
        <StoriesFeed
          id="all-stories"
          heading="Stories for careful community care"
          description="Read practical examples about safe reporting, fostering, adoption, and everyday support."
        />
      </main>
    </>
  );
}

export function StoryDetailPage() {
  const [matched, params] = useRoute<{ slug: string }>("/stories/:slug");
  const slug = matched ? params?.slug : undefined;
  const illustrativeStory = illustrativeStories.find((entry) => entry.slug === slug);
  const query = useQuery({
    queryKey: ["/api/stories", slug],
    queryFn: ({ signal }) => fetchStory(slug || "", signal),
    enabled: Boolean(slug) && !illustrativeStory,
    staleTime: 60_000,
  });

  if (!illustrativeStory && query.isPending) {
    return <main className="story-detail-page"><p className="story-status" role="status">Loading story…</p></main>;
  }

  if (!illustrativeStory && query.isError) {
    const status = (query.error as { status?: number }).status;
    return (
      <main className="story-detail-page">
        <div className="container story-detail-message">
          <BookOpen aria-hidden="true" size={25} />
          <h1>{status === 404 ? "This story is not available." : "Story could not be loaded."}</h1>
          <p>{status === 404 ? "It may have been unpublished or the link may be out of date." : "Please retry, or return to the published stories."}</p>
          {status !== 404 && (
            <button className="story-retry" type="button" onClick={() => void query.refetch()} disabled={query.isFetching}>
              <RefreshCw size={15} aria-hidden="true" />
              {query.isFetching ? "Retrying…" : "Try again"}
            </button>
          )}
          <Link className="story-back-link" href="/stories"><ArrowLeft size={15} aria-hidden="true" /> Back to stories</Link>
        </div>
      </main>
    );
  }

  const story = illustrativeStory ?? query.data;
  if (!story) {
    return (
      <main className="story-detail-page">
        <div className="container story-detail-message">
          <BookOpen aria-hidden="true" size={25} />
          <h1>This story is not available.</h1>
          <p>It may have been unpublished or the link may be out of date.</p>
          <Link className="story-back-link" href="/stories"><ArrowLeft size={15} aria-hidden="true" /> Back to stories</Link>
        </div>
      </main>
    );
  }
  const title = story?.title || "Story";
  const description = story?.excerpt || "A published SaveStreet Dogs story.";
  const body = story?.body?.trim() || story?.excerpt?.trim() || "";
  const storyDate = story?.createdAt ? new Date(story.createdAt) : undefined;
  const formattedDate = storyDate && !Number.isNaN(storyDate.valueOf())
    ? storyDate.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : undefined;

  return (
    <>
      <PageMeta title={title} description={description} />
      <main className="story-detail-page">
        <article className="container story-detail">
          <Link className="story-back-link" href="/stories"><ArrowLeft size={15} aria-hidden="true" /> Back to stories</Link>
          <div className="story-detail-layout">
            <div className="story-detail-copy">
              <span className="eyebrow">SaveStreet Dogs story</span>
              <h1>{title}</h1>
              {story.illustrative && <p className="story-illustrative-disclosure">Illustrative educational scenario — not a record of a real rescue, person, or outcome.</p>}
              {formattedDate && <p className="story-detail-date">{formattedDate}</p>}
              {story?.excerpt && <p className="story-detail-excerpt">{story.excerpt}</p>}
              {body.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => (
                <p className="story-detail-body" key={`${story.slug}-${index}`}>{paragraph}</p>
              ))}
              {story.relatedLinks?.length ? (
                <div className="story-related-links">
                  {story.relatedLinks.map((link) => <Link className="btn btn-ghost" href={link.href} key={link.href}>{link.label} <ArrowRight size={14} aria-hidden="true" /></Link>)}
                </div>
              ) : (
                <div className="story-related-links"><Link className="btn btn-ghost" href="/contact">Ask the team <ArrowRight size={14} aria-hidden="true" /></Link></div>
              )}
            </div>
            <div className="story-detail-image">
              {story && <StoryImage story={story} detail />}
            </div>
          </div>
        </article>
      </main>
    </>
  );
}

function LearnCard({ article }: { article: LearnArticle }) {
  const image = storageImageUrl(article.imageUrl);
  return (
    <article className="learn-card">
      <Link href={`/learn/${article.slug}`} className="learn-card-link" aria-label={`Read guide: ${article.title}`}>
        <div className="learn-card-image">
          {image
            ? <img src={image} alt={`Illustrative image for ${article.title}`} loading="lazy" decoding="async" />
            : <BookOpen size={28} aria-hidden="true" />}
          <span>Illustrative image</span>
        </div>
        <div className="learn-card-copy">
          <span className="learn-card-time"><Clock3 size={14} aria-hidden="true" /> {article.readingMinutes} min read</span>
          <h3>{article.title}</h3>
          <p>{article.summary}</p>
          <span className="learn-card-cta">Read guide <ArrowRight size={15} aria-hidden="true" /></span>
        </div>
      </Link>
    </article>
  );
}

export function LearnArticlePage() {
  const [matched, params] = useRoute<{ slug: string }>("/learn/:slug");
  const article = matched ? learnArticles.find((entry) => entry.slug === params?.slug) : undefined;

  if (!article) {
    return (
      <main className="learn-article-page">
        <div className="container story-detail-message">
          <BookOpen aria-hidden="true" size={25} />
          <h1>This guide is not available.</h1>
          <p>Choose one of the published learning guides instead.</p>
          <Link className="story-back-link" href="/learn"><ArrowLeft size={15} aria-hidden="true" /> Back to Learn</Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <PageMeta title={article.title} description={article.summary} />
      <main className="learn-article-page">
        <article className="container learn-article">
          <Link className="story-back-link" href="/learn"><ArrowLeft size={15} aria-hidden="true" /> Back to Learn</Link>
          <div className="learn-article-layout">
            <div className="learn-article-copy">
              <span className="eyebrow">Practical guide · {article.readingMinutes} min read</span>
              <h1>{article.title}</h1>
              <p className="learn-article-summary">{article.summary}</p>
              <p className="learn-advice-note">General educational information only. For urgent health concerns, contact a qualified veterinarian.</p>
            </div>
            <div className="learn-article-image">
              <img src={article.imageUrl} alt={`Illustrative image for ${article.title}`} loading="eager" decoding="async" />
              <span>Illustrative image</span>
            </div>
          </div>
          <div className="learn-article-content">
            {article.sections.map((section) => (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </section>
            ))}
            <div className="story-related-links">
              {article.relatedLinks.map((link) => <Link className="btn btn-ghost" href={link.href} key={link.href}>{link.label} <ArrowRight size={14} aria-hidden="true" /></Link>)}
              <Link className="btn btn-primary" href="/stories">Read Stories <ArrowRight size={14} aria-hidden="true" /></Link>
            </div>
          </div>
        </article>
      </main>
    </>
  );
}
