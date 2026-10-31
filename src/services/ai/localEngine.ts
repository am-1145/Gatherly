import { EventModel, ActionProposal } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

export interface LocalEngineResult {
  content: string;
  actionProposal?: ActionProposal;
  suggestedFollowUps: string[];
  intentTag: string;
}

export function processLocalCopilotPrompt(
  prompt: string,
  event: EventModel
): LocalEngineResult {
  const query = prompt.toLowerCase();
  const currency = event.budget.currency;
  const totalBudget = event.budget.total;
  const guestCount = event.guestCount;
  const occasion = event.occasion;
  const daysLeft = Math.max(
    0,
    Math.round((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  );

  // 1. COST REDUCTION & BUDGET SAVINGS
  if (
    query.includes('reduce') ||
    query.includes('save money') ||
    query.includes('cut cost') ||
    query.includes('cheaper') ||
    query.includes('lower budget') ||
    query.includes('costs')
  ) {
    const allocatedCatering =
      event.budget.categories.find((c) => c.key === 'Catering')?.allocatedAmount ||
      Math.round(totalBudget * 0.35);
    const proposedCateringSaving = Math.round(allocatedCatering * 0.15);
    const newCateringAllocation = allocatedCatering - proposedCateringSaving;

    return {
      intentTag: 'budget_optimization',
      content: `Here is a high-impact cost optimization plan for **${event.title}** (Current Budget: ${formatCurrency(totalBudget, currency)} for ${guestCount} guests):

1. **Catering Strategy (-15% to -20% savings):**
   - Shift from a seated multi-course dinner to interactive live food stations with pass-around finger foods. This eliminates duplicate entrée costs and reduces food wastage by ~22%.
   - Limit alcoholic / mocktail options to 2 signature craft drinks rather than an open shelf bar.
2. **Venue Negotiations:**
   - Ask for bundled audio-visual equipment and complimentary bridal/green room suites.
   - ForIndiranagar or rooftop spaces, shifting event start time by 1 hour earlier often waives overtime staffing surcharges.
3. **Smart Floral & Decor Re-use:**
   - Repurpose entrance arch arrangements onto the main cake/toast backdrop after guest arrivals.

Would you like me to adjust your **Food & Beverages** category allocation from ${formatCurrency(allocatedCatering, currency)} to **${formatCurrency(newCateringAllocation, currency)}** to immediately free up ${formatCurrency(proposedCateringSaving, currency)} in contingency buffer?`,
      actionProposal: {
        id: `prop-budget-${Date.now()}`,
        type: 'reallocate_category',
        title: `Reduce Catering Allocation to ${formatCurrency(newCateringAllocation, currency)}`,
        description: `Lowers Food & Beverages budget by ${formatCurrency(proposedCateringSaving, currency)} (15% saving) to free up contingency funds.`,
        status: 'pending',
        payload: {
          categoryKey: 'Catering',
          amount: newCateringAllocation,
        },
      },
      suggestedFollowUps: [
        'How can I save on venue rentals?',
        'What should I complete this week?',
        'Compare my vendor quotations',
      ],
    };
  }

  // 2. WEEKLY AGENDA & PENDING TASKS
  if (
    query.includes('this week') ||
    query.includes('pending task') ||
    query.includes('what should i complete') ||
    query.includes('to do') ||
    query.includes('checklist') ||
    query.includes('priority') ||
    query.includes('next steps')
  ) {
    const pendingTasks = event.tasks.filter((t) => t.status !== 'completed');
    const urgentTasks = pendingTasks.filter((t) => t.priority === 'urgent' || t.priority === 'high');

    let taskBullets: string;
    if (urgentTasks.length > 0) {
      taskBullets = urgentTasks
        .slice(0, 4)
        .map((t) => `• **${t.title}** (${t.category}) — Due ${formatDate(t.dueDate)} [${t.priority.toUpperCase()}]`)
        .join('\n');
    } else if (pendingTasks.length > 0) {
      taskBullets = pendingTasks
        .slice(0, 4)
        .map((t) => `• **${t.title}** — Due ${formatDate(t.dueDate)}`)
        .join('\n');
    } else {
      taskBullets = '• All recorded tasks are currently marked completed! Great momentum.';
    }

    return {
      intentTag: 'task_agenda',
      content: `You have **${daysLeft} days remaining** until ${event.title} on ${formatDate(event.date)}. 

### Top High-Priority Priorities For This Week:
${taskBullets}

### Strategic Recommendation:
With ${pendingTasks.length} total tasks pending, our immediate priority is locking contracts and confirming headcounts. Unresolved vendor contracts pose the highest risk of last-minute price escalation.

I recommend adding a dedicated task to **"Verify vendor arrival schedules and emergency contact list"** due 5 days before the event.`,
      actionProposal: {
        id: `prop-task-${Date.now()}`,
        type: 'add_task',
        title: 'Add Task: Verify vendor arrival schedules & emergency contacts',
        description: 'Creates a high-priority checklist item under Bookings with a deadline 5 days before event day.',
        status: 'pending',
        payload: {
          title: 'Verify vendor arrival schedules & emergency contact list',
          category: 'Bookings',
          priority: 'high',
          status: 'pending',
          dueDate: new Date(new Date(event.date).getTime() - 5 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          assignee: 'Host / Coordinator',
          notes: 'Collect phone numbers for delivery drivers, decor lead, and venue caretaker.',
        },
      },
      suggestedFollowUps: [
        'Create a seven-day preparation checklist',
        'Compare my vendor quotations',
        'What happens if I increase my guest count?',
      ],
    };
  }

  // 3. GUEST COUNT ADJUSTMENTS & IMPACT
  if (
    query.includes('guest') ||
    query.includes('increase guest') ||
    query.includes('headcount') ||
    query.includes('more people') ||
    query.includes('invite')
  ) {
    const currentGuests = event.guestCount || 80;
    const addedGuests = 20;
    const newGuestCount = currentGuests + addedGuests;
    const cateringCat = event.budget.categories.find((c) => c.key === 'Catering');
    const perGuestCatering = cateringCat
      ? Math.round(cateringCat.allocatedAmount / currentGuests)
      : Math.round((totalBudget * 0.35) / currentGuests);

    const incrementalCost = perGuestCatering * addedGuests;

    return {
      intentTag: 'guest_impact',
      content: `### Headcount Impact Analysis for ${event.title}:

- **Current Guest Count:** ${currentGuests} guests
- **Hypothetical Increase (+${addedGuests} guests):** ${newGuestCount} total guests

### Financial & Operational Ripple Effects:
1. **Direct Catering Cost Surge:**
   - At your estimated rate of **${formatCurrency(perGuestCatering, currency)}/guest**, adding ${addedGuests} guests will increase food & beverage expenditure by approximately **+${formatCurrency(incrementalCost, currency)}**.
2. **Venue Capacity & Seating:**
   - Current venue status: **${event.venueName || event.venueStatus}**. Verify whether your chosen venue's fire code and comfortable seating layout accommodates ${newGuestCount} people without feeling congested.
3. **Return Favors & Glassware:**
   - Estimated additional cost of ~${formatCurrency(addedGuests * 150, currency)} for favors and table settings.

Would you like me to add a quick planning reminder to check venue maximum seating capacity for ${newGuestCount} guests?`,
      actionProposal: {
        id: `prop-guest-task-${Date.now()}`,
        type: 'add_task',
        title: `Verify venue floorplan capacity for ${newGuestCount} guests`,
        description: 'Adds task to check maximum fire code occupancy and seating with venue manager.',
        status: 'pending',
        payload: {
          title: `Audit venue seating capacity for +${addedGuests} guests (${newGuestCount} total)`,
          category: 'Planning',
          priority: 'urgent',
          status: 'pending',
          dueDate: new Date().toISOString().split('T')[0],
          assignee: 'Host',
          notes: `Check if ${event.venueName || 'venue'} has extra chairs and dining buffet clearance.`,
        },
      },
      suggestedFollowUps: [
        'How can I reduce my event costs?',
        'Send RSVP reminder message template',
        'What should I complete this week?',
      ],
    };
  }

  // 4. VENDOR COMPARISON & EVALUATION
  if (
    query.includes('vendor') ||
    query.includes('quotation') ||
    query.includes('compare') ||
    query.includes('quote')
  ) {
    const vendors = event.vendors;
    let vendorSummary: string;

    if (vendors.length > 0) {
      vendorSummary = vendors
        .map(
          (v) =>
            `• **${v.name}** (${v.category}) — Quoted **${formatCurrency(v.quotation.price, currency)}** [Rating: ★ ${v.rating}] • Status: *${v.status.toUpperCase()}*`
        )
        .join('\n');
    } else {
      vendorSummary = '• No vendors recorded yet in your workspace.';
    }

    return {
      intentTag: 'vendor_analysis',
      content: `### Vendor Portfolio Analysis for ${event.title}:

${vendorSummary}

### Observations & Key Recommendations:
1. **Scope Transparency:** Ensure quotations explicitly account for taxes (GST/VAT), late-night overtime cleanup charges, and sound licenses.
2. **Payment Milestones:** Never pay more than 50% upfront before event day setup is physically verified.
3. **Catering Deliverables:** Confirm whether serving cutlery, servers, and drinking water jars are included in base rates.

Would you like me to create an expense record for the shortlisted **${vendors[0]?.name || 'Primary Vendor'}** so your budget tracker accurately monitors committed funds?`,
      actionProposal: {
        id: `prop-vendor-exp-${Date.now()}`,
        type: 'add_expense',
        title: `Record quote expense for ${vendors[0]?.name || 'Primary Vendor'}`,
        description: `Tracks quotation amount of ${formatCurrency(vendors[0]?.quotation.price || 15000, currency)} under ${vendors[0]?.category || 'Venue'} in budget expenses.`,
        status: 'pending',
        payload: {
          categoryKey: vendors[0]?.category || 'Venue',
          name: `Quotation: ${vendors[0]?.name || 'Primary Vendor'}`,
          estimatedAmount: vendors[0]?.quotation.price || 15000,
          actualAmount: 0,
          isPaid: false,
          notes: `Includes: ${(vendors[0]?.quotation.includedServices || []).slice(0, 2).join(', ')}`,
        },
      },
      suggestedFollowUps: [
        'How can I reduce my event costs?',
        'What should I complete this week?',
        'Suggest a unique birthday theme',
      ],
    };
  }

  // 5. THEMES & IDEAS
  if (
    query.includes('theme') ||
    query.includes('idea') ||
    query.includes('inspiration') ||
    query.includes('decor') ||
    query.includes('activity') ||
    query.includes('unique')
  ) {
    let themeIdeas: string;
    let proposedTitle: string;
    let proposedDesc: string;

    if (occasion === 'wedding') {
      themeIdeas = `1. **Royal Rajputana Amber & Marigold:** Brass samovars, earthen terracotta diyas, and sheer marigold hangings.
2. **Minimalist Tuscan Vineyard:** Olive branches, warm festoon lighting, long wooden banquet tables, and handwritten calligraphy place cards.
3. **Contemporary Boho Luxe:** Pampas grass, macramé arches, rattan lounge seating, and sunset terracotta drapery.`;
      proposedTitle = 'Acoustic Sitar & Handpan Sunset Prelude';
      proposedDesc = 'Live atmospheric ambient acoustic music during guest welcome arrivals, creating an intimate, aristocratic atmosphere.';
    } else if (occasion === 'corporate') {
      themeIdeas = `1. **Futuristic Neon Nexus:** Dark graphite palette with electric cyan accents, interactive digital display walls.
2. **Nordic Eco-Luxe:** Natural birch wood elements, living moss walls, zero-plastic artisan catering.
3. **Silicon Valley Casual:** High-energy casual lounge pods, specialty barista station, lightning talk breakout circles.`;
      proposedTitle = 'Digital AI Photobooth with Branded Live Gallery';
      proposedDesc = 'Interactive iPad station that generates custom branded corporate headshots and dynamic GIF cards for attendees to share on LinkedIn.';
    } else {
      // Birthday / Anniversary
      themeIdeas = `1. **Retro Neon 90s Rooftop:** Warm amber and magenta neon signage, cassette-tape placecards, Polaroid guestbook wall, and indie synthesizer tunes.
2. **Midnight in Paris Speakeasy:** Jazz soundtrack, vintage coupe glasses, velvet textures, and dim candlelight.
3. **Sunset Golden Hour Fiesta:** Sangria bar, vibrant floral centerpieces, fairy light canopies, and acoustic covers.`;
      proposedTitle = 'Signature Neon Floral Photo Wall';
      proposedDesc = 'A lush greenery foliage backdrop with warm neon lettering and a basket of Polaroid cameras for instant candid keepsakes.';
    }

    return {
      intentTag: 'theme_suggestions',
      content: `Here are 3 distinct, high-impact aesthetic themes tailored for your **${event.occasion.toUpperCase()}** in **${event.city}**:

${themeIdeas}

### Experiential Concept of the Day:
To make the celebration genuinely unforgettable, incorporate an immersive interactive station rather than standard passive decor.

Would you like me to save the **"${proposedTitle}"** concept into your workspace Ideas gallery?`,
      actionProposal: {
        id: `prop-idea-${Date.now()}`,
        type: 'save_idea',
        title: `Save Idea: "${proposedTitle}"`,
        description: 'Adds this curated concept with an estimated cost into your Ideas & Inspiration library.',
        status: 'pending',
        payload: {
          title: proposedTitle,
          category: 'decor',
          description: proposedDesc,
          estimatedCost: occasion === 'wedding' ? 15000 : 4500,
          tags: ['Aesthetic', 'Interactive', 'Curated'],
        },
      },
      suggestedFollowUps: [
        'How can I reduce my event costs?',
        'Create a seven-day preparation checklist',
        'Compare my vendor quotations',
      ],
    };
  }

  // 6. SEVEN-DAY TIMELINE / RUNBOOK CHECKLIST
  if (
    query.includes('seven-day') ||
    query.includes('7 day') ||
    query.includes('final week') ||
    query.includes('runbook') ||
    query.includes('day schedule') ||
    query.includes('event day')
  ) {
    return {
      intentTag: 'seven_day_countdown',
      content: `### 7-Day Precision Countdown Plan for ${event.title}:

- **T-7 Days:** Lock absolute headcount with caterer. Review dietary exceptions (veg, vegan, Jain, allergies).
- **T-5 Days:** Conduct final walk-through at **${event.venueName || 'venue'}**. Test microphones, power backup, and elevator clearance.
- **T-4 Days:** Confirm arrival times with photographer, DJ, and cake delivery vendors.
- **T-3 Days:** Print or finalize digital seating layouts, name cards, and welcome signage.
- **T-2 Days:** Prepare cash disbursement envelopes for vendor tips and final settlement balances.
- **T-1 Day:** Pack event emergency kit: phone chargers, safety pins, double-sided tape, paracetamol, and printed runbook.
- **Event Day (T-0):** Execution according to your chronological Runbook schedule!

Would you like me to insert the emergency kit preparation task into your checklist right now?`,
      actionProposal: {
        id: `prop-runbook-${Date.now()}`,
        type: 'add_task',
        title: 'Add Task: Assemble Event-Day Emergency Kit',
        description: 'Creates essential preparation checklist item with tape, chargers, safety pins, and cash envelopes.',
        status: 'pending',
        payload: {
          title: 'Assemble Event-Day Emergency Kit (Tape, Chargers, Envelopes)',
          category: 'Event Day',
          priority: 'urgent',
          status: 'pending',
          dueDate: new Date(new Date(event.date).getTime() - 1 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          assignee: 'Host / Coordinator',
          notes: 'Pack scissors, power banks, stain remover wipe, safety pins, and vendor payment envelopes.',
        },
      },
      suggestedFollowUps: [
        'What should I complete this week?',
        'How can I reduce my event costs?',
        'Suggest a unique birthday theme',
      ],
    };
  }

  // DEFAULT CONTEXTUAL ASSISTANT RESPONSE
  return {
    intentTag: 'general_assistance',
    content: `I am your **Gatherly AI Copilot**, synchronized with your active workspace for **${event.title}** (${formatDate(event.date)} in ${event.city}).

### Current Event Snapshot:
- **Budget:** ${formatCurrency(event.budget.total, currency)} (${formatCurrency(totalBudget - (event.budget.expenses.reduce((s, e) => s + (e.isPaid ? e.actualAmount || e.estimatedAmount : 0), 0)), currency)} balance remaining)
- **Guest Count:** ${guestCount} target attendees (${event.guests.filter((g) => g.status === 'confirmed').length} confirmed)
- **Tasks:** ${event.tasks.filter((t) => t.status === 'completed').length} of ${event.tasks.length} tasks completed
- **Vendors:** ${event.vendors.length} vendors in portfolio (${event.vendors.filter((v) => v.status === 'booked').length} booked)

I can help you audit your budget, negotiate vendor quotes, optimize task timelines, generate runbook schedules, or refine your event theme. What would you like to focus on?`,
    suggestedFollowUps: [
      'How can I reduce my event costs?',
      'What should I complete this week?',
      'Suggest a unique birthday theme',
      'What happens if I increase my guest count?',
    ],
  };
}

