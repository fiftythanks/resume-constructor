import type { ChangeEvent, RefObject } from 'react';

import useLastComponentBeforeTabpanel from '@/hooks/useLastComponentBeforeTabpanel';
import useResumeData from '@/hooks/useResumeData';

import type { Links } from '@/types/resumeData';
import type { ReadonlyDeep } from 'type-fest';

// TODO: make it possible to reorder links.

// TODO: add an option of replacing icons with vertical bars for separation.

// DILEMMA: Since the email is on the same line as the links, and since it's all the contents of one section, it's kind of strange to keep two different components for all of this info, `Personal` and `Links`. It's probably more reasonable to merge the components. As a bonus, the navbar will become lower and it will be easier to adapt the app for small screen sizes, like iPhone 5's.

export interface LinksProps {
  data: ReadonlyDeep<Links>;
  functions: ReadonlyDeep<ReturnType<typeof useResumeData>['linksFunctions']>;
  ref: RefObject<HTMLElement | null>;
}

/**
 * The Links section form.
 */
export default function Links({ data, functions, ref }: LinksProps) {
  const { handleFocus, handleKeyboard } =
    useLastComponentBeforeTabpanel('links');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    const [field, type] = name.split('-') as [
      'github' | 'linkedin' | 'telegram' | 'website',
      'link' | 'text',
    ];

    functions.updateLinks(field, type, value);
  };

  return (
    <section
      aria-labelledby="links"
      className="section"
      id="links-tabpanel"
      ref={ref}
      role="tabpanel"
    >
      <form action="#" className="section--form">
        <ul className="section--list">
          <li className="section--list-item">
            <label className="section--field-label" htmlFor="website-text">
              Website (text)
            </label>
            <input
              className="section--field"
              data-testid="first-tabbable-links"
              id="website-text"
              name="website-text"
              placeholder="johndoe.com"
              type="text"
              value={data.website.text}
              onChange={handleInputChange}
              onFocus={(e) => handleFocus(e)}
              onKeyDown={(e) => handleKeyboard(e)}
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
              value={data.github.text}
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
              value={data.github.link}
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
              value={data.linkedin.text}
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
              value={data.linkedin.link}
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
              value={data.telegram.text}
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
              value={data.telegram.link}
              onChange={handleInputChange}
            />
          </li>
        </ul>
      </form>
    </section>
  );
}
