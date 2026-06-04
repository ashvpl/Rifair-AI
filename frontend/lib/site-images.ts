/**
 * Site-wide image registry. Each Unsplash photo ID is assigned to exactly one
 * surface (testimonials, auth, blog, features, etc.) so no stock photo repeats
 * across the marketing site.
 */

export type SiteImage = { src: string; alt: string };

type UnsplashOptions = { w?: number; h?: number; q?: number };

export function unsplashUrl(
  photoId: string,
  options: UnsplashOptions = {}
): string {
  const params = new URLSearchParams({ auto: "format", fit: "crop" });
  if (options.w != null) params.set("w", String(options.w));
  if (options.h != null) params.set("h", String(options.h));
  if (options.q != null) params.set("q", String(options.q));
  return `https://images.unsplash.com/${photoId}?${params.toString()}`;
}

/** Blog article imagery (listing cards + article hero share the same asset). */
export const BLOG_IMAGES: Record<string, SiteImage> = {
  "how-to-create-structured-interview-kit": {
    src: unsplashUrl("photo-1565688534245-05d6b5be184a", { w: 1200, q: 85 }),
    alt: "Two professionals conducting a structured interview in a modern office",
  },
  "how-to-detect-bias-in-interview-questions": {
    src: unsplashUrl("photo-1521791136064-7986c2920216", { w: 1200, q: 85 }),
    alt: "Diverse professionals in an inclusive hiring environment",
  },
  "how-to-write-bias-free-job-description": {
    src: unsplashUrl("photo-1517245386807-bb43f82c33c4", { w: 1200, q: 85 }),
    alt: "Recruiter writing an inclusive job description on a laptop",
  },
  "candidate-evaluation-scorecards-guide": {
    src: unsplashUrl("photo-1553877522-43269d4ea984", { w: 1200, q: 85 }),
    alt: "HR manager reviewing candidate evaluation scorecards on a tablet",
  },
  "ai-in-recruiting-human-oversight": {
    src: unsplashUrl("photo-1531746790731-6c087fecd65a", { w: 1200, q: 85 }),
    alt: "Human and AI collaboration in a modern recruitment workflow",
  },
};

/** Smaller card thumbnails for the blog index. */
export function blogCardImage(slug: keyof typeof BLOG_IMAGES): SiteImage {
  const { alt, src } = BLOG_IMAGES[slug];
  const photoId = src.match(/photo-[\w-]+/)?.[0];
  if (!photoId) {
    throw new Error(`Missing Unsplash photo id for blog slug: ${slug}`);
  }
  return { src: unsplashUrl(photoId, { w: 800, q: 80 }), alt };
}

export function blogListingImage(slug: keyof typeof BLOG_IMAGES): {
  image: string;
  imageAlt: string;
} {
  const { src, alt } = blogCardImage(slug);
  return { image: src, imageAlt: alt };
}

/** Feature SEO pages — related-blog previews (unique from blog index heroes). */
export const FEATURE_RELATED_BLOG_PREVIEWS: Array<
  SiteImage & { slug: string; title: string; category: string }
> = [
  {
    slug: "how-to-create-structured-interview-kit",
    title: "How to Create a Structured Interview Kit for Better Hiring",
    category: "Structured Interviews",
    src: unsplashUrl("photo-1556761175-b413da4baf72", { w: 600, q: 80 }),
    alt: "Hiring team collaborating on interview structure",
  },
  {
    slug: "how-to-detect-bias-in-interview-questions",
    title: "How to Detect Bias in Interview Questions",
    category: "Interview Bias",
    src: unsplashUrl("photo-1573497620053-ea5300f94f21", { w: 600, q: 80 }),
    alt: "Recruiters auditing interview scripts for bias",
  },
  {
    slug: "how-to-write-bias-free-job-description",
    title: "How to Write a Bias-Free Job Description",
    category: "Job Descriptions",
    src: unsplashUrl("photo-1499750310107-5fef28a66643", { w: 600, q: 80 }),
    alt: "Inclusive job posting review on a laptop",
  },
];

/** Login / sign-up rotating gallery (auth-fuse). */
export const AUTH_GALLERY_IMAGES: SiteImage[] = [
  {
    src: unsplashUrl("photo-1494790108377-be9c29b29330", { w: 800, h: 600, q: 80 }),
    alt: "Professional woman in a modern office",
  },
  {
    src: unsplashUrl("photo-1508214751196-bcfd4ca60f91", { w: 600, h: 600, q: 80 }),
    alt: "HR leader reviewing hiring materials",
  },
  {
    src: unsplashUrl("photo-1600880292203-757bb62b4baf", { w: 600, h: 600, q: 80 }),
    alt: "Team discussion in a conference room",
  },
  {
    src: unsplashUrl("photo-1614644186680-77918426e36f", { w: 600, h: 600, q: 80 }),
    alt: "Collaborative workspace with hiring managers",
  },
  {
    src: unsplashUrl("photo-1438761681033-6461ffad8d80", { w: 150, h: 150, q: 80 }),
    alt: "Recruitment specialist portrait",
  },
  {
    src: unsplashUrl("photo-1560250097-0b93528c311a", { w: 150, h: 150, q: 80 }),
    alt: "Hiring manager portrait",
  },
];

/** Landing “Who is it for?” accordion. */
export const LANDING_AUDIENCE_IMAGES = {
  hrTeams: {
    src: unsplashUrl("photo-1521737604893-d14cc237f11d", { w: 600, h: 600, q: 80 }),
    alt: "HR team planning fair hiring workflows",
  },
  startups: {
    src: unsplashUrl("photo-1559136555-9303baea8ebd", { w: 600, h: 600, q: 80 }),
    alt: "Startup founders discussing early hires",
  },
  enterprises: {
    src: unsplashUrl("photo-1497366216548-37526070297c", { w: 600, h: 600, q: 80 }),
    alt: "Enterprise leadership team in a boardroom",
  },
} as const;

/** Homepage testimonial avatars — reserved; not used on auth or blog surfaces. */
export const TESTIMONIAL_AVATARS = {
  sarah: unsplashUrl("photo-1580489944761-15a19d654956", { w: 150, h: 150, q: 80 }),
  marcus: unsplashUrl("photo-1472099645785-5658abf4ff4e", { w: 150, h: 150, q: 80 }),
  elena: unsplashUrl("photo-1573496359142-b8d87734a5a2", { w: 150, h: 150, q: 80 }),
  david: unsplashUrl("photo-1507003211169-0a1dd7228f2d", { w: 150, h: 150, q: 80 }),
  amina: unsplashUrl("photo-1534528741775-53994a69daeb", { w: 150, h: 150, q: 80 }),
  james: unsplashUrl("photo-1500648767791-00dcc994a43e", { w: 150, h: 150, q: 80 }),
  sophia: unsplashUrl("photo-1517841905240-472988babdf9", { w: 150, h: 150, q: 80 }),
  thomas: unsplashUrl("photo-1506794778202-cad84cf45f1d", { w: 150, h: 150, q: 80 }),
  sophie: unsplashUrl("photo-1544005313-94ddf0286df2", { w: 150, h: 150, q: 80 }),
} as const;

/** Pricing page testimonial avatars. */
export const PRICING_TESTIMONIAL_AVATARS = {
  alexia: unsplashUrl("photo-1599566105107-176191caa79f", { w: 150, h: 150, q: 80 }),
  jim: unsplashUrl("photo-1519348338516-cef62856407b", { w: 150, h: 150, q: 80 }),
  marcusThorne: unsplashUrl("photo-1557863881-cecb659a2f0c", { w: 150, h: 150, q: 80 }),
  elenaRodriguez: unsplashUrl("photo-1573497010230-49678b35aaa8", { w: 150, h: 150, q: 80 }),
} as const;

/** Product feature carousel slides. */
export const FEATURE_CAROUSEL_IMAGES = [
  unsplashUrl("photo-1542601906990-b4d3fb778b09", { w: 1200, q: 80 }),
  unsplashUrl("photo-1517048676732-d65bc937f952", { w: 1200, q: 80 }),
  unsplashUrl("photo-1521737711867-e3b97375f902", { w: 1200, q: 80 }),
  unsplashUrl("photo-1578574577315-3fbeb0cecdc2", { w: 1200, q: 80 }),
  unsplashUrl("photo-1451187580459-43490279c0fa", { w: 1200, q: 80 }),
  unsplashUrl("photo-1512941937669-90a1b58e7e9c", { w: 1200, q: 80 }),
  unsplashUrl("photo-1550751827-4bd374c3f58b", { w: 1200, q: 80 }),
] as const;

/** Kit generator marketing cards (dashboard). */
export const KIT_FEATURE_IMAGES = [
  unsplashUrl("photo-1460925895917-afdab827c52f", { w: 1200, q: 80 }),
  unsplashUrl("photo-1522071820081-009f0129c71c", { w: 1200, q: 80 }),
  unsplashUrl("photo-1542744173-8e7e53415bb0", { w: 1200, q: 80 }),
  unsplashUrl("photo-1531538606174-0f90ff5dce83", { w: 1200, q: 80 }),
] as const;

/** Default demo accordion imagery (component showcase). */
export const INTERACTIVE_ACCORDION_DEMO_IMAGES = [
  unsplashUrl("photo-1518770660439-4636190af475", { w: 1974, q: 80 }),
  unsplashUrl("photo-1485827404703-89b55fcc595e", { w: 2070, q: 80 }),
  unsplashUrl("photo-1488590528505-98d2b5aba04b", { w: 1974, q: 80 }),
] as const;

/** Decorative backgrounds for reveal-text animation. */
export const REVEAL_TEXT_BACKGROUNDS = [
  unsplashUrl("photo-1550684848-fac1c5b4e853", { w: 1000, q: 80 }),
  unsplashUrl("photo-1557682250-33bd709cbe85", { w: 1000, q: 80 }),
  unsplashUrl("photo-1557683316-973673baf926", { w: 1000, q: 80 }),
  unsplashUrl("photo-1557682224-5b8590cd9ec5", { w: 1000, q: 80 }),
  unsplashUrl("photo-1557683917-29d509bd6617", { w: 1000, q: 80 }),
] as const;

export const INTRO_VIDEO_POSTER = "/images/video-thumbnail.jpg";

export const LANDING_CTA_BACKGROUND = unsplashUrl(
  "photo-1497366216548-37526070297c",
  { w: 1920, q: 85 }
);

export const DEMO_NAVBAR_BACKGROUND = unsplashUrl(
  "photo-1506318137071-a8e063b4b47e",
  { w: 3540, q: 80 }
);
