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
            name="universityName"
            type="text"
            value={data.universityName}
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
            /* TODO: add placeholder */
            name="degree"
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
        placeholder1="e.g., Relevant coursework, academic achievements, or thesis details."
        placeholder2=""
        placeholder3=""
        updateData={functions.updateBulletPoints}
        updateScreenReaderAnnouncement={updateScreenReaderAnnouncement}
      />
    </>
  );
}
