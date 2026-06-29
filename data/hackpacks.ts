export interface Hackpack {
  id: string;
  name: string;
  sponsor: string;
  description: string;
  link: string;
  category: ("Cloud Credits" | "AI APIs" | "Developer Tools" | "Design Tools" | "Domains")[];
  featured: boolean;
  instructions?: string;
}

export const hackpacks: Hackpack[] = [
  {
    id: "google-cloud",
    name: "Google Cloud Credits",
    sponsor: "Google for Startups",
    description:
      "Get $250 in Google Cloud credits to build and deploy your hackathon project. Includes access to Compute Engine, Cloud Run, and Firebase.",
    link: "https://cloud.google.com/startup",
    category: ["Cloud Credits"],
    featured: true,
    instructions:
      "Sign up with your .edu email and use code HACKATHON250 at checkout.",
  },
  {
    id: "aws-credits",
    name: "AWS Educate Credits",
    sponsor: "Amazon Web Services",
    description:
      "Receive $100 in AWS credits plus free access to AWS Educate learning resources. Build with EC2, Lambda, S3, and more.",
    link: "https://aws.amazon.com/education/awseducate/",
    category: ["Cloud Credits"],
    featured: true,
    instructions:
      "Create an AWS Educate account using your university email to claim credits.",
  },
  {
    id: "openai-api",
    name: "OpenAI API Access",
    sponsor: "OpenAI",
    description:
      "Free API credits to integrate GPT-4, DALL-E, and Whisper into your hackathon project. Includes $50 in free credits.",
    link: "https://platform.openai.com",
    category: ["AI APIs"],
    featured: true,
    instructions:
      "Apply for the OpenAI hackathon program using your .edu email to receive credits.",
  },
  {
    id: "claude-api",
    name: "Claude API Credits",
    sponsor: "Anthropic",
    description:
      "Build with Claude, Anthropic's AI assistant. Get $50 in API credits plus access to the latest Claude models.",
    link: "https://console.anthropic.com",
    category: ["AI APIs"],
    featured: false,
    instructions:
      "Sign up for the Anthropic console and use promo code HACKCLAUDE50.",
  },
  {
    id: "huggingface",
    name: "Hugging Face Spaces",
    sponsor: "Hugging Face",
    description:
      "Deploy your AI models for free on Hugging Face Spaces. Access thousands of pre-trained models and datasets.",
    link: "https://huggingface.co/spaces",
    category: ["AI APIs"],
    featured: false,
    instructions:
      "Create an account and deploy your model to Spaces with zero configuration.",
  },
  {
    id: "vercel",
    name: "Vercel Pro",
    sponsor: "Vercel",
    description:
      "Deploy your frontend instantly with Vercel. Get 90 days of Pro tier including serverless functions, analytics, and more.",
    link: "https://vercel.com/hackathons",
    category: ["Developer Tools"],
    featured: true,
    instructions:
      "Sign up for Vercel and apply your hackathon coupon code VERCELHACK2026.",
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    sponsor: "GitHub",
    description:
      "Free access to GitHub Copilot during the hackathon. AI-powered code completion and suggestions in your editor.",
    link: "https://github.com/features/copilot",
    category: ["Developer Tools"],
    featured: false,
    instructions:
      "Install the Copilot extension in VS Code and sign in with your GitHub account.",
  },
  {
    id: "supabase",
    name: "Supabase Pro",
    sponsor: "Supabase",
    description:
      "Get 3 months of Supabase Pro for free. Includes PostgreSQL database, authentication, real-time subscriptions, and storage.",
    link: "https://supabase.com/hackathon",
    category: ["Developer Tools"],
    featured: false,
    instructions:
      "Create a Supabase account and use promo code SUPABASEHACK to activate.",
  },
  {
    id: "figma",
    name: "Figma Professional",
    sponsor: "Figma",
    description:
      "90-day free trial of Figma Professional with unlimited project files, version history, and advanced prototyping tools.",
    link: "https://www.figma.com/education/hackathon/",
    category: ["Design Tools"],
    featured: true,
    instructions:
      "Register with your .edu email and join the Figma Education plan to unlock Pro features.",
  },
  {
    id: "canva",
    name: "Canva Pro",
    sponsor: "Canva",
    description:
      "Free 30-day Canva Pro trial with premium templates, design assets, and team collaboration features.",
    link: "https://www.canva.com/hackathons/",
    category: ["Design Tools"],
    featured: false,
    instructions:
      "Sign up for Canva and enter promo CANVAHACK30 at checkout.",
  },
  {
    id: "namecheap",
    name: ".XYZ Domain",
    sponsor: "Namecheap",
    description:
      "Get a free .xyz domain for one year. Perfect for hosting your hackathon project landing page.",
    link: "https://www.namecheap.com/hackathons/",
    category: ["Domains"],
    featured: false,
    instructions:
      "Use coupon code XYZHACK2026 at checkout to claim your free domain.",
  },
  {
    id: "googledomains",
    name: ".dev Domain + Hosting",
    sponsor: "Google Domains",
    description:
      "Free .dev domain for one year plus $50 in Firebase hosting credits. Launch your project with a professional domain.",
    link: "https://domains.google/hackathon",
    category: ["Domains"],
    featured: false,
    instructions:
      "Register your .dev domain through Google Domains using promo DEVHACK50.",
  },
];