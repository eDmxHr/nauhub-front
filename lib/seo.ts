import type { Metadata } from 'next'

// Site configuration
export const siteConfig = {
  name: 'Balani',
  description: 'Stream your favorite movies and TV shows on Balani. Watch Korean dramas, anime, Hollywood movies, and more.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://balani.app',
  ogImage: '/og-image.jpg',
  twitterHandle: '@balaniapp',
  locale: 'en_US',
  themeColor: '#000000',
}

// Default metadata that applies to all pages
export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} - Stream Movies & TV Shows`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    'streaming',
    'movies',
    'TV shows',
    'Korean drama',
    'K-drama',
    'anime',
    'watch online',
    'free streaming',
    'Balani',
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} - Stream Movies & TV Shows`,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} - Stream Movies & TV Shows`,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: siteConfig.twitterHandle,
    site: siteConfig.twitterHandle,
  },
  alternates: {
    canonical: siteConfig.url,
  },
  category: 'entertainment',
}

// Helper to generate page-specific metadata
export function generatePageMetadata({
  title,
  description,
  path = '',
  image,
  noIndex = false,
  keywords = [],
}: {
  title: string
  description: string
  path?: string
  image?: string
  noIndex?: boolean
  keywords?: string[]
}): Metadata {
  const url = `${siteConfig.url}${path}`
  const ogImage = image || siteConfig.ogImage

  return {
    title,
    description,
    keywords: [...(defaultMetadata.keywords as string[]), ...keywords],
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      url,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: url,
    },
  }
}

// Helper to generate show/movie metadata
export function generateShowMetadata({
  title,
  description,
  image,
  type,
  year,
  rating,
  genres,
  country,
  id,
}: {
  title: string
  description: string
  image: string
  type: 'tv' | 'movie'
  year: number
  rating: number
  genres: string[]
  country: string
  id: string
}): Metadata {
  const pageTitle = type === 'movie' 
    ? `Watch ${title} (${year}) - ${country} Movie`
    : `Watch ${title} (${year}) - ${country} TV Series`
  
  const pageDescription = `${description.slice(0, 150)}... Watch ${title} on Balani. Rating: ${rating}/10. Genres: ${genres.join(', ')}.`

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: [
      title,
      ...genres,
      country,
      type === 'movie' ? 'movie' : 'TV series',
      `watch ${title}`,
      `stream ${title}`,
      `${title} online`,
      year.toString(),
    ],
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: `${siteConfig.url}/detail/${id}`,
      type: type === 'movie' ? 'video.movie' : 'video.tv_show',
      images: [
        {
          url: image,
          width: 500,
          height: 750,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [image],
    },
    alternates: {
      canonical: `${siteConfig.url}/detail/${id}`,
    },
  }
}

// JSON-LD structured data generators
export function generateWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/icons/icon-512x512.svg`,
    sameAs: [
      `https://twitter.com/${siteConfig.twitterHandle.replace('@', '')}`,
    ],
  }
}

export function generateMovieJsonLd({
  title,
  description,
  image,
  year,
  rating,
  director,
  cast,
  duration,
  genres,
  id,
}: {
  title: string
  description: string
  image: string
  year: number
  rating: number
  director?: string
  cast?: string[]
  duration?: string
  genres: string[]
  id: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: title,
    description,
    image,
    datePublished: year.toString(),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: rating,
      bestRating: 10,
      worstRating: 0,
    },
    director: director ? {
      '@type': 'Person',
      name: director,
    } : undefined,
    actor: cast?.map(name => ({
      '@type': 'Person',
      name,
    })),
    duration: duration ? `PT${duration.replace(/\s/g, '').toUpperCase()}` : undefined,
    genre: genres,
    url: `${siteConfig.url}/detail/${id}`,
  }
}

export function generateTVSeriesJsonLd({
  title,
  description,
  image,
  year,
  rating,
  cast,
  seasons,
  genres,
  id,
}: {
  title: string
  description: string
  image: string
  year: number
  rating: number
  cast?: string[]
  seasons?: number
  genres: string[]
  id: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TVSeries',
    name: title,
    description,
    image,
    datePublished: year.toString(),
    numberOfSeasons: seasons ?? 1,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: rating,
      bestRating: 10,
      worstRating: 0,
    },
    actor: cast?.map(name => ({
      '@type': 'Person',
      name,
    })),
    genre: genres,
    url: `${siteConfig.url}/detail/${id}`,
  }
}

export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
