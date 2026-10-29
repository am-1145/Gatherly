import { describe, it, expect } from 'vitest';
import { processLocalCopilotPrompt } from '../services/ai/localEngine';
import { INITIAL_DEMO_EVENTS } from '../utils/demoData';

describe('AI Copilot & Analysis Services', () => {
  const demoEvent = INITIAL_DEMO_EVENTS[0]; // Aarav's 30th Birthday

  it('generates cost-reduction analysis and structured reallocate action', () => {
    const result = processLocalCopilotPrompt('How can I reduce my event costs?', demoEvent);

    expect(result.intentTag).toBe('budget_optimization');
    expect(result.content).toContain('cost optimization plan');
    expect(result.actionProposal).toBeDefined();
    expect(result.actionProposal?.type).toBe('reallocate_category');
    expect(result.actionProposal?.payload.categoryKey).toBe('Catering');
  });

  it('generates high-priority task agenda and task action proposal', () => {
    const result = processLocalCopilotPrompt('What should I complete this week?', demoEvent);

    expect(result.intentTag).toBe('task_agenda');
    expect(result.actionProposal).toBeDefined();
    expect(result.actionProposal?.type).toBe('add_task');
    expect(result.actionProposal?.payload.category).toBe('Bookings');
  });

  it('computes guest count increment impacts on per-head food cost', () => {
    const result = processLocalCopilotPrompt('What happens if I increase my guest count?', demoEvent);

    expect(result.intentTag).toBe('guest_impact');
    expect(result.content).toContain('Headcount Impact Analysis');
    expect(result.actionProposal).toBeDefined();
    expect(result.actionProposal?.type).toBe('add_task');
  });

  it('extracts action proposals from fenced markdown action blocks', () => {
    const mockModelOutput = `Here is my detailed analysis for your venue negotiation.
We should immediately create a task for the coordinator.

\`\`\`action
{
  "type": "add_task",
  "title": "Negotiate audio curfew extension",
  "description": "Request 1 hour extra outdoor sound clearance from Indiranagar authorities",
  "payload": {
    "title": "Negotiate audio curfew extension",
    "category": "Bookings",
    "priority": "urgent",
    "dueDate": "2026-11-20",
    "assignee": "Aarav"
  }
}
\`\`\``;

    const actionMatch = mockModelOutput.match(/```action\s*([\s\S]*?)\s*```/);
    expect(actionMatch).not.toBeNull();

    if (actionMatch) {
      const parsed = JSON.parse(actionMatch[1]);
      expect(parsed.type).toBe('add_task');
      expect(parsed.title).toBe('Negotiate audio curfew extension');
      expect(parsed.payload.assignee).toBe('Aarav');
    }
  });
});

