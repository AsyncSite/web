# CLAUDE.md - SlackDori Frontend Development Guidelines

## 🚨🚨🚨 절대 필수 규칙 🚨🚨🚨

### ⚠️ SEO 최우선 원칙 (SEO-First Principle)

**모든 개발 결정에서 SEO를 최우선으로 고려해야 합니다.**

1. **서버사이드 렌더링 필수**
   - 모든 공개 페이지는 SSR 또는 SSG 사용
   - 클라이언트 전용 렌더링 절대 금지
   - 동적 콘텐츠도 서버에서 먼저 렌더링

2. **메타데이터 완벽성**
   - 모든 페이지에 고유한 title, description 필수
   - Open Graph 태그 완전 구현
   - 구조화된 데이터 (JSON-LD) 필수

3. **성능 최적화**
   - Core Web Vitals 모든 지표 "Good" 유지
   - 이미지 최적화 필수 (next/image 사용)
   - 번들 크기 최소화

---

## 🏗️ Project Architecture

### Technology Stack
```
Framework: Next.js 14 (App Router)
Language: TypeScript 5.x (Strict Mode)
Styling: CSS Modules + Tailwind CSS
State: Zustand (경량 상태 관리)
Data Fetching: Native fetch + React Query
SEO: Next.js Metadata API
Analytics: Google Analytics 4 + Google AdSense
Monitoring: Vercel Analytics + Web Vitals
Testing: Jest + React Testing Library + Playwright
```

### Directory Structure
```
slackdori-frontend/
├── src/
│   ├── app/                      # App Router pages
│   │   ├── (marketing)/          # Marketing pages group
│   │   │   ├── layout.tsx        # Marketing layout with SEO
│   │   │   ├── page.tsx          # Home page
│   │   │   ├── about/
│   │   │   ├── blog/
│   │   │   └── guides/
│   │   ├── (app)/                # Application pages group
│   │   │   ├── layout.tsx        # App layout
│   │   │   ├── packs/
│   │   │   │   ├── page.tsx      # Pack list (SSR)
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx  # Pack detail (SSR)
│   │   │   │       └── opengraph-image.tsx
│   │   │   ├── dashboard/
│   │   │   └── auth/
│   │   ├── api/                  # API routes
│   │   │   ├── revalidate/
│   │   │   └── webhooks/
│   │   ├── layout.tsx            # Root layout
│   │   ├── robots.ts             # Dynamic robots.txt
│   │   └── sitemap.ts            # Dynamic sitemap
│   ├── components/
│   │   ├── ui/                   # Reusable UI components
│   │   ├── features/             # Feature-specific components
│   │   ├── layout/               # Layout components
│   │   └── seo/                  # SEO components
│   ├── lib/
│   │   ├── api/                  # API client functions
│   │   ├── seo/                  # SEO utilities
│   │   ├── utils/                # Utility functions
│   │   └── constants/            # Constants
│   ├── hooks/                    # Custom React hooks
│   ├── stores/                   # Zustand stores
│   ├── types/                    # TypeScript types
│   └── styles/                   # Global styles
├── public/
│   ├── images/                   # Static images
│   ├── og/                       # Open Graph images
│   └── icons/                    # Favicons and icons
├── tests/
│   ├── unit/                     # Unit tests
│   ├── integration/              # Integration tests
│   └── e2e/                      # E2E tests
└── docs/                         # Documentation
```

---

## 📋 Development Conventions

### 1. File Naming Conventions

```typescript
// Components: PascalCase
PackCard.tsx
InstallButton.tsx

// Utilities: camelCase
fetchPacks.ts
formatDate.ts

// Constants: UPPER_SNAKE_CASE
API_ENDPOINTS.ts
SEO_CONFIG.ts

// Types: PascalCase with .types.ts suffix
Pack.types.ts
User.types.ts

// Hooks: camelCase with use prefix
usePackData.ts
useInstallation.ts

// API routes: kebab-case
/api/slack-auth
/api/pack-data
```

### 2. Component Structure

```typescript
// ✅ GOOD - Complete component structure
import { Suspense } from 'react';
import type { Metadata } from 'next';

// Type definitions first
interface PackPageProps {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

// Metadata for SEO (pages only)
export async function generateMetadata({ params }: PackPageProps): Promise<Metadata> {
  const pack = await fetchPackData(params.id);
  
  return {
    title: `${pack.name} - ${pack.emojiCount} Slack Emojis | SlackDori`,
    description: pack.description,
    openGraph: {
      title: pack.name,
      description: pack.description,
      images: [`/og/packs/${pack.id}.png`],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
    },
    alternates: {
      canonical: `https://slackdori.asyncsite.com/packs/${pack.id}`,
    },
  };
}

// Static params for SSG
export async function generateStaticParams() {
  const packs = await fetchAllPacks();
  return packs.map((pack) => ({
    id: pack.id,
  }));
}

// Main component
export default async function PackPage({ params }: PackPageProps) {
  const pack = await fetchPackData(params.id);
  
  return (
    <>
      {/* Structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: pack.name,
            description: pack.description,
            applicationCategory: 'CommunicationApplication',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
          }),
        }}
      />
      
      {/* Page content */}
      <Suspense fallback={<PackSkeleton />}>
        <PackDetail pack={pack} />
      </Suspense>
    </>
  );
}
```

### 3. CSS Module Conventions

```css
/* PackCard.module.css */

/* BEM-inspired naming with CSS Modules */
.container {
  @apply p-4 rounded-lg shadow-md;
}

.container--featured {
  @apply border-2 border-blue-500;
}

.title {
  @apply text-2xl font-bold mb-2;
}

.title--large {
  @apply text-3xl;
}

/* State modifiers */
.container[data-loading="true"] {
  @apply opacity-50 pointer-events-none;
}

/* Responsive utilities */
@media (min-width: 768px) {
  .container {
    @apply p-6;
  }
}
```

### 4. API Client Patterns

```typescript
// lib/api/packs.ts

import { cache } from 'react';
import type { Pack, PackDetail } from '@/types';

// Server-side data fetching with caching
export const fetchPacks = cache(async (): Promise<Pack[]> => {
  const res = await fetch(`${process.env.API_URL}/api/slack-emoji/packs`, {
    next: { 
      revalidate: 3600, // Revalidate every hour
      tags: ['packs'],
    },
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch packs');
  }
  
  return res.json();
});

// Client-side data fetching hook
export function usePackMutation() {
  const [isLoading, setIsLoading] = useState(false);
  
  const installPack = async (packId: string, workspaceId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId, workspaceId }),
      });
      
      if (!res.ok) throw new Error('Installation failed');
      
      return await res.json();
    } finally {
      setIsLoading(false);
    }
  };
  
  return { installPack, isLoading };
}
```

---

## 🔍 SEO Implementation Guidelines

### 1. Dynamic Metadata

```typescript
// app/packs/[id]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pack = await fetchPack(params.id);
  
  // Generate keywords from pack data
  const keywords = [
    'slack emoji',
    'slack emoji pack',
    pack.name.toLowerCase(),
    ...pack.tags,
  ].join(', ');
  
  return {
    title: `${pack.name} - ${pack.emojiCount} Slack Emojis`,
    description: pack.description,
    keywords,
    authors: [{ name: 'SlackDori' }],
    creator: 'AsyncSite',
    publisher: 'AsyncSite',
    metadataBase: new URL('https://slackdori.asyncsite.com'),
    openGraph: {
      title: pack.name,
      description: pack.description,
      url: `/packs/${pack.id}`,
      siteName: 'SlackDori',
      images: [
        {
          url: `/og/packs/${pack.id}.png`,
          width: 1200,
          height: 630,
          alt: `${pack.name} emoji pack preview`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: pack.name,
      description: pack.description,
      images: [`/og/packs/${pack.id}.png`],
    },
    alternates: {
      canonical: `/packs/${pack.id}`,
      languages: {
        'en-US': `/en/packs/${pack.id}`,
        'ko-KR': `/ko/packs/${pack.id}`,
      },
    },
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
  };
}
```

### 2. Structured Data (JSON-LD)

```typescript
// components/seo/StructuredData.tsx
export function PackStructuredData({ pack }: { pack: PackDetail }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `https://slackdori.asyncsite.com/packs/${pack.id}`,
    name: pack.name,
    description: pack.description,
    applicationCategory: 'CommunicationApplication',
    applicationSubCategory: 'Emoji Pack',
    operatingSystem: 'Slack',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: pack.rating || 4.5,
      reviewCount: pack.reviewCount || 0,
      bestRating: 5,
      worstRating: 1,
    },
    author: {
      '@type': 'Organization',
      name: 'SlackDori',
      url: 'https://slackdori.asyncsite.com',
    },
    datePublished: pack.createdAt,
    dateModified: pack.updatedAt,
    screenshot: pack.screenshots.map(url => ({
      '@type': 'ImageObject',
      url,
    })),
  };
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
```

### 3. Dynamic Sitemap

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://slackdori.asyncsite.com';
  
  // Fetch all packs
  const packs = await fetchAllPacks();
  
  // Generate pack URLs
  const packUrls = packs.map((pack) => ({
    url: `${baseUrl}/packs/${pack.id}`,
    lastModified: new Date(pack.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/packs`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ];
  
  return [...staticPages, ...packUrls];
}
```

---

## 💰 AdSense Integration Guidelines

### 1. Ad Component Structure

```typescript
// components/features/AdSlot.tsx
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface AdSlotProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  responsive?: boolean;
  className?: string;
}

export function AdSlot({ 
  slot, 
  format = 'auto', 
  responsive = true,
  className = ''
}: AdSlotProps) {
  const pathname = usePathname();
  
  useEffect(() => {
    try {
      // Push ads on route change
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, [pathname]);
  
  // Don't show ads in development
  if (process.env.NODE_ENV !== 'production') {
    return (
      <div className={`bg-gray-200 p-4 text-center ${className}`}>
        [Ad Placeholder - Slot: {slot}]
      </div>
    );
  }
  
  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={{ display: 'block' }}
      data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive}
    />
  );
}
```

### 2. Ad Placement Strategy

```typescript
// app/packs/[id]/page.tsx
export default async function PackPage({ params }: Props) {
  const pack = await fetchPack(params.id);
  
  return (
    <article>
      <h1>{pack.name}</h1>
      
      {/* Above the fold ad */}
      <AdSlot slot="1234567890" format="rectangle" />
      
      <PackDescription pack={pack} />
      
      {/* In-content ad */}
      <AdSlot slot="2345678901" format="fluid" />
      
      <EmojiGrid emojis={pack.emojis} />
      
      {/* Below content ad */}
      <AdSlot slot="3456789012" format="auto" />
    </article>
  );
}
```

---

## 🎯 Performance Optimization

### 1. Image Optimization

```typescript
// components/ui/OptimizedImage.tsx
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
}

export function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height, 
  priority = false,
  className = ''
}: OptimizedImageProps) {
  // Use GitHub CDN for emoji images
  const imageUrl = src.startsWith('http') 
    ? src 
    : `https://raw.githubusercontent.com/AsyncSite/slack-emoji-packs/main${src}`;
  
  return (
    <Image
      src={imageUrl}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      placeholder="blur"
      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
}
```

### 2. Bundle Optimization

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable SWC minification
  swcMinify: true,
  
  // Optimize images
  images: {
    domains: ['raw.githubusercontent.com'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  
  // Bundle analyzer (only in dev)
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      );
    }
    return config;
  },
  
  // Experimental features for performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@heroicons/react', 'lodash'],
  },
};

module.exports = nextConfig;
```

---

## 🧪 Testing Strategy

### 1. Unit Testing

```typescript
// tests/unit/components/PackCard.test.tsx
import { render, screen } from '@testing-library/react';
import { PackCard } from '@/components/features/PackCard';

describe('PackCard', () => {
  const mockPack = {
    id: 'dev-pack',
    name: 'Developer Pack',
    description: 'Essential emojis for developers',
    emojiCount: 50,
    preview: ['/emojis/debug.png'],
  };
  
  it('renders pack information correctly', () => {
    render(<PackCard pack={mockPack} />);
    
    expect(screen.getByText('Developer Pack')).toBeInTheDocument();
    expect(screen.getByText('50 emojis')).toBeInTheDocument();
  });
  
  it('generates correct SEO-friendly URL', () => {
    render(<PackCard pack={mockPack} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/packs/dev-pack');
  });
});
```

### 2. SEO Testing

```typescript
// tests/integration/seo.test.ts
import { test, expect } from '@playwright/test';

test.describe('SEO Requirements', () => {
  test('has correct meta tags on pack page', async ({ page }) => {
    await page.goto('/packs/developer-essentials');
    
    // Check title
    const title = await page.title();
    expect(title).toContain('Developer Essentials');
    expect(title).toContain('SlackDori');
    
    // Check meta description
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toBeTruthy();
    expect(description.length).toBeGreaterThan(50);
    expect(description.length).toBeLessThan(160);
    
    // Check Open Graph tags
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect(ogTitle).toBeTruthy();
    
    // Check structured data
    const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
    expect(jsonLd).toBeTruthy();
    const structured = JSON.parse(jsonLd);
    expect(structured['@type']).toBe('SoftwareApplication');
  });
  
  test('generates valid sitemap', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.ok()).toBeTruthy();
    
    const text = await response.text();
    expect(text).toContain('https://slackdori.asyncsite.com/packs/');
  });
});
```

---

## 🔄 Development Workflow

### 1. Branch Strategy

```bash
main                 # Production (protected)
├── develop         # Development branch
├── feature/*       # New features
├── fix/*          # Bug fixes
├── seo/*          # SEO improvements
└── content/*      # Content updates
```

### 2. Commit Convention

```bash
# Format: <type>(<scope>): <subject>

feat(seo): add structured data for pack pages
fix(ui): resolve mobile navigation issue
perf(images): optimize emoji loading
docs(readme): update installation instructions
test(seo): add meta tag validation tests
refactor(api): simplify pack fetching logic
style(pack): improve card hover effects
```

### 3. PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] SEO improvement
- [ ] Performance optimization
- [ ] Documentation update

## SEO Checklist
- [ ] Meta tags updated
- [ ] Structured data added
- [ ] Sitemap updated
- [ ] URLs are SEO-friendly
- [ ] Images have alt text

## Performance Checklist
- [ ] Lighthouse score > 90
- [ ] Bundle size checked
- [ ] Images optimized
- [ ] No console errors

## Testing
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Mobile responsive
- [ ] Cross-browser tested
```

---

## 📈 Monitoring and Analytics

### 1. Core Web Vitals Monitoring

```typescript
// lib/analytics/webVitals.ts
import { onCLS, onFID, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';

export function reportWebVitals() {
  onCLS(sendToAnalytics);
  onFID(sendToAnalytics);
  onFCP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
  onINP(sendToAnalytics);
}

function sendToAnalytics(metric: any) {
  // Send to Google Analytics
  if (window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.value),
      metric_id: metric.id,
      metric_value: metric.value,
      metric_delta: metric.delta,
    });
  }
  
  // Send to Vercel Analytics
  if (window.va) {
    window.va('track', metric.name, { value: metric.value });
  }
}
```

### 2. SEO Performance Tracking

```typescript
// lib/analytics/seoTracking.ts
export function trackSEOEvent(eventName: string, parameters?: any) {
  // Track search queries
  if (eventName === 'search') {
    window.gtag('event', 'search', {
      search_term: parameters.query,
    });
  }
  
  // Track pack views
  if (eventName === 'view_item') {
    window.gtag('event', 'view_item', {
      currency: 'USD',
      value: 0,
      items: [{
        item_id: parameters.packId,
        item_name: parameters.packName,
        item_category: 'emoji_pack',
      }],
    });
  }
  
  // Track installations
  if (eventName === 'begin_checkout') {
    window.gtag('event', 'begin_checkout', {
      currency: 'USD',
      value: 0,
      items: [{
        item_id: parameters.packId,
        item_name: parameters.packName,
      }],
    });
  }
}
```

---

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Lighthouse score > 90 on all metrics
- [ ] Meta tags validated
- [ ] Sitemap generated correctly
- [ ] robots.txt configured
- [ ] Environment variables set
- [ ] AdSense approved and configured
- [ ] Analytics tracking verified

### Deployment Steps

```bash
# 1. Build and test locally
npm run build
npm run test
npm run test:e2e

# 2. Check bundle size
npm run analyze

# 3. Verify SEO
npm run seo:validate

# 4. Deploy to Vercel
vercel --prod

# 5. Post-deployment verification
npm run test:production
```

### Post-Deployment

- [ ] Verify all pages load correctly
- [ ] Test Slack OAuth flow
- [ ] Check meta tags in production
- [ ] Submit sitemap to Google Search Console
- [ ] Verify Analytics tracking
- [ ] Monitor Core Web Vitals
- [ ] Check AdSense ad serving

---

## 🔥 Critical Success Factors

1. **Every page must be SEO-optimized** - No exceptions
2. **Core Web Vitals must be "Good"** - Performance is SEO
3. **Structured data on all pages** - Help search engines understand
4. **Mobile-first development** - Google uses mobile-first indexing
5. **Fast page loads** - Under 2 seconds for all pages
6. **Semantic HTML** - Use proper heading hierarchy
7. **Alt text for all images** - Accessibility is SEO
8. **Regular content updates** - Fresh content ranks better

---

## 📚 Resources

### Essential Documentation
- [Next.js 14 Docs](https://nextjs.org/docs)
- [Google SEO Guide](https://developers.google.com/search/docs)
- [Schema.org](https://schema.org/)
- [Web.dev](https://web.dev/)

### Tools
- [Google Search Console](https://search.google.com/search-console)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Rich Results Test](https://search.google.com/test/rich-results)
- [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)

### Monitoring
- [Google Analytics 4](https://analytics.google.com/)
- [Vercel Analytics](https://vercel.com/analytics)
- [Google AdSense](https://www.google.com/adsense/)

---

## 🤖 AI Assistant Context

When working on SlackDori, always remember:

1. **SEO is the primary goal** - Every decision should improve SEO
2. **Performance affects SEO** - Fast pages rank better
3. **User experience matters** - Good UX leads to better engagement metrics
4. **Content is king** - Quality content drives organic traffic
5. **Mobile-first** - Most users will come from mobile devices
6. **Test everything** - Especially SEO and performance impacts

This is not just another web app. SlackDori's success depends entirely on search engine visibility. Without SEO, the project fails.

---

## 📝 Version History

- **v1.0.0** (2024-01-XX): Initial CLAUDE.md for SlackDori
- Created comprehensive SEO-first development guidelines
- Established Next.js 14 App Router patterns
- Defined strict performance and SEO requirements