import React, { useState, useMemo } from 'react';
import {
  Heart,
  Plus,
  CheckCircle2,
  Search,
} from 'lucide-react';
import { useEvent } from '../context/EventContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Input, Textarea } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { IdeaItem } from '../types';
import { formatCurrency } from '../utils/formatters';

const IDEA_CATEGORIES = [
  { key: 'All', label: 'All Ideas' },
  { key: 'theme', label: 'Themes' },
  { key: 'decor', label: 'Decorations' },
  { key: 'food', label: 'Food & Menus' },
  { key: 'entertainment', label: 'Entertainment' },
  { key: 'return_gifts', label: 'Return Gifts' },
  { key: 'budget_friendly', label: 'Budget Friendly' },
  { key: 'sustainable', label: 'Sustainable' },
];

export const IdeasPage: React.FC = () => {
  const {
    activeEvent,
    toggleFavoriteIdea,
    addCustomIdea,
    convertIdeaToTask,
    addIdeaToBudget,
  } = useEvent();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // Modal
  const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false);
  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaCategory, setIdeaCategory] = useState<IdeaItem['category']>('decor');
  const [ideaDesc, setIdeaDesc] = useState('');
  const [ideaCost, setIdeaCost] = useState<number>(3000);
  const [ideaTags, setIdeaTags] = useState('Creative, High Impact');

  const currency = activeEvent?.budget?.currency || 'INR';

  const filteredIdeas = useMemo(() => {
    const list = activeEvent?.ideas || [];
    return list.filter((item) => {
      if (onlyFavorites && !item.isFavorite) return false;
      if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !item.title.toLowerCase().includes(q) &&
          !item.description.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [activeEvent?.ideas, onlyFavorites, selectedCategory, searchQuery]);

  if (!activeEvent) return null;

  const handleSaveIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaTitle.trim()) return;

    addCustomIdea({
      title: ideaTitle.trim(),
      category: ideaCategory,
      description: ideaDesc.trim(),
      estimatedCost: ideaCost,
      tags: ideaTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });

    setIdeaTitle('');
    setIdeaDesc('');
    setIdeaCost(3000);
    setIsIdeaModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-ivory-200 dark:border-charcoal-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-extrabold text-charcoal-900 dark:text-ivory-50 tracking-tight">
              Ideas & Aesthetic Inspiration
            </h1>
            <Badge variant="sage" size="sm">
              {activeEvent.ideas.length} Saved Concepts
            </Badge>
          </div>
          <p className="text-xs text-charcoal-500">
            Curated experiential themes, decor arrangements, and interactive entertainment elements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400" />
            <input
              type="text"
              placeholder="Search concepts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg text-xs bg-white dark:bg-charcoal-900 border border-ivory-200 dark:border-charcoal-700 text-charcoal-900 dark:text-ivory-100 placeholder-charcoal-400 focus:outline-none focus:border-sage-500"
            />
          </div>

          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${onlyFavorites
                ? 'bg-red-50 border-red-300 text-red-700 dark:bg-red-950/50 dark:border-red-800 dark:text-red-300'
                : 'bg-white dark:bg-charcoal-900 border-ivory-200 dark:border-charcoal-700 text-charcoal-600 dark:text-charcoal-400 hover:bg-ivory-100'
              }`}
          >
            <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-current text-red-600' : ''}`} />
            <span>Favorites ({activeEvent.ideas.filter((i) => i.isFavorite).length})</span>
          </button>

          <Button
            variant="sage"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsIdeaModalOpen(true)}
          >
            Add Idea
          </Button>
        </div>
      </div>

      {/* Categories Horizontal Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-ivory-200 dark:border-charcoal-800">
        {IDEA_CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedCategory === cat.key
                ? 'bg-charcoal-900 text-ivory-50 dark:bg-ivory-100 dark:text-charcoal-900 shadow-subtle'
                : 'text-charcoal-600 dark:text-charcoal-400 hover:bg-ivory-100 dark:hover:bg-charcoal-800'
              }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Ideas Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredIdeas.length === 0 ? (
          <div className="col-span-full py-12 text-center text-charcoal-400">
            No ideas matching the selected filters.
          </div>
        ) : (
          filteredIdeas.map((idea) => (
            <Card
              key={idea.id}
              padding="lg"
              className="flex flex-col justify-between hover:border-sage-400 transition-all text-left"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant="sage" size="sm">
                    {idea.category.toUpperCase().replace('_', ' ')}
                  </Badge>
                  <button
                    onClick={() => toggleFavoriteIdea(idea.id)}
                    className="p-1 rounded-md text-charcoal-400 hover:text-red-500 transition-colors"
                    title={idea.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart
                      className={`w-4 h-4 ${idea.isFavorite ? 'fill-red-500 text-red-500' : ''
                        }`}
                    />
                  </button>
                </div>

                <h3 className="text-base font-bold text-charcoal-900 dark:text-ivory-50 mb-1.5">
                  {idea.title}
                </h3>

                <p className="text-xs text-charcoal-600 dark:text-charcoal-400 leading-relaxed mb-4">
                  {idea.description}
                </p>

                {idea.estimatedCost && (
                  <div className="flex items-center gap-1.5 text-xs text-charcoal-500 mb-3">
                    <span className="text-[10px] uppercase font-bold text-charcoal-400">
                      Est. Cost:
                    </span>
                    <span className="font-bold text-charcoal-800 dark:text-ivory-100">
                      {formatCurrency(idea.estimatedCost, currency)}
                    </span>
                  </div>
                )}

                {/* Tags */}
                {idea.tags && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {idea.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-ivory-100 dark:bg-charcoal-800 text-charcoal-500"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons to convert to Task or Budget */}
              <div className="pt-3 border-t border-ivory-100 dark:border-charcoal-800 flex items-center justify-between gap-2">
                {idea.convertedToTaskId ? (
                  <span className="text-[11px] font-semibold text-sage-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Added to Tasks
                  </span>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => convertIdeaToTask(idea.id)}
                  >
                    Convert to Task
                  </Button>
                )}

                {idea.estimatedCost && (
                  idea.addedToBudget ? (
                    <span className="text-[11px] font-semibold text-sage-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      In Budget
                    </span>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addIdeaToBudget(idea.id)}
                      className="text-sage-700 dark:text-sage-300 hover:bg-sage-50"
                    >
                      + Add to Budget
                    </Button>
                  )
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add Custom Idea Modal */}
      <Modal
        isOpen={isIdeaModalOpen}
        onClose={() => setIsIdeaModalOpen(false)}
        title="Add Creative Concept or Idea"
      >
        <form onSubmit={handleSaveIdea} className="space-y-3.5 py-2">
          <Input
            label="Idea Concept Title"
            value={ideaTitle}
            onChange={(e) => setIdeaTitle(e.target.value)}
            placeholder="e.g. Vintage Champagne Coupe Tower, Polaroid Guest Wall"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 dark:text-charcoal-300 mb-1.5">
                Category
              </label>
              <select
                value={ideaCategory}
                onChange={(e) => setIdeaCategory(e.target.value as any)}
                className="w-full text-sm rounded-lg bg-white dark:bg-charcoal-900 border border-ivory-200 dark:border-charcoal-700 p-2.5 text-charcoal-900 dark:text-ivory-100 focus:outline-none focus:ring-1 focus:ring-sage-500"
              >
                <option value="decor">Decorations</option>
                <option value="theme">Theme & Aesthetics</option>
                <option value="food">Food & Drinks</option>
                <option value="entertainment">Entertainment</option>
                <option value="return_gifts">Return Gifts</option>
                <option value="sustainable">Sustainable</option>
                <option value="budget_friendly">Budget Friendly</option>
              </select>
            </div>

            <Input
              label={`Estimated Cost (${currency})`}
              type="number"
              min={0}
              step={500}
              value={ideaCost}
              onChange={(e) => setIdeaCost(parseFloat(e.target.value) || 0)}
            />
          </div>

          <Textarea
            label="Concept Description & Setup Details"
            rows={3}
            value={ideaDesc}
            onChange={(e) => setIdeaDesc(e.target.value)}
            placeholder="How this will be staged and the experiential impact on attendees"
            required
          />

          <Input
            label="Tags (comma-separated)"
            value={ideaTags}
            onChange={(e) => setIdeaTags(e.target.value)}
            placeholder="Interactive, Keepsake, Photogenic"
          />

          <div className="flex justify-end gap-2.5 pt-4 border-t border-ivory-200 dark:border-charcoal-800">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setIsIdeaModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="sage" size="sm" type="submit">
              Save Concept
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

