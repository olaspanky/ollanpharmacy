import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.ollanpharmacy.ng'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/private/',
          '/_next/',
          '/checkout/',
          '/account/',
          '/user/',
          '/payment/',
          '/temp/',
          '*.json',
          '/search?*',
          '/cart',
          '/wishlist',
          '/compare'
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/private/',
          '/checkout/',
          '/account/',
          '/user/',
          '/payment/'
        ],
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}