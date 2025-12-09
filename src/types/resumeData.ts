import type { UUID } from 'crypto';

type AppendSuffix<T extends readonly string[], Suffix extends string> = {
  [K in keyof T]: `${T[K]}${Suffix}`;
};

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

export type SectionIdsDeletable = [
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

export type TabpanelIds = AppendSuffix<SectionIds, '-tabpanel'>;

export interface Personal {
  address: string;
  email: string;
  fullName: string;
  jobTitle: string;
  phone: string;
  summary: string;
}

// TODO: the object represents a link. The `link` property represents its URL. The `text` property represents the anchor text. Name `link` for the URL property isn't completely appropriate. It should be `url`. Refactor.
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

  // TODO: if I'm not wrong, the ID isn't used anywhere. Check this and if it's true, delete IDs from projects.
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

  // TODO: if I'm not wrong, the ID isn't used anywhere. Check this and if it's true, delete IDs from projects.
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

export interface ResumeDataFilled {
  certifications: {
    certificates: 'AWS Certified Solutions Architect, Meta Frontend Developer Certificate';
    interests: 'Open Source Development, AI/ML, Technical Writing';
    skills: 'Cloud Architecture, Web Accessibility, Performance Optimization';
  };
  education: {
    degrees: [
      {
        address: 'Berkeley, CA';
        bulletPoints: [
          {
            id: UUID;
            value: 'GPA: 3.8/4.0';
          },
          {
            id: UUID;
            value: "Dean's List: 2019–2022";
          },
          {
            id: UUID;
            value: 'Senior Project: AI-powered Code Review Assistant';
          },
        ];
        degree: 'Bachelor of Science in Computer Science';
        graduation: 'May 2022';
        id: UUID;
        uni: 'University of California, Berkeley';
      },
    ];
    shownDegreeIndex: 0;
  };
  experience: {
    jobs: [
      {
        address: 'San Francisco, CA';
        bulletPoints: [
          {
            id: UUID;
            value: 'Led development of a high-performance React application serving 1M+ users';
          },
          {
            id: UUID;
            value: 'Improved application load time by 40% through code splitting and lazy loading';
          },
          {
            id: UUID;
            value: 'Mentored junior developers and conducted technical interviews';
          },
        ];
        companyName: 'TechCorp Inc.';
        duration: 'Jan 2023 – Present';
        id: UUID;
        jobTitle: 'Senior Frontend Engineer';
      },
    ];
    shownJobIndex: 0;
  };
  links: {
    github: {
      link: 'https://github.com/johndoe';
      text: 'GitHub';
    };
    linkedin: {
      link: 'https://linkedin.com/in/johndoe';
      text: 'LinkedIn';
    };
    telegram: {
      link: 'https://t.me/johndoe';
      text: 'Telegram';
    };
    website: {
      link: 'https://johndoe.dev';
      text: 'Portfolio';
    };
  };
  personal: {
    address: '123 Main St, Anytown, CA 91234';
    email: 'john.doe@johndoe.com';
    fullName: 'John Doe';
    jobTitle: 'Frontend Engineer';
    phone: '+1 (555) 555-5555';
    summary: 'A highly motivated and skilled frontend engineer with a passion for creating innovative and user-friendly web applications.';
  };
  projects: {
    projects: [
      {
        bulletPoints: [
          {
            id: UUID;
            value: 'Built a scalable e-commerce platform with React and Next.js';
          },
          {
            id: UUID;
            value: 'Implemented server-side rendering for optimal SEO performance';
          },
          {
            id: UUID;
            value: 'Integrated Stripe payment processing and shopping cart functionality';
          },
        ];
        code: {
          link: 'https://github.com/johndoe/ecommerce';
          text: 'View Code';
        };
        demo: {
          link: 'https://ecommerce-demo.johndoe.dev';
          text: 'Live Demo';
        };
        id: UUID;
        projectName: 'E-commerce Platform';
        stack: 'React, Next.js, TypeScript, GraphQL';
      },
    ];
    shownProjectIndex: 0;
  };
  skills: {
    frameworks: [
      {
        id: UUID;
        value: 'React';
      },
      {
        id: UUID;
        value: 'Next.js';
      },
      {
        id: UUID;
        value: 'Node.js';
      },
    ];
    languages: [
      {
        id: UUID;
        value: 'JavaScript';
      },
      {
        id: UUID;
        value: 'TypeScript';
      },
      {
        id: UUID;
        value: 'HTML/CSS';
      },
    ];
    tools: [
      {
        id: UUID;
        value: 'Git';
      },
      {
        id: UUID;
        value: 'Webpack';
      },
      {
        id: UUID;
        value: 'Jest';
      },
    ];
  };
}
