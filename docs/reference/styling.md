# Styling

Retain SCSS. Component styles use React BEM: `BlockName-ElementName_modifierName_modifierValue`. Shared/global styles use traditional BEM: `block-name__element-name_modifier-name_modifier-value`.

Component size adaptation uses ancestor container queries. A size container does not query itself: establish containment on an ancestor of the element being adapted. Viewport-level layout belongs in `AppLayout`. Pointer, hover and user-preference media queries are a distinct permitted category, not viewport-size layout rules. Consider keyboard and reduced-motion behaviour alongside adaptation; see [Accessibility](accessibility.md).

Use silent `//` comments for Sass-only constructs such as variables, mixins and functions. Use block comments for native CSS constructs such as selectors, custom properties, keyframes and container queries.

Executable configuration owns property order and nesting limits; the existing styles establish theme-token locations. Consult those sources rather than maintaining parallel inventories here.
