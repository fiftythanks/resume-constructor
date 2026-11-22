# Accessibility

WCAG 2.2 AA is the web target for the editor and preview interaction, not a claim of verified conformance. Accessible exported CVs are a future goal; see [Product](product.md).

On touch displays, touch targets must be at least 44 × 44 CSS px, regardless of viewport width. This project requirement is separate from the WCAG 2.2 AA minimum for pointer targets.

Preserve keyboard operability, meaningful labels, focus containment and restoration, and informative announcements. Choose live-region urgency for the interaction rather than making every announcement polite. Existing `tabbable` and drag-and-drop integration provide implementation context, not mandatory snippets. Initial drag feedback must not misleadingly announce an item as newly moved over itself; see `src/components/BulletPoints/bulletPointsDnd.ts`.

Export accessibility requires semantic structure and meaningful reading order, including the associations between headings, lists and their content. Selectable text, link annotations, metadata and PDF/A alone do not establish it. Web audits do not verify the exported document.

## Current export capability gap

A synthetic in-memory probe on 2026-11-14 used `@react-pdf/renderer` 4.9.0, `pdfjs-dist` 6.4.299 and Node v24.16.0. It rendered a visual heading, two list items and an example link, not an actual CV template. Renderer public inputs exposed metadata and links but not semantic heading/list tags; its PDFKit constructor did not enable tagged output. Underlying PDFKit capabilities do not establish renderer integration.

The corrected probe used `pdfjs-dist/legacy/build/pdf.mjs` and exited 0. The one-page output was 2,215 bytes, PDF 1.3, with title "Synthetic accessibility probe" and language `en-GB`. All four text strings were extracted and the `https://example.com/` annotation had subtype `Link` with `structParent: -1`. `MarkInfo` and the page structure tree were both `null`; there were no heading/list roles or structure-linked marked-content entries.

The default PDF.js entrypoint first failed with `hashOriginal.toHex is not a function` and a legacy-build warning; that failure was inconclusive. The corrected run emitted two warnings requesting `standardFontDataUrl`, so it supports no typography or layout conclusion.

This bounded finding establishes missing semantic structure in representative synthetic output, not universal impossibility of accessible PDFs, actual-template accessibility, PDF/UA conformance or screen-reader usability. Exported semantic accessibility remains an application gap. Reuse this evidence only while the versions and probe inputs are unchanged; application accessibility design and verification are separate work.
