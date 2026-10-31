import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Wallet,
  CheckSquare,
  Users,
  Store,
  Clock,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { useEvent } from '../context/EventContext';
import { EventWizardModal } from '../components/wizard/EventWizardModal';
import { parseNaturalLanguageEvent, generateEventFromDraft } from '../utils/naturalLanguageParser';
import { generateEventWithGemini, getActiveGeminiApiKey } from '../services/ai/geminiService';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { createEvent, events, setActiveEventId } = useEvent();
  const [prompt, setPrompt] = useState(
    'I want to organize a birthday party for 80 people in Bangalore with a budget of ₹40,000. I want a classy theme, good food, music, and some fun activities.'
  );
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const [isInstantPlanning, setIsInstantPlanning] = useState(false);

  const handleInstantPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isInstantPlanning) return;

    const apiKey = getActiveGeminiApiKey();
    if (apiKey) {
      setIsInstantPlanning(true);
      try {
        const geminiEvent = await generateEventWithGemini(prompt, apiKey);
        if (geminiEvent) {
          createEvent(geminiEvent);
          navigate('/app');
          return;
        }
      } catch (err) {
        console.warn('Gemini planning failed, falling back to local generator:', err);
      } finally {
        setIsInstantPlanning(false);
      }
    }

    const parsed = parseNaturalLanguageEvent(prompt);
    const newEvent = generateEventFromDraft(parsed);
    createEvent(newEvent);
    navigate('/app');
  };

  const handleJumpToSample = (eventId: string) => {
    setActiveEventId(eventId);
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-ivory-50 dark:bg-charcoal-950 text-charcoal-900 dark:text-ivory-100 flex flex-col selection:bg-sage-200">
      {/* Top Navbar */}
      <header className="h-20 border-b border-ivory-200/80 dark:border-charcoal-800 bg-ivory-50/80 dark:bg-charcoal-950/80 backdrop-blur-md sticky top-0 z-30 px-6 sm:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sage-600 to-sage-500 flex items-center justify-center text-white font-bold text-lg shadow-subtle">
            G
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-charcoal-900 dark:text-ivory-50">
              Gatherly
            </span>
            <span className="text-[11px] font-semibold tracking-wider text-sage-600 dark:text-sage-400 ml-1 uppercase">
              AI
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-charcoal-600 dark:text-charcoal-300">
          <a href="#features" className="hover:text-charcoal-900 dark:hover:text-white transition-colors">
            Capabilities
          </a>
          <a href="#how-it-works" className="hover:text-charcoal-900 dark:hover:text-white transition-colors">
            How it Works
          </a>
          <a href="#samples" className="hover:text-charcoal-900 dark:hover:text-white transition-colors">
            Sample Workspaces
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleJumpToSample(events[0]?.id || 'demo-bday-blr')}
          >
            Live Demo
          </Button>
          <Button
            variant="sage"
            size="sm"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            onClick={() => navigate('/app')}
          >
            Open Dashboard
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-6 sm:px-12 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage-100/70 dark:bg-sage-950/60 border border-sage-200 dark:border-sage-800 text-sage-800 dark:text-sage-300 text-xs font-semibold mb-6 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-sage-600" />
          <span>Intelligent Event Planning Workspace • Frontend Pure</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-charcoal-900 dark:text-ivory-50 max-w-4xl mx-auto leading-[1.15] mb-6">
          Turn a simple event idea into a{' '}
          <span className="italic font-serif font-normal text-sage-700 dark:text-sage-400">
            structured, stress-free
          </span>{' '}
          master plan.
        </h1>

        <p className="text-base sm:text-lg text-charcoal-600 dark:text-charcoal-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          From weddings and landmark birthdays to executive tech summits. Gatherly AI synthesizes
          budgets, timelines, checklists, vendor quotations, and day-of runbooks in seconds.
        </p>

        {/* Large Natural Language Prompt Input */}
        <div className="max-w-3xl mx-auto mb-8">
          <form
            onSubmit={handleInstantPlan}
            className="p-2 sm:p-3 bg-white dark:bg-charcoal-900 rounded-2xl border border-ivory-300 dark:border-charcoal-700 shadow-elevated focus-within:ring-2 focus-within:ring-sage-500/20 focus-within:border-sage-500 transition-all text-left"
          >
            <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-400 px-3 pt-1">
              Describe your celebration
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Planning a 150-guest wedding in Jaipur with a 12 lakh budget, royal decor, live folk music, and gourmet Rajasthani feast..."
              className="w-full text-xs sm:text-sm bg-transparent p-3 text-charcoal-900 dark:text-ivory-50 placeholder-charcoal-400 focus:outline-none resize-none leading-relaxed"
            />
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 px-2 border-t border-ivory-100 dark:border-charcoal-800">
              <div className="text-[11px] text-charcoal-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-sage-600" />
                <span>Runs 100% in your browser • Local storage persistence</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => setIsWizardOpen(true)}
                >
                  Step Wizard
                </Button>
                <Button
                  type="submit"
                  variant="sage"
                  size="md"
                  className="w-full sm:w-auto font-semibold"
                  leftIcon={<Sparkles className="w-4 h-4" />}
                  isLoading={isInstantPlanning}
                >
                  {isInstantPlanning ? 'Gemini is Synthesizing...' : 'Assemble My Workspace'}
                </Button>
              </div>
            </div>
          </form>

          {/* Example prompt buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <span className="text-[11px] text-charcoal-400 font-medium">Try clicking:</span>
            <button
              onClick={() =>
                setPrompt(
                  'I want to organize a birthday party for 80 people in Bangalore with a budget of ₹40,000. I want a classy theme, good food, music, and some fun activities.'
                )
              }
              className="text-[11px] px-2.5 py-1 rounded-full bg-ivory-200/70 hover:bg-ivory-200 dark:bg-charcoal-800 dark:hover:bg-charcoal-700 text-charcoal-700 dark:text-charcoal-300 transition-colors"
            >
              🎂 80 Pax Bangalore Birthday (₹40,000)
            </button>
            <button
              onClick={() =>
                setPrompt(
                  'Royal palace wedding for 250 guests in Jaipur with ₹18,00,000 budget, brass lamps, folk troupe and royal buffet.'
                )
              }
              className="text-[11px] px-2.5 py-1 rounded-full bg-ivory-200/70 hover:bg-ivory-200 dark:bg-charcoal-800 dark:hover:bg-charcoal-700 text-charcoal-700 dark:text-charcoal-300 transition-colors"
            >
              👑 Jaipur Heritage Wedding (₹18 Lakh)
            </button>
            <button
              onClick={() =>
                setPrompt(
                  'Annual corporate leadership summit for 150 attendees in Hyderabad with ₹3,50,000 budget and executive lunch.'
                )
              }
              className="text-[11px] px-2.5 py-1 rounded-full bg-ivory-200/70 hover:bg-ivory-200 dark:bg-charcoal-800 dark:hover:bg-charcoal-700 text-charcoal-700 dark:text-charcoal-300 transition-colors"
            >
              💼 Tech Leadership Summit (₹3.5 Lakh)
            </button>
          </div>
        </div>

        {/* Dashboard Preview Teaser Card */}
        <div className="mt-12 p-3 sm:p-5 rounded-3xl bg-gradient-to-b from-ivory-200 to-ivory-100 dark:from-charcoal-800 dark:to-charcoal-900 border border-ivory-300 dark:border-charcoal-700 shadow-elevated">
          <div className="rounded-2xl bg-white dark:bg-charcoal-900 p-6 text-left border border-ivory-200 dark:border-charcoal-800 shadow-subtle">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-ivory-100 dark:border-charcoal-800">
              <div>
                <span className="text-[11px] font-bold text-sage-600 dark:text-sage-400 uppercase tracking-wider">
                  Live Event Preview
                </span>
                <h3 className="text-xl font-bold text-charcoal-900 dark:text-ivory-50 mt-0.5">
                  Aarav’s 30th Rooftop Soirée
                </h3>
                <p className="text-xs text-charcoal-500">
                  Indiranagar, Bengaluru • 80 Guests • Saturday, Nov 28, 2026
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="sage" size="md">
                  30 Days Left
                </Badge>
                <Button
                  variant="primary"
                  size="sm"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  onClick={() => handleJumpToSample('demo-bday-blr')}
                >
                  Explore This Workspace
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="p-3.5 rounded-xl bg-ivory-50 dark:bg-charcoal-800/60 border border-ivory-200 dark:border-charcoal-700">
                <span className="text-[10px] uppercase font-bold text-charcoal-400 block">
                  Total Budget
                </span>
                <span className="text-lg font-extrabold text-charcoal-900 dark:text-ivory-50">
                  ₹45,000
                </span>
                <span className="text-[11px] text-sage-600 block mt-0.5">₹26,400 remaining</span>
              </div>
              <div className="p-3.5 rounded-xl bg-ivory-50 dark:bg-charcoal-800/60 border border-ivory-200 dark:border-charcoal-700">
                <span className="text-[10px] uppercase font-bold text-charcoal-400 block">
                  RSVP Attendance
                </span>
                <span className="text-lg font-extrabold text-charcoal-900 dark:text-ivory-50">
                  66 / 80
                </span>
                <span className="text-[11px] text-charcoal-500 block mt-0.5">82% confirmation</span>
              </div>
              <div className="p-3.5 rounded-xl bg-ivory-50 dark:bg-charcoal-800/60 border border-ivory-200 dark:border-charcoal-700">
                <span className="text-[10px] uppercase font-bold text-charcoal-400 block">
                  Tasks Done
                </span>
                <span className="text-lg font-extrabold text-charcoal-900 dark:text-ivory-50">
                  3 of 7
                </span>
                <span className="text-[11px] text-amber-600 block mt-0.5">4 pending this week</span>
              </div>
              <div className="p-3.5 rounded-xl bg-ivory-50 dark:bg-charcoal-800/60 border border-ivory-200 dark:border-charcoal-700">
                <span className="text-[10px] uppercase font-bold text-charcoal-400 block">
                  Vendors Booked
                </span>
                <span className="text-lg font-extrabold text-charcoal-900 dark:text-ivory-50">
                  2 Booked
                </span>
                <span className="text-[11px] text-charcoal-500 block mt-0.5">1 shortlisted</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section id="features" className="py-20 px-6 sm:px-12 max-w-6xl mx-auto border-t border-ivory-200 dark:border-charcoal-800">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-sage-600 dark:text-sage-400">
            Comprehensive Toolkit
          </span>
          <h2 className="text-3xl font-extrabold text-charcoal-900 dark:text-ivory-50 mt-1">
            Everything you need from blueprint to final toast.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card padding="lg" className="hover:border-sage-400 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-sage-50 dark:bg-sage-950 text-sage-600 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-charcoal-900 dark:text-ivory-100 mb-1.5">
              Gemini-Style AI Copilot
            </h4>
            <p className="text-xs text-charcoal-600 dark:text-charcoal-400 leading-relaxed mb-4">
              Context-aware assistant that references your live budget numbers, pending tasks, and guest counts to formulate cost-saving tactics and checklist items.
            </p>
            <div className="text-[11px] font-semibold text-sage-700 dark:text-sage-400 flex items-center gap-1">
              <span>Proposes one-click action cards</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </Card>

          <Card padding="lg" className="hover:border-sage-400 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-terracotta-50 dark:bg-terracotta-950 text-terracotta-600 flex items-center justify-center mb-4">
              <Wallet className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-charcoal-900 dark:text-ivory-100 mb-1.5">
              Dynamic Budget Breakdown
            </h4>
            <p className="text-xs text-charcoal-600 dark:text-charcoal-400 leading-relaxed mb-4">
              Visual category distribution charts, paid status tracking, vendor quotation buffers, and instant warning banners when allocations breach limits.
            </p>
            <div className="text-[11px] font-semibold text-terracotta-700 dark:text-terracotta-400 flex items-center gap-1">
              <span>Deterministic calculations</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </Card>

          <Card padding="lg" className="hover:border-sage-400 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center mb-4">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-charcoal-900 dark:text-ivory-100 mb-1.5">
              Milestone Timeline & Tasks
            </h4>
            <p className="text-xs text-charcoal-600 dark:text-charcoal-400 leading-relaxed mb-4">
              Auto-generates preparation milestones based on your event date. Switch between list view and stage boards with urgency labels and assignees.
            </p>
            <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
              <span>Interactive stage workflow</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </Card>

          <Card padding="lg" className="hover:border-sage-400 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-charcoal-900 dark:text-ivory-100 mb-1.5">
              Guest List & RSVP Tracker
            </h4>
            <p className="text-xs text-charcoal-600 dark:text-charcoal-400 leading-relaxed mb-4">
              Household grouping, plus-one accounting, dietary requirements (Jain, Vegan, Gluten-free), WhatsApp invitation generator, and CSV exports.
            </p>
            <div className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-1">
              <span>Dietary tally & export</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </Card>

          <Card padding="lg" className="hover:border-sage-400 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center mb-4">
              <Store className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-charcoal-900 dark:text-ivory-100 mb-1.5">
              Vendor Quotation Matrix
            </h4>
            <p className="text-xs text-charcoal-600 dark:text-charcoal-400 leading-relaxed mb-4">
              Side-by-side comparison of deliverables, exclusions, payment milestones, and ratings. Clearly separates verified sample vendors from custom entries.
            </p>
            <div className="text-[11px] font-semibold text-purple-700 dark:text-purple-400 flex items-center gap-1">
              <span>Side-by-side comparison modal</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </Card>

          <Card padding="lg" className="hover:border-sage-400 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-charcoal-900 dark:text-ivory-100 mb-1.5">
              Chronological Day-of Runbook
            </h4>
            <p className="text-xs text-charcoal-600 dark:text-charcoal-400 leading-relaxed mb-4">
              Minute-by-minute schedule for decorators, sound engineers, hosts, and caterers with mobile-friendly status toggling and issue flagging.
            </p>
            <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <span>Mobile execution mode</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </Card>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 px-6 sm:px-12 bg-ivory-100/60 dark:bg-charcoal-900/60 border-t border-ivory-200 dark:border-charcoal-800">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-sage-600 dark:text-sage-400">
            Frictionless Process
          </span>
          <h2 className="text-3xl font-extrabold text-charcoal-900 dark:text-ivory-50 mt-1 mb-12">
            From prompt to execution in three intuitive steps.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="p-6 rounded-2xl bg-white dark:bg-charcoal-900 border border-ivory-200 dark:border-charcoal-800 shadow-card">
              <div className="w-8 h-8 rounded-full bg-sage-600 text-white font-bold text-xs flex items-center justify-center mb-4">
                1
              </div>
              <h4 className="text-sm font-bold text-charcoal-900 dark:text-ivory-100 mb-2">
                Describe Your Event
              </h4>
              <p className="text-xs text-charcoal-500 leading-relaxed">
                Provide budget, guest count, city, and theme preferences via plain English or our guided multi-step wizard.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-charcoal-900 border border-ivory-200 dark:border-charcoal-800 shadow-card">
              <div className="w-8 h-8 rounded-full bg-sage-600 text-white font-bold text-xs flex items-center justify-center mb-4">
                2
              </div>
              <h4 className="text-sm font-bold text-charcoal-900 dark:text-ivory-100 mb-2">
                AI Assembles the Framework
              </h4>
              <p className="text-xs text-charcoal-500 leading-relaxed">
                Deterministic calculations allocate funds across Venue, Catering, Decor, and Music, with tailored tasks and sample vendor profiles.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-charcoal-900 border border-ivory-200 dark:border-charcoal-800 shadow-card">
              <div className="w-8 h-8 rounded-full bg-sage-600 text-white font-bold text-xs flex items-center justify-center mb-4">
                3
              </div>
              <h4 className="text-sm font-bold text-charcoal-900 dark:text-ivory-100 mb-2">
                Co-Plan & Execute
              </h4>
              <p className="text-xs text-charcoal-500 leading-relaxed">
                Consult the Gatherly AI Copilot for cost-cutting ideas, lock RSVPs, and follow the chronological day-of runbook.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-10 px-6 sm:px-12 border-t border-ivory-200 dark:border-charcoal-800 bg-white dark:bg-charcoal-950 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-charcoal-500">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-sage-600 text-white font-bold text-xs flex items-center justify-center">
            G
          </div>
          <span className="font-semibold text-charcoal-800 dark:text-ivory-100">Gatherly AI</span>
          <span>— Frontend-Only Event Planning Suite</span>
        </div>
        <p className="text-charcoal-400">
          All data persists locally in browser LocalStorage. No server, no account required.
        </p>
      </footer>

      {/* Global Wizard Modal */}
      <EventWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        initialPrompt={prompt}
      />
    </div>
  );
};
