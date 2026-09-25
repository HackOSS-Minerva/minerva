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
