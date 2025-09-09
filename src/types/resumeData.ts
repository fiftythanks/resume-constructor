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
