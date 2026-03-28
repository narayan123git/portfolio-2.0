import Navbar from "../components/navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-green-400 font-mono">
      <Navbar />
      
      <section className="max-w-4xl mx-auto pt-32 px-6">
        <div className="border-l-2 border-green-500 pl-6 space-y-4">
          <p className="text-green-600 text-sm animate-pulse">&gt; system.status: online</p>
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">
            Software <br />
            <span className="text-green-500">Engineer.</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl leading-relaxed">
            B.Tech CSE @ <span className="text-white">NIT Durgapur</span>. 
            Focused on building high-performance backend architectures and 
            AI-driven medical diagnostics.
          </p>
          <div className="pt-6 flex gap-4">
            <button className="bg-green-900/30 border border-green-500 px-6 py-2 hover:bg-green-500 hover:text-black transition-all">
              VIEW_PROJECTS
            </button>
            <button className="border border-gray-700 text-gray-500 px-6 py-2 hover:border-green-500 hover:text-green-500 transition-all">
              DOWNLOAD_CV
            </button>
          </div>
        </div>
      </section>

      {/* Quick Stats Grid */}
      <section className="max-w-4xl mx-auto mt-24 px-6 grid grid-cols-2 md:grid-cols-4 gap-8 pb-20">
        <div>
          <p className="text-xs text-green-800">DATA_STRUCTURES</p>
          <p className="text-2xl text-white font-bold">250+ Solved</p>
        </div>
        <div>
          <p className="text-xs text-green-800">BOARD_RANK</p>
          <p className="text-2xl text-white font-bold">School Topper</p>
        </div>
        <div>
          <p className="text-xs text-green-800">GATE_CS</p>
          <p className="text-2xl text-white font-bold">Score 564</p>
        </div>
        <div>
          <p className="text-xs text-green-800">STACK</p>
          <p className="text-2xl text-white font-bold">MERN + AI</p>
        </div>
      </section>
    </main>
  );
}