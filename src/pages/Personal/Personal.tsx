import type { ChangeEvent, RefObject } from 'react';

import useLastComponentBeforeTabpanel from '@/hooks/useLastComponentBeforeTabpanel';
import useResumeData from '@/hooks/useResumeData';

import type { Personal } from '@/types/resumeData';
import type { ReadonlyDeep } from 'type-fest';

export interface PersonalProps {
  data: ReadonlyDeep<Personal>;
  functions: ReadonlyDeep<
    ReturnType<typeof useResumeData>['personalFunctions']
  >;
  ref: RefObject<HTMLElement | null>;
}

/**
 * The Personal Details section form.
 */
export default function Personal({ data, functions, ref }: PersonalProps) {
  const {
    captureLastComponentBeforeTabpanel: handleFocus,
    focusLastComponentBeforeTabpanel: handleKeyboard,
  } = useLastComponentBeforeTabpanel('personal');

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target as {
      name: 'address' | 'email' | 'fullName' | 'jobTitle' | 'phone' | 'summary';
      value: string;
    };

    functions.updatePersonal(name, value);
  };

  return (
    <section
      aria-labelledby="personal"
      className="section"
      id="personal-tabpanel"
      ref={ref}
      role="tabpanel"
    >
      <form action="#" className="section--form">
        <ul className="section--list">
          <li className="section--list-item">
            <label className="section--field-label" htmlFor="full-name">
              Full Name
            </label>
            <input
              className="section--field"
              data-testid="first-tabbable-personal"
              id="full-name"
              name="fullName"
              placeholder="John Doe"
              type="text"
              value={data.fullName}
              onChange={handleInputChange}
              onFocus={(e) => handleFocus(e)}
              onKeyDown={(e) => handleKeyboard(e)}
            />
          </li>
          <li className="section--list-item">
            <label className="section--field-label" htmlFor="job-title">
              Job Title
            </label>
            <input
              className="section--field"
              id="job-title"
              name="jobTitle"
              placeholder="Frontend Engineer"
              type="text"
              value={data.jobTitle}
              onChange={handleInputChange}
            />
          </li>
          <li className="section--list-item">
            <label className="section--field-label" htmlFor="email">
              Email
            </label>
            <input
              className="section--field"
              id="email"
              name="email"
              placeholder="john.doe@gmail.com"
              type="email"
              value={data.email}
              onChange={handleInputChange}
            />
          </li>
          <li className="section--list-item">
            <label className="section--field-label" htmlFor="phone">
              Phone
            </label>
            <input
              className="section--field"
              id="phone"
              name="phone"
              placeholder="+7 666 534-32-33"
              type="tel"
              value={data.phone}
              onChange={handleInputChange}
            />
          </li>
          <li className="section--list-item">
            <label className="section--field-label" htmlFor="address">
              Address
            </label>
            <input
              className="section--field"
              id="address"
              name="address"
              placeholder="Cool St, Cambridge"
              type="text"
              value={data.address}
              onChange={handleInputChange}
            />
          </li>
          <li className="section--list-item">
            <label
              className="section--field-label"
              htmlFor="personal-details-summary"
            >
              Summary
            </label>
            <textarea
              className="section--field section--field__textarea"
              id="personal-details-summary"
              name="summary"
              placeholder="Detail-oriented Frontend Engineer eager to create seamless user experiences."
              value={data.summary}
              onChange={handleInputChange}
            />
          </li>
        </ul>
      </form>
    </section>
  );
}
