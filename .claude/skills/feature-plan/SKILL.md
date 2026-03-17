---
name: feature-plan
description: Plan a feature or change before writing code. Use when starting new work to break it down and identify risks.
---

Before writing any code, produce a clear implementation plan:

1. **Understand the goal**
   - Restate what needs to be built or changed in one sentence
   - Clarify any ambiguities before proceeding

2. **Identify files to change**
   - List every file that will need to be created or modified
   - Note which are frontend, backend, types, or config

3. **Break into steps**
   - Order the work into small, logical steps
   - Each step should be independently testable
   - Flag any steps that have external dependencies (API, auth, DB)

4. **Identify risks and unknowns**
   - What could break existing functionality?
   - Are there edge cases that need special handling?
   - Any performance or security considerations?

5. **Define done**
   - What does a working implementation look like?
   - How will it be manually tested?
   - Are there any follow-up tasks to log after this is complete?

Present the plan clearly and wait for approval before starting implementation.
