export interface Hackpack {
  id: string;
  name: string;
  description: string;
  link: string;
  category: ("Web Development" | "AI/ML" | "Bots" | "General")[];
  featured: boolean;
  instructions?: string;
}

export const hackpacks: Hackpack[] = [
  {
    id: "fastmcp-python-hackpack",
    name: "FastMCP Python Hackpack",
    description:
      "A FastMCP server starter for AI hackathon projects with pre-built weather tools and offline tests to connect with Claude Desktop or Codex CLI.",
    link: "https://github.com/HackOSS-Minerva/fastmcp-python-hackpack",
    category: ["AI/ML"],
    featured: true,
    instructions:
      "Use This Template → uv sync --locked --no-editable → uv run --locked --no-editable python src/weather/main.py.",
  },
  {
    id: "cpp-hackpack",
    name: "C++ Hackpack",
    description:
      "Modern C++ starter configured with Make, Clang-Format, and Clang-Tidy for building fast command-line utilities and algorithms.",
    link: "https://github.com/HackOSS-Minerva/cpp-hackpack",
    category: ["General"],
    featured: false,
    instructions: "Install build-essential & clang tools → make build → make run.",
  },
  {
    id: "discord-python-hackpack",
    name: "Discord Python Hackpack",
    description:
      "Discord bot starter in Python using uv for fast dependency management, paired with Ruff for formatting and linting.",
    link: "https://github.com/HackOSS-Minerva/discord-python-hackpack",
    category: ["Bots"],
    featured: true,
    instructions:
      "Use This Template → cp .env.example .env (set DISCORD_BOT_TOKEN) → uv sync --locked → uv run bot.",
  },
  {
    id: "vite-hackpack",
    name: "Vite + React Hackpack",
    description:
      "Fast React + TypeScript frontend starter powered by Vite, Tailwind CSS v4, Oxlint, and the React Compiler with instant HMR.",
    link: "https://github.com/HackOSS-Minerva/vite-hackpack",
    category: ["Web Development"],
    featured: true,
    instructions: "Use This Template → bun install → bun run dev (localhost:5173).",
  },
  {
    id: "typescript-hackpack",
    name: "TypeScript Hackpack",
    description:
      "Minimal TypeScript starter and arithmetic library configured with Bun for lightning-fast testing and script execution.",
    link: "https://github.com/HackOSS-Minerva/typescript-hackpack",
    category: ["General"],
    featured: false,
    instructions: "Use This Template → bun install → bun run src/index.ts.",
  },
  {
    id: "python-hackpack",
    name: "Python Hackpack",
    description:
      "Lightweight Python template managed with uv and Ruff for quick script development, CLI tools, and packaging.",
    link: "https://github.com/HackOSS-Minerva/python-hackpack",
    category: ["General"],
    featured: false,
    instructions: "Use This Template → uv sync --locked → uv run calculator.",
  },
  {
    id: "nextjs-hackpack",
    name: "Next.js Hackpack",
    description:
      "Full-stack Next.js web application starter configured with Bun, App Router, Geist font, ESLint, and Prettier.",
    link: "https://github.com/HackOSS-Minerva/nextjs-hackpack",
    category: ["Web Development"],
    featured: true,
    instructions: "Use This Template → bun install → bun dev (localhost:3000).",
  },
];
