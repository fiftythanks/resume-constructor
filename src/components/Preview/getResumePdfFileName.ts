/**
 * Sanitises the user's full name and formats a downloadable PDF filename.
 * Strips filesystem-reserved characters and trims surrounding whitespace.
 *
 * @param fullName - The applicant's full name from Personal Details.
 * @returns Formatted PDF file name (e.g. "john_doe_resume.pdf" or "resume.pdf").
 */
export default function getResumePdfFileName(fullName?: string): string {
  if (!fullName || fullName.trim() === '') {
    return 'resume.pdf';
  }

  // Strip characters reserved across standard filesystems (/, \, ?, %, *, :, |, ", <, > and ASCII control codes).
  const sanitisedName = Array.from(fullName)
    .map((char) => {
      const code = char.charCodeAt(0);

      if (code < 32 || '<>:"/\\|?*'.includes(char)) {
        return '';
      }

      return char.toLowerCase();
    })
    .join('')
    .trim()
    .replace(/\s+/g, '_');

  if (sanitisedName === '') {
    return 'resume.pdf';
  }

  return `${sanitisedName}_resume.pdf`;
}
