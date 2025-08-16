import React from 'react';

import { Link, StyleSheet, Text, View } from '@react-pdf/renderer';

import joinItems from '@/utils/joinItems';

const styles = StyleSheet.create({
  bold: {
    fontWeight: 'bold',
  },
  bulletPoint: {
    display: 'flex',
    flexDirection: 'row',
    gap: 5,
    alignItems: 'first baseline',
  },
  italic: {
    fontStyle: 'italic',
  },
  jobHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rightJobHeaderPart: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  job: {
    marginTop: 5,
  },
  project: {
    marginTop: 5,
  },
  degreeHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rightDegreeHeaderPart: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  degree: {
    marginTop: 5,
  },
});

export default function ResumeSection({ data, sectionName, style }) {
  // Not using it by default for all sections and fields isn't the most user-friendly approach.
  // TODO: examine where you need conditional rendering and where you don't.
  switch (sectionName) {
    case 'certifications': {
      return (
        <>
          <Text style={styles.bold}>CERTIFICATES, SKILLS & INTERESTS</Text>
          <View style={style}>
            <Text
              render={() => (
                <>
                  <Text style={styles.bold}>Certificates:</Text>{' '}
                  {data.certificates}
                </>
              )}
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
                  <View key={degree.id} style={i > 0 && styles.degree}>
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
                  <View key={job.id} style={i > 0 && styles.job}>
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
                    style={i > 0 && styles.project}
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
                        {` ${joinItems(data.languages)}.`}
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
                        {` ${joinItems(data.frameworks)}.`}
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
                        {` ${joinItems(data.tools)}.`}
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
    // Do nothing.
  }
}
