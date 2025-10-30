import { act, renderHook } from '@testing-library/react';

import getDefaultData from './getDefaultData';
import useResumeData from './useResumeData';

import {
  ResumeData,
  ResumeDataWithOptionalIds,
  ResumeDataWithoutIds,
} from '@/types/resumeData';

function stripOfIds(data: ResumeData): ResumeDataWithoutIds {
  const newData: ResumeDataWithOptionalIds = structuredClone(data);

  newData.skills.frameworks.forEach((framework) => {
    delete framework.id;
  });

  newData.skills.languages.forEach((language) => {
    delete language.id;
  });

  newData.skills.tools.forEach((tool) => {
    delete tool.id;
  });

  newData.experience.jobs.forEach((job) => {
    delete job.id;

    job.bulletPoints.forEach((bullet) => {
      delete bullet.id;
    });
  });

  newData.projects.projects.forEach((project) => {
    delete project.id;

    project.bulletPoints.forEach((bullet) => {
      delete bullet.id;
    });
  });

  newData.education.degrees.forEach((degree) => {
    delete degree.id;

    degree.bulletPoints.forEach((bullet) => {
      delete bullet.id;
    });
  });

  return newData;
}

describe('useResumeData', () => {
  describe('clear', () => {
    it('should clear passed sections', async () => {
      const { result } = renderHook(() => useResumeData());

      await act(async () => {
        result.current.certificationsFunctions.updateCertifications(
          'certificates',
          'just some value',
        );

        result.current.clear('certifications');
      });

      expect(result.current.data.certifications).toEqual(
        getDefaultData('certifications'),
      );
    });
    describe('clearAll', () => {
      it('should clear all sections', async () => {
        const { result } = renderHook(() => useResumeData());

        await act(async () => {
          // Fills a section with random data.
          result.current.personalFunctions.updatePersonal(
            'address',
            'some string',
          );

          // Fills a section with random data.
          result.current.certificationsFunctions.updateCertifications(
            'skills',
            'some string',
          );

          result.current.clearAll();
        });

        expect(stripOfIds(result.current.data)).toEqual(
          stripOfIds(getDefaultData()),
        );
      });
    });
  });
});
