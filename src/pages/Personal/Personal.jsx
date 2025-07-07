import React from 'react';

export default function Personal({
  className,
  data,
  isNavbarExpanded = false,
  updateData,
}) {
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    updateData(name, value);
  };

  return (
    <main
      aria-labelledby="personal"
      aria-owns="app-layout-heading personal-tabpanel-form"
      className={`${className} section${isNavbarExpanded ? ` section__navbar-expanded` : ''}`}
      id="personal-tabpanel"
      role="tabpanel"
      tabIndex={-1}
    >
      <form action="#" className="section--form" id="personal-tabpanel-form">
        <ul className="section--list">
          <li className="section--list-item">
            <label className="section--field-label" htmlFor="full-name">
              Full Name
            </label>
            <input
              className="section--field"
              id="full-name"
              name="fullName"
              placeholder="John Doe"
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
    </main>
  );
}
