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
        placeholder1="Utilized Redux for state management to handle complex application data flow."
        placeholder2="Developed a user-friendly interface with React, focusing on accessibility and responsive design."
        placeholder3="Designed RESTful APIs using Node.js and Express to handle data persistence and retrieval."
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
            type="text"
            value={data.demoLink}
            onChange={handleInputChange}
          />
        </li>
      </ul>
    </>
  );
}
