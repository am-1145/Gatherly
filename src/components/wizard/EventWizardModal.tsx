import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  PartyPopper,
  Heart,
  Briefcase,
  Users,
  Compass,
  ArrowRight,
  ArrowLeft,
  Check,
  Wand2,
  AlertCircle,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input, Textarea } from '../common/Input';
import { Badge } from '../common/Badge';
import { EventOccasion, CurrencyCode, VenueStatus } from '../../types';
import { useEvent } from '../../context/EventContext';
import {
  parseNaturalLanguageEvent,
  generateEventFromDraft,
  ParsedEventDraft,
} from '../../utils/naturalLanguageParser';
import { generateEventWithGemini, getActiveGeminiApiKey } from '../../services/ai/geminiService';
import { formatCurrency } from '../../utils/formatters';

interface EventWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

export const EventWizardModal: React.FC<EventWizardModalProps> = ({
  isOpen,
  onClose,
  initialPrompt = '',
}) => {
  const { createEvent } = useEvent();
  const navigate = useNavigate();

  // Mode: 'guided' or 'natural'
  const [mode, setMode] = useState<'guided' | 'natural'>(
    initialPrompt ? 'natural' : 'guided'
  );

  // Guided Steps: 1: Occasion, 2: Details, 3: Budget, 4: Preferences, 5: Review
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Natural Language input state
  const [nlPrompt, setNlPrompt] = useState<string>(
    initialPrompt ||
      'I want to organize a birthday party for 80 people in Bangalore with a budget of ₹40,000. I want a classy theme, good food, music, and some fun activities.'
  );

  // Draft state
  const [occasion, setOccasion] = useState<EventOccasion>('birthday');
  const [title, setTitle] = useState('My Dream Celebration');
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 45);
    return d.toISOString().split('T')[0];
  });
  const [city, setCity] = useState('Bengaluru');
  const [venueStatus, setVenueStatus] = useState<VenueStatus>('searching');
  const [guestCount, setGuestCount] = useState<number>(80);
  const [budgetTotal, setBudgetTotal] = useState<number>(45000);
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [theme, setTheme] = useState('Retro Chic & Warm Lights');
  const [foodPreferences, setFoodPreferences] = useState('Multi-cuisine live street food & mocktails');
  const [entertainment, setEntertainment] = useState('Live DJ, dance floor setup, and interactive trivia games');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [assumptions, setAssumptions] = useState<string[]>([]);

  const [isParsingAI, setIsParsingAI] = useState(false);

  // Apply NL Parsing (Using Real Gemini AI if Key is in .env, otherwise fast rule engine)
  const handleParseNaturalLanguage = async () => {
    if (!nlPrompt.trim() || isParsingAI) return;
    const apiKey = getActiveGeminiApiKey();

    if (apiKey) {
      setIsParsingAI(true);
      try {
        const geminiEvent = await generateEventWithGemini(nlPrompt, apiKey);
        if (geminiEvent) {
          createEvent(geminiEvent);
          confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
          onClose();
          navigate('/app');
          return;
        }
      } catch (err) {
        console.warn('Gemini generation failed, falling back to local parser:', err);
      } finally {
        setIsParsingAI(false);
      }
    }

    // Default or fallback local parser
    const parsed: ParsedEventDraft = parseNaturalLanguageEvent(nlPrompt);
    setOccasion(parsed.occasion);
    setTitle(parsed.title);
    setDate(parsed.date);
    setCity(parsed.city);
    setGuestCount(parsed.guestCount);
    setBudgetTotal(parsed.budgetTotal);
    setCurrency(parsed.currency);
    setTheme(parsed.theme);
    setFoodPreferences(parsed.foodPreferences);
    setEntertainment(parsed.entertainment);
    setSpecialRequirements(parsed.specialRequirements);
    setAssumptions(parsed.assumptions);
    setMode('guided');
    setCurrentStep(5); // Jump straight to Review to inspect parsed details
  };

  const handleFinalSubmit = () => {
    const draft: ParsedEventDraft = {
      title: title || `${city} ${occasion.charAt(0).toUpperCase() + occasion.slice(1)}`,
      occasion,
      date,
      city,
      guestCount: Math.max(1, guestCount),
      budgetTotal: Math.max(100, budgetTotal),
      currency,
      theme,
      foodPreferences,
      entertainment,
      specialRequirements,
      assumptions,
    };

    const newEvent = generateEventFromDraft(draft);
    newEvent.venueStatus = venueStatus;
    createEvent(newEvent);

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // non-blocking
    }

    onClose();
    navigate('/app');
  };

  const occasions: Array<{
    type: EventOccasion;
    label: string;
    icon: any;
    desc: string;
  }> = [
    { type: 'wedding', label: 'Wedding', icon: Heart, desc: 'Ceremonies, receptions, sangeet & rituals' },
    { type: 'birthday', label: 'Birthday', icon: PartyPopper, desc: 'Milestone celebrations, theme parties & soirées' },
    { type: 'anniversary', label: 'Anniversary', icon: Sparkles, desc: 'Romantic dinners, renewals & silver jubilees' },
    { type: 'corporate', label: 'Corporate', icon: Briefcase, desc: 'Summits, team offsites & networking dinners' },
    { type: 'community', label: 'Community', icon: Users, desc: 'Fundraisers, local gatherings & club meetups' },
    { type: 'custom', label: 'Custom Event', icon: Compass, desc: 'Bespoke celebrations tailored to any vision' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="xl"
      title={
        <div className="flex items-center justify-between pr-8">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base text-charcoal-900 dark:text-ivory-50">
              Create New Event
            </span>
            <Badge variant="sage" size="sm">
              Gatherly AI
            </Badge>
          </div>
          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-ivory-100 dark:bg-charcoal-800 p-0.5 rounded-lg">
            <button
              onClick={() => setMode('guided')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                mode === 'guided'
                  ? 'bg-white dark:bg-charcoal-700 text-charcoal-900 dark:text-ivory-50 shadow-subtle'
                  : 'text-charcoal-500 hover:text-charcoal-800 dark:hover:text-ivory-200'
              }`}
            >
              Step-by-Step
            </button>
            <button
              onClick={() => setMode('natural')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium flex items-center gap-1 transition-all ${
                mode === 'natural'
                  ? 'bg-white dark:bg-charcoal-700 text-charcoal-900 dark:text-ivory-50 shadow-subtle'
                  : 'text-charcoal-500 hover:text-charcoal-800 dark:hover:text-ivory-200'
              }`}
            >
              <Wand2 className="w-3 h-3 text-sage-600" />
              <span>Prompt AI</span>
            </button>
          </div>
        </div>
      }
    >
      {/* NATURAL LANGUAGE PROMPT MODE */}
      {mode === 'natural' && (
        <div className="space-y-4 py-2">
          <p className="text-xs text-charcoal-600 dark:text-charcoal-400 leading-relaxed">
            Describe your event in plain English. Gatherly AI will parse the occasion, guest count,
            budget, city, and style preferences to assemble your complete structured workspace.
          </p>

          <Textarea
            rows={4}
            value={nlPrompt}
            onChange={(e) => setNlPrompt(e.target.value)}
            placeholder="e.g. I want to organize a birthday party for 80 people in Bangalore with a budget of ₹40,000. I want a classy theme, good food, music, and some fun activities."
          />

          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-charcoal-500 uppercase tracking-wider">
              Example Prompts:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() =>
                  setNlPrompt(
                    'I want to organize a birthday party for 80 people in Bangalore with a budget of ₹40,000. I want a classy theme, good food, music, and some fun activities.'
                  )
                }
                className="text-[11px] px-2.5 py-1 rounded-full bg-ivory-100 hover:bg-ivory-200 dark:bg-charcoal-800 dark:hover:bg-charcoal-700 text-charcoal-700 dark:text-charcoal-300 text-left transition-colors"
              >
                🎂 Bangalore Rooftop 80 Pax Birthday (₹40k)
              </button>
              <button
                type="button"
                onClick={() =>
                  setNlPrompt(
                    'Planning a 220 guest royal heritage wedding in Jaipur with a 15 lakh budget. Need palace decor, folk music, and grand banquet.'
                  )
                }
                className="text-[11px] px-2.5 py-1 rounded-full bg-ivory-100 hover:bg-ivory-200 dark:bg-charcoal-800 dark:hover:bg-charcoal-700 text-charcoal-700 dark:text-charcoal-300 text-left transition-colors"
              >
                👑 Jaipur Palace Wedding (220 Pax, ₹15L)
              </button>
              <button
                type="button"
                onClick={() =>
                  setNlPrompt(
                    'Tech company annual leadership summit in Indiranagar for 120 attendees with $6,000 budget. Need high-speed AV and networking cocktail.'
                  )
                }
                className="text-[11px] px-2.5 py-1 rounded-full bg-ivory-100 hover:bg-ivory-200 dark:bg-charcoal-800 dark:hover:bg-charcoal-700 text-charcoal-700 dark:text-charcoal-300 text-left transition-colors"
              >
                💼 Corporate Tech Summit ($6k)
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-ivory-200 dark:border-charcoal-800">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="sage"
              size="sm"
              leftIcon={<Sparkles className="w-4 h-4" />}
              isLoading={isParsingAI}
              onClick={handleParseNaturalLanguage}
            >
              {isParsingAI ? 'Gemini AI is Planning...' : 'Parse & Generate Workspace'}
            </Button>
          </div>
        </div>
      )}

      {/* GUIDED MULTI-STEP MODE */}
      {mode === 'guided' && (
        <div className="py-2">
          {/* Step Progress Tracker */}
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-ivory-200 dark:border-charcoal-800 text-xs">
            {['Occasion', 'Details', 'Budget', 'Preferences', 'Review'].map((label, idx) => {
              const stepNum = idx + 1;
              const isPast = currentStep > stepNum;
              const isCurrent = currentStep === stepNum;

              return (
                <div key={label} className="flex items-center gap-1.5">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                      isCurrent
                        ? 'bg-sage-600 text-white shadow-subtle'
                        : isPast
                        ? 'bg-sage-100 text-sage-800 dark:bg-sage-900/60 dark:text-sage-200'
                        : 'bg-ivory-200 text-charcoal-500 dark:bg-charcoal-800 dark:text-charcoal-400'
                    }`}
                  >
                    {isPast ? <Check className="w-3.5 h-3.5" /> : stepNum}
                  </span>
                  <span
                    className={`hidden sm:inline font-medium ${
                      isCurrent
                        ? 'text-charcoal-900 dark:text-ivory-50 font-semibold'
                        : 'text-charcoal-500 dark:text-charcoal-400'
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* STEP 1: OCCASION */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <p className="text-xs text-charcoal-600 dark:text-charcoal-400">
                Select the primary occasion you are planning. Gatherly AI will calibrate default
                budget allocation percentages and timeline milestones.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {occasions.map((item) => {
                  const Icon = item.icon;
                  const isSelected = occasion === item.type;
                  return (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setOccasion(item.type)}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-sage-600 bg-sage-50/70 dark:bg-sage-950/40 shadow-subtle ring-1 ring-sage-600'
                          : 'border-ivory-200 dark:border-charcoal-800 hover:border-charcoal-400 dark:hover:border-charcoal-600 bg-white dark:bg-charcoal-900'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                          isSelected
                            ? 'bg-sage-600 text-white'
                            : 'bg-ivory-100 dark:bg-charcoal-800 text-charcoal-600 dark:text-charcoal-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <p className="text-xs font-bold text-charcoal-900 dark:text-ivory-100">
                        {item.label}
                      </p>
                      <p className="text-[10px] text-charcoal-500 dark:text-charcoal-400 line-clamp-2 mt-0.5 leading-tight">
                        {item.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: DETAILS */}
          {currentStep === 2 && (
            <div className="space-y-3.5">
              <Input
                label="Event Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Aarav's 30th Rooftop Soirée"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Event Date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <Input
                  label="City / Location"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Bengaluru, Indiranagar"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Expected Guests"
                  type="number"
                  min={1}
                  value={guestCount}
                  onChange={(e) => setGuestCount(parseInt(e.target.value, 10) || 0)}
                  hint="Used to compute per-head food and beverage budgets."
                />

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 dark:text-charcoal-300 mb-1.5">
                    Venue Status
                  </label>
                  <select
                    value={venueStatus}
                    onChange={(e) => setVenueStatus(e.target.value as VenueStatus)}
                    className="w-full text-sm rounded-lg bg-white dark:bg-charcoal-900 border border-ivory-200 dark:border-charcoal-700 p-2.5 text-charcoal-900 dark:text-ivory-100 focus:outline-none focus:ring-1 focus:ring-sage-500"
                  >
                    <option value="searching">Searching / Need Ideas</option>
                    <option value="shortlisted">Shortlisted Few Options</option>
                    <option value="booked">Already Booked / Confirmed</option>
                    <option value="none">Private Home / Informal</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: BUDGET */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <Input
                    label="Total Target Budget"
                    type="number"
                    min={100}
                    step={1000}
                    value={budgetTotal}
                    onChange={(e) => setBudgetTotal(parseFloat(e.target.value) || 0)}
                    hint={`Estimated ~${formatCurrency(
                      Math.round(budgetTotal / (guestCount || 1)),
                      currency
                    )} per guest.`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 dark:text-charcoal-300 mb-1.5">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                    className="w-full text-sm rounded-lg bg-white dark:bg-charcoal-900 border border-ivory-200 dark:border-charcoal-700 p-2.5 text-charcoal-900 dark:text-ivory-100 focus:outline-none focus:ring-1 focus:ring-sage-500"
                  >
                    <option value="INR">₹ INR (Indian Rupee)</option>
                    <option value="USD">$ USD (US Dollar)</option>
                    <option value="EUR">€ EUR (Euro)</option>
                    <option value="GBP">£ GBP (British Pound)</option>
                  </select>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-ivory-100/70 dark:bg-charcoal-800/60 border border-ivory-200 dark:border-charcoal-700">
                <p className="text-xs font-semibold text-charcoal-800 dark:text-ivory-100 mb-2">
                  Estimated Initial Allocations ({occasion}):
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-charcoal-600 dark:text-charcoal-400">
                  <div className="p-2 rounded bg-white dark:bg-charcoal-900 border border-ivory-200 dark:border-charcoal-700">
                    <span className="block text-[10px] text-charcoal-400">Venue</span>
                    <span className="font-semibold text-charcoal-900 dark:text-ivory-100">
                      {formatCurrency(budgetTotal * 0.25, currency)}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-charcoal-900 border border-ivory-200 dark:border-charcoal-700">
                    <span className="block text-[10px] text-charcoal-400">Food & Drinks</span>
                    <span className="font-semibold text-charcoal-900 dark:text-ivory-100">
                      {formatCurrency(budgetTotal * 0.35, currency)}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-charcoal-900 border border-ivory-200 dark:border-charcoal-700">
                    <span className="block text-[10px] text-charcoal-400">Decor & Lights</span>
                    <span className="font-semibold text-charcoal-900 dark:text-ivory-100">
                      {formatCurrency(budgetTotal * 0.15, currency)}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-charcoal-900 border border-ivory-200 dark:border-charcoal-700">
                    <span className="block text-[10px] text-charcoal-400">Photography</span>
                    <span className="font-semibold text-charcoal-900 dark:text-ivory-100">
                      {formatCurrency(budgetTotal * 0.1, currency)}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-charcoal-900 border border-ivory-200 dark:border-charcoal-700">
                    <span className="block text-[10px] text-charcoal-400">Music & Activities</span>
                    <span className="font-semibold text-charcoal-900 dark:text-ivory-100">
                      {formatCurrency(budgetTotal * 0.08, currency)}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-white dark:bg-charcoal-900 border border-ivory-200 dark:border-charcoal-700">
                    <span className="block text-[10px] text-charcoal-400">Contingency</span>
                    <span className="font-semibold text-charcoal-900 dark:text-ivory-100">
                      {formatCurrency(budgetTotal * 0.07, currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PREFERENCES */}
          {currentStep === 4 && (
            <div className="space-y-3.5">
              <Input
                label="Theme & Aesthetic Style"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="e.g. Retro 90s Rooftop, Royal Heritage, Minimalist Luxe"
              />

              <Input
                label="Food & Beverage Preferences"
                value={foodPreferences}
                onChange={(e) => setFoodPreferences(e.target.value)}
                placeholder="e.g. Vegetarian tapas, live BBQ counter, artisan mocktails"
              />

              <Input
                label="Entertainment & Activities"
                value={entertainment}
                onChange={(e) => setEntertainment(e.target.value)}
                placeholder="e.g. Curated indie playlist, roast trivia game, Polaroid station"
              />

              <Textarea
                label="Special Requirements or Notes"
                rows={2}
                value={specialRequirements}
                onChange={(e) => setSpecialRequirements(e.target.value)}
                placeholder="Any sound curfew restrictions, accessibility needs, or key moments"
              />
            </div>
          )}

          {/* STEP 5: REVIEW & SUMMARY */}
          {currentStep === 5 && (
            <div className="space-y-3.5">
              {assumptions.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex gap-2.5 text-xs text-amber-800 dark:text-amber-200">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <span className="font-semibold block mb-0.5">Assumptions made by AI parser:</span>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                      {assumptions.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div className="p-4 rounded-xl bg-ivory-50 dark:bg-charcoal-800/50 border border-ivory-200 dark:border-charcoal-700 space-y-3 text-xs">
                <div className="flex justify-between items-start pb-2 border-b border-ivory-200 dark:border-charcoal-700">
                  <div>
                    <p className="text-sm font-bold text-charcoal-900 dark:text-ivory-50">
                      {title}
                    </p>
                    <p className="text-[11px] text-charcoal-500 capitalize">
                      {occasion} • {city} • {date}
                    </p>
                  </div>
                  <Badge variant="sage" size="md">
                    {guestCount} Guests
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-charcoal-700 dark:text-charcoal-300">
                  <div>
                    <span className="text-[10px] uppercase text-charcoal-400 block font-semibold">
                      Budget
                    </span>
                    <span className="font-bold text-sm text-sage-700 dark:text-sage-400">
                      {formatCurrency(budgetTotal, currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-charcoal-400 block font-semibold">
                      Venue Status
                    </span>
                    <span className="capitalize">{venueStatus}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] uppercase text-charcoal-400 block font-semibold">
                      Theme & Style
                    </span>
                    <span>{theme}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] uppercase text-charcoal-400 block font-semibold">
                      Food & Music
                    </span>
                    <span>
                      {foodPreferences} • {entertainment}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-charcoal-500 dark:text-charcoal-400 italic text-center">
                Confirming will populate your live workspace with categorized budget items, starter
                vendors, checklist timeline, and an initial event-day schedule. Everything remains
                100% editable.
              </p>
            </div>
          )}

          {/* Stepper Footer Controls */}
          <div className="flex justify-between items-center pt-5 mt-4 border-t border-ivory-200 dark:border-charcoal-800">
            {currentStep > 1 ? (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                onClick={() => setCurrentStep((s) => s - 1)}
              >
                Back
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 5 ? (
              <Button
                variant="primary"
                size="sm"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => setCurrentStep((s) => s + 1)}
              >
                Next Step
              </Button>
            ) : (
              <Button
                variant="sage"
                size="md"
                leftIcon={<Sparkles className="w-4 h-4" />}
                onClick={handleFinalSubmit}
              >
                Generate Workspace
              </Button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

