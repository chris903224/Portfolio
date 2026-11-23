export type Project = {
  title: string;
  description: string;
  longDescription: string;
  tech: TechName[];
  icon: string;
  gradient: string;
  image: string;
  images?: string[];
  liveUrl?: string;
  repoUrl?: string;
};

export type Experience = {
  year: string;
  role: string;
  org: string;
  icon: string;
  description: string;
  tags: TechName[];
  image: string;
};

export type TechName =
  | 'React'
  | 'HTML5'
  | 'CSS3'
  | 'JavaScript'
  | 'TypeScript'
  | 'Node.js'
  | 'PostgreSQL'
  | 'Spring Boot'
  | 'Java'
  | 'Git'
  | 'Vercel'
  | 'Vite'
  | 'VS Code'
  | 'IntelliJ';

export type TechMeta = { icon?: string; glyph?: string; color: string };

export type TabKey = 'projects' | 'certificates' | 'experience' | 'skills';