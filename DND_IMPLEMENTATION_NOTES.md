# Why Drag-and-Drop Looks Broken in Variable-Width Grids — and Why AI Consistently Gets It Wrong

---

## 1. What "Ugly" Actually Means: Diagnosing the Visual Failure

When a user drags a widget in this dashboard and the layout convulses — items jumping to wrong positions, displaced widgets teleporting, the dragged item shaking or snapping erratically — it is tempting to describe the problem as a "styling issue." It is not. It is an **architectural mismatch** between two systems that each believe they own the layout.

The two systems in conflict are:

- **CSS Grid**, the browser's layout engine, which positions elements based on declared column spans and auto-placement rules.
- **@dnd-kit**, the drag-and-drop library, which positions displaced elements using CSS `transform: translate(x, y)` — calculated based on measured DOM rectangles.

These two systems do not speak to each other. When they diverge, the result looks broken.

---

## 2. The Two Specific Bugs in This Implementation

### Bug 1: `useSortable` is attached to the wrong DOM node

In the current implementation, `useSortable` is called inside `WidgetWrapper`. This hook returns a `setNodeRef` callback and a CSS `transform` value that should be applied to **the element dnd-kit treats as the sortable item**.

The `setNodeRef` is applied to the inner card div — the `rounded-2xl bg-card` element. But the element that CSS Grid actually positions is the **outer wrapper div** in `DashboardGrid`, the one with `style={{ gridColumn: "span N / span N" }}`.

This creates a split identity:

```
DashboardGrid
└── <div style="gridColumn: span 8">   ← CSS Grid positions THIS
    └── WidgetWrapper
        └── <div ref={setNodeRef} style={transform}>  ← dnd-kit owns THIS
```

dnd-kit measures the inner card to calculate where items should move. It applies a `translateX / translateY` to the inner card. But the CSS Grid is still positioning based on the outer div's column span, untouched. The result is that the card visually translates away from its grid cell during drag, appearing to float independently of the layout. Displaced items, meanwhile, receive transforms calculated against the inner card positions — not the grid cell positions — so they translate to wrong coordinates.

**The fix**: `setNodeRef` and the CSS transform must be applied to the outermost element that CSS Grid positions — i.e., the grid cell div. This means `useSortable` should be called at the `DashboardGrid` level (in a `SortableWidgetCell` wrapper), not inside `WidgetWrapper`.

---

### Bug 2: `rectSortingStrategy` assumes a uniform grid

`rectSortingStrategy` is dnd-kit's strategy for 2D grid sorting. Its algorithm works by:

1. Measuring the bounding rectangle of every sortable item.
2. Imagining those rectangles arranged in a regular matrix.
3. When the cursor moves over a new cell, calculating which items need to "shift" to make room, and by how much.

This algorithm is designed for **uniform grids** — items that are all the same size, arranged in regular rows and columns. The canonical use case is an image gallery or a Kanban card list.

This dashboard has widgets that are `small` (4/12 cols), `medium` (6/12), `large` (8/12), and `full` (12/12). When you place a `large` widget (8 cols) next to a `medium` widget (6 cols) in the same visual row, `rectSortingStrategy` sees two rectangles of dramatically different widths. Its displacement calculations assume the items could swap positions symmetrically. They cannot — the grid will re-flow when the column spans change, and the CSS Grid's auto-placement produces a completely different arrangement than what `rectSortingStrategy` predicted.

The displaced items receive transforms to positions that don't exist in the actual grid, so they appear to jump into empty space.

**The fix**: Switch to `verticalListSortingStrategy`. This strategy ignores the x-axis entirely and sorts items only by their vertical order — by the y-coordinate of each item's center. This is correct for a variable-width grid because:

- Users intuitively understand "drag up = move earlier in the list, drag down = move later."
- Displaced items only translate on the y-axis, which is always valid regardless of width differences.
- The sort order corresponds exactly to the DOM/array order, so `arrayMove` produces the correct result.

---

## 3. Why AI Makes This Mistake Consistently

This section is worth examining carefully, because the same mistake recurs across almost every AI-assisted dnd-kit implementation in variable-width layouts. The reasons are structural to how large language models learn.

### 3.1 Training data over-represents the happy path

The internet contains an enormous number of dnd-kit tutorials, blog posts, and Stack Overflow answers. Virtually all of them demonstrate:

- A Kanban board (uniform-width cards in a vertical column)
- An image gallery (uniform-width tiles in a CSS grid)
- A todo list (uniform-height items in a vertical list)

In every one of these examples, `rectSortingStrategy` and a CSS grid or flexbox work correctly, because the items are uniform. The pairing of `rectSortingStrategy` + CSS grid is the dominant pattern in training data, so an AI asked to implement drag-and-drop in a grid will reach for it by default.

The failure case — variable-width items in a CSS span-based grid — is rare in training data because most applications either:
- Use a purpose-built drag-and-drop grid library (like `react-grid-layout`) that manages sizing internally, or
- Use a uniform-width grid and avoid the problem entirely.

The AI has not learned from enough failure cases involving mixed spans to know the strategy is wrong.

### 3.2 The constraint is semantic, not syntactic

A TypeScript or ESLint error is syntactic — the AI sees it immediately in the output and corrects it. The constraint that `rectSortingStrategy` is wrong for variable-width items is **semantic**: the code compiles, the types pass, the library doesn't throw, and the feature appears to "work" at a surface level. The failure only becomes apparent when a user actually drags something and notices the animation is wrong.

AI systems that generate code cannot observe runtime visual behavior. They cannot run the application, drag a widget, and see that the displaced items are teleporting. The code looks correct at a syntactic and even logical level. The bug lives in the gap between the algorithm's assumptions and the physical layout reality.

This is a class of bug that is almost invisible during code generation and only apparent in live use.

### 3.3 The `useSortable` placement mistake follows from tutorial-level architecture

In every dnd-kit tutorial, `useSortable` is called **inside the item component** — exactly the architecture in `WidgetWrapper`. This is correct when the sortable item is a self-contained element with no outer layout wrapper (a card in a vertical list, for example).

The architecture breaks when a layout system (CSS Grid) controls positioning via an **outer wrapper** that is separate from the component that renders the visible content. In that situation, the sortable ref must be on the outer wrapper, and the drag handle must be passed as a prop to the inner component.

An AI asked to "make this component draggable" will by default call `useSortable` inside the component that renders the visible UI, because that is the pattern in its training data. It does not reason about whether there is an outer layout element that should be the actual sortable node.

### 3.4 Technical debt from compositional mismatch

There is a deeper pattern here: when UI architecture separates concerns across component boundaries (layout in one place, content in another, behaviour in a third), AI systems tend to implement cross-cutting behaviours like drag-and-drop **at the wrong level of the tree**. The AI knows it needs `setNodeRef` and a `transform` applied to a div, and it finds the nearest div it controls — which is inside `WidgetWrapper`, not in `DashboardGrid`.

The correct placement requires understanding the relationship between `DashboardGrid` (the layout owner), `WidgetWrapper` (the presentation owner), and `useSortable` (the behaviour owner). These must be coordinated by passing the drag handle down as a prop from the layout level to the presentation level. This prop-threading pattern is not present in tutorial code and is therefore underrepresented in training data.

---

## 4. The Correct Architecture

Based on the above analysis, the correct architecture for drag-and-drop in a variable-width CSS grid is:

```
DashboardGrid
├── DndContext
└── SortableContext (verticalListSortingStrategy)
    └── SortableWidgetCell  ← useSortable lives HERE
        ├── ref={setNodeRef}
        ├── style={{ gridColumn: "span N", transform: CSS.Transform... }}
        └── WidgetWrapper  ← purely presentational, receives dragHandleProps
            ├── dragHandleProps={{ ...attributes, ...listeners }}  applied to GripVertical button
            └── children (the rendered widget)
```

### Why `verticalListSortingStrategy` is correct here

The strategy determines how items animate when an item is being dragged over them. With `verticalListSortingStrategy`:

- Only vertical translation is applied to displaced items.
- Displaced items slide up or down smoothly as the dragged item passes over them.
- The relative order of items is determined by their vertical center positions — which is exactly the semantic intent ("this widget is above that one").
- There is no assumption about item width, so variable column spans do not corrupt the calculation.

The trade-off is that the strategy does not attempt to animate items sideways in the same row. In practice, this is a better user experience for a management dashboard: items feel like they have a clear vertical order, and reordering feels deliberate and linear rather than 2D and chaotic.

### Why `setNodeRef` must be on the grid cell

dnd-kit uses the element pointed to by `setNodeRef` to:

1. Measure the item's position and size for collision detection.
2. Calculate the `transform` value that will visually move the item during drag.
3. Detect when the pointer enters the item's region to trigger a reorder.

If `setNodeRef` points to the inner card but the outer div controls the grid column span, these measurements are for the wrong element. The inner card fills its grid cell, so the positions will be close but not identical — and more importantly, the transform is applied to the inner element, causing it to shift relative to the grid cell rather than moving the grid cell itself.

When `setNodeRef` is on the grid cell div (the one with `gridColumn: span N`), the measurement and transform are aligned with the element CSS Grid is positioning. The animation is correct.

---

## 5. What the Fix Will Do

Based on this analysis, the fix involves three changes:

1. **Move `useSortable` from `WidgetWrapper` to a new `SortableWidgetCell` component inside `DashboardGrid`.** Apply `setNodeRef` and the CSS transform inline style to the grid cell div. Pass `{ ...attributes, ...listeners }` as a `dragHandleProps` prop to `WidgetWrapper`.

2. **Switch from `rectSortingStrategy` to `verticalListSortingStrategy`.** Items will sort by vertical position. Dragging up moves an item earlier in the list; dragging down moves it later. Displaced items animate smoothly on the y-axis only.

3. **Remove `useSortable` from `WidgetWrapper` entirely.** `WidgetWrapper` becomes a purely presentational component. It accepts `dragHandleProps` and applies them to the grip icon element. The `isDragging` state is passed as a prop from `SortableWidgetCell`.

These changes are sufficient to produce a drag experience that is visually clean and behaviourally correct.

---

## References and Further Reading

- dnd-kit docs — Sortable: https://docs.dndkit.com/presets/sortable
- dnd-kit sorting strategies: https://docs.dndkit.com/presets/sortable/sortable-context#sorting-strategies
- CSS Intrinsic & Extrinsic Sizing (why `span N` columns affect layout in ways transforms cannot): https://www.w3.org/TR/css-sizing-3/
- Sweller, J. (1988). Cognitive load during problem solving. *Cognitive Science*, 12(2), 257–285. — For the argument that implementation complexity that exceeds a tool's design scope always produces surprising failures.
