import React from 'react';

import BulletPoints from '@/components/BulletPoints';

export default function Skills({
  className,
  data,
  functions,
  isNavbarExpanded = false,
}) {
  return (
    <main
      aria-labelledby="skills"
      className={`${className} section${isNavbarExpanded ? ` section__navbar-expanded` : ''}`}
      id="skills-tabpanel"
      tabIndex={-1}
    >
      <form action="#" className="section--form section--form__bullet-points">
        <BulletPoints
          addItem={functions.addLanguage}
          data={data.languages}
          deleteItem={functions.deleteLanguage}
          editItem={functions.editLanguage}
          legend="Languages"
          name="languages"
          updateData={(value) => functions.updateSkills('languages', value)}
        />
        <BulletPoints
          addItem={functions.addFramework}
          data={data.frameworks}
          deleteItem={functions.deleteFramework}
          editItem={functions.editFramework}
          legend="Frameworks, Libraries & Databases"
          name="frameworks"
          updateData={(value) => functions.updateSkills('frameworks', value)}
        />
        <BulletPoints
          addItem={functions.addTool}
          data={data.tools}
          deleteItem={functions.deleteTool}
          editItem={functions.editTool}
          legend="Tools & Other Technologies"
          name="tools"
          updateData={(value) => functions.updateSkills('tools', value)}
        />
      </form>
    </main>
  );
}
