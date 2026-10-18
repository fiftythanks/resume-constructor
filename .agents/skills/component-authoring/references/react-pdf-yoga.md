# Yoga Flexbox Layout Guidelines for `@react-pdf/renderer`

This reference documents the styling rules, layout constraints and supported properties when authoring PDF documents with `@react-pdf/renderer` in `ResumeDocument.tsx`.

---

## 1. Yoga Flexbox Engine Fundamentals

`@react-pdf/renderer` calculates layouts using Facebook's Yoga engine — a C++ implementation of Flexbox. Yoga does not implement standard web CSS; it only implements a subset of Flexbox rules.

### Core Engine Differences from Web CSS

1. **Default Display Model:**
   - Every `<View>` and `<Page>` has `display: 'flex'` by default.
   - The default `flexDirection` is `'column'` (same as React Native, unlike web browser CSS which defaults to `'row'`).
2. **Dimension Defaults:**
   - Dimensions default to points (`pt`), where `72pt = 1in = 25.4mm`.
   - String values with units `'cm'`, `'mm'`, `'in'` or `'pt'` are supported (e.g. `paddingHorizontal: '1.25cm'`).
   - Percentage strings (e.g. `'100%'`, `'50%'`) are supported for widths and heights relative to the parent container.
3. **No Cascading Styles:**
   - Styles do not cascade automatically from parent `<View>` to child elements, except for font properties inherited by `<Text>` nodes inside other `<Text>` nodes.

---

## 2. Supported Flexbox Properties

| Property               | Allowed Values                                                                                  | Notes                                                       |
| :--------------------- | :---------------------------------------------------------------------------------------------- | :---------------------------------------------------------- |
| `display`              | `'flex'`, `'none'`                                                                              | Defaults to `'flex'`. No `'grid'`, `'inline'` or `'block'`. |
| `flexDirection`        | `'row'`, `'row-reverse'`, `'column'`, `'column-reverse'`                                        | Defaults to `'column'`.                                     |
| `flexWrap`             | `'nowrap'`, `'wrap'`, `'wrap-reverse'`                                                          | Use `'wrap'` for tag clouds or skill lists.                 |
| `justifyContent`       | `'flex-start'`, `'flex-end'`, `'center'`, `'space-between'`, `'space-around'`, `'space-evenly'` | Aligns along the main axis.                                 |
| `alignItems`           | `'flex-start'`, `'flex-end'`, `'center'`, `'stretch'`, `'baseline'`                             | Aligns along the cross axis.                                |
| `alignSelf`            | `'auto'`, `'flex-start'`, `'flex-end'`, `'center'`, `'stretch'`, `'baseline'`                   | Overrides parent `alignItems` on a single child.            |
| `flexGrow`             | `number` (e.g. `1`, `0`)                                                                        | Proportional growth factor.                                 |
| `flexShrink`           | `number` (e.g. `1`, `0`)                                                                        | Proportional shrink factor.                                 |
| `flexBasis`            | `number`, `'auto'`, string percentage                                                           | Initial size before distributing free space.                |
| `gap`                  | `number`, string with units                                                                     | Supported in modern `@react-pdf/renderer` releases.         |
| `rowGap` / `columnGap` | `number`, string with units                                                                     | Independent row and column gaps.                            |

---

## 3. Supported Box Model & Spacing Properties

- **Padding:** `padding`, `paddingTop`, `paddingRight`, `paddingBottom`, `paddingLeft`, `paddingHorizontal`, `paddingVertical`.
- **Margin:** `margin`, `marginTop`, `marginRight`, `marginBottom`, `marginLeft`, `marginHorizontal`, `marginVertical`. Negative margins are supported for micro-adjustments.
- **Borders:** `borderWidth`, `borderColor`, `borderStyle` (`'solid'`, `'dashed'`, `'dotted'`), `borderRadius`, plus side-specific variants (`borderTopWidth`, `borderTopColor`, etc.).
- **Positioning:** `position: 'absolute'` or `position: 'relative'`. For absolute elements, use `top`, `right`, `bottom`, `left`.

---

## 4. Unsupported Web CSS Features

The following web CSS capabilities do **not** exist in the Yoga engine and must never be used in `ResumeDocument.tsx` or related PDF subcomponents:

- **No CSS Grid:** `display: 'grid'`, `grid-template-columns`, `grid-template-rows` and `grid-gap` are unsupported. Use nested Flexbox rows instead.
- **No Responsive Queries:** `@media` and `@container` queries are ignored. PDF page dimensions are fixed (e.g. A4 or Letter).
- **No Modern Math Functions:** `clamp()`, `min()`, `max()` and `calc()` are unsupported. Use precalculated numbers.
- **No Viewport Units:** `vw`, `vh`, `cqw`, `cqh`, `vmin` and `vmax` are invalid.
- **No Floats or Clear:** `float` and `clear` do not exist.
- **No Pseudo-classes or Pseudo-elements:** `:hover`, `:focus`, `:active`, `::before` and `::after` are invalid.
- **No CSS Transitions or Animations:** PDFs are static documents; `@keyframes` and `transition` are unsupported.
- **No CSS Variables:** Custom properties (`var(--name)`) cannot be resolved. Use shared JavaScript constants for tokens.

---

## 5. Typical Layout Patterns

### Two-Column Header Row

```tsx
const styles = StyleSheet.create({
  headerRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  leftColumn: {
    flexGrow: 1,
  },
  rightColumn: {
    flexShrink: 0,
    alignItems: 'flex-end',
  },
});
```

### Inline Tag List with Wrap

```tsx
const styles = StyleSheet.create({
  tagList: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 3,
  },
  tagItem: {
    fontSize: 10,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderWidth: 0.5,
    borderColor: '#666666',
    borderRadius: 2,
  },
});
```
