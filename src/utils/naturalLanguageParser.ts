import {
  EventModel,
  EventOccasion,
  CurrencyCode,
  BudgetCategory,
  ExpenseItem,
  TaskItem,
  VendorItem,
  IdeaItem,
  RunbookItem,
  AIRecommendation,
} from '../types';

export interface ParsedEventDraft {
  title: string;
  occasion: EventOccasion;
  guestCount: number;
  city: string;
  date: string;
  budgetTotal: number;
  currency: CurrencyCode;
  theme: string;
  foodPreferences: string;
  entertainment: string;
  specialRequirements: string;
  assumptions: string[];
}

export function parseNaturalLanguageEvent(prompt: string): ParsedEventDraft {
  const text = prompt.toLowerCase();
  const assumptions: string[] = [];

  // 1. Detect Occasion
  let occasion: EventOccasion = 'custom';
  let titleOccasion = 'Special Celebration';

  if (text.includes('wedding') || text.includes('marriage') || text.includes('sangeet') || text.includes('reception')) {
    occasion = 'wedding';
    titleOccasion = 'Wedding Celebration';
  } else if (text.includes('birthday') || text.includes('bday')) {
    occasion = 'birthday';
    titleOccasion = 'Birthday Bash';
  } else if (text.includes('anniversary')) {
    occasion = 'anniversary';
    titleOccasion = 'Anniversary Celebration';
  } else if (
    text.includes('corporate') ||
    text.includes('conference') ||
    text.includes('retreat') ||
    text.includes('summit') ||
    text.includes('company') ||
    text.includes('team')
  ) {
    occasion = 'corporate';
    titleOccasion = 'Corporate Gathering';
  } else if (text.includes('community') || text.includes('meetup') || text.includes('gathering') || text.includes('fundraiser')) {
    occasion = 'community';
    titleOccasion = 'Community Gathering';
  }

  // 2. Extract Guest Count
  let guestCount = 60; // fallback assumption
  const guestMatch = prompt.match(/(\d+)\s*(?:people|guests|pax|attendees|persons|members|friends)/i);
  if (guestMatch) {
    guestCount = parseInt(guestMatch[1], 10);
  } else {
    const forMatch = prompt.match(/for\s+(\d+)\b/i);
    if (forMatch) {
      guestCount = parseInt(forMatch[1], 10);
    } else {
      assumptions.push(`Guest count not clearly stated; assumed ${guestCount} guests.`);
    }
  }

  // 3. Extract Budget & Currency
  let currency: CurrencyCode = 'INR';
  if (prompt.includes('$') || text.includes('usd') || text.includes('dollar')) currency = 'USD';
  else if (prompt.includes('€') || text.includes('eur') || text.includes('euro')) currency = 'EUR';
  else if (prompt.includes('£') || text.includes('gbp') || text.includes('pound')) currency = 'GBP';

  let budgetTotal = 50000;
  // Match currency and amount like ₹40,000 or 10 lakh or 40k or $5,000
  const budgetMatch = prompt.match(/(?:budget\s*(?:of|is|:)?\s*|[₹$€£]|rs\.?\s*|inr\s*)(\d+(?:,\d+)*(?:\.\d+)?)\s*(k|lakh|lac|m|cr|crore|million|thousand)?/i) ||
                     prompt.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*(k|lakh|lac|m|cr|crore|million|thousand)\s*(?:budget|inr|rs|usd|\$|₹)?/i);

  if (budgetMatch) {
    let rawNum = parseFloat(budgetMatch[1].replace(/,/g, ''));
    const unit = (budgetMatch[2] || '').toLowerCase();

    if (unit === 'k' || unit === 'thousand') {
      rawNum *= 1000;
    } else if (unit === 'lakh' || unit === 'lac') {
      rawNum *= 100000;
    } else if (unit === 'cr' || unit === 'crore') {
      rawNum *= 10000000;
    } else if (unit === 'm' || unit === 'million') {
      rawNum *= 1000000;
    }
    budgetTotal = Math.round(rawNum);
  } else {
    if (occasion === 'wedding') budgetTotal = currency === 'INR' ? 800000 : 25000;
    else if (occasion === 'corporate') budgetTotal = currency === 'INR' ? 250000 : 8000;
    else budgetTotal = currency === 'INR' ? 40000 : 2000;
    assumptions.push(`Budget was estimated at ${currency} ${budgetTotal.toLocaleString()} based on ${occasion} standards.`);
  }

  // 4. Extract Location / City (NEVER default to Bangalore unless specified!)
  let city: string | null = null;

  // Check known major destinations first (case-insensitive)
  const knownCities: Record<string, string> = {
    bangalore: 'Bengaluru',
    bengaluru: 'Bengaluru',
    indiranagar: 'Indiranagar, Bengaluru',
    koramangala: 'Koramangala, Bengaluru',
    mumbai: 'Mumbai',
    delhi: 'New Delhi',
    'new delhi': 'New Delhi',
    jaipur: 'Jaipur',
    udaipur: 'Udaipur',
    goa: 'Goa',
    'south goa': 'South Goa',
    'north goa': 'North Goa',
    hyderabad: 'Hyderabad',
    chennai: 'Chennai',
    kolkata: 'Kolkata',
    pune: 'Pune',
    ahmedabad: 'Ahmedabad',
    paris: 'Paris',
    london: 'London',
    'new york': 'New York',
    nyc: 'New York',
    dubai: 'Dubai',
    singapore: 'Singapore',
    tokyo: 'Tokyo',
    chicago: 'Chicago',
    toronto: 'Toronto',
    bali: 'Bali',
    amsterdam: 'Amsterdam',
    sydney: 'Sydney',
    rome: 'Rome',
  };

  for (const [key, standardName] of Object.entries(knownCities)) {
    const cityRegex = new RegExp(`\\b${key}\\b`, 'i');
    if (cityRegex.test(text)) {
      city = standardName;
      break;
    }
  }

  // If not in known list, use dynamic preposition matching: "in [Location]" or "at [Location]"
  if (!city) {
    const locMatch = prompt.match(/\b(?:in|at|around|near|destination\s+is)\s+([A-Za-z][A-Za-z\s]{1,25})(?=[,.]|\s+(?:with|for|on|having|budget|during|having|within)\b|$)/i);
    if (locMatch) {
      const candidate = locMatch[1].trim();
      const stopWords = ['a', 'an', 'the', 'my', 'our', 'december', 'november', 'october', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'evening', 'morning', 'afternoon', 'night', 'hotel', 'hall', 'venue', 'advance'];
      if (!stopWords.includes(candidate.toLowerCase()) && candidate.length > 2) {
        // Capitalize words
        city = candidate.replace(/\b\w/g, (c) => c.toUpperCase());
      }
    }
  }

  // If STILL no location detected, DO NOT assume Bangalore! Mark as Location TBD
  if (!city) {
    city = 'Location TBD';
    assumptions.push('Location was not specified in prompt; marked as Location TBD.');
  }

  // 5. Date calculation (Default to 45 days from today)
  const targetDateObj = new Date();
  targetDateObj.setDate(targetDateObj.getDate() + 45);
  const dateStr = targetDateObj.toISOString().split('T')[0];

  // 6. Preferences extraction
  let theme = 'Modern Elegance';
  if (text.includes('classy')) theme = 'Classy Contemporary';
  else if (text.includes('royal') || text.includes('palace')) theme = 'Royal Heritage';
  else if (text.includes('retro') || text.includes('vintage')) theme = 'Retro Chic';
  else if (text.includes('rustic') || text.includes('boho')) theme = 'Bohemian Rustic';
  else if (text.includes('neon') || text.includes('party')) theme = 'Neon Glow & Electric Beats';
  else if (text.includes('minimalist') || text.includes('clean')) theme = 'Minimalist Luxe';
  else if (text.includes('beach') || text.includes('coastal')) theme = 'Coastal Tropical Sunset';

  let foodPreferences = 'Multi-cuisine appetizers & plated dinner';
  if (text.includes('veg') && !text.includes('non-veg')) foodPreferences = 'Pure Vegetarian gourmet spread';
  else if (text.includes('vegan')) foodPreferences = 'Artisanal Vegan menu';
  else if (text.includes('bbq') || text.includes('barbecue')) foodPreferences = 'Live BBQ & craft beverages';

  let entertainment = 'Background acoustic music & curated playlist';
  if (text.includes('dj') || text.includes('music')) entertainment = 'Live DJ, dance floor setup, and interactive games';
  if (text.includes('activity') || text.includes('activities') || text.includes('fun')) {
    entertainment += ' + interactive party games & photo booth';
  }

  const title = city !== 'Location TBD' ? `${city} ${titleOccasion}` : `My ${titleOccasion}`;

  return {
    title,
    occasion,
    guestCount,
    city,
    date: dateStr,
    budgetTotal,
    currency,
    theme,
    foodPreferences,
    entertainment,
    specialRequirements: prompt.trim(),
    assumptions,
  };
}

export function generateEventFromDraft(draft: ParsedEventDraft): EventModel {
  const eventId = `event-${Date.now()}`;
  const total = draft.budgetTotal;

  // Occasion-specific budget percentages
  let venuePct = 0.25;
  let cateringPct = 0.35;
  let decorPct = 0.15;
  let photoPct = 0.10;
  let entertainmentPct = 0.08;
  let miscPct = 0.07;

  if (draft.occasion === 'wedding') {
    venuePct = 0.28;
    cateringPct = 0.32;
    decorPct = 0.16;
    photoPct = 0.12;
    entertainmentPct = 0.06;
    miscPct = 0.06;
  } else if (draft.occasion === 'birthday') {
    venuePct = 0.20;
    cateringPct = 0.40;
    decorPct = 0.15;
    photoPct = 0.08;
    entertainmentPct = 0.12;
    miscPct = 0.05;
  }

  const categories: BudgetCategory[] = [
    { key: 'Venue', name: 'Venue & Spaces', allocatedAmount: Math.round(total * venuePct) },
    { key: 'Catering', name: 'Food & Beverages', allocatedAmount: Math.round(total * cateringPct) },
    { key: 'Decoration', name: 'Decor & Florals', allocatedAmount: Math.round(total * decorPct) },
    { key: 'Photography', name: 'Photo & Video', allocatedAmount: Math.round(total * photoPct) },
    { key: 'Entertainment', name: 'Music & Activities', allocatedAmount: Math.round(total * entertainmentPct) },
    { key: 'Miscellaneous', name: 'Contingency & Gifts', allocatedAmount: Math.round(total * miscPct) },
  ];

  const expenses: ExpenseItem[] = [
    {
      id: `exp-1`,
      categoryKey: 'Venue',
      name: 'Venue advance deposit',
      estimatedAmount: Math.round(categories[0].allocatedAmount * 0.5),
      actualAmount: 0,
      isPaid: false,
      notes: 'Due upon contract signing',
    },
    {
      id: `exp-2`,
      categoryKey: 'Catering',
      name: `Catering deposit (${draft.guestCount} covers)`,
      estimatedAmount: Math.round(categories[1].allocatedAmount * 0.4),
      actualAmount: 0,
      isPaid: false,
      notes: `Estimated per head cost: ${draft.currency} ${Math.round(categories[1].allocatedAmount / draft.guestCount)}`,
    },
    {
      id: `exp-3`,
      categoryKey: 'Decoration',
      name: `${draft.theme} backdrop & floral arrangements`,
      estimatedAmount: Math.round(categories[2].allocatedAmount * 0.6),
      actualAmount: 0,
      isPaid: false,
    },
    {
      id: `exp-4`,
      categoryKey: 'Entertainment',
      name: 'Sound system rental & DJ booking',
      estimatedAmount: Math.round(categories[4].allocatedAmount * 0.7),
      actualAmount: 0,
      isPaid: false,
    },
  ];

  // Default tasks based on date
  const targetDate = new Date(draft.date);
  const formatDateOffset = (daysBefore: number) => {
    const d = new Date(targetDate);
    d.setDate(d.getDate() - daysBefore);
    return d.toISOString().split('T')[0];
  };

  const locationContext = draft.city !== 'Location TBD' ? `in ${draft.city}` : 'for celebration';

  const tasks: TaskItem[] = [
    {
      id: `task-1`,
      title: `Finalize venue contract ${locationContext}`,
      category: 'Bookings',
      priority: 'urgent',
      status: 'pending',
      dueDate: formatDateOffset(35),
      assignee: 'You',
      notes: 'Check sound curfew, air conditioning, and in-house catering policies',
    },
    {
      id: `task-2`,
      title: `Confirm menu tasting for ${draft.guestCount} guests`,
      category: 'Preparations',
      priority: 'high',
      status: 'pending',
      dueDate: formatDateOffset(28),
      assignee: 'Food Lead',
      notes: draft.foodPreferences,
    },
    {
      id: `task-3`,
      title: `Send digital save-the-dates & RSVP links`,
      category: 'Invitations',
      priority: 'high',
      status: 'pending',
      dueDate: formatDateOffset(25),
      assignee: 'Host',
      notes: `Target guest count: ${draft.guestCount}`,
    },
    {
      id: `task-4`,
      title: `Approve decor moodboard & entrance design`,
      category: 'Planning',
      priority: 'medium',
      status: 'pending',
      dueDate: formatDateOffset(18),
      assignee: 'Decor Lead',
      notes: `Theme: ${draft.theme}`,
    },
    {
      id: `task-5`,
      title: 'Curate party playlist & activity sequence',
      category: 'Planning',
      priority: 'medium',
      status: 'pending',
      dueDate: formatDateOffset(12),
      assignee: 'Entertainment Lead',
      notes: draft.entertainment,
    },
    {
      id: `task-6`,
      title: 'Final RSVP head-count lock & seating plan',
      category: 'Preparations',
      priority: 'urgent',
      status: 'pending',
      dueDate: formatDateOffset(5),
      assignee: 'You',
      notes: 'Pass final headcount to caterer',
    },
    {
      id: `task-7`,
      title: 'Pack emergency kit & vendor payment envelopes',
      category: 'Event Day',
      priority: 'medium',
      status: 'pending',
      dueDate: formatDateOffset(1),
      assignee: 'Host',
      notes: 'Cash balances, tape, safety pins, charger hubs',
    },
  ];

  // Dynamic vendor naming adapted to the city
  const venueTitle =
    draft.city !== 'Location TBD'
      ? `${draft.city} Grand Skyline Terrace & Hall`
      : 'Elegance Grand Celebration Terrace';

  const catererTitle =
    draft.city !== 'Location TBD'
      ? `${draft.city} Culinary Crafters`
      : 'Artisan Culinary Crafters';

  const vendors: VendorItem[] = [
    {
      id: `ven-1`,
      name: venueTitle,
      category: 'Venue',
      status: 'shortlisted',
      contactName: 'Venue Manager',
      phone: '+91 98450 12345',
      email: 'events@celebrationvenue.in',
      rating: 4.8,
      quotation: {
        price: Math.round(categories[0].allocatedAmount * 0.95),
        includedServices: ['Main hall & open deck for 6 hours', 'Basic ambient lighting & round tables', 'Dedicated event coordinator'],
        exclusions: ['DJ sound equipment', 'Alcohol corkage fee', 'Valet parking'],
        paymentTerms: '40% advance on booking, 60% morning of event',
      },
      notes: 'Offers backup power generator and flexible seating arrangements.',
      isVerifiedSample: true,
    },
    {
      id: `ven-2`,
      name: catererTitle,
      category: 'Catering',
      status: 'shortlisted',
      contactName: 'Executive Chef',
      phone: '+91 97412 88900',
      email: 'chef@artisancrafters.com',
      rating: 4.9,
      quotation: {
        price: Math.round(categories[1].allocatedAmount * 0.92),
        includedServices: ['4 live counter appetizers', '3 main course stations', 'Dessert buffet & beverage bar', 'Service staff & glassware'],
        exclusions: ['Hard spirits', 'Extra hour service fee'],
        paymentTerms: '50% booking advance, 50% post-event completion',
      },
      notes: 'Includes food tasting session prior to final menu sign-off.',
      isVerifiedSample: true,
    },
    {
      id: `ven-3`,
      name: 'Lumina Aesthetic Floral & Decors',
      category: 'Decoration',
      status: 'contacted',
      contactName: 'Creative Director',
      phone: '+91 99001 44556',
      email: 'hello@luminadecors.com',
      rating: 4.7,
      quotation: {
        price: Math.round(categories[2].allocatedAmount * 0.88),
        includedServices: [`${draft.theme} customized backdrop`, 'Entry passage lighting', 'Fresh centerpieces on guest tables'],
        exclusions: ['Custom neon signs', 'LED wall rentals'],
        paymentTerms: '30% advance, 70% upon installation',
      },
      isVerifiedSample: true,
    },
  ];

  // Ideas
  const ideas: IdeaItem[] = [
    {
      id: `idea-1`,
      title: 'Interactive Polaroid Guestbook Station',
      category: 'entertainment',
      description: 'Set up an aesthetic vintage table with two instax cameras, metallic pens, and washi tape. Guests snap a candid and tape it alongside their message.',
      estimatedCost: 3500,
      tags: ['Interactive', 'Keepsake', 'Low-effort'],
      isFavorite: true,
    },
    {
      id: `idea-2`,
      title: 'Signature Welcome Drinks with Dry Ice Mist',
      category: 'food',
      description: 'Greet guests with a themed signature refresher served in coupe glasses with subtle food-grade aroma smoke for instant wow factor.',
      estimatedCost: 4500,
      tags: ['Cocktails', 'Visual Appeal', 'Hospitality'],
      isFavorite: false,
    },
    {
      id: `idea-3`,
      title: 'Fairy Light Canopy with Hanging Greenery',
      category: 'decor',
      description: 'Warm 2700K fairy lights strung in a gentle ceiling canopy with eucalyptus and ivy trails, transforming the venue into an intimate sanctuary.',
      estimatedCost: 7500,
      tags: ['Ambiance', 'Cozy', 'Photogenic'],
      isFavorite: true,
    },
    {
      id: `idea-4`,
      title: 'Seed-Paper Thank You Cards & Plantable Favors',
      category: 'sustainable',
      description: 'Handmade plantable wild-flower seed paper cards thanking guests for attending. Zero waste and creates lasting memories.',
      estimatedCost: 2000,
      tags: ['Eco-friendly', 'Thoughtful', 'Budget'],
      isFavorite: false,
    },
  ];

  // Runbook
  const runbook: RunbookItem[] = [
    {
      id: `rb-1`,
      time: '03:00 PM',
      durationMinutes: 60,
      title: 'Venue handover & decor team access',
      responsible: 'Host & Decor Lead',
      location: 'Main Hall',
      status: 'pending',
      notes: 'Check stage position, air conditioning, and electrical sockets',
    },
    {
      id: `rb-2`,
      time: '04:30 PM',
      durationMinutes: 45,
      title: 'Sound check & playlist sync',
      responsible: 'DJ / AV Lead',
      location: 'DJ Booth',
      status: 'pending',
      notes: 'Test wireless microphones and baseline volume levels',
    },
    {
      id: `rb-3`,
      time: '05:30 PM',
      durationMinutes: 30,
      title: 'Catering live counters setup & welcome drinks chill',
      responsible: 'Caterer Captain',
      location: 'Dining Veranda',
      status: 'pending',
      notes: 'Verify vegetarian food counter separation and water dispensers',
    },
    {
      id: `rb-4`,
      time: '06:30 PM',
      durationMinutes: 60,
      title: 'Guest arrivals, welcome cocktails & photo station',
      responsible: 'Greeter / Family',
      location: 'Entrance Foyer',
      status: 'pending',
    },
    {
      id: `rb-5`,
      time: '08:00 PM',
      durationMinutes: 45,
      title: 'Main celebration moment & toast',
      responsible: 'Host',
      location: 'Center Stage',
      status: 'pending',
      notes: 'Cue highlight lights and music',
    },
    {
      id: `rb-6`,
      time: '08:45 PM',
      durationMinutes: 75,
      title: 'Dinner buffet open & ambient music',
      responsible: 'Caterer Captain',
      location: 'Dining Area',
      status: 'pending',
    },
    {
      id: `rb-7`,
      time: '10:30 PM',
      durationMinutes: 30,
      title: 'Return favors handover & guest sendoff',
      responsible: 'Host Team',
      location: 'Exit Foyer',
      status: 'pending',
    },
  ];

  // AI Recommendations
  const recommendations: AIRecommendation[] = [
    {
      id: `rec-1`,
      title: 'Lock Venue Advance within 7 days',
      description: `Popular weekend dates get booked quickly. Secure your slot early with ${vendors[0]?.name || 'the venue'}.`,
      impact: 'high',
      category: 'vendor',
    },
    {
      id: `rec-2`,
      title: `Buffer 10% for Catering Overrun`,
      description: `With ${draft.guestCount} guests, a buffer of ${draft.currency} ${Math.round(categories[1].allocatedAmount * 0.1).toLocaleString()} helps cover last-minute RSVP additions.`,
      impact: 'medium',
      category: 'budget',
    },
    {
      id: `rec-3`,
      title: 'Send Digital Save-the-Dates Early',
      description: 'Sending save-the-dates 4 weeks ahead improves attendance confirmation rate by ~35%.',
      impact: 'medium',
      category: 'timeline',
    },
  ];

  return {
    id: eventId,
    title: draft.title,
    occasion: draft.occasion,
    date: draft.date,
    city: draft.city,
    venueStatus: 'searching',
    venueName: venueTitle,
    guestCount: draft.guestCount,
    budget: {
      total,
      currency: draft.currency,
      categories,
      expenses,
    },
    tasks,
    guests: [
      {
        id: 'g-1',
        name: 'Aditya & Priya Rao',
        group: 'Family',
        status: 'confirmed',
        diet: 'Vegetarian',
        plusOnes: 1,
        tableOrArea: 'Table 1',
        phone: '+91 98200 11223',
      },
      {
        id: 'g-2',
        name: 'Karan Mehra',
        group: 'Friends',
        status: 'confirmed',
        diet: 'Standard',
        plusOnes: 0,
        tableOrArea: 'Table 2',
        phone: '+91 98450 33445',
      },
      {
        id: 'g-3',
        name: 'Neha Chawla',
        group: 'Friends',
        status: 'tentative',
        diet: 'Vegan',
        plusOnes: 1,
        phone: '+91 99110 55667',
      },
    ],
    vendors,
    ideas,
    runbook,
    recommendations,
    preferences: {
      theme: draft.theme,
      foodPreferences: draft.foodPreferences,
      entertainment: draft.entertainment,
      specialRequirements: draft.specialRequirements,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
