import React from 'react';

import BulletPoints from '@/components/BulletPoints';

export default function Degree({
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
          <label className="section--field-label" htmlFor="university-name">
            University Name
          </label>
          <input
            className="section--field"
            id="university-name"
            name="uni"
            placeholder="e.g. University of California, Berkeley"
            type="text"
            value={data.uni}
            onChange={handleInputChange}
          />
        </li>
        <li className="section--list-item">
          <label className="section--field-label" htmlFor="degree">
            Degree
          </label>
          <input
            className="section--field"
            id="degree"
            name="degree"
            placeholder="e.g. B.S. in Computer Science"
            type="text"
            value={data.degree}
            onChange={handleInputChange}
          />
        </li>
        <li className="section--list-item">
          <label className="section--field-label" htmlFor="graduation">
            Graduation
          </label>
          <input
            className="section--field"
            id="graduation"
            name="graduation"
            placeholder="e.g. May 2021"
            type="text"
            value={data.graduation}
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
            placeholder="e.g. Berkeley, CA, USA"
            type="text"
            value={data.address}
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
        name="degree-bullet-points"
        placeholder1="Relevant coursework: Data Structures, Algorithms, Web Development"
        placeholder2="Graduated with Honors, GPA: 3.8/4.0"
        placeholder3="Led a team project to build a React-based student portal"
        updateData={functions.updateBulletPoints}
        updateScreenReaderAnnouncement={updateScreenReaderAnnouncement}
      />
    </>
  );
}
