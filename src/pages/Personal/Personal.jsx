import React from 'react';

export default function Personal({ className, isNavbarExpanded = false }) {
  return (
    <main
      className={`${className} section${isNavbarExpanded ? ` section__navbar-expanded` : ''}`}
    >
      <form action="#" className="section--form">
        <ul className="section--list">
          <li className="section--list-item">
            <label className="section--field-label" htmlFor="full-name">
              <span className="section--label-text">Full Name</span>
              <input
                className="section--field"
                id="full-name"
                name="full-name"
                placeholder="John Doe"
                type="text"
              />
            </label>
          </li>
          <li className="section--list-item">
            <label className="section--field-label" htmlFor="job-title">
              <span className="section--label-text">Job Title</span>
              <input
                className="section--field"
                id="job-title"
                name="job-title"
                placeholder="Frontend Engineer"
                type="text"
              />
            </label>
          </li>
          <li className="section--list-item">
            <label className="section--field-label" htmlFor="email">
              <span className="section--label-text">Email</span>
              <input
                className="section--field"
                id="email"
                name="email"
                placeholder="john.doe@gmail.com"
                type="email"
              />
            </label>
          </li>
          <li className="section--list-item">
            <label className="section--field-label" htmlFor="phone">
              <span className="section--label-text">Phone</span>
              <input
                className="section--field"
                id="phone"
                name="phone"
                placeholder="+7 666 534-32-33"
                type="tel"
              />
            </label>
          </li>
          <li className="section--list-item">
            <label className="section--field-label" htmlFor="address">
              <span className="section--label-text">Address</span>
              <input
                className="section--field"
                id="address"
                name="address"
                placeholder="Cool St, Cambridge"
                type="text"
              />
            </label>
          </li>
          <li className="section--list-item">
            <label
              className="section--field-label"
              htmlFor="personal-details-summary"
            >
              <span className="section--label-text">Summary</span>
              <textarea
                className="section--field section--field__textarea"
                id="personal-details-summary"
                name="personal-details-summary"
                placeholder="Detail-oriented Frontend Engineer eager to create seamless user experiences."
              />
            </label>
          </li>
        </ul>
      </form>
    </main>
  );
}
