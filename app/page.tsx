export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="px-4 py-20 md:py-32 lg:py-40">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to Lekhyo
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Build something amazing with our modern platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Get Started
            </button>
            <button className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </section>

      <section className="px-4 py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Fast & Reliable</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Built with performance in mind, delivering lightning-fast experiences.
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Modern Design</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Beautiful, responsive interfaces that work on all devices.
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3">Easy to Use</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Intuitive and user-friendly, designed for everyone.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

