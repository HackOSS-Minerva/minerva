export interface Hackpack {
  id: string;
  name: string;
  sponsor: string;
  description: string;
  link: string;
  category: (
    | "Web Development"
    | "Mobile"
    | "Backend & Database"
    | "AI/ML"
    | "Bots"
    | "Hardware"
    | "Game Dev"
    | "General"
  )[];
  featured: boolean;
  instructions?: string;
}

export const hackpacks: Hackpack[] = [
  {
    id: "nextjs-hackpack",
    name: "Next.js Hackpack",
    sponsor: "ACM at UCR",
    description:
      "Starter Next.js + Tailwind template with Prettier and ESLint. Perfect starting point for any web project.",
    link: "https://github.com/acm-ucr/nextjs-hackpack",
    category: ["Web Development"],
    featured: true,
    instructions:
      "Use This Template → npm i → npm run dev (Node 20.10+, localhost:3000).",
  },
  {
    id: "firebase-nextjs-hackpack",
    name: "Firebase + Next.js Hackpack",
    sponsor: "ACM at UCR",
    description:
      "Next.js template wired up with Firebase. Includes auth domain, project ID, and storage bucket env setup.",
    link: "https://github.com/acm-ucr/firebase-nextjs-hackpack",
    category: ["Web Development"],
    featured: true,
    instructions:
      "Use This Template → add NEXT_PUBLIC_FIREBASE_* env vars → npm i → npm run dev.",
  },
  {
    id: "nextjs-auth-hackpack",
    name: "Next.js Auth Hackpack",
    sponsor: "ACM at UCR",
    description:
      "Next.js + Auth.js skeleton with Google login and MongoDB. Skip auth boilerplate and start building.",
    link: "https://github.com/acm-ucr/nextjs-auth-hackpack",
    category: ["Web Development"],
    featured: true,
    instructions:
      "Use This Template → set AUTH_SECRET, GOOGLE_CLIENT_ID/SECRET, MONGODB_URI → npm i → npm run dev.",
  },
  {
    id: "mongodb-nextjs-hackpack",
    name: "MongoDB + Next.js Hackpack",
    sponsor: "ACM at UCR",
    description:
      "Next.js template connected to MongoDB. Just drop in your connection string and start reading/writing data.",
    link: "https://github.com/acm-ucr/mongodb-nextjs-hackpack",
    category: ["Backend & Database"],
    featured: false,
    instructions: "Use This Template → set MONGODB_URI → npm i → npm run dev.",
  },
  {
    id: "expo-tailwind-hackpack",
    name: "Expo + Tailwind Hackpack",
    sponsor: "ACM at UCR",
    description:
      "React Native mobile starter using Expo and NativeWind. Scan the QR code with Expo Go to run on your phone.",
    link: "https://github.com/acm-ucr/expo-tailwind-hackpack",
    category: ["Mobile"],
    featured: true,
    instructions:
      "Use This Template → npm i → npm run start → scan QR with Expo Go.",
  },
  {
    id: "discord-typescript-hackpack",
    name: "Discord Bot (TypeScript) Hackpack",
    sponsor: "ACM at UCR",
    description:
      "Discord.js bot starter in TypeScript. Command handling boilerplate included — just add your bot token.",
    link: "https://github.com/acm-ucr/discord-typescript-hackpack",
    category: ["Bots"],
    featured: false,
    instructions:
      "Use This Template → set DISCORD_TOKEN → npm i → npm run bot.",
  },
  {
    id: "discord-python-hackpack",
    name: "Discord Bot (Python) Hackpack",
    sponsor: "ACM at UCR",
    description:
      "Discord bot starter in Python using Poetry. Great if you prefer Python over Node for bot logic.",
    link: "https://github.com/acm-ucr/discord-python-hackpack",
    category: ["Bots"],
    featured: false,
    instructions:
      "Use This Template → set DISCORD_BOT_TOKEN → poetry install → poetry run bot.",
  },
  {
    id: "mongodb-python-hackpack",
    name: "MongoDB + Python Hackpack",
    sponsor: "ACM at UCR",
    description:
      "Python + PyMongo template managed with Poetry. Connect to MongoDB and build a backend in minutes.",
    link: "https://github.com/acm-ucr/mongodb-python-hackpack",
    category: ["Backend & Database"],
    featured: false,
    instructions:
      "Use This Template → set MONGODB_URI → poetry install → poetry run app.",
  },
  {
    id: "machine-learning-hackpack",
    name: "Machine Learning Hackpack",
    sponsor: "ACM at UCR",
    description:
      "Jupyter Notebook starter for ML experiments. Open in VS Code or Google Colab and start training models.",
    link: "https://github.com/acm-ucr/machine-learning-hackpack",
    category: ["AI/ML"],
    featured: true,
    instructions:
      "Open machine-learning-hackpack.ipynb in VS Code or Google Colab (Python 3.8+).",
  },
  {
    id: "computer-vision-hackpack",
    name: "Computer Vision Hackpack",
    sponsor: "ACM at UCR",
    description:
      "Python + Poetry starter for computer vision projects. Image processing boilerplate ready to extend.",
    link: "https://github.com/acm-ucr/computer-vision-hackpack",
    category: ["AI/ML"],
    featured: false,
    instructions: "Use This Template → poetry install → poetry run app.",
  },
  {
    id: "arduino-hackpack",
    name: "Arduino Hackpack",
    sponsor: "ACM at UCR",
    description:
      "Arduino IDE starter sketch for hardware hacks. Install the Arduino IDE, flash the sample, and iterate.",
    link: "https://github.com/acm-ucr/arduino-hackpack",
    category: ["Hardware"],
    featured: false,
    instructions: "Install Arduino IDE → open src → flash to your board.",
  },
  {
    id: "unity-hackpack",
    name: "Unity Hackpack",
    sponsor: "ACM at UCR",
    description:
      "Unity starter project (2022.3.29f1). Open the repo as a project in Unity Hub to start building your game.",
    link: "https://github.com/acm-ucr/unity-hackpack",
    category: ["Game Dev"],
    featured: false,
    instructions: "Install Unity Hub + 2022.3.29f1 → open repo as project.",
  },
  {
    id: "python-hackpack",
    name: "Python Hackpack",
    sponsor: "ACM at UCR",
    description:
      "General-purpose Python starter using Poetry with YAPF and Pylint. Ideal for scripts, APIs, and tooling.",
    link: "https://github.com/acm-ucr/python-hackpack",
    category: ["General"],
    featured: true,
    instructions:
      "Use This Template → poetry install → poetry run app (Python 3.8+).",
  },
];
