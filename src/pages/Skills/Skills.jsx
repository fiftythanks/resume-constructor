import React from 'react';

import BulletPoints from '@/components/BulletPoints';

export default function Skills({
  data,
  functions,
  updateScreenReaderAnnouncement,
}) {
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
