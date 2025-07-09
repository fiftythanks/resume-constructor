import React from 'react';

export default function Certifications({ data, functions }) {
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    functions.updateCertifications(name, value);
  };

  return (
    <form
      action="#"
      aria-labelledby="certifications"
      className="section"
      id="certifications-tabpanel"
      role="tabpanel"
    >
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
          />
        </li>
        <li className="section--list-item">
          <label className="section--field-label" htmlFor="skills">
            Skills
          </label>
          <textarea
            className="section--field section--field__textarea"
            id="skills"
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
  );
}
