// Test script to verify flow positioning logic
const testSteps = [
  {
    "id": 10,
    "step_name": "Demo Main Menu",
    "message_template": "Welcome to the LobbyBee Demo! How can we help you today?",
    "message_type": "list_message",
    "options": {
      "1": "Reception",
      "2": "Cafe",
      "3": "House Keeping"
    },
    "conditional_next_steps": {
      "1": 11,
      "2": 13,
      "3": 17
    },
    "flow_template": 2,
    "next_step_template": null,
    "actions": []
  },
  {
    "id": 11,
    "step_name": "Reception Welcome",
    "message_template": "Welcome to reception. What would you like to inform? (Type \"back\" to return to the main menu)",
    "message_type": "quick_reply",
    "options": {},
    "conditional_next_steps": {
      "*": 12
    },
    "flow_template": 2,
    "next_step_template": null,
    "actions": []
  },
  {
    "id": 12,
    "step_name": "Reception Confirmation",
    "message_template": "Demo Reception Message Received.",
    "message_type": "text",
    "options": {
      "1": "Main Menu"
    },
    "conditional_next_steps": {
      "1": 10
    },
    "flow_template": 2,
    "next_step_template": null,
    "actions": []
  },
  {
    "id": 13,
    "step_name": "Cafe Menu",
    "message_template": "Here is our cafe menu.",
    "message_type": "list_message",
    "options": {
      "1": "Coffee",
      "2": "Tea",
      "3": "Sandwich"
    },
    "conditional_next_steps": {
      "1": 14,
      "2": 15,
      "3": 16
    },
    "flow_template": 2,
    "next_step_template": null,
    "actions": []
  },
  {
    "id": 14,
    "step_name": "Cafe Confirm Coffee",
    "message_template": "Please confirm your order: Coffee.",
    "message_type": "quick_reply",
    "options": {
      "1": "Confirm",
      "2": "Cancel"
    },
    "conditional_next_steps": {
      "1": 99,
      "2": 13
    },
    "flow_template": 2,
    "next_step_template": null,
    "actions": []
  },
  {
    "id": 15,
    "step_name": "Cafe Confirm Tea",
    "message_template": "Please confirm your order: Tea.",
    "message_type": "quick_reply",
    "options": {
      "1": "Confirm",
      "2": "Cancel"
    },
    "conditional_next_steps": {
      "1": 99,
      "2": 13
    },
    "flow_template": 2,
    "next_step_template": null,
    "actions": []
  },
  {
    "id": 16,
    "step_name": "Cafe Confirm Sandwich",
    "message_template": "Please confirm your order: Sandwich.",
    "message_type": "quick_reply",
    "options": {
      "1": "Confirm",
      "2": "Cancel"
    },
    "conditional_next_steps": {
      "1": 99,
      "2": 13
    },
    "flow_template": 2,
    "next_step_template": null,
    "actions": []
  },
  {
    "id": 99,
    "step_name": "Cafe Order Received",
    "message_template": "Your demo order has been received.",
    "message_type": "quick_reply",
    "options": {
      "1": "Main Menu"
    },
    "conditional_next_steps": {
      "1": 10
    },
    "flow_template": 2,
    "next_step_template": null,
    "actions": []
  },
  {
    "id": 17,
    "step_name": "House Keeping Confirm",
    "message_template": "Welcome to House Keeping. Order a room clean up?",
    "message_type": "quick_reply",
    "options": {
      "1": "Confirm",
      "2": "Cancel"
    },
    "conditional_next_steps": {
      "1": 18,
      "2": 10
    },
    "flow_template": 2,
    "next_step_template": null,
    "actions": []
  },
  {
    "id": 18,
    "step_name": "House Keeping Received",
    "message_template": "Your House Keeping request has been received. Please await.",
    "message_type": "quick_reply",
    "options": {
      "1": "Main Menu"
    },
    "conditional_next_steps": {
      "1": 10
    },
    "flow_template": 2,
    "next_step_template": null,
    "actions": []
  }
];

// Mock the positioning functions to test them
function calculateNodePositions(steps) {
  const positions = {};
  const stepMap = new Map(steps.map(step => [step.id, step]));

  // If no steps, return empty positions
  if (steps.length === 0) return positions;

  // Find the main menu (often the one without incoming connections or has id 10)
  let mainMenu = steps.find(step => step.id === 10);
  if (!mainMenu) {
    // Fallback: find step with no incoming connections
    const hasIncoming = new Set();
    steps.forEach(step => {
      if (step.conditional_next_steps) {
        Object.values(step.conditional_next_steps).forEach(id => hasIncoming.add(id));
      }
      if (step.next_step_template) {
        hasIncoming.add(step.next_step_template);
      }
    });
    mainMenu = steps.find(step => !hasIncoming.has(step.id));
  }

  // If still no main menu found, use the first step
  if (!mainMenu) {
    mainMenu = steps[0];
  }

  // Position main menu at the top center
  positions[mainMenu.id] = { x: 500, y: 50 };

  // Create branching structure visualization
  positionFlowSteps(mainMenu, positions, stepMap);

  // Position any remaining unpositioned nodes
  steps.forEach(step => {
    if (!positions[step.id]) {
      positions[step.id] = { x: 250, y: Object.keys(positions).length * 200 };
    }
  });

  return positions;
}

// Position flow steps in a hierarchical structure
function positionFlowSteps(mainMenu, positions, stepMap) {
  // Define branch structure for known flows
  const branchRoots = [];

  // Get main branches from main menu
  if (mainMenu.conditional_next_steps) {
    Object.entries(mainMenu.conditional_next_steps).forEach(([condition, nextStepId]) => {
      if (stepMap.has(nextStepId)) {
        branchRoots.push({
          id: nextStepId,
          condition,
          parentId: mainMenu.id
        });
      }
    });
  }

  // Position main branches horizontally
  const branchSpacing = 400;
  const branchStartX = 500 - (branchRoots.length - 1) * branchSpacing / 2;

  branchRoots.forEach((branch, index) => {
    const xPos = branchStartX + index * branchSpacing;
    positionBranch(branch.id, xPos, 250, positions, stepMap);
  });
}

// Position a branch and its sub-steps
function positionBranch(startStepId, startX, startY, positions, stepMap) {
  let currentStepId = startStepId;
  let currentY = startY;
  let currentX = startX;

  // Keep track of positioned nodes in this branch to avoid cycles
  const positionedInBranch = new Set();

  while (currentStepId && !positionedInBranch.has(currentStepId)) {
    // Position current step
    positions[currentStepId] = { x: currentX, y: currentY };
    positionedInBranch.add(currentStepId);

    const step = stepMap.get(currentStepId);
    if (!step) break;

    // Check for branching first (multiple options)
    if (step.conditional_next_steps) {
      const conditions = Object.keys(step.conditional_next_steps);

      // If multiple branches, arrange them horizontally
      if (conditions.length > 1) {
        const childSpacing = 250;
        const childrenStartX = currentX - (conditions.length - 1) * childSpacing / 2;

        // Position each branch child
        conditions.forEach((condition, index) => {
          const nextStepId = step.conditional_next_steps[condition];
          if (nextStepId && stepMap.has(nextStepId) && !positions[nextStepId]) {
            positions[nextStepId] = {
              x: childrenStartX + index * childSpacing,
              y: currentY + 150
            };

            // Continue positioning this branch
            positionBranch(nextStepId, positions[nextStepId].x, positions[nextStepId].y + 100, positions, stepMap);
          }
        });
        break; // Stop linear processing when we have branching
      }
      // Single branch, continue linearly
      else if (conditions.length === 1) {
        const nextStepId = step.conditional_next_steps[conditions[0]];
        if (nextStepId && stepMap.has(nextStepId) && !positions[nextStepId]) {
          currentStepId = nextStepId;
          currentY += 150;
          continue;
        }
      }
    }

    // Check for default next step
    if (step.next_step_template && !positions[step.next_step_template]) {
      currentStepId = step.next_step_template;
      currentY += 150;
    } else {
      break;
    }
  }
}

// Run the test
const positions = calculateNodePositions(testSteps);
console.log("Node positions:");
Object.entries(positions).forEach(([id, pos]) => {
  const step = testSteps.find(s => s.id == id);
  console.log(`ID ${id} (${step?.step_name}): x=${pos.x}, y=${pos.y}`);
});
