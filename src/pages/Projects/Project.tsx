import React, { ChangeEvent } from 'react';

import BulletPoints from '@/components/BulletPoints';

import type { ProjectFunctions } from './Projects';
import type { Project } from '@/types/resumeData';
import type { ReadonlyDeep } from 'type-fest';

export interface ProjectProps {
  data: Project;
  functions: ProjectFunctions;
  updateScreenReaderAnnouncement: (announcement: string) => void;
}

export default function Project({
  data,
  functions,
  updateScreenReaderAnnouncement,
}: ReadonlyDeep<ProjectProps>) {
  function handleLinkChange(
    e: ChangeEvent<HTMLInputElement>,
    field: 'code' | 'demo',
    type: 'link' | 'text',
  ) {
    const { value } = e.target;
    functions.editLink(field, type, value);
  }

  function handleTextChange(e: ChangeEvent<HTMLInputElement>) {
    const { name: field, value } = e.target as {
      name: 'projectName' | 'stack';
      value: string;
    };

    functions.editText(field, value);
  }

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
            onChange={handleTextChange}
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
            onChange={handleTextChange}
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
            // TODO: as far as I understand, these names in code and demo inputs aren't used. Check if it's true and if so, delete them.
            name="codeText"
            placeholder="GitHub Repo"
            type="text"
            value={data.code.text}
            onChange={(e) => handleLinkChange(e, 'code', 'text')}
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
            placeholder="https://www.github.com/johndoe/TravelPlanner/"
            type="text"
            value={data.code.link}
            onChange={(e) => handleLinkChange(e, 'code', 'link')}
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
            value={data.demo.text}
            onChange={(e) => handleLinkChange(e, 'demo', 'text')}
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
            placeholder="https://john-doe-travel-planner.herokuapp.com/"
            type="text"
            value={data.demo.link}
            onChange={(e) => handleLinkChange(e, 'demo', 'link')}
          />
        </li>
      </ul>
    </>
  );
}
