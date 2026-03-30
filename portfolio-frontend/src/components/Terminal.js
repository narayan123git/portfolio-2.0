"use client";

import { useEffect, useRef, useState } from "react";

const LINKEDIN_URL = "https://www.linkedin.com/in/narayan-paul-ba2339253/";
const GITHUB_USERNAME = "narayan123git";
const GITHUB_URL = `https://github.com/${GITHUB_USERNAME}`;
const RESUME_URL = "https://drive.google.com/file/d/1l4PY4a2YaiStGcTYYzN2XgLD2EwzQHz7/view?usp=sharing";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

const HELP_TEXT = [
  "Available commands:",
  "  help                - Show this command list",
  "  clear               - Clear terminal history",
  "  whoami              - Show terminal identity",
  "  about               - Quick profile summary",
  "  date                - Show current date",
  "  time                - Show current time",
  "  github              - Fetch GitHub profile quick stats",
  "  linkedin            - Show LinkedIn profile link",
  "  projects            - Open projects page",
  "  blogs               - Open blogs page",
  "  contact             - Open contact page",
  "  resume              - Open resume link",
  "  open <target>       - Open github/linkedin/projects/blogs/contact/resume",
  "  stats               - Fetch live portfolio stats",
  "  echo <text>         - Print text",
  "  play guess          - Start number guessing game (1-100)",
].join("\n");

export default function Terminal() {
  const [history, setHistory] = useState([
    {
      type: "output",
      text: "Ubuntu Portfolio Terminal v1.0\nType 'help' to see available commands.",
    },
  ]);
  const [input, setInput] = useState("");
  const [gameMode, setGameMode] = useState(false);
  const [targetNumber, setTargetNumber] = useState(null);
  const [guessCount, setGuessCount] = useState(0);
  const terminalEndRef = useRef(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const pushLine = (type, text) => {
    setHistory((prev) => [...prev, { type, text }]);
  };

  const getApiUrl = (path) => {
    const cleanBase = String(API_BASE).replace(/\/$/, "");
    const cleanPath = String(path).replace(/^\//, "");
    return `${cleanBase}/${cleanPath}`;
  };

  const openPath = (path) => {
    if (typeof window === "undefined") return;
    window.open(path, "_blank", "noopener,noreferrer");
  };

  const runOpenCommand = (target) => {
    const map = {
      github: GITHUB_URL,
      linkedin: LINKEDIN_URL,
      projects: "/projects",
      blogs: "/blogs",
      contact: "/contact",
      resume: RESUME_URL,
    };

    const destination = map[target];
    if (!destination) {
      pushLine("output", "Unknown target. Use: github | linkedin | projects | blogs | contact | resume");
      return;
    }

    openPath(destination);
    pushLine("output", `Opened: ${destination}`);
  };

  const fetchPortfolioStats = async () => {
    pushLine("output", "Fetching portfolio stats...");

    try {
      const [projectsRes, blogsRes, diaryRes] = await Promise.all([
        fetch(getApiUrl("projects")),
        fetch(getApiUrl("blogs")),
        fetch(getApiUrl("diary")),
      ]);

      const [projectsData, blogsData, diaryData] = await Promise.all([
        projectsRes.json(),
        blogsRes.json(),
        diaryRes.json(),
      ]);

      const projectsCount = Array.isArray(projectsData) ? projectsData.length : (projectsData?.data?.length || 0);
      const blogsCount = Array.isArray(blogsData) ? blogsData.length : (blogsData?.data?.length || 0);
      const diaryCount = Array.isArray(diaryData) ? diaryData.length : (diaryData?.data?.length || 0);

      pushLine("output", [
        "Live Portfolio Stats:",
        `Projects: ${projectsCount}`,
        `Blogs: ${blogsCount}`,
        `Diary Entries: ${diaryCount}`,
      ].join("\n"));
    } catch (error) {
      pushLine("output", `Error: could not fetch stats (${error.message})`);
    }
  };

  const handleGithubCommand = async () => {
    pushLine("output", "Fetching GitHub data...");

    try {
      const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);

      if (!res.ok) {
        throw new Error(`GitHub API request failed (${res.status})`);
      }

      const data = await res.json();

      const formatted = [
        `GitHub User: ${data.login || "N/A"}`,
        `Bio: ${data.bio || "No bio available"}`,
        `Public Repos: ${data.public_repos ?? "N/A"}`,
        `Followers: ${data.followers ?? "N/A"}`,
      ].join("\n");

      pushLine("output", formatted);
    } catch (error) {
      pushLine("output", `Error: ${error.message}`);
    }
  };

  const startGuessGame = () => {
    const randomNumber = Math.floor(Math.random() * 100) + 1;
    setTargetNumber(randomNumber);
    setGuessCount(0);
    setGameMode(true);
    pushLine("output", "I am thinking of a number between 1 and 100. Enter your guess:");
  };

  const handleGuessModeInput = (rawCommand) => {
    if (rawCommand.toLowerCase() === "exit") {
      setGameMode(false);
      setTargetNumber(null);
      setGuessCount(0);
      pushLine("output", "Exited guess game. Back to terminal mode.");
      return;
    }

    const guess = Number.parseInt(rawCommand, 10);
    if (Number.isNaN(guess)) {
      pushLine("output", "Please enter a valid number between 1 and 100, or type 'exit'.");
      return;
    }

    const nextCount = guessCount + 1;
    setGuessCount(nextCount);

    if (guess < targetNumber) {
      pushLine("output", "Higher");
      return;
    }

    if (guess > targetNumber) {
      pushLine("output", "Lower");
      return;
    }

    pushLine("output", `Correct! You guessed it in ${nextCount} attempts. Type 'play guess' to play again.`);
    setGameMode(false);
    setTargetNumber(null);
    setGuessCount(0);
  };

  const handleNormalCommand = async (commandLine) => {
    const normalizedLine = commandLine.trim().toLowerCase();
    if (normalizedLine === "play guess") {
      startGuessGame();
      return;
    }

    const [command, ...args] = commandLine.split(" ");
    const argument = args.join(" ").trim();

    switch (command) {
      case "help":
        pushLine("output", HELP_TEXT);
        break;

      case "clear":
        setHistory([]);
        break;

      case "linkedin":
        pushLine("output", `LinkedIn Profile:\n${LINKEDIN_URL}`);
        break;

      case "whoami":
        pushLine("output", "narayan@portfolio\nRole: Full Stack Developer\nMode: Build + Secure + Ship");
        break;

      case "about":
        pushLine("output", "Narayan Paul\nFull-stack developer focused on secure backend systems, practical AI integration, and polished user experiences.");
        break;

      case "date":
        pushLine("output", new Date().toLocaleDateString());
        break;

      case "time":
        pushLine("output", new Date().toLocaleTimeString());
        break;

      case "github":
        await handleGithubCommand();
        break;

      case "projects":
        openPath("/projects");
        pushLine("output", "Opening projects page...");
        break;

      case "blogs":
        openPath("/blogs");
        pushLine("output", "Opening blogs page...");
        break;

      case "contact":
        openPath("/contact");
        pushLine("output", "Opening contact page...");
        break;

      case "resume":
        openPath(RESUME_URL);
        pushLine("output", `Opening resume link: ${RESUME_URL}`);
        break;

      case "open":
        if (!argument) {
          pushLine("output", "Usage: open <github|linkedin|projects|blogs|contact|resume>");
          break;
        }
        runOpenCommand(argument.toLowerCase());
        break;

      case "stats":
        await fetchPortfolioStats();
        break;

      case "echo":
        pushLine("output", argument || "");
        break;

      default:
        pushLine("output", `Command not found: ${commandLine}. Type 'help' to see commands.`);
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const rawCommand = input.trim();
    if (!rawCommand) return;

    pushLine("command", rawCommand);
    setInput("");

    if (gameMode) {
      handleGuessModeInput(rawCommand);
      return;
    }

    await handleNormalCommand(rawCommand.toLowerCase());
  };

  return (
    <section className="rounded-2xl border border-green-500/30 bg-gray-950 shadow-[0_18px_45px_rgba(0,0,0,0.55)] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-green-500/20 bg-gray-900">
        <span className="w-3 h-3 rounded-full bg-red-500" />
        <span className="w-3 h-3 rounded-full bg-yellow-400" />
        <span className="w-3 h-3 rounded-full bg-green-500" />
        <p className="ml-3 text-xs text-green-300 font-mono tracking-wide">narayan@portfolio:~</p>
      </div>

      <div className="h-[480px] overflow-y-auto p-4 text-green-400 font-mono text-sm leading-6">
        {history.map((item, index) => (
          <div key={`${item.type}-${index}`} className="whitespace-pre-wrap break-words">
            {item.type === "command" ? (
              <p>
                <span className="text-green-300">narayan@portfolio:~$ </span>
                <span>{item.text}</span>
              </p>
            ) : (
              <p>{item.text}</p>
            )}
          </div>
        ))}

        <form onSubmit={handleSubmit} className="mt-2 flex items-start gap-2">
          <span className="text-green-300">narayan@portfolio:~$</span>
          <input
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent outline-none text-green-400 placeholder:text-green-700"
            placeholder={gameMode ? "Enter guess or type 'exit'" : "Type a command..."}
          />
        </form>
        <div ref={terminalEndRef} />
      </div>
    </section>
  );
}