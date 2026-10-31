export type EventOccasion =
  | 'wedding'
  | 'birthday'
  | 'anniversary'
  | 'corporate'
  | 'community'
  | 'custom';

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

export type VenueStatus = 'booked' | 'shortlisted' | 'searching' | 'none';

export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskCategory =
  | 'Planning'
  | 'Bookings'
  | 'Invitations'
  | 'Preparations'
  | 'Event Day'
  | 'Follow-up';

export interface TaskItem {
  id: string;
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string; // ISO date string YYYY-MM-DD
  assignee?: string;
  notes?: string;
}

export type BudgetCategoryKey =
  | 'Venue'
  | 'Catering'
  | 'Decoration'
  | 'Photography'
  | 'Entertainment'
  | 'Clothing'
  | 'Transport'
  | 'Miscellaneous';

export interface BudgetCategory {
  key: string;
  name: string;
  allocatedAmount: number;
  color?: string;
  iconName?: string;
}

export interface ExpenseItem {
  id: string;
  categoryKey: string;
  name: string;
  estimatedAmount: number;
  actualAmount: number;
  isPaid: boolean;
  vendorId?: string;
  notes?: string;
  paymentDate?: string;
}

export type RSVPStatus = 'confirmed' | 'tentative' | 'declined' | 'pending';
export type DietaryPreference = 'Standard' | 'Vegetarian' | 'Vegan' | 'Gluten-Free' | 'Jain' | 'Halal';

export interface GuestItem {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  group: 'Family' | 'Friends' | 'VIP' | 'Colleagues' | 'Vendors' | 'Other';
  status: RSVPStatus;
  diet: DietaryPreference;
  plusOnes: number;
  tableOrArea?: string;
  notes?: string;
}

export type VendorStatus = 'shortlisted' | 'contacted' | 'booked' | 'rejected';

export interface VendorQuotation {
  price: number;
  includedServices: string[];
  exclusions: string[];
  paymentTerms: string;
  validUntil?: string;
}

export interface VendorItem {
  id: string;
  name: string;
  category: string;
  status: VendorStatus;
  contactName: string;
  phone: string;
  email: string;
  website?: string;
  rating: number; // e.g. 4.8
  quotation: VendorQuotation;
  notes?: string;
  followUpDate?: string;
  isVerifiedSample?: boolean;
}

export interface IdeaItem {
  id: string;
  title: string;
  category: 'theme' | 'decor' | 'food' | 'entertainment' | 'return_gifts' | 'budget_friendly' | 'sustainable';
  description: string;
  estimatedCost?: number;
  tags: string[];
  isFavorite: boolean;
  convertedToTaskId?: string;
  addedToBudget?: boolean;
}

export type RunbookStatus = 'pending' | 'in_progress' | 'completed' | 'flagged';

export interface RunbookItem {
  id: string;
  time: string; // e.g. "09:00 AM" or "14:30"
  durationMinutes?: number;
  title: string;
  responsible: string;
  location?: string;
  status: RunbookStatus;
  notes?: string;
}

export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: 'budget' | 'timeline' | 'vendor' | 'guest';
  suggestedAction?: {
    type: 'add_task' | 'reallocate_budget' | 'send_rsvp_reminder' | 'review_vendor';
    payload: Record<string, unknown>;
  };
}

export interface EventPreferences {
  theme?: string;
  style?: string;
  foodPreferences?: string;
  entertainment?: string;
  specialRequirements?: string;
}

export interface EventModel {
  id: string;
  title: string;
  occasion: EventOccasion;
  date: string; // YYYY-MM-DD
  city: string;
  venueStatus: VenueStatus;
  venueName?: string;
  guestCount: number;
  budget: {
    total: number;
    currency: CurrencyCode;
    categories: BudgetCategory[];
    expenses: ExpenseItem[];
  };
  tasks: TaskItem[];
  guests: GuestItem[];
  vendors: VendorItem[];
  ideas: IdeaItem[];
  runbook: RunbookItem[];
  recommendations: AIRecommendation[];
  preferences: EventPreferences;
  createdAt: string;
  updatedAt: string;
}

