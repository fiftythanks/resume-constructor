import React from 'react';

import BulletPoints from '@/components/BulletPoints';

export default function Skills({
  className,
  data,
  functions,
  isNavbarExpanded = false,
  updateScreenReaderAnnouncement,
}) {
  return (
    <main
      aria-labelledby="skills"
      aria-owns="app-layout-heading skills-tabpanel-form"
      className={`${className} section${isNavbarExpanded ? ` section__navbar-expanded` : ''}`}
      id="skills-tabpanel"
      role="tabpanel"
      tabIndex={-1}
    >
      <form
        action="#"
        className="section--form section--form__bullet-points"
        id="skills-tabpanel-form"
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
    </main>
  );
}
