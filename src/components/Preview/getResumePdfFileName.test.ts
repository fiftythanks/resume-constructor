import getResumePdfFileName from './getResumePdfFileName';

describe('getResumePdfFileName', () => {
  it('should return "resume.pdf" when full name is an empty string', () => {
    const fullName = '';

    const result = getResumePdfFileName(fullName);

    expect(result).toBe('resume.pdf');
  });

  it('should return "resume.pdf" when full name contains only whitespace', () => {
    const fullName = '   \t\n  ';

    const result = getResumePdfFileName(fullName);

    expect(result).toBe('resume.pdf');
  });

  it('should format valid full name as "<first name>_<second name>_resume.pdf"', () => {
    const fullName = 'John Doe';

    const result = getResumePdfFileName(fullName);

    expect(result).toBe('john_doe_resume.pdf');
  });

  it('should trim surrounding whitespace from the full name', () => {
    const fullName = '   Ada Lovelace   ';

    const result = getResumePdfFileName(fullName);

    expect(result).toBe('ada_lovelace_resume.pdf');
  });

  it('should strip invalid filesystem characters from the file name', () => {
    const fullName = 'Jane: Doe / Senior <Dev>?';

    const result = getResumePdfFileName(fullName);

    expect(result).toBe('jane_doe_senior_dev_resume.pdf');
  });

  it('should collapse consecutive whitespace resulting from stripped characters', () => {
    const fullName = 'Alan   Turing';

    const result = getResumePdfFileName(fullName);

    expect(result).toBe('alan_turing_resume.pdf');
  });

  it('should return "resume.pdf" if full name contains only invalid characters', () => {
    const fullName = '<>:"/\\|?*';

    const result = getResumePdfFileName(fullName);

    expect(result).toBe('resume.pdf');
  });
});
