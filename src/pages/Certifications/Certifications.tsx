import type { ChangeEvent, RefObject } from 'react';

import useLastComponentBeforeTabpanel from '@/hooks/useLastComponentBeforeTabpanel';
import useResumeData from '@/hooks/useResumeData';

import type { Certifications } from '@/types/resumeData';
import type { ReadonlyDeep } from 'type-fest';

export interface CertificationsProps {
  data: ReadonlyDeep<Certifications>;
  functions: ReadonlyDeep<
    ReturnType<typeof useResumeData>['certificationsFunctions']
  >;
  ref: RefObject<HTMLElement | null>;
}

// The Certifications section form.
export default function Certifications({
  data,
  functions,
  ref,
}: CertificationsProps) {
  const {
    captureLastComponentBeforeTabpanel,
    focusLastComponentBeforeTabpanel,
  } = useLastComponentBeforeTabpanel('certifications');

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target as {
      name: 'certificates' | 'interests' | 'skills';
      value: string;
    };

    functions.updateCertifications(name, value);
  };

  return (
    <section
      aria-labelledby="certifications"
      className="section"
      id="certifications-tabpanel"
      ref={ref}
      role="tabpanel"
    >
      <form action="#" className="section--form">
        <ul className="section--list">
          <li className="section--list-item">
            <label className="section--field-label" htmlFor="certificates">
              Certificates
            </label>
            <textarea
              className="section--field section--field__textarea"
              id="certificates"
              name="certificates"
              placeholder="List any relevant certifications, e.g., AWS Certified Cloud Practitioner, Google IT Support Professional Certificate."
              value={data.certificates}
              onChange={handleInputChange}
              onFocus={(e) => captureLastComponentBeforeTabpanel(e)}
              onKeyDown={(e) => focusLastComponentBeforeTabpanel(e)}
            />
          </li>
          <li className="section--list-item">
            <label
              className="section--field-label"
              htmlFor="certifications-skills"
            >
              Skills
            </label>
            <textarea
              className="section--field section--field__textarea"
              id="certifications-skills"
              name="skills"
              placeholder="Highlight key skills not covered elsewhere, e.g., Strategic Planning, Problem Solving, Leadership, Teamwork."
              value={data.skills}
              onChange={handleInputChange}
            />
          </li>
          <li className="section--list-item">
            <label className="section--field-label" htmlFor="interests">
              Interests
            </label>
            <textarea
              className="section--field section--field__textarea"
              id="interests"
              name="interests"
              placeholder="Mention relevant interests that showcase personality or relate to the field, e.g., Open Source Contributions, Tech Meetups, Hiking."
              value={data.interests}
              onChange={handleInputChange}
            />
          </li>
        </ul>
      </form>
    </section>
  );
}
