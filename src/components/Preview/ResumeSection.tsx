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
            <Text
              render={() => {
                return (
                  <>
                    <Text style={styles.bold}>Certificates:</Text>{' '}
                    {data.certificates}
                  </>
                );
              }}
            />
            <Text
              render={() => (
                <>
                  <Text style={styles.bold}>Skills:</Text> {data.skills}
                </>
              )}
            />
            <Text
              render={() => (
                <>
                  <Text style={styles.bold}>Interests:</Text> {data.interests}
                </>
              )}
            />
          </View>
        </>
      );
    }
    case 'education': {
      return (
        <>
          <Text style={styles.bold}>EDUCATION</Text>
          <View
            style={style}
            render={() => (
              <>
                {data.degrees.map((degree, i) => (
                  <View
                    key={degree.id}
                    style={i > 0 ? styles.degree : undefined}
                  >
                    <View style={styles.degreeHeader}>
                      <View>
                        <Text
                          render={() => `${degree.uni}`}
                          style={styles.bold}
                        />
                        <Text
                          render={() => `${degree.degree}`}
                          style={styles.italic}
                        />
                      </View>
                      <View style={styles.rightDegreeHeaderPart}>
                        <Text
                          render={() => `${degree.graduation}`}
                          style={styles.bold}
                        />
                        <Text
                          render={() => `${degree.address}`}
                          style={styles.italic}
                        />
                      </View>
                    </View>
                    <View
                      render={() => (
                        <>
                          {degree.bulletPoints.map((item) => (
                            <View key={item.id} style={styles.bulletPoint}>
                              <Text>•</Text>
                              <Text render={() => `${item.value}`} />
                            </View>
                          ))}
                        </>
                      )}
                    />
                  </View>
                ))}
              </>
            )}
          />
        </>
      );
    }
    case 'experience': {
      return (
        <>
          <Text style={styles.bold}>WORK EXPERIENCE</Text>
          <View
            style={style}
            render={() => (
              <>
                {data.jobs.map((job, i) => (
                  <View key={job.id} style={i > 0 ? styles.job : undefined}>
                    <View style={styles.jobHeader}>
                      <View>
                        <Text
                          render={() => `${job.companyName}`}
                          style={styles.bold}
                        />
                        <Text
                          render={() => `${job.jobTitle}`}
                          style={styles.italic}
                        />
                      </View>
                      <View style={styles.rightJobHeaderPart}>
                        <Text
                          render={() => `${job.duration}`}
                          style={styles.bold}
                        />
                        <Text
                          render={() => `${job.address}`}
                          style={styles.italic}
                        />
                      </View>
                    </View>
                    <View
                      render={() => (
                        <>
                          {job.bulletPoints.map((item) => (
                            <View key={item.id} style={styles.bulletPoint}>
                              <Text>•</Text>
                              <Text render={() => `${item.value}`} />
                            </View>
                          ))}
                        </>
                      )}
                    />
                  </View>
                ))}
              </>
            )}
          />
        </>
      );
    }
    case 'projects': {
      return (
        <>
          <Text style={styles.bold}>PROJECTS</Text>
          <View
            style={style}
            render={() => (
              <>
                {data.projects.map((project, i) => (
                  <View
                    key={project.id}
                    style={i > 0 ? styles.project : undefined}
                    render={() => (
                      <>
                        <Text
                          render={() => (
                            <>
                              <Text
                                render={() => `${project.projectName}`}
                                style={styles.bold}
                              />
                              {` — ${project.stack}.`}
                            </>
                          )}
                        />
                        {project.bulletPoints.map((item) => (
                          <View key={item.id} style={styles.bulletPoint}>
                            <Text>•</Text>
                            <Text render={() => `${item.value}`} />
                          </View>
                        ))}
                        <Text
                          render={() => (
                            <>
                              <Link
                                href={project.code.link}
                                src={project.code.link}
                              >
                                {project.code.text}
                              </Link>
                              {'  |  '}
                              <Link
                                href={project.demo.link}
                                src={project.demo.link}
                              >
                                {project.demo.text}
                              </Link>
                            </>
                          )}
                        />
                      </>
                    )}
                  />
                ))}
              </>
            )}
          />
        </>
      );
    }
    case 'skills': {
      return (
        <>
          <Text style={styles.bold}>TECHNICAL SKILLS</Text>
          <View
            style={style}
            render={() => (
              <>
                {data.languages && (
                  <Text
                    render={() => (
                      <>
                        <Text style={styles.bold}>Languages:</Text>
                        {` ${joinSkills(data.languages)}.`}
                      </>
                    )}
                  />
                )}
                {data.frameworks && (
                  <Text
                    render={() => (
                      <>
                        <Text style={styles.bold}>
                          Frameworks, Libraries & Databases:
                        </Text>
                        {` ${joinSkills(data.frameworks)}.`}
                      </>
                    )}
                  />
                )}
                {data.tools && (
                  <Text
                    render={() => (
                      <>
                        <Text style={styles.bold}>
                          Tools & Other Technologies:
                        </Text>
                        {` ${joinSkills(data.tools)}.`}
                      </>
                    )}
                  />
                )}
              </>
            )}
          />
        </>
      );
    }
    default:
      neverReached(sectionName);
  }
}
