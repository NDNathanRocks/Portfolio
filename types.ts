export type Project = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  github_url?: string | null;
  demo_url?: string | null;
  date: string; // ISO date
};
