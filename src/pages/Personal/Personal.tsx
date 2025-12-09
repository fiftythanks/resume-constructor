import React from 'react';
import type { ChangeEvent, RefObject } from 'react';

import useResumeData from '@/hooks/useResumeData';

import type { ReadonlyExcept } from '@/types/ReadonlyExcept';
import type { Personal } from '@/types/resumeData';

export interface PersonalProps {
  data: Personal;
  firstTabbable: RefObject<HTMLInputElement | null>;
  functions: ReturnType<typeof useResumeData>['personalFunctions'];
}

/**
 * The Personal Details section form.
 */
export default function Personal({
  data,
  firstTabbable,
  functions,
}: ReadonlyExcept<PersonalProps, 'firstTabbable'>) {
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
    <form
      action="#"
      aria-labelledby="personal"
      className="section"
      id="personal-tabpanel"
      role="tabpanel"
    >
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
            ref={firstTabbable}
            type="text"
            value={data.fullName}
            onChange={handleInputChange}
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
  );
}
