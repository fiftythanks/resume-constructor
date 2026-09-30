import type { RefObject } from 'react';

import useLastComponentBeforeTabpanel from '@/hooks/useLastComponentBeforeTabpanel';
import useResumeData from '@/hooks/useResumeData';

import BulletPoints from '@/components/BulletPoints';

import type { Skills } from '@/types/resumeData';
import type { ReadonlyDeep } from 'type-fest';

export interface SkillsProps {
  data: ReadonlyDeep<Skills>;
  functions: ReadonlyDeep<ReturnType<typeof useResumeData>['skillsFunctions']>;
  ref: RefObject<HTMLElement | null>;
  updateScreenReaderAnnouncement: ReadonlyDeep<(announcement: string) => void>;
}

/**
 * The Technical Skills section form.
 */
export default function Skills({
  data,
  functions,
  ref,
  updateScreenReaderAnnouncement,
}: SkillsProps) {
  const { handleFocus, handleKeyboard } =
    useLastComponentBeforeTabpanel('skills');

  /**
   * Skills don't need to be bullet points. I'd say they must not be bullet
   * points at all. They are single-line. Why on earth are they bullet points?
   * It's strange and super redundant. For each line it should be a simple
   * input field, and that's all.
   *
   * TODO: switch to simple input fields from redundant bullet points.
   */
  return (
    <section
      aria-labelledby="skills"
      className="section"
      id="skills-tabpanel"
      ref={ref}
      role="tabpanel"
    >
      <form action="#" className="section--form section--form__bullet-points">
        <BulletPoints
          addItem={functions.addLanguage}
          data={data.languages}
          deleteItem={functions.deleteLanguage}
          editItem={functions.editLanguage}
          handleFocusOnFirstElement={handleFocus}
          handleKeyDownOnFirstElement={handleKeyboard}
          itemName="language"
          legend="Languages"
          name="language"
          updateData={(value) => functions.updateSkills('languages', value)}
          updateScreenReaderAnnouncement={updateScreenReaderAnnouncement}
        />
        <BulletPoints
          addItem={functions.addFramework}
          data={data.frameworks}
          deleteItem={functions.deleteFramework}
          editItem={functions.editFramework}
          itemName="framework"
          legend="Frameworks, Libraries & Databases"
          name="framework"
          updateData={(value) => functions.updateSkills('frameworks', value)}
          updateScreenReaderAnnouncement={updateScreenReaderAnnouncement}
        />
        <BulletPoints
          addItem={functions.addTool}
          data={data.tools}
          deleteItem={functions.deleteTool}
          editItem={functions.editTool}
          itemName="tool"
          legend="Tools & Other Technologies"
          name="tool"
          updateData={(value) => functions.updateSkills('tools', value)}
          updateScreenReaderAnnouncement={updateScreenReaderAnnouncement}
        />
      </form>
    </section>
  );
}
