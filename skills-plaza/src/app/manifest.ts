import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#050914',
    theme_color: '#08111f',
    icons: [
      {
        src: '/icon.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      },
    ],
  };
}
