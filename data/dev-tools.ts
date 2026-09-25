export type DevToolCategory =
  | "AI Coding Agents"
  | "Code Editors & IDEs"
  | "Design & Ideation"
  | "Code Hosting"
  | "Deployment"
  | "Backend & Databases"
  | "Email"
  | "Analytics";

export interface DevTool {
  /**
   * Also the default logo filename, resolved as `/logos/<id>.svg`.
   */
  id: string;
  name: string;
  url: string;
  /** One sentence describing what the tool is good for. */
  description: string;
  category: DevToolCategory;
  /** Override the default `/logos/<id>.svg` logo path. */
  logo?: string;
  /** Extra searchable keywords that surface the tool in more searches. */
  tags: string[];
}

/**
 * Display order for both the category filter tabs and the grouped sections.
 */
export const devToolCategories: DevToolCategory[] = [
  "AI Coding Agents",
  "Code Editors & IDEs",
  "Design & Ideation",
  "Code Hosting",
  "Deployment",
  "Backend & Databases",
  "Email",
  "Analytics",
];

export const devTools: DevTool[] = [
  {
    id: "claude-code",
    name: "Claude Code",
    url: "https://claude.com/product/claude-code",
    description:
      "Anthropic's agentic coding tool that reads, edits, and runs your whole project from the terminal.",
    category: "AI Coding Agents",
    tags: ["Anthropic", "Agent", "CLI", "Terminal", "Autonomous"],
  },
  {
    id: "codex",
    name: "Codex",
    url: "https://chatgpt.com/codex/",
    description:
      "OpenAI's cloud-based coding agent that implements tasks in parallel across isolated environments.",
    category: "AI Coding Agents",
    tags: ["OpenAI", "Agent", "CLI", "Cloud", "Parallel"],
  },
  {
    id: "cline",
    name: "Cline",
    url: "https://cline.bot",
    description:
      "An open-source autonomous agent that plans and executes multi-file changes right inside your editor.",
    category: "AI Coding Agents",
    tags: ["VS Code", "Agent", "Open Source", "Autonomous", "MCP"],
  },
  {
    id: "antigravity",
    name: "Antigravity",
    url: "https://antigravity.google",
    description:
      "Google's agent-first development environment that reasons across your whole workspace before writing code.",
    category: "Code Editors & IDEs",
    tags: ["Google", "Agentic", "Editor", "IDE", "Agent"],
  },
  {
    id: "cursor",
    name: "Cursor",
    url: "https://cursor.com",
    description:
      "An AI-first code editor that autocompletes, predicts multi-file edits, and indexes your entire repo for chat-based refactoring.",
    category: "Code Editors & IDEs",
    tags: ["Editor", "IDE", "AI", "Fork", "Autocomplete", "Refactoring"],
  },
  {
    id: "vscode",
    name: "VS Code",
    url: "https://code.visualstudio.com",
    description:
      "Microsoft's free, extensible code editor with a huge extension ecosystem and built-in debugging.",
    category: "Code Editors & IDEs",
    tags: ["Editor", "IDE", "Extensions", "Free", "Debugger"],
  },
  {
    id: "figma",
    name: "Figma",
    url: "https://www.figma.com",
    description:
      "The collaborative design workspace for mockups, prototypes, and developer handoff.",
    category: "Design & Ideation",
    tags: ["UI", "UX", "Design", "Prototyping", "Wireframe", "Handoff"],
  },
  {
    id: "framer",
    name: "Framer",
    url: "https://www.framer.com",
    description:
      "A visual site builder for polished marketing sites and interactive prototypes, with a CMS built in.",
    category: "Design & Ideation",
    tags: ["Site Builder", "Prototyping", "Web", "No-Code", "CMS"],
  },
  {
    id: "dribbble",
    name: "Dribbble",
    url: "https://dribbble.com",
    description:
      "A shot-based portfolio community for browsing visual inspiration and polished UI concepts.",
    category: "Design & Ideation",
    tags: ["Inspiration", "Shots", "Portfolio", "Visual", "UI"],
  },
  {
    id: "mobbin",
    name: "Mobbin",
    url: "https://mobbin.com",
    description:
      "A searchable library of real product screens and user flows you can use as a design reference.",
    category: "Design & Ideation",
    tags: ["Inspiration", "Patterns", "Flows", "UI", "UX", "Reference"],
  },
  {
    id: "miro",
    name: "Miro",
    url: "https://miro.com",
    description:
      "An online whiteboard for brainstorming, user journeys, and collaborative workshop facilitation.",
    category: "Design & Ideation",
    tags: ["Whiteboard", "Brainstorm", "Workshop", "Diagram", "Collaboration"],
  },
  {
    id: "github",
    name: "GitHub",
    url: "https://github.com",
    description:
      "The default home for source control, code review, CI automation, and open source collaboration.",
    category: "Code Hosting",
    tags: ["Git", "Repos", "Issues", "Pull Requests", "CI", "Open Source"],
  },
  {
    id: "vercel",
    name: "Vercel",
    url: "https://vercel.com/",
    description:
      "The platform for deploying Next.js and frontend projects with previews and instant rollbacks.",
    category: "Deployment",
    tags: ["Hosting", "Frontend", "Serverless", "Next.js", "Preview", "CDN"],
  },
  {
    id: "supabase",
    name: "Supabase",
    url: "https://supabase.com",
    description:
      "An open-source Postgres platform with built-in auth, storage, realtime subscriptions, and edge functions.",
    category: "Backend & Databases",
    tags: ["Postgres", "SQL", "Auth", "Storage", "Realtime", "Open Source"],
  },
  {
    id: "firebase",
    name: "Firebase",
    url: "https://firebase.google.com",
    description:
      "Google's suite of app services covering auth, Firestore, storage, and cloud functions.",
    category: "Backend & Databases",
    tags: ["Google", "Firestore", "Auth", "Storage", "Functions", "Mobile"],
  },
  {
    id: "convex",
    name: "Convex",
    url: "https://www.convex.dev",
    description:
      "A reactive backend with a TypeScript datastore, live queries, and server functions in one deployable package.",
    category: "Backend & Databases",
    tags: ["TypeScript", "Realtime", "Database", "Sync", "Backend"],
  },
  {
    id: "resend",
    name: "Resend",
    url: "https://resend.com",
    description:
      "A developer-friendly email API for sending transactional messages, campaigns, and notifications.",
    category: "Email",
    tags: ["Transactional", "SMTP", "API", "Newsletter", "Notifications"],
  },
  {
    id: "posthog",
    name: "PostHog",
    url: "https://posthog.com",
    description:
      "An open-source platform for product analytics, session replay, funnels, and feature flags.",
    category: "Analytics",
    tags: [
      "Product Analytics",
      "Funnels",
      "Feature Flags",
      "Replay",
      "Open Source",
    ],
  },
];
