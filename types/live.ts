export interface Announcement {
  _id: string;
  title: string;
  description: string;
  priority: "info" | "warning" | "critical";
  createdAt: number;
  tenant: string;
}

export interface Hackpack {
  _id: string;
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
  tenant: string;
}

export interface Idea {
  _id: string;
  title: string;
  description: string;
  authorid: string;
  author: string;
  skills: string[];
  timestamp: number;
  tenant: string;
}
