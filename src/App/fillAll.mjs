/**
 * What does `fillAll` mean? It's too vague, I don't understand this
 * function myself!
 */
// TODO: change `fillAll` to a more telling name.
export default function fillAll(
  // TODO: remove `activeSectionIDs` from the parameters.
  activeSectionIDs,
  addSections,
  clear,
  clearAll,
  possibleSectionIDs,
  sectionFunctions,
) {
  clearAll(clear);

  const {
    certificationsFunctions,
    educationFunctions,
    experienceFunctions,
    linksFunctions,
    personalFunctions,
    projectFunctions,
    skillsFunctions,
  } = sectionFunctions;

  possibleSectionIDs.forEach((sectionID) => {
    addSections(possibleSectionIDs);

    // But first, you need to determine those fields.
    // TODO: go through all the fields and prevent filling those fields that it's not recommended to include in a software engineer's resume.
    switch (sectionID) {
      case 'certifications': {
        const { updateCertifications: update } = certificationsFunctions;

        update(
          'certificates',
          'AWS Certified Solutions Architect, Meta Frontend Developer Certificate',
        );
        update(
          'skills',
          'Cloud Architecture, Web Accessibility, Performance Optimization',
        );
        update(
          'interests',
          'Open Source Development, AI/ML, Technical Writing',
        );

        break;
      }
      case 'education': {
        const { editDegree, addDegree } = educationFunctions;

        const sampleDegrees = [
          {
            uni: 'University of California, Berkeley',
            degree: 'Bachelor of Science in Computer Science',
            graduation: 'May 2022',
            address: 'Berkeley, CA',
            bulletPoints: [
              'GPA: 3.8/4.0',
              "Dean's List: 2019–2022",
              'Senior Project: AI-powered Code Review Assistant',
            ],
          },
        ];

        sampleDegrees.forEach((sampleDegree, index) => {
          // First degree already exists after clear
          if (index > 0) addDegree();

          editDegree(index, 'uni', sampleDegree.uni);
          editDegree(index, 'degree', sampleDegree.degree);
          editDegree(index, 'graduation', sampleDegree.graduation);
          editDegree(index, 'address', sampleDegree.address);

          editDegree(
            index,
            'bulletPoints',
            sampleDegree.bulletPoints.map((point) => ({
              id: crypto.randomUUID(),
              value: point,
            })),
          );
        });

        break;
      }
      case 'experience': {
        const { editJob, addJob } = experienceFunctions;

        const sampleJobs = [
          {
            companyName: 'TechCorp Inc.',
            jobTitle: 'Senior Frontend Engineer',
            duration: 'Jan 2023 – Present',
            address: 'San Francisco, CA',
            bulletPoints: [
              'Led development of a high-performance React application serving 1M+ users',
              'Improved application load time by 40% through code splitting and lazy loading',
              'Mentored junior developers and conducted technical interviews',
            ],
          },
        ];

        sampleJobs.forEach((sampleJob, index) => {
          // First job already exists after clear
          if (index > 0) addJob();

          editJob(index, 'companyName', sampleJob.companyName);
          editJob(index, 'jobTitle', sampleJob.jobTitle);
          editJob(index, 'duration', sampleJob.duration);
          editJob(index, 'address', sampleJob.address);

          editJob(
            index,
            'bulletPoints',
            sampleJob.bulletPoints.map((point) => ({
              id: crypto.randomUUID(),
              value: point,
            })),
          );
        });

        break;
      }
      case 'links': {
        const { updateLinks: update } = linksFunctions;

        update('website', 'text', 'Portfolio');
        update('website', 'link', 'https://johndoe.dev');
        update('github', 'text', 'GitHub');
        update('github', 'link', 'https://github.com/johndoe');
        update('linkedin', 'text', 'LinkedIn');
        update('linkedin', 'link', 'https://linkedin.com/in/johndoe');
        update('telegram', 'text', 'Telegram');
        update('telegram', 'link', 'https://t.me/johndoe');

        break;
      }
      case 'personal': {
        const { updatePersonal: update } = personalFunctions;

        update('fullName', 'John Doe');
        update('jobTitle', 'Frontend Engineer');
        update('email', 'john.doe@johndoe.com');
        update('phone', '+1 (555) 555-5555');
        update('address', '123 Main St, Anytown, CA 91234');
        update(
          'summary',
          'A highly motivated and skilled frontend engineer with a passion for creating innovative and user-friendly web applications.',
        );

        break;
      }
      case 'projects': {
        const { editProject, addProject } = projectFunctions;

        const sampleProjects = [
          {
            projectName: 'E-commerce Platform',
            stack: 'React, Next.js, TypeScript, GraphQL',
            bulletPoints: [
              'Built a scalable e-commerce platform with React and Next.js',
              'Implemented server-side rendering for optimal SEO performance',
              'Integrated Stripe payment processing and shopping cart functionality',
            ],
            code: {
              text: 'View Code',
              link: 'https://github.com/johndoe/ecommerce',
            },
            demo: {
              text: 'Live Demo',
              link: 'https://ecommerce-demo.johndoe.dev',
            },
          },
        ];

        sampleProjects.forEach((sampleProject, index) => {
          // First project already exists after clear
          if (index > 0) addProject();

          editProject(index, 'projectName', sampleProject.projectName);
          editProject(index, 'stack', sampleProject.stack);
          editProject(index, 'code', sampleProject.code);
          editProject(index, 'demo', sampleProject.demo);

          editProject(
            index,
            'bulletPoints',
            sampleProject.bulletPoints.map((point) => ({
              id: crypto.randomUUID(),
              value: point,
            })),
          );
        });

        break;
      }
      case 'skills': {
        const {
          editLanguage,
          editFramework,
          editTool,
          addLanguage,
          addFramework,
          addTool,
        } = skillsFunctions;

        const sampleSkills = {
          languages: ['JavaScript', 'TypeScript', 'HTML/CSS'],
          frameworks: ['React', 'Next.js', 'Node.js'],
          tools: ['Git', 'Webpack', 'Jest'],
        };

        // Languages
        sampleSkills.languages.forEach((language, index) => {
          // First 3 items already exist after clear
          if (index > 2) addLanguage();

          editLanguage(index, {
            id: crypto.randomUUID(),
            value: language,
          });
        });

        // Frameworks
        sampleSkills.frameworks.forEach((framework, index) => {
          // First 3 items already exist after clear
          if (index > 2) addFramework();

          editFramework(index, {
            id: crypto.randomUUID(),
            value: framework,
          });
        });

        // Tools
        sampleSkills.tools.forEach((tool, index) => {
          // First 3 items already exist after clear
          if (index > 2) addTool();

          editTool(index, {
            id: crypto.randomUUID(),
            value: tool,
          });
        });

        break;
      }
      default:
      // do nothing
    }
  });
}
