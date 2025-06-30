import React from 'react';

export default function Links({
  className,
  data,
  isNavbarExpanded = false,
  updateData,
}) {
  return (
    <main
      aria-labelledby="links"
      className={`${className} section${isNavbarExpanded ? ` section__navbar-expanded` : ''}`}
      id="links-tabpanel"
      tabIndex={-1}
    >
      <form action="#" className="section--form">
        <ul className="section--list">
          <li className="section--list-item">
            <label className="section--field-label" htmlFor="website-text">
              Website (text)
            </label>
            <input
              className="section--field"
              id="website-text"
              name="website-text"
              placeholder="johndoe.com"
              type="text"
              value={data.website.text}
              onChange={(e) => updateData('website', 'text', e.target.value)}
            />
          </li>
          <li className="section--list-item">
            <label className="section--field-label" htmlFor="website-link">
              Website (link)
            </label>
            <input
              className="section--field"
              id="website-link"
              name="website-link"
              placeholder="https://johndoe.com/"
              type="text"
              value={data.website.link}
              onChange={(e) => updateData('website', 'link', e.target.value)}
            />
          </li>
          <li className="section--list-item">
            <label className="section--field-label" htmlFor="github-text">
              GitHub (text)
            </label>
            <input
              className="section--field"
              id="github-text"
              name="github-text"
              placeholder="github.com/johndoe"
              type="text"
              value={data.github.text}
              onChange={(e) => updateData('github', 'text', e.target.value)}
            />
          </li>
          <li className="section--list-item">
            <label className="section--field-label" htmlFor="github-link">
              GitHub (link)
            </label>
            <input
              className="section--field"
              id="github-link"
              name="github-link"
              placeholder="https://github.com/johndoe/"
              type="text"
              value={data.github.link}
              onChange={(e) => updateData('github', 'link', e.target.value)}
            />
          </li>
          <li className="section--list-item">
            <label className="section--field-label" htmlFor="linkedin-text">
              LinkedIn (text)
            </label>
            <input
              className="section--field"
              id="linkedin-text"
              name="linkedin-text"
              placeholder="linkedin.com/johndoe"
              type="text"
              value={data.linkedin.text}
              onChange={(e) => updateData('linkedin', 'text', e.target.value)}
            />
          </li>
          <li className="section--list-item">
            <label className="section--field-label" htmlFor="linkedin-link">
              LinkedIn (link)
            </label>
            <input
              className="section--field"
              id="linkedin-link"
              name="linkedin-link"
              placeholder="https://linkedin.com/johndoe/"
              type="text"
              value={data.linkedin.link}
              onChange={(e) => updateData('linkedin', 'link', e.target.value)}
            />
          </li>
          <li className="section--list-item">
            <label className="section--field-label" htmlFor="telegram-text">
              Telegram (text)
            </label>
            <input
              className="section--field"
              id="telegram-text"
              name="telegram-text"
              placeholder="@johndoe"
              type="text"
              value={data.telegram.text}
              onChange={(e) => updateData('telegram', 'text', e.target.value)}
            />
          </li>
          <li className="section--list-item">
            <label className="section--field-label" htmlFor="telegram-link">
              Telegram (link)
            </label>
            <input
              className="section--field"
              id="telegram-link"
              name="telegram-link"
              placeholder="https://t.me/johndoe/"
              type="text"
              value={data.telegram.link}
              onChange={(e) => updateData('telegram', 'link', e.target.value)}
            />
          </li>
        </ul>
      </form>
    </main>
  );
}
