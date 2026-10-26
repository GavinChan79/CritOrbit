export type AnswerContent = { name: string; summary: string; questions: readonly (readonly [string, string])[] };

export const platformDescription = "CritOrbit is an online helper-matching platform for Malaysian students seeking support with coding, reports, presentations and design coursework. Students submit a brief and coordinate the next steps through the CritOrbit admin.";

export const platformQuestions = [
  ["What is CritOrbit?", platformDescription],
  ["How do I get assignment support through CritOrbit?", "Submit a brief with the task, your progress, deadline and budget. Compare helper profiles and select a suitable helper, then coordinate the scope and next steps with the CritOrbit admin."],
  ["How much does assignment support cost?", "The final amount depends on the agreed scope, complexity and deadline. Share your budget in RM and confirm the deliverables and amount with the admin before proceeding."],
  ["Can I contact a helper directly?", "Requests and communication are routed through the CritOrbit admin WhatsApp. Use the brief and helper-selection flow to start a request."],
  ["Can I track my request?", "Logged-in users can track their requests from the dashboard."],
  ["Can an urgent request be guaranteed?", "Availability and turnaround must be confirmed for the specific task. An urgent request does not guarantee a response or completion time."],
] as const;

export const serviceAnswers: Record<string, AnswerContent> = {
  "assignment-help-malaysia": {
    "name": "Assignment help in Malaysia",
    "summary": "CritOrbit helps Malaysian students compare helper profiles for coding, reports, presentations and design coursework. Students submit a brief, choose a suitable helper and coordinate scope, availability and payment through the CritOrbit admin.",
    "questions": [
      [
        "What assignment support can I request?",
        "You can describe a coding problem, report draft, presentation or design task in your brief. Include your course requirements and the work you have attempted so the admin can check whether a suitable helper is available."
      ],
      [
        "What should I send before asking for help?",
        "Send the assignment question, marking rubric, current progress, exact deadline, required file format and budget in RM. Specify whether you need an explanation, feedback, debugging or design review."
      ]
    ]
  },
  "coding-assignment-help-malaysia": {
    "name": "Coding assignment help in Malaysia",
    "summary": "CritOrbit helps students find coding support for debugging, error diagnosis and code review. Share the code you have attempted, the error message, expected output and required environment so the admin can check the right helper and scope.",
    "questions": [
      [
        "What should I include in a debugging request?",
        "Include the language and version, the command you run, the full error message and a small example of the failing input. Explain the expected output and remove API keys, passwords and personal data before sharing code."
      ],
      [
        "Can I ask for a code review instead of a complete solution?",
        "Yes. State which part of your own code you want reviewed and whether you need help with readability, logic or testing. Ask for an explanation so you can understand and validate changes yourself."
      ]
    ]
  },
  "programming-assignment-help-malaysia": {
    "name": "Programming assignment help in Malaysia",
    "summary": "CritOrbit helps students find support with programming logic, algorithms and code structure. Share the assignment constraints and your attempted approach to focus the discussion on the concept or step you need to understand.",
    "questions": [
      [
        "How do I explain a programming logic problem?",
        "Provide example inputs and expected outputs, your pseudocode or attempted code, and any restrictions on libraries or techniques. Point to the step where your reasoning stops working."
      ],
      [
        "How can I check that I understand the suggested approach?",
        "Work through normal and edge-case inputs yourself. Ask why the algorithm works and what its limits are, then run your own tests against the assignment requirements."
      ]
    ]
  },
  "business-assignment-help-malaysia": {
    "name": "Business assignment help in Malaysia",
    "summary": "CritOrbit helps students find support for business case studies, report structure and presentations. Include the case material, marking rubric and your draft so a helper can focus on the analysis or communication issue you identify.",
    "questions": [
      [
        "What should I share for a business case-study review?",
        "Send the case, question, marking criteria and draft analysis. Identify which decision, argument or section needs feedback and note any frameworks your course requires."
      ],
      [
        "Can I request feedback on a report or presentation?",
        "Describe whether you need feedback on the argument, organisation, evidence or slide clarity. Include the word limit or presentation length and the referencing style required by your course."
      ]
    ]
  },
  "engineering-assignment-help-malaysia": {
    "name": "Engineering assignment help in Malaysia",
    "summary": "CritOrbit helps students find support for engineering coursework, calculations and technical reports. Share the problem statement, assumptions, units and attempted method so the admin can assess whether a suitable helper is available.",
    "questions": [
      [
        "What should I include with an engineering calculation question?",
        "Include the complete problem, diagrams, given values with units, assumptions and your workings. Point to the equation or step you want explained instead of sending only a final answer."
      ],
      [
        "How do I request help with a technical report?",
        "Provide the report brief, rubric, draft and permitted data. Specify whether you need feedback on the method, explanation, units, figures or structure, and check calculations independently."
      ]
    ]
  },
  "interior-design-assignment-help-malaysia": {
    "name": "Interior design assignment help in Malaysia",
    "summary": "CritOrbit helps students find support for interior design coursework, including concept reviews, spatial planning and presentation. Share the studio brief and current plans or sketches, then confirm scope and file formats with the admin.",
    "questions": [
      [
        "What files should I send for an interior design review?",
        "Send the studio brief, site information, current sketches or plans, required scales and marking criteria. Identify the concept, layout or presentation decision you want feedback on."
      ],
      [
        "How do I specify design deliverables?",
        "List the required drawings, sheet sizes, software versions and editable or export formats. Give the presentation date and leave time to check dimensions, annotations and final exports."
      ]
    ]
  },
  "urgent-assignment-help-malaysia": {
    "name": "Urgent assignment help in Malaysia",
    "summary": "CritOrbit lets students request deadline-sensitive support by sharing the task, progress and exact deadline. The admin must confirm helper availability and a feasible scope; an urgent request does not guarantee a particular response or completion time.",
    "questions": [
      [
        "Can CritOrbit guarantee same-day completion?",
        "A same-day outcome cannot be assumed. Availability, task complexity and remaining work must be checked with the admin before a turnaround time is agreed."
      ],
      [
        "What should I prioritise in an urgent request?",
        "State the exact deadline and time zone, what is complete and the specific issue blocking progress. Ask for a focused task and leave time to review and apply feedback before submission."
      ]
    ]
  },
  "last-minute-assignment-help-malaysia": {
    "name": "Last-minute assignment help in Malaysia",
    "summary": "CritOrbit helps students request focused support near a deadline, such as reviewing a draft, checking slides or diagnosing a specific bug. Share the remaining time and priority issue so the admin can assess availability and scope.",
    "questions": [
      [
        "What kind of review is practical close to a deadline?",
        "A focused review of a particular section, citation issue, slide sequence or reproducible bug is easier to assess than an unspecified full assignment. The admin still needs to confirm availability."
      ],
      [
        "What should I check before submitting my files?",
        "Recheck the rubric, file type, naming rules and references. Open the exported files, run code in the required environment and keep a backup of the final version."
      ]
    ]
  },
  "cheap-assignment-help-malaysia": {
    "name": "Budget-conscious assignment help in Malaysia",
    "summary": "CritOrbit lets students share a budget in RM when requesting assignment support. The scope, complexity and deadline need to be reviewed before a price is agreed; a final quote should be confirmed with the admin before proceeding.",
    "questions": [
      [
        "How can I request support within my budget?",
        "State your budget in RM and identify the part of the task where you need help. Share the rubric, draft and deadline so the admin can discuss a manageable scope."
      ],
      [
        "Does a displayed helper price cover every task?",
        "Check what any displayed price includes. Confirm the deliverables, deadline, file format and final amount with the admin for your specific brief before proceeding."
      ]
    ]
  },
  "diploma-assignment-help-malaysia": {
    "name": "Diploma assignment help in Malaysia",
    "summary": "CritOrbit helps diploma students find support for coursework such as reports, coding tasks and presentations. Include your course level, rubric and attempted work so the requested support matches the requirements of your module.",
    "questions": [
      [
        "What should a diploma student include in a request?",
        "Include the module, course level, assignment question, rubric and your progress. Explain the concept, draft section or technical issue you want help with."
      ],
      [
        "Can I ask for feedback appropriate to my module?",
        "State the methods, software and referencing style taught in your module. Ask for explanations and feedback within those requirements rather than assuming a more advanced approach will fit."
      ]
    ]
  },
  "university-assignment-help-kl": {
    "name": "University assignment help for Kuala Lumpur students",
    "summary": "CritOrbit helps university students in Kuala Lumpur find assignment support through an online brief and admin-managed coordination. Share your module requirements, draft and deadline to check whether a suitable helper is available.",
    "questions": [
      [
        "Do I need to visit an office in Kuala Lumpur?",
        "The published request process starts online: submit a brief on CritOrbit and coordinate the next steps through the admin. This page does not offer a walk-in office or promise an in-person appointment."
      ],
      [
        "What university details should I provide?",
        "Include your module level, marking rubric, approved tools and deadline. Check your institution’s rules on outside assistance and specify the support you are permitted to receive."
      ]
    ]
  },
  "do-assignment-for-me-malaysia": {
    "name": "Finding the right assignment support in Malaysia",
    "summary": "CritOrbit matches students with helpers through a brief and admin-managed coordination. Explain what support you need with your own work, confirm the scope before proceeding and check the rules your institution sets for outside assistance.",
    "questions": [
      [
        "How should I describe the assignment help I need?",
        "Specify whether you need a concept explained, feedback on your draft, a code review or design guidance. Share your attempted work and the rubric so the request has a clear purpose and boundary."
      ],
      [
        "Who is responsible for the final submission?",
        "You remain responsible for understanding your work and following your institution’s rules. Check what outside support is permitted and make sure you can explain and validate the work you submit."
      ]
    ]
  }
};
