import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, BookOpen, ImageOff, RefreshCw } from "lucide-react";
import { Link, useRoute } from "wouter";
import { storageImageUrl, storefrontJson } from "@/storefront/api";

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
    <img
      src={source}
      alt={story.title}
      loading={detail ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
    />
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
        ) : query.isError ? (
          <div className="story-status story-error" role="alert">
            <p>Stories could not be loaded. Please try again.</p>
            <button className="story-retry" type="button" onClick={() => void query.refetch()} disabled={query.isFetching}>
              <RefreshCw size={15} aria-hidden="true" />
              {query.isFetching ? "Retrying…" : "Try again"}
            </button>
          </div>
        ) : query.data.length === 0 ? (
          <p className="story-status" role="status">No stories have been published yet.</p>
        ) : (
          <div className="story-grid">
            {query.data.map((story) => (
              <article className="story-card" key={story.id || story.slug}>
                <Link href={`/stories/${encodeURIComponent(story.slug)}`} className="story-card-link" aria-label={`Read story: ${story.title}`}>
                  <div className="story-card-image">
                    <StoryImage story={story} />
                  </div>
                  <div className="story-card-content">
                    <h3>{story.title}</h3>
                    {story.excerpt && <p>{story.excerpt}</p>}
                    <span className="story-card-cta">Read story <ArrowRight size={15} aria-hidden="true" /></span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function LearnPage() {
  return (
    <>
      <PageMeta title="Learning" description="Learn from SaveStreet Dogs' published stories and community work." />
      <main>
        <section className="learn-intro">
          <div className="container">
            <span className="eyebrow">Learning</span>
            <h1>Learn from the stories behind the work.</h1>
            <p>Read the published stories shared by SaveStreet Dogs and the people working alongside street dogs.</p>
            <a className="learn-intro-link" href="#stories">Explore stories <ArrowRight size={15} aria-hidden="true" /></a>
          </div>
        </section>
        <StoriesFeed
          id="stories"
          heading="Real stories from the work"
          description="Each story below is loaded from the published story collection."
        />
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
            <h1>Every published story.</h1>
            <p>Open a story to read its full description and view its associated image.</p>
          </div>
        </section>
        <StoriesFeed
          id="all-stories"
          heading="Stories from the work"
          description="All published stories are listed here."
        />
      </main>
    </>
  );
}

export function StoryDetailPage() {
  const [matched, params] = useRoute<{ slug: string }>("/stories/:slug");
  const slug = matched ? params?.slug : undefined;
  const query = useQuery({
    queryKey: ["/api/stories", slug],
    queryFn: ({ signal }) => fetchStory(slug || "", signal),
    enabled: Boolean(slug),
    staleTime: 60_000,
  });

  if (query.isPending) {
    return <main className="story-detail-page"><p className="story-status" role="status">Loading story…</p></main>;
  }

  if (query.isError) {
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

  const story = query.data;
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
              {formattedDate && <p className="story-detail-date">{formattedDate}</p>}
              {story?.excerpt && <p className="story-detail-excerpt">{story.excerpt}</p>}
              {body && <p className="story-detail-body">{body}</p>}
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
