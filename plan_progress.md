# Plan Progress

This document tracks the progress of the flow editor and conversation simulator UI development.

- **Phase 1: Core UI Structure:** [Done]
  - Two-column layout in `pages/flows.vue`.
  - Created all necessary components: `FlowTemplateList`, `FlowEditor`, `FlowStepNode`, `FlowStepDialog`, and `FlowTemplateDialog`.

- **Phase 2: Flow Template Management:** [Done]
  - Implemented full CRUD (Create, Read, Update, Delete) functionality for flow templates.
  - Replaced `trigger_keyword` with `category` and added the `is_active` toggle.
  - The list now shows the active status and allows for quick toggling.

- **Phase 3: Flow Editor - Visualizing the Flow:** [Deprecated]
  - The initial visual editor with graph connectors was built but has been replaced by the more intuitive interactive simulator as the primary interface.

- **Phase 4: CRUD for Flow Steps:** [Done]
  - Implemented full CRUD for flow steps.
  - Editing is now initiated directly from the simulator by double-clicking a message.
  - The step editor dialog has been significantly improved with a combined "Options & Branching" section for clarity.

- **Phase 5: Conversation Simulator:** [Done]
  - This became the primary focus and is fully implemented in `FlowSimulator.vue`.
  - The UI mimics a real chat application.
  - It correctly handles `text`, `quick-reply` (buttons), and `list-picker` (`Listbox`) message types.
  - Navigation logic follows the defined conditional branches.

- **Phase 6: Refinements & Bug Fixes:** [Done]
  - Refactored the entire UI to use PrimeVue components for a consistent look and feel.
  - Resolved several tricky reactivity and data-handling bugs to ensure the UI is stable and updates correctly.
  - Improved the UX of the editor dialogs by using dropdowns for step selection and disabling confusing fields.