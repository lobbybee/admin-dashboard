# UI Implementation Plan: Conversational Flow Management (v2)

This document outlines the revised plan for creating the user interface for managing conversational flows, incorporating the API's capabilities for branching logic. The UI will be a graph-based node editor, built with a modular, component-based architecture.

## 1. Core Objective

The primary goal is to create an intuitive, **visual, graph-based interface** for platform admins to:
-   Create, view, update, and delete Flow Templates.
-   Visually map out and manage the steps (nodes) and conditional branches (edges) of a conversational flow.
-   Manage the actions associated with each step.
-   Assign and manage flow configurations for different hotels.

## 2. Revised UI/UX Strategy: A Node-Based Graph Editor

The previous list-based approach is insufficient for handling branching logic. We will pivot to a proper flow chart/node editor interface.

-   **Core Technology:** We will integrate **Vue Flow** (`@vue-flow/core`), a powerful library for building node-based editors, to serve as the foundation for our flow builder.

-   **Component Architecture:** The flow editor will be broken down into several single-responsibility components to keep the codebase clean and manageable, instead of concentrating all logic within the main page file.

-   **Main View (`pages/flows.vue`):**
    -   This page will manage the overall layout.
    -   **Left Column (Master):** A dedicated component, `components/FlowTemplateList.vue`, will handle fetching and displaying the list of `Flow Templates`.
    -   **Right Column (Detail):** This area will host the main editor component, `components/FlowEditor.vue`.

-   **Flow Editor (`components/FlowEditor.vue`):**
    -   This component will contain the `<VueFlow>` canvas.
    -   It will be responsible for fetching the steps of the selected flow, transforming them into nodes and edges, and managing the overall state of the canvas (panning, zooming, etc.).

-   **Visualizing the Flow:**
    -   **Nodes (`components/FlowStepNode.vue`):** Each `FlowStepTemplate` will be rendered by this custom node component. It will display the step's content and provide input/output handles for connections.
    -   **Edges:** The connections in the `conditional_next_steps` object will be rendered as labeled edges between the nodes.

## 3. List of Changes to Current Implementation

1.  **Dependency Management:** Add `@vue-flow/core` and its required CSS to the project.
2.  **Remove Old Logic:** Remove the `vuedraggable` library and all associated list-reordering logic from `pages/flows.vue`.
3.  **Refactor and Componentize:**
    -   Move all template list logic from `pages/flows.vue` into `components/FlowTemplateList.vue`.
    -   Create `components/FlowEditor.vue` to house the Vue Flow canvas and its related logic.
    -   Create `components/FlowStepNode.vue` to render the custom nodes.
    -   Create `components/FlowDialogs.vue` (or similar) to contain the various modal dialogs for editing steps and actions, to further clean up the main page.
4.  **Data Transformation Layer:** Implement logic within `components/FlowEditor.vue` to transform the fetched flow steps into the `nodes` and `edges` arrays required by Vue Flow.
5.  **Update Composables & Types:** The `FlowStepTemplate` interfaces must be updated to include the `conditional_next_steps: Record<string, number> | null` field.

## 4. Revised Phased Implementation Plan

### Phase 1: Project Restructure & Read-Only Graph View

1.  **Add Dependency:** Integrate `@vue-flow/core`.
2.  **Update Composables:** Add the `conditional_next_steps` field to the `FlowStepTemplate` type definitions.
3.  **Refactor UI:** Create the new component files (`FlowTemplateList.vue`, `FlowEditor.vue`, `FlowStepNode.vue`). Move existing template list logic into `FlowTemplateList.vue`. Set up the basic `<VueFlow>` canvas in `FlowEditor.vue`.
4.  **Implement Read-Only Graph:** In `FlowEditor.vue`, fetch the flow steps and implement the logic to transform and render them as a non-interactive graph. This validates the core visualization.

### Phase 2: Step (Node) Management

1.  **Customize Node:** Flesh out `FlowStepNode.vue` to create a user-friendly representation of each step, including its content and connection handles.
2.  **Add/Delete Nodes:** Implement controls on the `FlowEditor` canvas to add a new step (node) and a mechanism on each node to delete it. These actions will call the appropriate composables.
3.  **Edit Node Content:** Implement the `Dialog` for editing a step's `step_name` and `message_template`, which will open when a node is double-clicked.

### Phase 3: Branching (Connection) Management

1.  **Enable Edge Creation:** Configure Vue Flow in `FlowEditor.vue` to allow users to drag connections between nodes.
2.  **Implement Connection Logic:** On a new connection event, prompt the user to enter the condition (`user_input`).
3.  **Persist Connections:** Update the source node's `conditional_next_steps` object and use the `useUpdateFlowStepTemplate` composable to save the change.
4.  **Implement Edge Deletion:** Allow users to delete connections, which will remove the corresponding entry from `conditional_next_steps` and persist the change.

### Phase 4: Final Touches

1.  **Flow Actions:** The "Manage Actions" button will be part of the `FlowStepNode.vue` UI, opening a dialog for action management.
2.  **Built-in Navigation:** Add a small, non-intrusive note in the `FlowEditor.vue` component to inform the admin about the global `back` and `main menu` commands.
3.  **Hotel Configuration:** The plan for `pages/hotel-configurations.vue` remains valid and can be implemented as the final step.
