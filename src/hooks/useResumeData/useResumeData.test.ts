import { act, renderHook } from '@testing-library/react';

import getDefaultData from './getDefaultData';
import useResumeData from './useResumeData';

import type { WritableDraft } from 'immer';
import type { ReadonlyDeep } from 'type-fest';

import {
  ItemWithId,
  Project,
  ResumeData,
  ResumeDataWithOptionalIds,
  ResumeDataWithoutIds,
} from '@/types/resumeData';

function stripOfIds(data: ReadonlyDeep<ResumeData>): ResumeDataWithoutIds {
  const newData: ResumeDataWithOptionalIds = structuredClone(
    data,
  ) as WritableDraft<ResumeData>;

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

        await act(async () => {
          result.current.educationFunctions.editBulletPoint(0, 0, 'some value');
        });

        expect(
          result.current.data.education.degrees[0].bulletPoints[0].value,
        ).toBe('some value');
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

        await act(async () => {
          result.current.experienceFunctions.editBulletPoint(
            0,
            0,
            'some value',
          );
        });

        expect(
          result.current.data.experience.jobs[0].bulletPoints[0].value,
        ).toBe('some value');
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

  describe('personalFunctions', () => {
    describe('updatePersonal', () => {
      it('should change Personal data', async () => {
        const { result } = renderHook(() => useResumeData());

        await act(async () => {
          result.current.personalFunctions.updatePersonal(
            'address',
            'some value',
          );
        });

        expect(result.current.data.personal.address).toBe('some value');
      });
    });
  });

  describe('projectsFunctions', () => {
    describe('addProject', () => {
      it('should add projects', async () => {
        const { result } = renderHook(() => useResumeData());
        const { length: initialLength } = result.current.data.projects.projects;

        await act(async () => {
          result.current.projectsFunctions.addProject();
        });

        expect(
          result.current.data.projects.projects.length - initialLength,
        ).toBe(1);
      });

      it('should add a new project to the end of the list', async () => {
        const { result } = renderHook(() => useResumeData());

        if (result.current.data.projects.projects.length <= 1) {
          while (result.current.data.projects.projects.length <= 1) {
            await act(async () => {
              result.current.projectsFunctions.addProject();
            });
          }
        }

        const projectIds = new Set();

        result.current.data.projects.projects.forEach((project) => {
          projectIds.add(project.id);
        });

        await act(async () => {
          result.current.projectsFunctions.addProject();
        });

        const lastProjectId = result.current.data.projects.projects.at(-1);

        expect(projectIds.has(lastProjectId)).toBe(false);
      });

      it('should add an empty project', async () => {
        const { result } = renderHook(() => useResumeData());

        await act(async () => {
          result.current.projectsFunctions.addProject();
        });

        const project = result.current.data.projects.projects.at(-1)!;

        expect(project.code.link).toBe('');
        expect(project.code.text).toBe('');
        expect(project.demo.link).toBe('');
        expect(project.demo.text).toBe('');
        expect(project.projectName).toBe('');
        expect(project.stack).toBe('');

        project.bulletPoints.forEach((bullet) => {
          expect(bullet.value).toBe('');
        });
      });
    });

    describe('deleteProject', () => {
      it('should delete projects', async () => {
        const { result } = renderHook(() => useResumeData());

        if (result.current.data.projects.projects.length === 0) {
          await act(async () => {
            result.current.projectsFunctions.addProject();
          });
        }

        const { length: initialLength } = result.current.data.projects.projects;

        await act(async () => {
          result.current.projectsFunctions.deleteProject(0);
        });

        expect(
          initialLength - result.current.data.projects.projects.length,
        ).toBe(1);
      });

      it('should delete correct projects', async () => {
        const { result } = renderHook(() => useResumeData());

        if (result.current.data.projects.projects.length <= 1) {
          while (result.current.data.projects.projects.length <= 1) {
            await act(async () => {
              result.current.projectsFunctions.addProject();
            });
          }
        }

        const { id: deletedProjectId } =
          result.current.data.projects.projects[0];

        await act(async () => {
          result.current.projectsFunctions.deleteProject(0);
        });

        const currentProjectsIds = new Set();

        result.current.data.projects.projects.forEach((project) => {
          currentProjectsIds.add(project.id);
        });

        expect(currentProjectsIds.has(deletedProjectId)).toBe(false);
      });
    });

    describe('showProject', () => {
      it('should change shown project index', async () => {
        const { result } = renderHook(() => useResumeData());

        if (result.current.data.projects.projects.length <= 1) {
          while (result.current.data.projects.projects.length <= 1) {
            await act(async () => {
              result.current.projectsFunctions.addProject();
            });
          }
        }

        const { shownProjectIndex: initialShownProjectIndex } =
          result.current.data.projects;

        if (initialShownProjectIndex === 0) {
          await act(async () => {
            result.current.projectsFunctions.showProject(1);
          });

          // It's too convenient and harmless here to not use it like that.
          // eslint-disable-next-line jest/no-conditional-expect
          expect(result.current.data.projects.shownProjectIndex).toBe(1);
        } else {
          await act(async () => {
            result.current.projectsFunctions.showProject(0);
          });

          // It's too convenient and harmless here to not use it like that.
          // eslint-disable-next-line jest/no-conditional-expect
          expect(result.current.data.projects.shownProjectIndex).toBe(0);
        }
      });
    });

    describe('addBulletPoint', () => {
      it('should add bullet points', async () => {
        const { result } = renderHook(() => useResumeData());

        if (result.current.data.projects.projects.length === 0) {
          await act(async () => {
            result.current.projectsFunctions.addProject();
          });
        }

        const { length: initialLength } =
          result.current.data.projects.projects[0].bulletPoints;

        await act(async () => {
          result.current.projectsFunctions.addBulletPoint(0);
        });

        expect(
          result.current.data.projects.projects[0].bulletPoints.length -
            initialLength,
        ).toBe(1);
      });

      it('should add a new bullet point to the end of the list', async () => {
        const { result } = renderHook(() => useResumeData());

        if (result.current.data.projects.projects.length === 0) {
          await act(async () => {
            result.current.projectsFunctions.addProject();
          });
        }

        if (result.current.data.projects.projects[0].bulletPoints.length <= 1) {
          while (
            result.current.data.projects.projects[0].bulletPoints.length <= 1
          ) {
            await act(async () => {
              result.current.projectsFunctions.addBulletPoint(0);
            });
          }
        }

        const bulletIds = new Set();

        result.current.data.projects.projects[0].bulletPoints.forEach(
          (bullet) => {
            bulletIds.add(bullet.id);
          },
        );

        await act(async () => {
          result.current.projectsFunctions.addBulletPoint(0);
        });

        const { id: lastBulletId } =
          result.current.data.projects.projects[0].bulletPoints.at(-1)!;

        expect(bulletIds.has(lastBulletId)).toBe(false);
      });

      it('should add a bullet point with an empty value', async () => {
        const { result } = renderHook(() => useResumeData());

        if (result.current.data.projects.projects.length === 0) {
          await act(async () => {
            result.current.projectsFunctions.addProject();
          });
        }

        await act(async () => {
          result.current.projectsFunctions.addBulletPoint(0);
        });

        expect(
          result.current.data.projects.projects[0].bulletPoints.at(-1)!.value,
        ).toBe('');
      });
    });

    describe('editProject', () => {
      it('should edit project data', async () => {
        const { result } = renderHook(() => useResumeData());

        if (result.current.data.projects.projects.length === 0) {
          await act(async () => {
            result.current.projectsFunctions.addProject();
          });
        }

        const newCodeObject: Project['code'] = {
          link: 'some link',
          text: 'some text',
        };

        await act(async () => {
          result.current.projectsFunctions.editProject(
            0,
            'code',
            newCodeObject,
          );
        });

        expect(result.current.data.projects.projects[0].code).toEqual(
          newCodeObject,
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

        if (result.current.data.projects.projects.length === 0) {
          result.current.projectsFunctions.addProject();
        }

        await act(async () => {
          result.current.projectsFunctions.updateBulletPoints(
            0,
            newBulletPoints,
          );
        });

        expect(result.current.data.projects.projects[0].bulletPoints).toEqual(
          newBulletPoints,
        );
      });
    });

    describe('deleteBulletPoint', () => {
      it('should delete bullet points', async () => {
        const { result } = renderHook(() => useResumeData());

        if (result.current.data.projects.projects.length === 0) {
          await act(async () => {
            result.current.projectsFunctions.addProject();
          });
        }

        if (
          result.current.data.projects.projects[0].bulletPoints.length === 0
        ) {
          await act(async () => {
            result.current.projectsFunctions.addBulletPoint(0);
          });
        }

        const { length: initialLength } =
          result.current.data.projects.projects[0].bulletPoints;

        await act(async () => {
          result.current.projectsFunctions.deleteBulletPoint(0, 0);
        });

        expect(
          initialLength -
            result.current.data.projects.projects[0].bulletPoints.length,
        ).toBe(1);
      });

      it('should delete correct bullet points', async () => {
        const { result } = renderHook(() => useResumeData());

        if (result.current.data.projects.projects.length === 0) {
          await act(async () => {
            result.current.projectsFunctions.addProject();
          });
        }

        if (result.current.data.projects.projects[0].bulletPoints.length <= 1) {
          while (
            result.current.data.projects.projects[0].bulletPoints.length <= 1
          ) {
            await act(async () => {
              result.current.projectsFunctions.addBulletPoint(0);
            });
          }
        }

        const { id: deletedBulletId } =
          result.current.data.projects.projects[0].bulletPoints[0];

        await act(async () => {
          result.current.projectsFunctions.deleteBulletPoint(0, 0);
        });

        const currentBulletsIds = new Set();

        result.current.data.projects.projects[0].bulletPoints.forEach(
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

        if (result.current.data.projects.projects.length === 0) {
          await act(async () => {
            result.current.projectsFunctions.addProject();
          });
        }

        if (
          result.current.data.projects.projects[0].bulletPoints.length === 0
        ) {
          await act(async () => {
            result.current.projectsFunctions.addBulletPoint(0);
          });
        }

        await act(async () => {
          result.current.projectsFunctions.editBulletPoint(0, 0, 'some value');
        });

        expect(
          result.current.data.projects.projects[0].bulletPoints[0].value,
        ).toBe('some value');
      });
    });

    describe('clear', () => {
      it('should clear Projects data, resetting it to defaults', async () => {
        const { result } = renderHook(() => useResumeData());

        await act(async () => {
          result.current.projectsFunctions.addProject();
          result.current.projectsFunctions.addProject();
          result.current.projectsFunctions.addProject();
          result.current.projectsFunctions.addProject();
          result.current.projectsFunctions.addProject();
        });

        await act(async () => {
          result.current.projectsFunctions.addBulletPoint(4);
          result.current.projectsFunctions.addBulletPoint(4);
          result.current.projectsFunctions.addBulletPoint(4);
          result.current.projectsFunctions.addBulletPoint(1);
          result.current.projectsFunctions.addBulletPoint(2);
        });

        await act(async () => {
          result.current.projectsFunctions.clear();
        });

        expect(stripOfIds(result.current.data)).toEqual(
          stripOfIds(getDefaultData()),
        );
      });
    });
  });

  describe('skillsFunctions', () => {
    describe('updateSkills', () => {
      it('should replace Skills fields with passed objects', async () => {
        const { result } = renderHook(() => useResumeData());

        const newFrameworksObject: ItemWithId[] = [
          {
            id: '5-5-5-5-5',
            value: 'some framework',
          },
        ];

        await act(async () => {
          result.current.skillsFunctions.updateSkills(
            'frameworks',
            newFrameworksObject,
          );
        });

        expect(result.current.data.skills.frameworks).toEqual(
          newFrameworksObject,
        );
      });
    });

    describe('clear', () => {
      it('should clear Skills data', async () => {
        const { result } = renderHook(() => useResumeData());

        const newFrameworksObject: ItemWithId[] = [
          {
            id: '5-5-5-5-5',
            value: 'some framework',
          },
        ];

        await act(async () => {
          result.current.skillsFunctions.updateSkills(
            'frameworks',
            newFrameworksObject,
          );
        });

        await act(async () => {
          result.current.skillsFunctions.clear();
        });

        expect(stripOfIds(result.current.data)).toEqual(
          stripOfIds(getDefaultData()),
        );
      });
    });

    describe('addLanguage', () => {
      it('should add languages', async () => {
        const { result } = renderHook(() => useResumeData());
        const { length: initialLength } = result.current.data.skills.languages;

        await act(async () => {
          result.current.skillsFunctions.addLanguage();
        });

        expect(
          result.current.data.skills.languages.length - initialLength,
        ).toBe(1);
      });

      it('should add new languages to the end of the list', async () => {
        const { result } = renderHook(() => useResumeData());

        if (result.current.data.skills.languages.length <= 1) {
          while (result.current.data.skills.languages.length <= 1) {
            await act(async () => {
              result.current.skillsFunctions.addLanguage();
            });
          }
        }

        const initialLanguagesIds = new Set();

        result.current.data.skills.languages.forEach((language) => {
          initialLanguagesIds.add(language.id);
        });

        await act(async () => {
          result.current.skillsFunctions.addLanguage();
        });

        const { id: lastLanguageId } =
          result.current.data.skills.languages.at(-1)!;

        expect(initialLanguagesIds.has(lastLanguageId)).toBe(false);
      });

      it('should add empty languages', async () => {
        const { result } = renderHook(() => useResumeData());

        await act(async () => {
          result.current.skillsFunctions.addLanguage();
        });

        expect(result.current.data.skills.languages.at(-1)!.value).toBe('');
      });
    });

    describe('deleteLanguage', () => {
      it('should delete languages', async () => {
        const { result } = renderHook(() => useResumeData());

        if (result.current.data.skills.languages.length === 0) {
          await act(async () => {
            result.current.skillsFunctions.addLanguage();
          });
        }

        const { length: initialLength } = result.current.data.skills.languages;

        await act(async () => {
          result.current.skillsFunctions.deleteLanguage(0);
        });

        expect(
          initialLength - result.current.data.skills.languages.length,
        ).toBe(1);
      });

      it('should delete correct languages', async () => {
        const { result } = renderHook(() => useResumeData());

        if (result.current.data.skills.languages.length <= 1) {
          while (result.current.data.skills.languages.length <= 1) {
            await act(async () => {
              result.current.skillsFunctions.addLanguage();
            });
          }
        }

        const initialLanguagesIds = new Set();

        const { id: deletedLanguageId } =
          result.current.data.skills.languages[0];

        await act(async () => {
          result.current.skillsFunctions.deleteLanguage(0);
        });

        expect(initialLanguagesIds.has(deletedLanguageId)).toBe(false);
      });
    });

    describe('editLanguage', () => {
      it('should replace language object with passed object', async () => {
        const { result } = renderHook(() => useResumeData());

        if (result.current.data.skills.languages.length === 0) {
          await act(async () => {
            result.current.skillsFunctions.addLanguage();
          });
        }

        const newLanguageObject: ItemWithId = {
          id: '5-5-5-5-5',
          value: 'some language',
        };

        await act(async () => {
          result.current.skillsFunctions.editLanguage(0, newLanguageObject);
        });

        expect(result.current.data.skills.languages[0]).toEqual(
          newLanguageObject,
        );
      });
    });

    describe('addFramework', () => {
      it('should add frameworks', async () => {
        const { result } = renderHook(() => useResumeData());
        const { length: initialLength } = result.current.data.skills.frameworks;

        await act(async () => {
          result.current.skillsFunctions.addFramework();
        });

        expect(
          result.current.data.skills.frameworks.length - initialLength,
        ).toBe(1);
      });

      it('should add new frameworks to the end of the list', async () => {
        const { result } = renderHook(() => useResumeData());

        if (result.current.data.skills.frameworks.length <= 1) {
          while (result.current.data.skills.frameworks.length <= 1) {
            await act(async () => {
              result.current.skillsFunctions.addFramework();
            });
          }
        }

        const initialFrameworksIds = new Set();

        result.current.data.skills.frameworks.forEach((framework) => {
          initialFrameworksIds.add(framework.id);
        });

        await act(async () => {
          result.current.skillsFunctions.addFramework();
        });

        const { id: lastFrameworkId } =
          result.current.data.skills.frameworks.at(-1)!;

        expect(initialFrameworksIds.has(lastFrameworkId)).toBe(false);
      });

      it('should add empty frameworks', async () => {
        const { result } = renderHook(() => useResumeData());

        await act(async () => {
          result.current.skillsFunctions.addFramework();
        });

        expect(result.current.data.skills.frameworks.at(-1)!.value).toBe('');
      });
    });

    describe('deleteFramework', () => {
      it('should delete frameworks', async () => {
        const { result } = renderHook(() => useResumeData());

        if (result.current.data.skills.frameworks.length === 0) {
          await act(async () => {
            result.current.skillsFunctions.addFramework();
          });
        }

        const { length: initialLength } = result.current.data.skills.frameworks;

        await act(async () => {
          result.current.skillsFunctions.deleteFramework(0);
        });

        expect(
          initialLength - result.current.data.skills.frameworks.length,
        ).toBe(1);
      });

      it('should delete correct frameworks', async () => {
        const { result } = renderHook(() => useResumeData());

        if (result.current.data.skills.frameworks.length <= 1) {
          while (result.current.data.skills.frameworks.length <= 1) {
            await act(async () => {
              result.current.skillsFunctions.addFramework();
            });
          }
        }

        const initialFrameworksIds = new Set();

        const { id: deletedFrameworkId } =
          result.current.data.skills.frameworks[0];

        await act(async () => {
          result.current.skillsFunctions.deleteFramework(0);
        });

        expect(initialFrameworksIds.has(deletedFrameworkId)).toBe(false);
      });
    });

    describe('editFramework', () => {
      it('should replace framework object with passed object', async () => {
        const { result } = renderHook(() => useResumeData());

        if (result.current.data.skills.frameworks.length === 0) {
          await act(async () => {
            result.current.skillsFunctions.addFramework();
          });
        }

        const newFrameworkObject: ItemWithId = {
          id: '5-5-5-5-5',
          value: 'some framework',
        };

        await act(async () => {
          result.current.skillsFunctions.editFramework(0, newFrameworkObject);
        });

        expect(result.current.data.skills.frameworks[0]).toEqual(
          newFrameworkObject,
        );
      });
    });

    describe('addTool', () => {
      it('should add tools', async () => {
        const { result } = renderHook(() => useResumeData());
        const { length: initialLength } = result.current.data.skills.tools;

        await act(async () => {
          result.current.skillsFunctions.addTool();
        });

        expect(result.current.data.skills.tools.length - initialLength).toBe(1);
      });

      it('should add new tools to the end of the list', async () => {
        const { result } = renderHook(() => useResumeData());

        if (result.current.data.skills.tools.length <= 1) {
          while (result.current.data.skills.tools.length <= 1) {
            await act(async () => {
              result.current.skillsFunctions.addTool();
            });
          }
        }

        const initialToolsIds = new Set();

        result.current.data.skills.tools.forEach((tool) => {
          initialToolsIds.add(tool.id);
        });

        await act(async () => {
          result.current.skillsFunctions.addTool();
        });

        const { id: lastToolId } = result.current.data.skills.tools.at(-1)!;

        expect(initialToolsIds.has(lastToolId)).toBe(false);
      });

      it('should add empty tools', async () => {
        const { result } = renderHook(() => useResumeData());

        await act(async () => {
          result.current.skillsFunctions.addTool();
        });

        expect(result.current.data.skills.tools.at(-1)!.value).toBe('');
      });
    });

    describe('deleteTool', () => {
      it('should delete tools', async () => {
        const { result } = renderHook(() => useResumeData());

        if (result.current.data.skills.tools.length === 0) {
          await act(async () => {
            result.current.skillsFunctions.addTool();
          });
        }

        const { length: initialLength } = result.current.data.skills.tools;

        await act(async () => {
          result.current.skillsFunctions.deleteTool(0);
        });

        expect(initialLength - result.current.data.skills.tools.length).toBe(1);
      });

      it('should delete correct tools', async () => {
        const { result } = renderHook(() => useResumeData());

        if (result.current.data.skills.tools.length <= 1) {
          while (result.current.data.skills.tools.length <= 1) {
            await act(async () => {
              result.current.skillsFunctions.addTool();
            });
          }
        }

        const initialToolsIds = new Set();

        const { id: deletedToolId } = result.current.data.skills.tools[0];

        await act(async () => {
          result.current.skillsFunctions.deleteTool(0);
        });

        expect(initialToolsIds.has(deletedToolId)).toBe(false);
      });
    });

    describe('editTool', () => {
      it('should replace tool object with passed object', async () => {
        const { result } = renderHook(() => useResumeData());

        if (result.current.data.skills.tools.length === 0) {
          await act(async () => {
            result.current.skillsFunctions.addTool();
          });
        }

        const newToolObject: ItemWithId = {
          id: '5-5-5-5-5',
          value: 'some tool',
        };

        await act(async () => {
          result.current.skillsFunctions.editTool(0, newToolObject);
        });

        expect(result.current.data.skills.tools[0]).toEqual(newToolObject);
      });
    });
  });
});
