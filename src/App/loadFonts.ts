import { Font } from '@react-pdf/renderer';

// TODO: don't forget to implement some logic that will import a particular font subset depending on the language of the resume. Or maybe just add Russian letters to the subset by default.
/**
 * They're of the TTF format by design. It brings much better performance
 * because WOFF is a compressed format, and the decompression takes a lot
 * of time for the `react-pdf`'s engine.
 */
import garamondBold from '@/assets/fonts/EBGaramond-Bold.ttf';
import garamondItalic from '@/assets/fonts/EBGaramond-Italic.ttf';
import garamondRegular from '@/assets/fonts/EBGaramond-Regular.ttf';

/**
 * Loads fonts for the PDF generation.
 */
export default function loadFonts() {
  Font.register({
    family: 'EBGaramond',
    fonts: [
      {
        src: garamondRegular,
        fontStyle: 'normal',
        fontWeight: 'normal',
      },
      {
        src: garamondItalic,
        fontStyle: 'italic',
        fontWeight: 'normal',
      },
      // Bold normal.
      {
        src: garamondBold,
        fontStyle: 'normal',
        fontWeight: 'bold',
      },
    ],
  });
}
