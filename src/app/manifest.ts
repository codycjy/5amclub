// src/app/manifest.ts
import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '5AM Club',
    short_name: '5AM',
    description: 'Join the community of early risers',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#38bdf8',
    icons: [
      {
        src: 'icon',
        sizes: '256x256',
        type: 'image/png',
      },
      {
        src: 'icon',
        sizes: '512x512',
        type: 'image/png',
      },
    ]
  }
}