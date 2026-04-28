import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://critorbit.com',
      lastModified: new Date(),
    },
    {
      url: 'https://critorbit.com/helpers',
      lastModified: new Date(),
    },
  ]
}
