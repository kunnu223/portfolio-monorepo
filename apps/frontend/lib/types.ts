export interface PersonalInfo {
  name: string;
  role: string;
  location: string;
  email: string;
  phone: string;
  summary: string;
  about?: string; // High-level "My Story"
  profileImage?: string;
  socials: {
    github: string;
    linkedin: string;
  };
}

export interface Experience {
  _id?: string;
  company: string;
  role: string;
  period: string;
  location?: string;
  description: string[];
}

export interface SkillCategory {
  frontend?: string[];
  backend?: string[];
  databases?: string[];
  languages?: string[];
  tools?: string[];
  [key: string]: string[] | undefined;
}

export interface Project {
  _id?: string;
  title: string;
  description: string;
  technologies: string[];
  link: string;
}

export interface EducationItem {
  _id?: string;
  institution: string;
  degree: string;
  period: string;
}

export interface PortfolioData {
  personalInfo: PersonalInfo;
  experiences: Experience[];
  skills: SkillCategory;
  projects: Project[];
  education: EducationItem[];
  resumeUrl: string;
}
