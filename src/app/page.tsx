import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-3xl">
        <h1 className="text-5xl font-bold tracking-tight mb-6">
          See Your Entire System.
          <br />
          <span className="text-blue-600">Know Your Blast Radius.</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Map your microservice dependencies. Visualize failures before
          they happen. Understand what breaks when a service goes down.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/signup">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition">
              Get Started
            </button>
          </Link>
          <Link href="/signin" className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}