import React from 'react';

import useAppState from '@/hooks/useAppState';
import useResumeData from '@/hooks/useResumeData';

import BulletPoints from '@/components/BulletPoints';

import type { Skills } from '@/types/resumeData';
import type { ReadonlyDeep } from 'type-fest';

export interface SkillsProps {
  data: Skills;
  functions: ReturnType<typeof useResumeData>['skillsFunctions'];

  updateScreenReaderAnnouncement: ReturnType<
    typeof useAppState
  >['updateScreenReaderAnnouncement'];
}

export default function Skills({
  data,
  functions,
  updateScreenReaderAnnouncement,
}: ReadonlyDeep<SkillsProps>) {
  // Skills don't need to be bullet points. I'd say they must not be bullet points at all. They are single-line. Why on earth are they bullet points? It's strange and super redundant. For each line it should be a simple input field, and that's all.
  // TODO: switch to simple input fields from redundant bullet points.
  return (
    <form
      action="#"
      aria-labelledby="skills"
      className="section section__bullet-points"
      id="skills-tabpanel"
      role="tabpanel"
    >
      <BulletPoints
        addItem={functions.addLanguage}
        data={data.languages}
        deleteItem={functions.deleteLanguage}
        editItem={functions.editLanguage}
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
        legend="Tools & Other Technologies"
        name="tool"
        updateData={(value) => functions.updateSkills('tools', value)}
        updateScreenReaderAnnouncement={updateScreenReaderAnnouncement}
      />
    </form>
  );
}
