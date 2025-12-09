/* eslint-disable n/no-unsupported-features/node-builtins */

import { ResumeDataFilled } from '@/types/resumeData';

export default function getFilledData() {
  const filledData: ResumeDataFilled = {
    certifications: {
      certificates:
        'AWS Certified Solutions Architect, Meta Frontend Developer Certificate',
      interests: 'Open Source Development, AI/ML, Technical Writing',
      skills: 'Cloud Architecture, Web Accessibility, Performance Optimization',
    },
    education: {
      degrees: [
        {
          address: 'Berkeley, CA',
          bulletPoints: [
            {
              id: crypto.randomUUID(),
              value: 'GPA: 3.8/4.0',
            },
            {
              id: crypto.randomUUID(),
              value: "Dean's List: 2019–2022",
            },
            {
              id: crypto.randomUUID(),
              value: 'Senior Project: AI-powered Code Review Assistant',
            },
          ],
          degree: 'Bachelor of Science in Computer Science',
          graduation: 'May 2022',
          id: crypto.randomUUID(),
          uni: 'University of California, Berkeley',
        },
      ],
      shownDegreeIndex: 0,
    },
    experience: {
      jobs: [
        {
          address: 'San Francisco, CA',
          bulletPoints: [
            {
              id: crypto.randomUUID(),
              value:
                'Led development of a high-performance React application serving 1M+ users',
            },
            {
              id: crypto.randomUUID(),
              value:
                'Improved application load time by 40% through code splitting and lazy loading',
            },
            {
              id: crypto.randomUUID(),
              value:
                'Mentored junior developers and conducted technical interviews',
            },
          ],
          companyName: 'TechCorp Inc.',
          duration: 'Jan 2023 – Present',
          id: crypto.randomUUID(),
          jobTitle: 'Senior Frontend Engineer',
        },
      ],
      shownJobIndex: 0,
    },
    links: {
      github: {
        link: 'https://github.com/johndoe',
        text: 'GitHub',
      },
      linkedin: {
        link: 'https://linkedin.com/in/johndoe',
        text: 'LinkedIn',
      },
      telegram: {
        link: 'https://t.me/johndoe',
        text: 'Telegram',
      },
      website: {
        link: 'https://johndoe.dev',
        text: 'Portfolio',
      },
    },
    personal: {
      address: '123 Main St, Anytown, CA 91234',
      email: 'john.doe@johndoe.com',
      fullName: 'John Doe',
      jobTitle: 'Frontend Engineer',
      phone: '+1 (555) 555-5555',
      summary:
        'A highly motivated and skilled frontend engineer with a passion for creating innovative and user-friendly web applications.',
    },
    projects: {
      projects: [
        {
          bulletPoints: [
            {
              id: crypto.randomUUID(),
              value:
                'Built a scalable e-commerce platform with React and Next.js',
            },
            {
              id: crypto.randomUUID(),
              value:
                'Implemented server-side rendering for optimal SEO performance',
            },
            {
              id: crypto.randomUUID(),
              value:
                'Integrated Stripe payment processing and shopping cart functionality',
            },
          ],
          code: {
            text: 'View Code',
            link: 'https://github.com/johndoe/ecommerce',
          },
          demo: {
            text: 'Live Demo',
            link: 'https://ecommerce-demo.johndoe.dev',
          },
          id: crypto.randomUUID(),
          projectName: 'E-commerce Platform',
          stack: 'React, Next.js, TypeScript, GraphQL',
        },
      ],
      shownProjectIndex: 0,
    },
    skills: {
      frameworks: [
        {
          id: crypto.randomUUID(),
          value: 'React',
        },
        {
          id: crypto.randomUUID(),
          value: 'Next.js',
        },
        {
          id: crypto.randomUUID(),
          value: 'Node.js',
        },
      ],
      languages: [
        {
          id: crypto.randomUUID(),
          value: 'JavaScript',
        },
        {
          id: crypto.randomUUID(),
          value: 'TypeScript',
        },
        {
          id: crypto.randomUUID(),
          value: 'HTML/CSS',
        },
      ],
      tools: [
        {
          id: crypto.randomUUID(),
          value: 'Git',
        },
        {
          id: crypto.randomUUID(),
          value: 'Webpack',
        },
        {
          id: crypto.randomUUID(),
          value: 'Jest',
        },
      ],
    },
  };

  return filledData;
}
