import { Link, StyleSheet, Text, View } from '@react-pdf/renderer';

import neverReached from '@/utils/neverReached';

import joinSkills from './joinSkills';

import type { ResumeData } from '@/types/resumeData';
import type { ViewProps } from '@react-pdf/renderer';
import type { ReadonlyDeep } from 'type-fest';

const styles = StyleSheet.create({
  bold: {
    fontWeight: 'bold',
  },
  bulletPoint: {
    alignItems: 'baseline',
    display: 'flex',
    flexDirection: 'row',
    gap: 5,
  },
  degree: {
    marginTop: 5,
  },
  degreeHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  italic: {
    fontStyle: 'italic',
  },
  job: {
    marginTop: 5,
  },
  jobHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  project: {
    marginTop: 5,
  },
  rightDegreeHeaderPart: {
    alignItems: 'flex-end',
    display: 'flex',
    flexDirection: 'column',
  },
  rightJobHeaderPart: {
    alignItems: 'flex-end',
    display: 'flex',
    flexDirection: 'column',
  },
});

// ============================================================================
// PROPS
// ============================================================================

interface BaseProps {
  style?: ViewProps['style'];
}

interface CertificationsProps {
  data: ResumeData['certifications'];
  sectionName: 'certifications';
}

interface EducationProps {
  data: ResumeData['education'];
  sectionName: 'education';
}

interface ExperienceProps {
  data: ResumeData['experience'];
  sectionName: 'experience';
}

interface ProjectsProps {
  data: ResumeData['projects'];
  sectionName: 'projects';
}

interface SkillsProps {
  data: ResumeData['skills'];
  sectionName: 'skills';
}

type SectionSpecificProps =
  | CertificationsProps
  | EducationProps
  | ExperienceProps
  | ProjectsProps
  | SkillsProps;

/**
 * A resume Section (Personal Details, Education, Experience etc.) for insertion
 * directly into the rendered document.
 */
export default function ResumeSection({
  data,
  // DILEMMA: Why is it named `sectionName` here, whereas it's `sectionId` absolutely everywhere else? It shouldn't be like that, should it?
  sectionName,
  style,
}: BaseProps & ReadonlyDeep<SectionSpecificProps>) {
  // Not using it by default for all sections and fields isn't the most user-friendly approach.
  // TODO: examine where you need conditional rendering and where you don't.
  switch (sectionName) {
    case 'certifications': {
      return (
        <>
          <Text style={styles.bold}>CERTIFICATES, SKILLS & INTERESTS</Text>
          <View style={style}>
            {data.certificates !== '' && (
              <Text>
                <Text style={styles.bold}>Certificates:</Text>{' '}
                {data.certificates}
              </Text>
            )}
            {data.skills !== '' && (
              <Text>
                <Text style={styles.bold}>Skills:</Text> {data.skills}
              </Text>
            )}
            {data.interests !== '' && (
              <Text>
                <Text style={styles.bold}>Interests:</Text> {data.interests}
              </Text>
            )}
          </View>
        </>
      );
    }
    case 'education': {
      return (
        <>
          <Text style={styles.bold}>EDUCATION</Text>
          <View style={style}>
            {data.degrees.map((degree, i) => (
              <View
                key={degree.id}
                style={i > 0 ? styles.degree : undefined}
                wrap={false}
              >
                <View style={styles.degreeHeader}>
                  <View>
                    {degree.uni !== '' && (
                      <Text style={styles.bold}>{degree.uni}</Text>
                    )}
                    {degree.degree !== '' && (
                      <Text style={styles.italic}>{degree.degree}</Text>
                    )}
                  </View>
                  <View style={styles.rightDegreeHeaderPart}>
                    {degree.graduation !== '' && (
                      <Text style={styles.bold}>{degree.graduation}</Text>
                    )}
                    {degree.address !== '' && (
                      <Text style={styles.italic}>{degree.address}</Text>
                    )}
                  </View>
                </View>
                {degree.bulletPoints.map((item) => (
                  <View key={item.id} style={styles.bulletPoint}>
                    <Text>•</Text>
                    <Text>{item.value}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </>
      );
    }
    case 'experience': {
      return (
        <>
          <Text style={styles.bold}>WORK EXPERIENCE</Text>
          <View style={style}>
            {data.jobs.map((job, i) => (
              <View
                key={job.id}
                style={i > 0 ? styles.job : undefined}
                wrap={false}
              >
                <View style={styles.jobHeader}>
                  <View>
                    {job.companyName !== '' && (
                      <Text style={styles.bold}>{job.companyName}</Text>
                    )}
                    {job.jobTitle !== '' && (
                      <Text style={styles.italic}>{job.jobTitle}</Text>
                    )}
                  </View>
                  <View style={styles.rightJobHeaderPart}>
                    {job.duration !== '' && (
                      <Text style={styles.bold}>{job.duration}</Text>
                    )}
                    {job.address !== '' && (
                      <Text style={styles.italic}>{job.address}</Text>
                    )}
                  </View>
                </View>
                {job.bulletPoints.map((item) => (
                  <View key={item.id} style={styles.bulletPoint}>
                    <Text>•</Text>
                    <Text>{item.value}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </>
      );
    }
    case 'projects': {
      return (
        <>
          <Text style={styles.bold}>PROJECTS</Text>
          <View style={style}>
            {data.projects.map((project, i) => (
              <View
                key={project.id}
                style={i > 0 ? styles.project : undefined}
                wrap={false}
              >
                <Text>
                  {project.projectName !== '' && (
                    <Text style={styles.bold}>{project.projectName}</Text>
                  )}
                  {project.stack !== '' && ` — ${project.stack}.`}
                </Text>
                {project.bulletPoints.map((item) => (
                  <View key={item.id} style={styles.bulletPoint}>
                    <Text>•</Text>
                    <Text>{item.value}</Text>
                  </View>
                ))}
                {(project.code.text !== '' || project.demo.text !== '') && (
                  <Text>
                    {project.code.text !== '' && (
                      <Link href={project.code.link} src={project.code.link}>
                        {project.code.text}
                      </Link>
                    )}
                    {project.code.text !== '' &&
                      project.demo.text !== '' &&
                      '  |  '}
                    {project.demo.text !== '' && (
                      <Link href={project.demo.link} src={project.demo.link}>
                        {project.demo.text}
                      </Link>
                    )}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </>
      );
    }
    case 'skills': {
      return (
        <>
          <Text style={styles.bold}>TECHNICAL SKILLS</Text>
          <View style={style}>
            {data.languages.length > 0 && joinSkills(data.languages) !== '' && (
              <Text>
                <Text style={styles.bold}>Languages:</Text>
                {` ${joinSkills(data.languages)}.`}
              </Text>
            )}
            {data.frameworks.length > 0 &&
              joinSkills(data.frameworks) !== '' && (
                <Text>
                  <Text style={styles.bold}>
                    Frameworks, Libraries & Databases:
                  </Text>
                  {` ${joinSkills(data.frameworks)}.`}
                </Text>
              )}
            {data.tools.length > 0 && joinSkills(data.tools) !== '' && (
              <Text>
                <Text style={styles.bold}>Tools & Other Technologies:</Text>
                {` ${joinSkills(data.tools)}.`}
              </Text>
            )}
          </View>
        </>
      );
    }
    default:
      neverReached(sectionName);
  }
}
