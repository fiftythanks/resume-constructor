import React from 'react';

import BulletPoints from '@/components/BulletPoints';

export default function Project({
  data,
  functions,
  updateScreenReaderAnnouncement,
}) {
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    functions.edit(name, value);
  };

  return (
    <>
      <ul className="section--list">
        <li className="section--list-item">
          <label className="section--field-label" htmlFor="project-name">
            Project Name
          </label>
          <input
            className="section--field"
            id="project-name"
            name="projectName"
            placeholder="TravelPlanner"
            type="text"
            value={data.projectName}
            onChange={handleInputChange}
          />
        </li>
        <li className="section--list-item">
          <label className="section--field-label" htmlFor="stack">
            Tech Stack
          </label>
          <input
            className="section--field"
            id="stack"
            name="stack"
            placeholder="HTML, CSS, React, TypeScript, Redux, Bootstrap, Express.js, PostgreSQL"
            type="text"
            value={data.stack}
            onChange={handleInputChange}
          />
        </li>
      </ul>

      <BulletPoints
        legendCentralized
        addItem={functions.addBulletPoint}
        data={data.bulletPoints}
        deleteItem={functions.deleteBulletPoint}
        editItem={functions.editBulletPoint}
        legend="Bullet Points"
        name="project-bullet-points"
        placeholder1="Developed a user-friendly web application for travel planning, allowing users to create and manage their itineraries."
        placeholder2="Utilized Redux for state management, enabling efficient data flow and improved application performance."
        placeholder3="Designed RESTful APIs using Node.js and Express.js, facilitating data retrieval and storage from the PostgreSQL database."
        updateData={functions.updateBulletPoints}
        updateScreenReaderAnnouncement={updateScreenReaderAnnouncement}
      />

      <ul className="section--list">
        <li className="section--list-item">
          <label className="section--field-label" htmlFor="code-text">
            Code (text)
          </label>
          <input
            className="section--field"
            id="code-text"
            name="codeText"
            placeholder="GitHub Repo"
            type="text"
            value={data.codeText}
            onChange={handleInputChange}
          />
        </li>
        <li className="section--list-item">
          <label className="section--field-label" htmlFor="code-link">
            Code (link)
          </label>
          <input
            className="section--field"
            id="code-link"
            name="codeLink"
            placeholder="https://www.github.com/johndoe/TravelPlanner"
            type="text"
            value={data.codeLink}
            onChange={handleInputChange}
          />
        </li>
        <li className="section--list-item">
          <label className="section--field-label" htmlFor="demo-text">
            Demo (text)
          </label>
          <input
            className="section--field"
            id="demo-text"
            name="demoText"
            placeholder="Live Preview"
            type="text"
            value={data.demoText}
            onChange={handleInputChange}
          />
        </li>
        <li className="section--list-item">
          <label className="section--field-label" htmlFor="demo-link">
            Demo (link)
          </label>
          <input
            className="section--field"
            id="demo-link"
            name="demoLink"
            placeholder="https://john-doe-travel-planner.herokuapp.com"
            type="text"
            value={data.demoLink}
            onChange={handleInputChange}
          />
        </li>
      </ul>
    </>
  );
}
