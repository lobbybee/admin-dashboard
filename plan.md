# Plan for Flow Editor and Conversation Simulator UI

This document outlines the plan to build an intuitive UI for creating, editing, and simulating conversational flows. The primary focus is now on the **interactive conversation simulator**.

--- 

### Completed Work

*   **Core UI & Editor:** A functional editor is in place with a two-column layout, template selection, step visualization with connectors, and full CRUD functionality for flow steps using PrimeVue components.

--- 

### New Plan: Interactive Simulator

## Phase 1: Simulator Mode

1.  **Mode Toggle:**
    *   In `FlowEditor.vue`, add a toggle switch (e.g., PrimeVue `InputSwitch`) to let users switch between the current **Editor View** and a new **Simulator View**.

2.  **Simulator Component:**
    *   Create a new component `components/FlowSimulator.vue`.
    *   This component will be responsible for rendering the interactive chat simulation.
    *   It will be displayed in the right column of `pages/flows.vue` when Simulator View is active.

## Phase 2: Building the Simulator UI

1.  **Chat Interface:**
    *   Design `FlowSimulator.vue` to look like a standard messaging app (e.g., a chat window).

2.  **Message History:**
    *   Create an area to display the history of the conversation as it progresses.
    *   Messages from the bot and the user will be styled differently.

3.  **User Input:**
    *   For steps with `message_type: 'quick_reply'` or `'list_message'`, the options will be rendered as clickable buttons within the chat window.
    *   For steps that require text input, a text input field and a "Send" button will be provided.

## Phase 3: Implementing the Simulation Logic

1.  **State Management:**
    *   Inside `FlowSimulator.vue`, manage the state of the simulation, including:
        *   The full list of flow steps.
        *   The current step ID.
        *   The history of displayed messages.

2.  **Starting the Flow:**
    *   The simulation will start with the first step in the flow (determined by the step with the lowest `order` or a designated starting step).

3.  **Flow Navigation:**
    *   When the user clicks a button (for `quick_reply`/`list_message`) or sends a text message:
        *   The simulator will find the corresponding key in the current step's `conditional_next_steps`.
        *   It will handle the wildcard `*` as a fallback.
        *   It will determine the ID of the next step to display.
        *   The new step will be added to the message history and rendered in the chat window.

4.  **Ending the Flow:**
    *   If no next step is found (no matching condition and no `next_step_template`), the simulation for that branch ends, and a message like "Flow ended" will be displayed.

## Phase 4: Integration and Refinement

1.  **Connecting Editor and Simulator:**
    *   Ensure that any changes made in the Editor View are immediately reflected when switching to the Simulator View.

2.  **UX/UI Polish:**
    *   Add smooth scrolling to the chat window.
    *   Implement clear visual cues for loading states or errors during simulation.
    *   Add a "Reset" button to the simulator to start the conversation over.