import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="border-b border-green-900/30 bg-gray-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="font-mono text-xl font-bold text-white tracking-tighter">
          NARAYAN<span className="text-green-500">_PAUL</span>
        </Link>
        <div className="space-x-8 font-mono text-sm text-green-600">
          <Link href="/projects" className="hover:text-green-400 transition-colors">[ PROJECTS ]</Link>
          <Link href="/blogs" className="hover:text-green-400 transition-colors">[ BLOGS ]</Link>
          <Link href="/diary" className="hover:text-green-400 transition-colors">[ DIARY ]</Link>
        </div>
      </div>
    </nav>
  );
}