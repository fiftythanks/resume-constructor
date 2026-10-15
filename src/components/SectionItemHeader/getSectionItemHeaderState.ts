export type SectionItemName = 'Degree' | 'Job' | 'Project';

export type SectionItemHeaderModifier =
  | 'SectionItemHeader_fourButtons'
  | 'SectionItemHeader_oneButton'
  | 'SectionItemHeader_threeButtons'
  | undefined;

export interface SectionItemHeaderState {
  addAnnouncement: string;
  canDelete: boolean;
  canShowNext: boolean;
  canShowPrevious: boolean;
  deleteAnnouncement: string;
  headerModifier: SectionItemHeaderModifier;
  nextAnnouncement: string;
  previousAnnouncement: string;
}

/**
 * Computes the pure visibility flags, BEM layout modifier and screen-reader
 * announcement strings for `SectionItemHeader` from the current item position.
 *
 * @param itemName - Singular name of the collection item ("Degree", "Job" or "Project").
 * @param itemNumber - 1-based index of the currently displayed item.
 * @param itemsNumber - Total count of items in the collection.
 * @returns Derived flags, modifier class and live-region announcement strings.
 */
export default function getSectionItemHeaderState(
  itemName: SectionItemName,
  itemNumber: number,
  itemsNumber: number,
): SectionItemHeaderState {
  let headerModifier: SectionItemHeaderModifier;

  if (itemsNumber === 1) {
    headerModifier = 'SectionItemHeader_oneButton';
  } else if (
    itemsNumber > 1 &&
    (itemNumber === 1 || itemNumber === itemsNumber)
  ) {
    headerModifier = 'SectionItemHeader_threeButtons';
  } else if (
    itemsNumber > 2 &&
    itemNumber !== 1 &&
    itemNumber !== itemsNumber
  ) {
    headerModifier = 'SectionItemHeader_fourButtons';
  }

  return {
    addAnnouncement: `${itemName} ${itemsNumber + 1} was added`,
    canDelete: itemsNumber > 1,
    canShowNext: itemNumber < itemsNumber,
    canShowPrevious: itemNumber > 1,
    deleteAnnouncement: `${itemName} ${itemNumber} was deleted`,
    headerModifier,
    nextAnnouncement: `Showing ${itemName} ${itemNumber + 1}`,
    previousAnnouncement: `Showing ${itemName} ${itemNumber - 1}`,
  };
}
