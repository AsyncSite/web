import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SlackDori - One-Click Slack Emoji Pack Installation',
  description: 'Transform your Slack workspace with curated emoji packs. Install developer, Korean, and custom emoji collections instantly.',
};

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slack-purple to-slack-blue text-white py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              One-Click Slack Emoji Pack Installation
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Transform your Slack workspace with curated emoji packs. 
              No more adding emojis one by one.
            </p>
            <div className="flex gap-4 justify-center">
              <button className="btn-secondary">
                Browse Emoji Packs
              </button>
              <button className="bg-white text-slack-purple px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200">
                How It Works
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why SlackDori?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2">Instant Installation</h3>
              <p className="text-gray-600">
                Add entire emoji packs to your Slack workspace with just one click
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold mb-2">Curated Collections</h3>
              <p className="text-gray-600">
                Hand-picked emoji packs for developers, designers, and teams
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-2">Secure & Simple</h3>
              <p className="text-gray-600">
                Official Slack OAuth integration with enterprise-grade security
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Packs Section */}
      <section className="py-16 bg-gray-100">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">
            Popular Emoji Packs
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Pack Card 1 */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Developer Essentials</h3>
                <span className="text-sm bg-slack-purple text-white px-2 py-1 rounded">50 emojis</span>
              </div>
              <p className="text-gray-600 mb-4">
                Debug, deploy, and celebrate with developer-focused emojis
              </p>
              <div className="flex gap-2 mb-4">
                <span className="text-2xl">🐛</span>
                <span className="text-2xl">🚀</span>
                <span className="text-2xl">💻</span>
                <span className="text-2xl">🔥</span>
                <span className="text-gray-400">+46</span>
              </div>
              <button className="w-full btn-primary">
                View Pack
              </button>
            </div>

            {/* Pack Card 2 */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Korean Reactions</h3>
                <span className="text-sm bg-slack-purple text-white px-2 py-1 rounded">30 emojis</span>
              </div>
              <p className="text-gray-600 mb-4">
                Express yourself with popular Korean culture emojis
              </p>
              <div className="flex gap-2 mb-4">
                <span className="text-2xl">🤟</span>
                <span className="text-2xl">💜</span>
                <span className="text-2xl">✨</span>
                <span className="text-2xl">🎉</span>
                <span className="text-gray-400">+26</span>
              </div>
              <button className="w-full btn-primary">
                View Pack
              </button>
            </div>

            {/* Pack Card 3 */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Project Status</h3>
                <span className="text-sm bg-slack-purple text-white px-2 py-1 rounded">20 emojis</span>
              </div>
              <p className="text-gray-600 mb-4">
                Visual project management with status indicator emojis
              </p>
              <div className="flex gap-2 mb-4">
                <span className="text-2xl">✅</span>
                <span className="text-2xl">⏳</span>
                <span className="text-2xl">🚧</span>
                <span className="text-2xl">❌</span>
                <span className="text-gray-400">+16</span>
              </div>
              <button className="w-full btn-primary">
                View Pack
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slack-purple text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Slack Workspace?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of teams using SlackDori to enhance their communication
          </p>
          <button className="btn-secondary text-lg px-8 py-4">
            Get Started Free
          </button>
        </div>
      </section>
    </main>
  );
}