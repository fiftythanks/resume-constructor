import { act, renderHook } from '@testing-library/react';

import getDefaultData from './getDefaultData';
import useResumeData from './useResumeData';

import {
  ItemWithId,
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

  describe('certificationsFunctions', () => {
    describe('updateCertifications', () => {
      it('should update Certifications data', async () => {
        const { result } = renderHook(() => useResumeData());

        await act(async () => {
          result.current.certificationsFunctions.updateCertifications(
            'certificates',
            'some value',
          );
        });

        expect(result.current.data.certifications.certificates).toBe(
          'some value',
        );
      });
    });

    describe('clear', () => {
      it('should clear Certifications data', async () => {
        const { result } = renderHook(() => useResumeData());

        await act(async () => {
          result.current.certificationsFunctions.updateCertifications(
            'certificates',
            'some value',
          );

          result.current.certificationsFunctions.clear();
        });

        expect(result.current.data.certifications).toEqual(
          getDefaultData('certifications'),
        );
      });
    });
  });

  describe('educationFunctions', () => {
    describe('addDegree', () => {
      it('should add degrees', async () => {
        const { result } = renderHook(() => useResumeData());
        const { length: initialLength } = result.current.data.education.degrees;

        await act(async () => {
          result.current.educationFunctions.addDegree();
        });

        expect(
          result.current.data.education.degrees.length - initialLength,
        ).toBe(1);
      });

      it('should add new degrees to the end of the list', async () => {
        const { result } = renderHook(() => useResumeData());
        const degreeIds = new Set();

        if (result.current.data.education.degrees.length === 0) {
          await act(async () => {
            result.current.educationFunctions.addDegree();
            result.current.educationFunctions.addDegree();
            result.current.educationFunctions.addDegree();
          });
        }

        result.current.data.education.degrees.forEach((degree) => {
          degreeIds.add(degree.id);
        });

        await act(async () => {
          result.current.educationFunctions.addDegree();
        });

        const { id: lastDegreeId } =
          result.current.data.education.degrees.at(-1)!;

        expect(degreeIds.has(lastDegreeId)).toBe(false);
      });

      it('should add empty degrees', async () => {
        const { result } = renderHook(() => useResumeData());

        await act(async () => {
          result.current.educationFunctions.addDegree();
        });

        const newDegree = result.current.data.education.degrees.at(-1);

        expect(newDegree!.address).toBe('');
        expect(newDegree!.degree).toBe('');
        expect(newDegree!.graduation).toBe('');
        expect(newDegree!.uni).toBe('');

        newDegree!.bulletPoints.forEach((bullet) => {
          expect(bullet.value).toBe('');
        });
      });
    });

    describe('deleteDegree', () => {
      it('should delete degrees', async () => {
        const { result } = renderHook(() => useResumeData());

        if (result.current.data.education.degrees.length === 0) {
          await act(async () => {
            result.current.educationFunctions.addDegree();
          });
        }

        const { length: initialLength } = result.current.data.education.degrees;

        await act(async () => {
          result.current.educationFunctions.deleteDegree(0);
        });

        expect(
          initialLength - result.current.data.education.degrees.length,
        ).toBe(1);
      });

      it('should delete correct degrees', async () => {
        const { result } = renderHook(() => useResumeData());

        if (result.current.data.education.degrees.length <= 1) {
          while (result.current.data.education.degrees.length <= 1) {
            await act(async () => {
              result.current.educationFunctions.addDegree();
            });
          }
        }

        const { id: deletedDegreeId } =
          result.current.data.education.degrees[0];

        await act(async () => {
          result.current.educationFunctions.deleteDegree(0);
        });

        const currentDegreesIds = new Set();

        result.current.data.education.degrees.forEach((degree) => {
          currentDegreesIds.add(degree.id);
        });

        expect(currentDegreesIds.has(deletedDegreeId)).toBe(false);
      });
    });

    describe('editDegree', () => {
      it('should edit degree data', async () => {
        const { result } = renderHook(() => useResumeData());

        if (result.current.data.education.degrees.length === 0) {
          await act(async () => {
            result.current.educationFunctions.addDegree();
          });
        }

        await act(async () => {
          result.current.educationFunctions.editDegree(
            0,
            'address',
            'some value',
          );
        });

        expect(result.current.data.education.degrees[0].address).toBe(
          'some value',
        );
      });
    });

    describe('showDegree', () => {
      it('should change shown degree index', async () => {
        const { result } = renderHook(() => useResumeData());

        if (result.current.data.education.degrees.length <= 1) {
          while (result.current.data.education.degrees.length <= 1) {
            await act(async () => {
              result.current.educationFunctions.addDegree();
            });
          }
        }

        const { shownDegreeIndex: initialShownDegreeIndex } =
          result.current.data.education;

        if (initialShownDegreeIndex === 0) {
          await act(async () => {
            result.current.educationFunctions.showDegree(1);
          });

          // It's too convenient and harmless here to not use it like that.
          // eslint-disable-next-line jest/no-conditional-expect
          expect(result.current.data.education.shownDegreeIndex).toBe(1);
        } else {
          await act(async () => {
            result.current.educationFunctions.showDegree(0);
          });

          // It's too convenient and harmless here to not use it like that.
          // eslint-disable-next-line jest/no-conditional-expect
          expect(result.current.data.education.shownDegreeIndex).toBe(0);
        }
      });
    });

    describe('updateBulletPoints', () => {
      it('should create new bullet points from passed argument', async () => {
        const { result } = renderHook(() => useResumeData());

        const newBulletPoints: ItemWithId[] = [
          {
            id: '1-2-3-4-5',
            value: 'random value',
          },
        ];

        if (result.current.data.education.degrees.length === 0) {
          result.current.educationFunctions.addDegree();
        }

        await act(async () => {
          result.current.educationFunctions.updateBulletPoints(
            0,
            newBulletPoints,
          );
        });

        expect(result.current.data.education.degrees[0].bulletPoints).toEqual(
          newBulletPoints,
        );
      });
    });

    describe('addBulletPoint', () => {
      it('should add bullet points', async () => {
        const { result } = renderHook(() => useResumeData());

        if (result.current.data.education.degrees.length === 0) {
          await act(async () => {
            result.current.educationFunctions.addDegree();
          });
        }

        const { length: initialLength } =
          result.current.data.education.degrees[0].bulletPoints;

        await act(async () => {
          result.current.educationFunctions.addBulletPoint(0);
        });

        expect(
          result.current.data.education.degrees[0].bulletPoints.length -
            initialLength,
        ).toBe(1);
      });

      it('should add a new bullet point to the end of the list', async () => {
        const { result } = renderHook(() => useResumeData());

        if (result.current.data.education.degrees.length === 0) {
          await act(async () => {
            result.current.educationFunctions.addDegree();
          });
        }

        if (result.current.data.education.degrees[0].bulletPoints.length <= 1) {
          while (
            result.current.data.education.degrees[0].bulletPoints.length <= 1
          ) {
            await act(async () => {
              result.current.educationFunctions.addBulletPoint(0);
            });
          }
        }

        const bulletIds = new Set();

        result.current.data.education.degrees[0].bulletPoints.forEach(
          (bullet) => {
            bulletIds.add(bullet.id);
          },
        );

        await act(async () => {
          result.current.educationFunctions.addBulletPoint(0);
        });

        const { id: lastBulletId } =
          result.current.data.education.degrees[0].bulletPoints.at(-1)!;

        expect(bulletIds.has(lastBulletId)).toBe(false);
      });

      it('should add a bullet point with an empty value', async () => {
        const { result } = renderHook(() => useResumeData());

        if (result.current.data.education.degrees.length === 0) {
          await act(async () => {
            result.current.educationFunctions.addDegree();
          });
        }

        await act(async () => {
          result.current.educationFunctions.addBulletPoint(0);
        });

        expect(
          result.current.data.education.degrees[0].bulletPoints.at(-1)!.value,
        ).toBe('');
      });
    });

    describe('deleteBulletPoint', () => {
      it('should delete bullet points', async () => {
        const { result } = renderHook(() => useResumeData());

        if (result.current.data.education.degrees.length === 0) {
          await act(async () => {
            result.current.educationFunctions.addDegree();
          });
        }

        if (
          result.current.data.education.degrees[0].bulletPoints.length === 0
        ) {
          await act(async () => {
            result.current.educationFunctions.addBulletPoint(0);
          });
        }

        const { length: initialLength } =
          result.current.data.education.degrees[0].bulletPoints;

        await act(async () => {
          result.current.educationFunctions.deleteBulletPoint(0, 0);
        });

        expect(
          initialLength -
            result.current.data.education.degrees[0].bulletPoints.length,
        ).toBe(1);
      });

      it('should delete correct bullet points', async () => {
        const { result } = renderHook(() => useResumeData());

        if (result.current.data.education.degrees.length === 0) {
          await act(async () => {
            result.current.educationFunctions.addDegree();
          });
        }

        if (result.current.data.education.degrees[0].bulletPoints.length <= 1) {
          while (
            result.current.data.education.degrees[0].bulletPoints.length <= 1
          ) {
            await act(async () => {
              result.current.educationFunctions.addBulletPoint(0);
            });
          }
        }

        const { id: deletedBulletId } =
          result.current.data.education.degrees[0].bulletPoints[0];

        await act(async () => {
          result.current.educationFunctions.deleteBulletPoint(0, 0);
        });

        const currentBulletsIds = new Set();

        result.current.data.education.degrees[0].bulletPoints.forEach(
          (bullet) => {
            currentBulletsIds.add(bullet.id);
          },
        );

        expect(currentBulletsIds.has(deletedBulletId)).toBe(false);
      });
    });

    describe('editBulletPoint', () => {
      it('should edit bullet points, including their IDs', async () => {
        const { result } = renderHook(() => useResumeData());

        if (result.current.data.education.degrees.length === 0) {
          await act(async () => {
            result.current.educationFunctions.addDegree();
          });
        }

        if (
          result.current.data.education.degrees[0].bulletPoints.length === 0
        ) {
          await act(async () => {
            result.current.educationFunctions.addBulletPoint(0);
          });
        }

        const newBulletPointObject: ItemWithId = {
          id: '1-2-3-4-5',
          value: 'some value',
        };

        await act(async () => {
          result.current.educationFunctions.editBulletPoint(
            0,
            0,
            newBulletPointObject,
          );
        });

        expect(
          result.current.data.education.degrees[0].bulletPoints[0],
        ).toEqual(newBulletPointObject);
      });
    });

    describe('clear', () => {
      it('should clear Education data, resetting it to defaults', async () => {
        const { result } = renderHook(() => useResumeData());

        await act(async () => {
          result.current.educationFunctions.addDegree();
          result.current.educationFunctions.addDegree();
          result.current.educationFunctions.addDegree();
          result.current.educationFunctions.addDegree();
          result.current.educationFunctions.addDegree();
        });

        await act(async () => {
          result.current.educationFunctions.addBulletPoint(4);
          result.current.educationFunctions.addBulletPoint(4);
          result.current.educationFunctions.addBulletPoint(4);
          result.current.educationFunctions.addBulletPoint(1);
          result.current.educationFunctions.addBulletPoint(2);
        });

        await act(async () => {
          result.current.educationFunctions.clear();
        });

        expect(stripOfIds(result.current.data)).toEqual(
          stripOfIds(getDefaultData()),
        );
      });
    });
  });

  describe('experienceFunctions', () => {
    describe('addJob', () => {
      it('should add jobs', async () => {
        const { result } = renderHook(() => useResumeData());
        const { length: initialLength } = result.current.data.experience.jobs;

        await act(async () => {
          result.current.experienceFunctions.addJob();
        });

        expect(result.current.data.experience.jobs.length - initialLength).toBe(
          1,
        );
      });

      it('should add a new job to the end of the list', async () => {
        const { result } = renderHook(() => useResumeData());

        if (result.current.data.experience.jobs.length <= 1) {
          while (result.current.data.experience.jobs.length <= 1) {
            await act(async () => {
              result.current.experienceFunctions.addJob();
            });
          }
        }

        const jobIds = new Set();

        result.current.data.experience.jobs.forEach((job) => {
          jobIds.add(job.id);
        });

        await act(async () => {
          result.current.experienceFunctions.addJob();
        });

        const lastJobId = result.current.data.experience.jobs.at(-1);

        expect(jobIds.has(lastJobId)).toBe(false);
      });

      it('should add an empty job', async () => {
        const { result } = renderHook(() => useResumeData());

        await act(async () => {
          result.current.experienceFunctions.addJob();
        });

        const job = result.current.data.experience.jobs.at(-1)!;

        expect(job.address).toBe('');
        expect(job.companyName).toBe('');
        expect(job.duration).toBe('');
        expect(job.jobTitle).toBe('');

        job.bulletPoints.forEach((bullet) => {
          expect(bullet.value).toBe('');
        });
      });
    });

    describe('deleteJob', () => {
      it('should delete jobs', async () => {
        const { result } = renderHook(() => useResumeData());

        if (result.current.data.experience.jobs.length === 0) {
          await act(async () => {
            result.current.experienceFunctions.addJob();
          });
        }

        const { length: initialLength } = result.current.data.experience.jobs;

        await act(async () => {
          result.current.experienceFunctions.deleteJob(0);
        });

        expect(initialLength - result.current.data.experience.jobs.length).toBe(
          1,
        );
      });

      it('should delete correct jobs', async () => {
        const { result } = renderHook(() => useResumeData());

        if (result.current.data.experience.jobs.length <= 1) {
          while (result.current.data.experience.jobs.length <= 1) {
            await act(async () => {
              result.current.experienceFunctions.addJob();
            });
          }
        }

        const { id: deletedJobId } = result.current.data.experience.jobs[0];

        await act(async () => {
          result.current.experienceFunctions.deleteJob(0);
        });

        const currentJobsIds = new Set();

        result.current.data.experience.jobs.forEach((job) => {
          currentJobsIds.add(job.id);
        });

        expect(currentJobsIds.has(deletedJobId)).toBe(false);
      });
    });

    describe('showJob', () => {
      it('should change shown job index', async () => {
        const { result } = renderHook(() => useResumeData());

        if (result.current.data.experience.jobs.length <= 1) {
          while (result.current.data.experience.jobs.length <= 1) {
            await act(async () => {
              result.current.experienceFunctions.addJob();
            });
          }
        }

        const { shownJobIndex: initialShownJobIndex } =
          result.current.data.experience;

        if (initialShownJobIndex === 0) {
          await act(async () => {
            result.current.experienceFunctions.showJob(1);
          });

          // It's too convenient and harmless here to not use it like that.
          // eslint-disable-next-line jest/no-conditional-expect
          expect(result.current.data.experience.shownJobIndex).toBe(1);
        } else {
          await act(async () => {
            result.current.experienceFunctions.showJob(0);
          });

          // It's too convenient and harmless here to not use it like that.
          // eslint-disable-next-line jest/no-conditional-expect
          expect(result.current.data.experience.shownJobIndex).toBe(0);
        }
      });
    });

    describe('addBulletPoint', () => {
      it('should add bullet points', async () => {
        const { result } = renderHook(() => useResumeData());

        if (result.current.data.experience.jobs.length === 0) {
          await act(async () => {
            result.current.experienceFunctions.addJob();
          });
        }

        const { length: initialLength } =
          result.current.data.experience.jobs[0].bulletPoints;

        await act(async () => {
          result.current.experienceFunctions.addBulletPoint(0);
        });

        expect(
          result.current.data.experience.jobs[0].bulletPoints.length -
            initialLength,
        ).toBe(1);
      });

      it('should add a new bullet point to the end of the list', async () => {
        const { result } = renderHook(() => useResumeData());

        if (result.current.data.experience.jobs.length === 0) {
          await act(async () => {
            result.current.experienceFunctions.addJob();
          });
        }

        if (result.current.data.experience.jobs[0].bulletPoints.length <= 1) {
          while (
            result.current.data.experience.jobs[0].bulletPoints.length <= 1
          ) {
            await act(async () => {
              result.current.experienceFunctions.addBulletPoint(0);
            });
          }
        }

        const bulletIds = new Set();

        result.current.data.experience.jobs[0].bulletPoints.forEach(
          (bullet) => {
            bulletIds.add(bullet.id);
          },
        );

        await act(async () => {
          result.current.experienceFunctions.addBulletPoint(0);
        });

        const { id: lastBulletId } =
          result.current.data.experience.jobs[0].bulletPoints.at(-1)!;

        expect(bulletIds.has(lastBulletId)).toBe(false);
      });

      it('should add a bullet point with an empty value', async () => {
        const { result } = renderHook(() => useResumeData());

        if (result.current.data.experience.jobs.length === 0) {
          await act(async () => {
            result.current.experienceFunctions.addJob();
          });
        }

        await act(async () => {
          result.current.experienceFunctions.addBulletPoint(0);
        });

        expect(
          result.current.data.experience.jobs[0].bulletPoints.at(-1)!.value,
        ).toBe('');
      });
    });

    describe('editJob', () => {
      it('should edit job data', async () => {
        const { result } = renderHook(() => useResumeData());

        if (result.current.data.experience.jobs.length === 0) {
          await act(async () => {
            result.current.experienceFunctions.addJob();
          });
        }

        await act(async () => {
          result.current.experienceFunctions.editJob(
            0,
            'address',
            'some value',
          );
        });

        expect(result.current.data.experience.jobs[0].address).toBe(
          'some value',
        );
      });
    });

    describe('updateBulletPoints', () => {
      it('should create new bullet points from passed argument', async () => {
        const { result } = renderHook(() => useResumeData());

        const newBulletPoints: ItemWithId[] = [
          {
            id: '1-2-3-4-5',
            value: 'random value',
          },
        ];

        if (result.current.data.experience.jobs.length === 0) {
          result.current.experienceFunctions.addJob();
        }

        await act(async () => {
          result.current.experienceFunctions.updateBulletPoints(
            0,
            newBulletPoints,
          );
        });

        expect(result.current.data.experience.jobs[0].bulletPoints).toEqual(
          newBulletPoints,
        );
      });
    });

    describe('deleteBulletPoint', () => {
      it('should delete bullet points', async () => {
        const { result } = renderHook(() => useResumeData());

        if (result.current.data.experience.jobs.length === 0) {
          await act(async () => {
            result.current.experienceFunctions.addJob();
          });
        }

        if (result.current.data.experience.jobs[0].bulletPoints.length === 0) {
          await act(async () => {
            result.current.experienceFunctions.addBulletPoint(0);
          });
        }

        const { length: initialLength } =
          result.current.data.experience.jobs[0].bulletPoints;

        await act(async () => {
          result.current.experienceFunctions.deleteBulletPoint(0, 0);
        });

        expect(
          initialLength -
            result.current.data.experience.jobs[0].bulletPoints.length,
        ).toBe(1);
      });

      it('should delete correct bullet points', async () => {
        const { result } = renderHook(() => useResumeData());

        if (result.current.data.experience.jobs.length === 0) {
          await act(async () => {
            result.current.experienceFunctions.addJob();
          });
        }

        if (result.current.data.experience.jobs[0].bulletPoints.length <= 1) {
          while (
            result.current.data.experience.jobs[0].bulletPoints.length <= 1
          ) {
            await act(async () => {
              result.current.experienceFunctions.addBulletPoint(0);
            });
          }
        }

        const { id: deletedBulletId } =
          result.current.data.experience.jobs[0].bulletPoints[0];

        await act(async () => {
          result.current.experienceFunctions.deleteBulletPoint(0, 0);
        });

        const currentBulletsIds = new Set();

        result.current.data.experience.jobs[0].bulletPoints.forEach(
          (bullet) => {
            currentBulletsIds.add(bullet.id);
          },
        );

        expect(currentBulletsIds.has(deletedBulletId)).toBe(false);
      });
    });

    describe('editBulletPoint', () => {
      it('should edit bullet points, including their IDs', async () => {
        const { result } = renderHook(() => useResumeData());

        if (result.current.data.experience.jobs.length === 0) {
          await act(async () => {
            result.current.experienceFunctions.addJob();
          });
        }

        if (result.current.data.experience.jobs[0].bulletPoints.length === 0) {
          await act(async () => {
            result.current.experienceFunctions.addBulletPoint(0);
          });
        }

        const newBulletPointObject: ItemWithId = {
          id: '1-2-3-4-5',
          value: 'some value',
        };

        await act(async () => {
          result.current.experienceFunctions.editBulletPoint(
            0,
            0,
            newBulletPointObject,
          );
        });

        expect(result.current.data.experience.jobs[0].bulletPoints[0]).toEqual(
          newBulletPointObject,
        );
      });
    });

    describe('clear', () => {
      it('should clear Experience data, resetting it to defaults', async () => {
        const { result } = renderHook(() => useResumeData());

        await act(async () => {
          result.current.experienceFunctions.addJob();
          result.current.experienceFunctions.addJob();
          result.current.experienceFunctions.addJob();
          result.current.experienceFunctions.addJob();
          result.current.experienceFunctions.addJob();
        });

        await act(async () => {
          result.current.experienceFunctions.addBulletPoint(4);
          result.current.experienceFunctions.addBulletPoint(4);
          result.current.experienceFunctions.addBulletPoint(4);
          result.current.experienceFunctions.addBulletPoint(1);
          result.current.experienceFunctions.addBulletPoint(2);
        });

        await act(async () => {
          result.current.experienceFunctions.clear();
        });

        expect(stripOfIds(result.current.data)).toEqual(
          stripOfIds(getDefaultData()),
        );
      });
    });
  });

  describe('linksFunctions', () => {
    describe('updateLinks', () => {
      it('should change Links data', async () => {
        const { result } = renderHook(() => useResumeData());

        await act(async () => {
          result.current.linksFunctions.updateLinks(
            'github',
            'text',
            'some value',
          );
        });

        expect(result.current.data.links.github.text).toBe('some value');
      });
    });

    describe('clear', () => {
      it('should clear Links data', async () => {
        const { result } = renderHook(() => useResumeData());

        await act(async () => {
          result.current.linksFunctions.updateLinks(
            'github',
            'text',
            'some value',
          );

          result.current.linksFunctions.updateLinks(
            'linkedin',
            'link',
            'some link value',
          );
        });

        await act(async () => {
          result.current.linksFunctions.clear();
        });

        expect(result.current.data.links).toEqual(getDefaultData('links'));
      });
    });
  });
});
