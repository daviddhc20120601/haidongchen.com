// AI-assisted (Cursor) — review before merge.
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://haidongchen.com';
const DEFAULT_TITLE = 'Haidong Chen — GPU AI Factory Principal Engineer';
const DEFAULT_DESCRIPTION =
  'Haidong Chen designs, commissions, and tunes large-scale NVIDIA GPU AI factories, including HPC networking, liquid cooling, and model performance.';

const ROUTE_METADATA = {
  '/': {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  '/about': {
    title: 'About Haidong Chen — GPU AI Factory Principal Engineer',
    description:
      'Professional profile, experience, achievements, and technical competencies of GPU AI factory principal engineer Haidong Chen.',
  },
  '/publications': {
    title: 'Publications and Patents — Haidong Chen',
    description:
      'Technical publications, patents, and whitepapers by Haidong Chen covering AI, cloud computing, and engineering.',
  },
  '/talks': {
    title: 'Technical Talks and Writing — Haidong Chen',
    description:
      'Talks, tutorials, and technical articles by Haidong Chen about AI systems, cloud infrastructure, robotics, data, and blockchain.',
  },
  '/research': {
    title: 'Research — Haidong Chen',
    description:
      'Research interests and technical work by Haidong Chen in GPU AI infrastructure, generative AI, cloud systems, and robotics.',
  },
  '/robot-simulations': {
    title: 'Robot Simulations — Haidong Chen',
    description:
      'Robotics simulation projects and articles covering ROS, reinforcement learning, VLA systems, physics engines, and autonomous navigation.',
  },
  '/books': {
    title: 'Books — Haidong Chen',
    description: 'Books and long-form writing by Haidong Chen.',
  },
  '/llm-agents': {
    title: 'LLM Agents — Haidong Chen',
    description: 'An interactive interface for exploring large language model agents.',
  },
};

function setMeta(selector, attribute, value) {
  const element = document.head.querySelector(selector);
  if (element) element.setAttribute(attribute, value);
}

export default function Seo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const metadata = ROUTE_METADATA[pathname] ?? {
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
    };
    const canonicalUrl = `${SITE_URL}${pathname === '/' ? '/' : pathname}`;

    document.title = metadata.title;
    setMeta('meta[name="description"]', 'content', metadata.description);
    setMeta('meta[property="og:title"]', 'content', metadata.title);
    setMeta('meta[property="og:description"]', 'content', metadata.description);
    setMeta('meta[property="og:url"]', 'content', canonicalUrl);
    setMeta('meta[name="twitter:title"]', 'content', metadata.title);
    setMeta('meta[name="twitter:description"]', 'content', metadata.description);
    setMeta('link[rel="canonical"]', 'href', canonicalUrl);
    setMeta(
      'meta[name="robots"]',
      'content',
      pathname === '/llm-agents'
        ? 'noindex, nofollow'
        : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    );
  }, [pathname]);

  return null;
}
