import React from 'react';

export default function Certifications({
  className,
  data,
  isNavbarExpanded = false,
  functions,
}) {
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    functions.updateCertifications(name, value);
  };

  return (
    <main
      aria-labelledby="certifications"
      aria-owns="app-layout-heading certifications-tabpanel-form"
      className={`${className} section${isNavbarExpanded ? ` section__navbar-expanded` : ''}`}
      id="certifications-tabpanel"
      role="tabpanel"
      tabIndex={-1}
    >
      <form
        action="#"
        className="section--form"
        id="certifications-tabpanel-form"
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
    </main>
  );
}
