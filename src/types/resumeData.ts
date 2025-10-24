/**
 * The rule didn't allow me to use `crypto`, but it's baseline available in
 * browsers so I don't have to worry about it.
 */
/* eslint-disable n/no-unsupported-features/node-builtins */

export type SectionId =
  | 'certifications'
  | 'education'
  | 'experience'
  | 'links'
  | 'personal'
  | 'projects'
  | 'skills';

export type SectionIds = [
  'personal',
  'links',
  'skills',
  'experience',
  'projects',
  'education',
  'certifications',
];

export type SectionTitle =
  | 'Certifications'
  | 'Education'
  | 'Links'
  | 'Personal Details'
  | 'Projects'
  | 'Technical Skills'
  | 'Work Experience';

export type SectionTitles = {
  certifications: 'Certifications';
  education: 'Education';
  experience: 'Work Experience';
  links: 'Links';
  personal: 'Personal Details';
  projects: 'Projects';
  skills: 'Technical Skills';
};

export interface Personal {
  address: string;
  email: string;
  fullName: string;
  jobTitle: string;
  phone: string;
  summary: string;
}

export interface Link {
  link: string;
  text: string;
}

export interface Links {
  github: Link;
  linkedin: Link;
  telegram: Link;
  website: Link;
}

export interface ItemWithId {
  id: ReturnType<Crypto['randomUUID']>;
  value: string;
}

export interface Skills {
  frameworks: ItemWithId[];
  languages: ItemWithId[];
  tools: ItemWithId[];
}

export interface Job {
  address: string;
  bulletPoints: ItemWithId[];
  companyName: string;
  duration: string;
  id: ReturnType<Crypto['randomUUID']>;
  jobTitle: string;
}

export interface Experience {
  jobs: Job[];
  shownJobIndex: number;
}

export interface Project {
  bulletPoints: ItemWithId[];
  code: Link;
  demo: Link;
  id: ReturnType<Crypto['randomUUID']>;
  projectName: string;
  stack: string;
}

export interface Projects {
  projects: Project[];
  shownProjectIndex: number;
}

export interface Degree {
  address: string;
  bulletPoints: ItemWithId[];
  degree: string;
  graduation: string;
  id: ReturnType<Crypto['randomUUID']>;
  uni: string;
}

export interface Education {
  degrees: Degree[];
  shownDegreeIndex: number;
}

export interface Certifications {
  certificates: string;
  interests: string;
  skills: string;
}

export interface ResumeData {
  certifications: Certifications;
  education: Education;
  experience: Experience;
  links: Links;
  personal: Personal;
  projects: Projects;
  skills: Skills;
}
