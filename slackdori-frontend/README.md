# SlackDori Frontend

> 🚀 SEO-optimized Next.js application for SlackDori - One-click Slack emoji pack installation service

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## 🎯 Project Overview

SlackDori is a web service that allows users to install curated emoji packs to their Slack workspaces with a single click. This frontend application is built with **SEO as the primary focus**, utilizing Next.js 14's App Router for server-side rendering and optimal search engine visibility.

### Key Features

- ✨ **One-click Installation**: Install entire emoji packs to Slack workspaces instantly
- 🔍 **SEO Optimized**: Server-side rendering for maximum search visibility
- 📱 **Mobile First**: Responsive design optimized for all devices
- ⚡ **Lightning Fast**: Optimized for Core Web Vitals
- 💰 **Monetized**: Integrated with Google AdSense
- 📊 **Analytics**: Full tracking with Google Analytics 4

## 🏗️ Architecture

```
Frontend (This Repo)          Backend Services
┌─────────────────┐          ┌─────────────────┐
│                 │          │                 │
│  Next.js 14     │  <--->   │  Spring Boot    │
│  (SSR/SSG)      │          │  Microservice   │
│                 │          │                 │
│  Vercel Host    │          │  Kubernetes     │
└─────────────────┘          └─────────────────┘
        ↓                            ↓
   GitHub CDN                    MySQL DB
  (Emoji Images)               (Metadata)
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18.17 or later
- npm 9 or later
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/AsyncSite/slackdori-frontend.git
cd slackdori-frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
slackdori-frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (marketing)/        # Public marketing pages
│   │   ├── (app)/             # Application pages
│   │   └── api/               # API routes
│   ├── components/            # React components
│   ├── lib/                   # Utility libraries
│   ├── hooks/                 # Custom React hooks
│   ├── stores/               # Zustand state stores
│   └── types/                # TypeScript type definitions
├── public/                    # Static assets
├── tests/                     # Test files
└── docs/                      # Documentation
```

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev           # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Testing
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests
npm run test:coverage # Generate coverage report

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format with Prettier
npm run typecheck    # TypeScript type checking

# SEO & Performance
npm run lighthouse   # Run Lighthouse audit
npm run analyze      # Analyze bundle size
npm run seo:validate # Validate SEO requirements
```

### Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080
API_URL=http://internal-api:8080

# OAuth
NEXT_PUBLIC_SLACK_CLIENT_ID=your_slack_client_id
SLACK_CLIENT_SECRET=your_slack_client_secret

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXX

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_ADS=true
```

## 🔍 SEO Strategy

### Core Principles

1. **Server-Side Rendering**: All public pages are SSR/SSG
2. **Dynamic Metadata**: Unique meta tags for every page
3. **Structured Data**: JSON-LD on all relevant pages
4. **Performance First**: Core Web Vitals optimization
5. **Mobile Optimized**: Mobile-first responsive design

### Target Keywords

- Primary: "slack emoji pack", "슬랙 이모지 팩"
- Secondary: "slack custom emoji", "bulk emoji upload"
- Long-tail: "how to add multiple emojis to slack"

### SEO Checklist

- [ ] Unique title and description for each page
- [ ] Open Graph tags implemented
- [ ] Twitter Card tags implemented
- [ ] Canonical URLs set
- [ ] Structured data (JSON-LD) added
- [ ] XML sitemap generated
- [ ] robots.txt configured
- [ ] Alt text for all images
- [ ] Semantic HTML structure
- [ ] Core Web Vitals optimized

## 📊 Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Lighthouse Performance | > 90 | - |
| Lighthouse SEO | 100 | - |
| Lighthouse Accessibility | > 95 | - |
| First Contentful Paint | < 1.8s | - |
| Largest Contentful Paint | < 2.5s | - |
| Cumulative Layout Shift | < 0.1 | - |
| First Input Delay | < 100ms | - |
| Time to Interactive | < 3.8s | - |

## 🧪 Testing

### Unit Tests

```bash
npm run test
```

Tests are written using Jest and React Testing Library. Test files are located alongside components with `.test.tsx` extension.

### E2E Tests

```bash
npm run test:e2e
```

E2E tests use Playwright and cover critical user journeys including:
- Pack browsing and search
- Slack OAuth flow
- Pack installation process
- SEO meta tag validation

### SEO Testing

```bash
npm run seo:validate
```

Automated SEO validation includes:
- Meta tag presence and uniqueness
- Structured data validation
- Sitemap generation
- Open Graph tag verification
- Mobile responsiveness

## 📦 Deployment

### Vercel Deployment (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod

# Deploy to preview
vercel
```

### Docker Deployment

```bash
# Build Docker image
docker build -t slackdori-frontend .

# Run container
docker run -p 3000:3000 slackdori-frontend
```

### Environment-Specific Builds

```bash
# Development build
npm run build:dev

# Staging build
npm run build:staging

# Production build
npm run build:prod
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test
      - run: npm run build
      - run: npm run lighthouse
```

## 📈 Monitoring

### Analytics

- **Google Analytics 4**: User behavior tracking
- **Vercel Analytics**: Performance monitoring
- **Google Search Console**: SEO performance

### Error Tracking

- **Sentry**: Runtime error tracking
- **LogRocket**: Session replay (optional)

### Performance Monitoring

- **Vercel Speed Insights**: Real user metrics
- **Lighthouse CI**: Automated performance audits

## 🤝 Contributing

### Development Process

1. Create feature branch from `develop`
2. Make changes following CLAUDE.md guidelines
3. Write/update tests
4. Ensure all checks pass
5. Create pull request with detailed description
6. Wait for code review and approval

### Commit Convention

```
feat(scope): add new feature
fix(scope): fix bug
docs(scope): update documentation
style(scope): formatting changes
refactor(scope): code refactoring
test(scope): add tests
perf(scope): performance improvements
seo(scope): SEO improvements
```

### Code Style

- Follow ESLint configuration
- Use Prettier for formatting
- Follow TypeScript strict mode
- Write comprehensive tests
- Document complex logic

## 📚 Documentation

- [CLAUDE.md](./CLAUDE.md) - Comprehensive development guidelines
- [API Documentation](./docs/API.md) - Backend API reference
- [SEO Strategy](./docs/SEO.md) - Detailed SEO implementation
- [Component Library](./docs/COMPONENTS.md) - UI component documentation

## 🔐 Security

### Best Practices

- Never commit secrets or API keys
- Use environment variables for sensitive data
- Implement proper CORS policies
- Sanitize user inputs
- Use HTTPS in production
- Regular dependency updates

### Security Headers

```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Vercel](https://vercel.com/) - Hosting and deployment
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Slack API](https://api.slack.com/) - Slack platform integration

## 📞 Support

For support, please contact:
- Email: support@asyncsite.com
- Discord: [AsyncSite Community](https://discord.gg/asyncsite)
- GitHub Issues: [Report a bug](https://github.com/AsyncSite/slackdori-frontend/issues)

---

**Remember: SEO is not a feature, it's the foundation. Every line of code should contribute to better search visibility.**