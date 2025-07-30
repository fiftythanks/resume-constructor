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
  switch (sectionName) {
    case 'certifications': {
      return (
        <>
          <Text style={styles.bold}>CERTIFICATES, SKILLS & INTERESTS</Text>
          <View style={style}>
            <Text>
              <Text style={styles.bold}>Certificates:</Text> {data.certificates}
            </Text>
            <Text>
              <Text style={styles.bold}>Skills:</Text> {data.skills}
            </Text>
            <Text>
              <Text style={styles.bold}>Interests:</Text> {data.interests}
            </Text>
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
              <View key={degree.id} style={i > 0 && styles.degree}>
                <View style={styles.degreeHeader}>
                  <View>
                    <Text style={styles.bold}>{degree.uni}</Text>
                    <Text style={styles.italic}>{degree.degree}</Text>
                  </View>
                  <View style={styles.rightDegreeHeaderPart}>
                    <Text style={styles.bold}>{degree.graduation}</Text>
                    <Text style={styles.italic}>{degree.address}</Text>
                  </View>
                </View>
                <View>
                  {degree.bulletPoints.map((item) => (
                    <View key={item.id} style={styles.bulletPoint}>
                      <Text>•</Text>
                      <Text>{item.value}</Text>
                    </View>
                  ))}
                </View>
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
              <View key={job.id} style={i > 0 && styles.job}>
                <View style={styles.jobHeader}>
                  <View>
                    <Text style={styles.bold}>{job.companyName}</Text>
                    <Text style={styles.italic}>{job.jobTitle}</Text>
                  </View>
                  <View style={styles.rightJobHeaderPart}>
                    <Text style={styles.bold}>{job.duration}</Text>
                    <Text style={styles.italic}>{job.address}</Text>
                  </View>
                </View>
                <View>
                  {job.bulletPoints.map((item) => (
                    <View key={item.id} style={styles.bulletPoint}>
                      <Text>•</Text>
                      <Text>{item.value}</Text>
                    </View>
                  ))}
                </View>
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
              <View key={project.id} style={i > 0 && styles.project}>
                <Text>
                  <Text style={styles.bold}>{project.projectName}</Text>
                  {` — ${project.stack}.`}
                </Text>
                {project.bulletPoints.map((item) => (
                  <View key={item.id} style={styles.bulletPoint}>
                    <Text>•</Text>
                    <Text>{item.value}</Text>
                  </View>
                ))}
                <Text>
                  <Link href={project.code.link} src={project.code.link}>
                    {project.code.text}
                  </Link>
                  {'  |  '}
                  <Link href={project.demo.link} src={project.demo.link}>
                    {project.demo.text}
                  </Link>
                </Text>
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
            {data.languages && (
              <Text>
                <Text style={styles.bold}>Languages:</Text>
                {` ${joinItems(data.languages)}.`}
              </Text>
            )}
            {data.frameworks && (
              <Text>
                <Text style={styles.bold}>
                  Frameworks, Libraries & Databases:
                </Text>
                {` ${joinItems(data.frameworks)}.`}
              </Text>
            )}
            {data.tools && (
              <Text>
                <Text style={styles.bold}>Tools & Other Technologies:</Text>
                {` ${joinItems(data.tools)}.`}
              </Text>
            )}
          </View>
        </>
      );
    }
    default:
    // Do nothing.
  }
}
