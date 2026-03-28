'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function HackerMode() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([
    { type: 'output', text: 'Welcome to HOST_SYSTEM v9.2' },
    { type: 'output', text: 'Type "help" for a list of available commands.' }
  ]);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const router = useRouter();

  // Listen for the global Ctrl + \ shortcut to toggle terminal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === '\\') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-scroll inside terminal and focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, history]);

  const fetchApiData = async (endpoint, formatter) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${endpoint}`);
      const data = await res.json();
      if (data.success && data.data.length > 0) {
        return data.data.map(formatter).join('\\n');
      }
      return 'No entries found.';
    } catch (error) {
      return 'Error: Database connection refused.';
    }
  };

  const handleCommand = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmd = input.trim();
    const args = cmd.toLowerCase().split(' ');
    const newHistory = [...history, { type: 'input', text: cmd }];
    setInput('');
    setHistory(newHistory); // Optimistic update for the command itself

    let outputText = '';

    switch (args[0]) {
      case 'help':
        outputText = `Available commands:
  ls          List directory contents
  cat <dir>   Read contents of a directory/file
  clear       Clear terminal output
  sudo        Execute a command as superuser
  game        Launch the terminal mini-game
  exit        Close terminal`;
        break;

      case 'ls':
        const dir = args[1] || '';
        if (!dir) {
          outputText = 'projects/   skills/   education/   about.txt';
        } else {
          outputText = `ls: cannot access '${dir}': No such file or directory`;
        }
        break;

      case 'cat':
        const file = args[1];
        if (!file) {
          outputText = 'cat: missing operand';
        } else if (file === 'about.txt') {
          outputText = 'Full Stack Developer with a passion for building secure and scalable applications. Always learning, always building.';
        } else if (file === 'projects' || file === 'projects/') {
          outputText = 'Fetching projects...\\n' + await fetchApiData('/api/projects', p => `- ${p.title} [${p.techStack.join(', ')}]`);
        } else if (file === 'skills' || file === 'skills/') {
          outputText = 'Fetching skills...\\n' + await fetchApiData('/api/skills', s => `- ${s.name} (${s.category}): ${s.percentage}%`);
        } else if (file === 'education' || file === 'education/') {
          outputText = 'Fetching credentials...\\n' + await fetchApiData('/api/education', e => `- ${e.institution} | ${e.degree} (${e.startDate} - ${e.endDate || 'Present'})`);
        } else {
          outputText = `cat: ${file}: No such file or directory`;
        }
        break;

      case 'clear':
        setHistory([]);
        return; // Early return to avoid pushing an empty output

      case 'sudo':
        if (args[1] === 'login') {
          outputText = 'Authenticating... Redirecting to secure portal.';
          setHistory(prev => [...prev, { type: 'output', text: outputText }]);
          setTimeout(() => {
            setIsOpen(false);
            router.push('/admin');
          }, 1000);
          return;
        } else {
          outputText = `[sudo] password for guest: \\nsudo: ${args[1] || ''}: command not found`;
        }
        break;
      case 'game':
        outputText = 'Initializing connection to mainframe... done.\nType "hack" to begin the sequence.';
        break;

      case 'hack':
        const puzzles = [
          { q: 'Decrypt the code: 01101000 01100101 01101100 01101100 01101111', a: 'hello' },
          { q: 'What is the standard port for HTTPS?', a: '443' },
          { q: 'If true is false and false is true, what is !false?', a: 'false' }
        ];
        const randomPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
        outputText = `*** INTRUSION DETECTED ***\nSystem lockdown in progress...\nAnswer this to abort:\n\n${randomPuzzle.q}\n\n(Type 'answer <your_answer>')`;
        break;

      case 'answer':
        const ans = args.slice(1).join(' ').toLowerCase();
        if (['hello', '443', 'false'].includes(ans)) {
            outputText = 'Access Granted. System lockdown averted. Good job.';
        } else if (!ans) {
            outputText = 'You must provide an answer. Type "answer <your_answer>"';
        } else {
            outputText = 'INCORRECT. Security countermeasures deployed. (Try typing "hack" again)';
        }
        break;
      case 'exit':
        setIsOpen(false);
        return;

      default:
        outputText = `bash: ${args[0]}: command not found`;
    }

    setHistory(prev => [...prev, { type: 'output', text: outputText }]);
  };

  return (
    <div 
      className={`fixed top-0 left-0 w-full bg-black bg-opacity-95 text-green-500 font-mono z-[100] border-b border-green-500 shadow-[0_4px_30px_rgba(34,197,94,0.3)] transition-all duration-300 ease-in-out ${
        isOpen ? 'h-[50vh] opacity-100 translate-y-0' : 'h-0 opacity-0 -translate-y-full'
      }`}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="p-4 h-full overflow-y-auto w-full max-w-5xl mx-auto flex flex-col">
        {history.map((entry, i) => (
          <div key={i} className="mb-2 whitespace-pre-wrap">
            {entry.type === 'input' ? (
              <span className="text-white"><span className="text-green-500">guest@portfolio:~$</span> {entry.text}</span>
            ) : (
              <span className="text-green-400">{entry.text}</span>
            )}
          </div>
        ))}
        
        {isOpen && (
          <form onSubmit={handleCommand} className="flex mt-2">
            <span className="text-green-500 mr-2">guest@portfolio:~$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-transparent text-white outline-none border-none shadow-none focus:ring-0 p-0 m-0"
              autoComplete="off"
              spellCheck="false"
              autoFocus
            />
          </form>
        )}
        <div ref={bottomRef} />
      </div>
      
      {/* Visual resize handle / close button */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 pb-1 cursor-pointer opacity-50 hover:opacity-100 transition-opacity"
        onClick={() => setIsOpen(false)}
      >
        <span className="text-xs tracking-widest">[ CLOSE ]</span>
      </div>
    </div>
  );
}