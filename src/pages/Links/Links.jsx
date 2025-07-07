import React from 'react';

export default function Links({
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
      aria-labelledby="links"
      aria-owns="app-layout-heading links-tabpanel-form"
      className={`${className} section${isNavbarExpanded ? ` section__navbar-expanded` : ''}`}
      id="links-tabpanel"
      role="tabpanel"
      tabIndex={-1}
    >
      <form action="#" className="section--form" id="links-tabpanel-form">
        <ul className="section--list">
          <li className="section--list-item">
            <label className="section--field-label" htmlFor="website-text">
              Website (text)
            </label>
            <input
              className="section--field"
              id="website-text"
              name="websiteText"
              placeholder="johndoe.com"
              type="text"
              value={data.websiteText}
              onChange={handleInputChange}
            />
          </li>
          <li className="section--list-item">
            <label className="section--field-label" htmlFor="website-link">
              Website (link)
            </label>
            <input
              className="section--field"
              id="website-link"
              name="websiteLink"
              placeholder="https://johndoe.com/"
              type="text"
              value={data.websiteLink}
              onChange={handleInputChange}
            />
          </li>
          <li className="section--list-item">
            <label className="section--field-label" htmlFor="github-text">
              GitHub (text)
            </label>
            <input
              className="section--field"
              id="github-text"
              name="githubText"
              placeholder="github.com/johndoe"
              type="text"
              value={data.githubText}
              onChange={handleInputChange}
            />
          </li>
          <li className="section--list-item">
            <label className="section--field-label" htmlFor="github-link">
              GitHub (link)
            </label>
            <input
              className="section--field"
              id="github-link"
              name="githubLink"
              placeholder="https://github.com/johndoe/"
              type="text"
              value={data.githubLink}
              onChange={handleInputChange}
            />
          </li>
          <li className="section--list-item">
            <label className="section--field-label" htmlFor="linkedin-text">
              LinkedIn (text)
            </label>
            <input
              className="section--field"
              id="linkedin-text"
              name="linkedinText"
              placeholder="linkedin.com/johndoe"
              type="text"
              value={data.linkedinText}
              onChange={handleInputChange}
            />
          </li>
          <li className="section--list-item">
            <label className="section--field-label" htmlFor="linkedin-link">
              LinkedIn (link)
            </label>
            <input
              className="section--field"
              id="linkedin-link"
              name="linkedinLink"
              placeholder="https://linkedin.com/johndoe/"
              type="text"
              value={data.linkedinLink}
              onChange={handleInputChange}
            />
          </li>
          <li className="section--list-item">
            <label className="section--field-label" htmlFor="telegram-text">
              Telegram (text)
            </label>
            <input
              className="section--field"
              id="telegram-text"
              name="telegramText"
              placeholder="@johndoe"
              type="text"
              value={data.telegramText}
              onChange={handleInputChange}
            />
          </li>
          <li className="section--list-item">
            <label className="section--field-label" htmlFor="telegram-link">
              Telegram (link)
            </label>
            <input
              className="section--field"
              id="telegram-link"
              name="telegramLink"
              placeholder="https://t.me/johndoe/"
              type="text"
              value={data.telegramLink}
              onChange={handleInputChange}
            />
          </li>
        </ul>
      </form>
    </main>
  );
}
