import React from 'react';

// TODO: make it possible to reorder links.

// TODO: add an option of replacing icons with vertical bars for separation.

// ? Since the email is on the same line as the links, and since it's all the contents of one section, it's kind of strange to keep two different components for all of this info, `Personal` and `Links`. It's probably more reasonable to merge the components. As a bonus, the navbar will become lower and it will be easier to adapt the app for small screen sizes, like iPhone 5's.

export default function Links({ data, functions }) {
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    const [field, type] = name.split('-');

    functions.updateLinks(field, type, value);
  };

  return (
    <form
      action="#"
      aria-labelledby="links"
      className="section"
      id="links-tabpanel"
      role="tabpanel"
    >
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
            name="website-link"
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
            name="github-text"
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
            name="github-link"
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
            name="linkedin-text"
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
            name="linkedin-link"
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
            name="telegram-text"
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
            name="telegram-link"
            placeholder="https://t.me/johndoe/"
            type="text"
            value={data.telegramLink}
            onChange={handleInputChange}
          />
        </li>
      </ul>
    </form>
  );
}
