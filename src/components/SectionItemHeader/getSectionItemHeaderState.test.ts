import getSectionItemHeaderState from './getSectionItemHeaderState';

describe('getSectionItemHeaderState', () => {
  it('should enable only the Add action and apply the one-button modifier when there is a single item', () => {
    const state = getSectionItemHeaderState('Project', 1, 1);

    expect(state).toEqual({
      addAnnouncement: 'Project 2 was added',
      canDelete: false,
      canShowNext: false,
      canShowPrevious: false,
      deleteAnnouncement: 'Project 1 was deleted',
      headerModifier: 'SectionItemHeader_oneButton',
      nextAnnouncement: 'Showing Project 2',
      previousAnnouncement: 'Showing Project 0',
    });
  });

  it('should enable Next and Delete actions and apply the three-buttons modifier on the first item of a multi-item collection', () => {
    const state = getSectionItemHeaderState('Job', 1, 3);

    expect(state).toEqual({
      addAnnouncement: 'Job 4 was added',
      canDelete: true,
      canShowNext: true,
      canShowPrevious: false,
      deleteAnnouncement: 'Job 1 was deleted',
      headerModifier: 'SectionItemHeader_threeButtons',
      nextAnnouncement: 'Showing Job 2',
      previousAnnouncement: 'Showing Job 0',
    });
  });

  it('should enable Previous, Next and Delete actions and apply the four-buttons modifier on a middle item', () => {
    const state = getSectionItemHeaderState('Degree', 2, 3);

    expect(state).toEqual({
      addAnnouncement: 'Degree 4 was added',
      canDelete: true,
      canShowNext: true,
      canShowPrevious: true,
      deleteAnnouncement: 'Degree 2 was deleted',
      headerModifier: 'SectionItemHeader_fourButtons',
      nextAnnouncement: 'Showing Degree 3',
      previousAnnouncement: 'Showing Degree 1',
    });
  });

  it('should enable Previous and Delete actions and apply the three-buttons modifier on the final item of a multi-item collection', () => {
    const state = getSectionItemHeaderState('Project', 3, 3);

    expect(state).toEqual({
      addAnnouncement: 'Project 4 was added',
      canDelete: true,
      canShowNext: false,
      canShowPrevious: true,
      deleteAnnouncement: 'Project 3 was deleted',
      headerModifier: 'SectionItemHeader_threeButtons',
      nextAnnouncement: 'Showing Project 4',
      previousAnnouncement: 'Showing Project 2',
    });
  });

  it('should disable navigation and deletion controls when itemsNumber is 0', () => {
    const state = getSectionItemHeaderState('Project', 1, 0);

    expect(state).toEqual({
      addAnnouncement: 'Project 1 was added',
      canDelete: false,
      canShowNext: false,
      canShowPrevious: false,
      deleteAnnouncement: 'Project 1 was deleted',
      headerModifier: undefined,
      nextAnnouncement: 'Showing Project 2',
      previousAnnouncement: 'Showing Project 0',
    });
  });
});
