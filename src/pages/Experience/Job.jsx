import React from 'react';

import BulletPoints from '@/components/BulletPoints';

export default function Job({
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
          <label className="section--field-label" htmlFor="company-name">
            Company Name
          </label>
          <input
            className="section--field"
            id="company-name"
            name="companyName"
            placeholder="Google"
            type="text"
            value={data.companyName}
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
            placeholder="Senior Frontend Engineer"
            type="text"
            value={data.jobTitle}
            onChange={handleInputChange}
          />
        </li>
        <li className="section--list-item">
          <label className="section--field-label" htmlFor="job-duration">
            Duration
          </label>
          <input
            className="section--field"
            id="job-duration"
            name="duration"
            placeholder="Feb 2021 – Present"
            type="text"
            value={data.duration}
            onChange={handleInputChange}
          />
        </li>
        <li className="section--list-item">
          <label className="section--field-label" htmlFor="job-address">
            Address
          </label>
          <input
            className="section--field"
            id="job-address"
            name="address"
            placeholder="Mountain View, CA"
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
        name="job-bullet-points"
        placeholder1="Led a team of 10 developers in the successful design, development, and delivery of a scalable and high-performance SaaS platform, resulting in a 30% increase in user engagement and a 20% reduction in response time."
        placeholder2="Architected and implemented a microservices-based architecture using Node.js and Docker, resulting in a more flexible and maintainable system and enabling seamless integration with third-party services."
        placeholder3="Core responsibility #3. Pretend this is where they stop reading. First 3 things should be the most impressive"
        updateData={functions.updateBulletPoints}
        updateScreenReaderAnnouncement={updateScreenReaderAnnouncement}
      />
    </>
  );
}
