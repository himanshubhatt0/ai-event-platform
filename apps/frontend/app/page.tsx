import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900 p-4">
      <div className="max-w-xl w-full text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to AI Event Platform</h1>
        <p className="mb-6 text-lg text-gray-700">
          Use the links below to sign in or register.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/login" className="rounded-xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition">
            Login
          </Link>
          <Link href="/register" className="rounded-xl border border-blue-600 px-6 py-3 text-blue-600 hover:bg-blue-50 transition">
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}
