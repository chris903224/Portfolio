import type { Project, TabKey, TechMeta, TechName } from './types';

export const TECH_META: Record<TechName, TechMeta> = {
  React: { icon: 'fa-brands fa-react', color: '#38bdf8' },
  HTML5: { icon: 'fa-brands fa-html5', color: '#f97316' },
  CSS3: { icon: 'fa-brands fa-css3-alt', color: '#3b82f6' },
  JavaScript: { icon: 'fa-brands fa-js', color: '#facc15' },
  TypeScript: { glyph: 'TS', color: '#3b82f6' },
  'Node.js': { icon: 'fa-brands fa-node-js', color: '#4ade80' },
  PostgreSQL: { icon: 'fa-solid fa-database', color: '#60a5fa' },
  'Spring Boot': { icon: 'fa-solid fa-leaf', color: '#4ade80' },
  Java: { icon: 'fa-brands fa-java', color: '#f89820' },
  Git: { icon: 'fa-brands fa-git-alt', color: '#fb7185' },
  Vercel: { glyph: '▲', color: '#f8fafc' },
  Vite: { icon: 'fa-solid fa-bolt', color: '#a855f7' },
  'VS Code': { icon: 'fa-solid fa-terminal', color: '#38bdf8' },
  IntelliJ: { glyph: 'IJ', color: '#f472b6' },
};

export const TECH_GROUPS: Record<string, TechName[]> = {
  Frontend: ['React', 'HTML5', 'CSS3', 'JavaScript', 'TypeScript'],
  Backend: ['Node.js', 'PostgreSQL', 'Spring Boot', 'Java'],
  Tools: ['Git', 'Vercel', 'Vite', 'VS Code', 'IntelliJ'],
};

export const PROJECTS: Project[] = [
  { 
    title: 'SJC Merchandise', 
    description: 'A Student-Centered E-Commerce Platform for Saint Jude College Manila.', 
    longDescription: 'SJC Merchandise is a web-based e-commerce platform designed to simplify the process of browsing, purchasing, and tracking school merchandise within the Saint Jude College community. It provides a centralized platform for school-related products, order management, and online payment processing. The project focuses on improving the student purchasing experience through an organized product catalog, inventory tracking, and a streamlined checkout process.',
    tech: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Vite', 'CSS3',], 
    icon: 'fa-store', 
    gradient: 'linear-gradient(135deg,#2563eb,#0ea5e9,#22d3ee)',
    image: '/portfolio1.png',
    liveUrl: 'https://merchandise-system.vercel.app/',
    repoUrl: 'https://github.com/chris903224/Merchandise'
  },
  { 
    title: 'SJC Supplies', 
    description: 'Campus Commerce — A Spring-Based E-Commerce System with Shopper and Administrator Interfaces.', 
    longDescription: 'Campus Commerce is a web-based commerce system designed to support online shopping and administrative operations through dedicated browser interfaces. It combines product browsing, cart management, checkout, order tracking, account management, and payment integration within a structured backend architecture. The project separates shopper-facing functionality from administrative operations while organizing backend responsibilities into controllers, services, and repositories.', 
    tech: ['Java', 'Spring Boot', 'JavaScript', 'HTML5', 'CSS3', 'PostgreSQL'], 
    icon: 'fa-cart-shopping', 
    gradient: 'linear-gradient(135deg,#10b981,#14b8a6,#0891b2)',
    image: '/portfolio2.png',
    repoUrl: 'https://github.com/chris903224/CampusCommerce'
  },
  { 
    title: 'Generated', 
    description: 'To implement of the one OS Generated Control Number.', 
    longDescription: 'A system designed to generate unique control numbers for various administrative and operational workflows. Built with a focus on reliability and efficiency to ensure that every generated control number is unique and traceable.', 
    tech: ['TypeScript', 'React', 'Vite', 'CSS3'], 
    icon: 'fa-id-badge', 
    gradient: 'linear-gradient(135deg,#4f46e5,#2563eb,#06b6d4)',
    image: '/portfolio3.png',
    liveUrl: 'https://generatedcontrolnumber.vercel.app/',
    repoUrl: 'https://github.com/chris903224/generated'
  },
  { 
    title: 'MP Company', 
    description: 'MP Micro IT Solutions — Reliable IT Infrastructure. Smarter Business Operations.', 
    longDescription: 'MP Micro IT Solutions provides practical technology solutions for businesses and property owners, specializing in network cabling and infrastructure, CCTV and security system installation. From structured cabling and router configuration to indoor and outdoor CCTV deployment with DVR/NVR setup and remote viewing, the project delivers reliable, cost-effective IT services that help businesses stay connected, equipped, and secure.', 
    tech: ['React', 'CSS3', 'TypeScript', 'Vite', 'Node.js', 'PostgreSQL', ], 
    icon: 'fa-network-wired', 
    gradient: 'linear-gradient(135deg,#0f172a,#1d4ed8,#38bdf8)',
    image: '/portfolio4.png',
    liveUrl: 'https://mp-company.vercel.app/',
    repoUrl: 'https://github.com/chris903224/mp-company'
  },
  { 
    title: 'PawPatrol', 
    description: 'An online pet shop portal for customers.', 
    longDescription: 'PawPatrol is an online pet shop portal where customers can browse and purchase products and pets, checkout, register their own pets, and view their past orders. Built with Vanilla JS and Vite on the frontend and Supabase (Postgres) on the backend, checkout is handled through a database transaction that checks stock, deducts inventory, marks pets as sold, and saves the order — using database-side pricing so customers cannot tamper with prices.', 
    tech: ['JavaScript', 'Vite', 'PostgreSQL', 'HTML5'], 
    icon: 'fa-paw', 
    gradient: 'linear-gradient(135deg,#f59e0b,#f97316,#ef4444)',
    image: '/portfolio5.png',
    liveUrl: 'https://pawpatrol-five.vercel.app/',
    repoUrl: 'https://github.com/hayen2/pawpatrol'
  },
  { 
    title: 'Gene and Stem Website', 
    description: 'Gene Therapy & Stem Cell Research — Science, Technology and Society.', 
    longDescription: 'A web-based science explorer presenting gene therapy and stem cell research through a 3D focus graph. The project covers the genome and double helix, somatic and germline editing, CRISPR-Cas9, base editors, AAV vectors and lipid nanoparticles, clinical milestones such as Casgevy and Lyfgenia, and the ethical and social issues around embryo use, informed consent, genetic privacy and heritable modification — framed as questions of governance, legitimation and accountability of science and technology.', 
    tech: ['HTML5', 'JavaScript', 'Vite', 'CSS3'], 
    icon: 'fa-dna', 
    gradient: 'linear-gradient(135deg,#7c3aed,#2563eb,#06b6d4)',
    image: '/portfolio6.png',
    liveUrl: 'https://gene-stem.vercel.app/',
    repoUrl: 'https://github.com/chris903224/gene-stem'
  },
];

// Isang certificate lang (Collaborative Robot TESDA NC3)
export const CERT_IMAGES = [
  '/certificate1.png',
];

export const EXP_IMAGES = [
  '/experience1.png',
  '/experience2.png',
  '/experience3.png',
  '/experience4.png'
];

export const TAB_LABELS: { key: TabKey; icon: string; label: string }[] = [
  { key: 'projects', icon: 'fa-code', label: 'Projects' },
  { key: 'certificates', icon: 'fa-certificate', label: 'Certificates' },
  { key: 'experience', icon: 'fa-briefcase', label: 'Experience' },
  { key: 'skills', icon: 'fa-layer-group', label: 'Tech Skills' },
];