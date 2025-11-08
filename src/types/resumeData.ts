import type { UUID } from 'crypto';

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
  id: UUID;
  value: string;
}

export interface ItemWithOptionalId extends Omit<ItemWithId, 'id'> {
  id?: UUID;
}

export type ItemWithoutId = Omit<ItemWithId, 'id'>;

export interface Skills {
  frameworks: ItemWithId[];
  languages: ItemWithId[];
  tools: ItemWithId[];
}

export interface SkillsWithOptionalIds {
  frameworks: ItemWithOptionalId[];
  languages: ItemWithOptionalId[];
  tools: ItemWithOptionalId[];
}

export interface SkillsWithoutIds {
  frameworks: ItemWithoutId[];
  languages: ItemWithoutId[];
  tools: ItemWithoutId[];
}

export interface Job {
  address: string;
  bulletPoints: ItemWithId[];
  companyName: string;
  duration: string;
  id: UUID;
  jobTitle: string;
}

export interface JobWithOptionalIds extends Omit<Job, 'bulletPoints' | 'id'> {
  bulletPoints: ItemWithOptionalId[];
  id?: UUID;
}

export interface JobWithoutIds extends Omit<Job, 'bulletPoints' | 'id'> {
  bulletPoints: ItemWithoutId[];
}

export interface Experience {
  jobs: Job[];
  shownJobIndex: number;
}

export interface ExperienceWithOptionalIds extends Omit<Experience, 'jobs'> {
  jobs: JobWithOptionalIds[];
}

export interface ExperienceWithoutIds extends Omit<Experience, 'jobs'> {
  jobs: JobWithoutIds[];
}

export interface Project {
  bulletPoints: ItemWithId[];
  code: Link;
  demo: Link;
  id: UUID;
  projectName: string;
  stack: string;
}

export interface ProjectWithOptionalIds
  extends Omit<Project, 'bulletPoints' | 'id'> {
  bulletPoints: ItemWithOptionalId[];
  id?: UUID;
}

export interface ProjectWithoutIds
  extends Omit<Project, 'bulletPoints' | 'id'> {
  bulletPoints: ItemWithoutId[];
}

export interface Projects {
  projects: Project[];
  shownProjectIndex: number;
}

export interface ProjectsWithOptionalIds extends Omit<Projects, 'projects'> {
  projects: ProjectWithOptionalIds[];
}

export interface ProjectsWithoutIds extends Omit<Projects, 'projects'> {
  projects: ProjectWithoutIds[];
}

export interface Degree {
  address: string;
  bulletPoints: ItemWithId[];
  degree: string;
  graduation: string;
  id: UUID;
  uni: string;
}

export interface DegreeWithOptionalIds
  extends Omit<Degree, 'bulletPoints' | 'id'> {
  bulletPoints: ItemWithOptionalId[];
  id?: UUID;
}

export interface DegreeWithoutIds extends Omit<Degree, 'bulletPoints' | 'id'> {
  bulletPoints: ItemWithoutId[];
}

export interface Education {
  degrees: Degree[];
  shownDegreeIndex: number;
}

export interface EducationWithOptionalIds extends Omit<Education, 'degrees'> {
  degrees: DegreeWithOptionalIds[];
}

export interface EducationWithoutIds extends Omit<Education, 'degrees'> {
  degrees: DegreeWithoutIds[];
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

export interface ResumeDataWithOptionalIds
  extends Omit<ResumeData, 'education' | 'experience' | 'projects' | 'skills'> {
  education: EducationWithOptionalIds;
  experience: ExperienceWithOptionalIds;
  projects: ProjectsWithOptionalIds;
  skills: SkillsWithOptionalIds;
}

export interface ResumeDataWithoutIds
  extends Omit<ResumeData, 'education' | 'experience' | 'projects' | 'skills'> {
  education: EducationWithoutIds;
  experience: ExperienceWithoutIds;
  projects: ProjectsWithoutIds;
  skills: SkillsWithoutIds;
}
