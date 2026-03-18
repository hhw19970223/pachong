export const siteConfig = {
  name: 'Skills Plaza',
  shortName: 'Skills Plaza',
  headline: 'The editorial front page for AI agent skills.',
  description:
    'Discover, compare, and install standout AI agent skills with a curated browsing experience built for fast scanning and deep inspection.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://skills-plaza.vercel.app',
  githubUrl: 'https://github.com/hhw19970223/pachong',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://98.88.137.186:3001',
  keywords: [
    'AI skills',
    'agent marketplace',
    'skills.sh',
    'AI agents',
    'automation tools',
    'prompt engineering',
  ],
} as const;
