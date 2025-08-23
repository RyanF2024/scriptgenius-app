// Genre constants
export const GENRES = [
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Family',
  'Fantasy',
  'Film-Noir',
  'Horror',
  'Musical',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Short',
  'Thriller',
  'War',
  'Western',
  'Biography',
  'History',
  'Sport',
  'Superhero',
  'Teen',
  'Coming of Age',
  'Dark Comedy',
  'Satire',
  'Mockumentary',
  'Noir',
  'Psychological Thriller',
] as const;

export type Genre = typeof GENRES[number];

// User roles
export const USER_ROLES = [
  { value: 'writer', label: 'Screenwriter' },
  { value: 'producer', label: 'Producer' },
  { value: 'director', label: 'Director' },
  { value: 'student', label: 'Film Student' },
  { value: 'other', label: 'Other' },
] as const;

// Experience levels
export const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Just starting out' },
  { value: 'intermediate', label: 'Some experience' },
  { value: 'advanced', label: 'Experienced' },
  { value: 'professional', label: 'Professional' },
] as const;

// Writing goals
export const WRITING_GOALS = [
  { 
    value: 'first_draft', 
    label: 'Complete my first draft',
    description: 'I need help getting my ideas on paper'
  },
  { 
    value: 'improve_skills', 
    label: 'Improve my writing skills',
    description: 'I want to learn and grow as a writer'
  },
  { 
    value: 'get_published', 
    label: 'Get published or produced',
    description: 'I want to take my writing to the next level'
  },
  { 
    value: 'career_advancement', 
    label: 'Advance my career',
    description: 'I want to break into the industry'
  },
  { 
    value: 'personal_project', 
    label: 'Work on a personal project',
    description: 'I write for fun or personal fulfillment'
  },
] as const;

// Onboarding steps
export const ONBOARDING_STEPS = [
  { id: 'welcome', title: 'Welcome', description: 'Get started with ScriptGenius' },
  { id: 'profile', title: 'Your Profile', description: 'Tell us about yourself' },
  { id: 'preferences', title: 'Preferences', description: 'Set your writing preferences' },
  { id: 'goals', title: 'Your Goals', description: 'What do you want to achieve?' },
  { id: 'complete', title: 'All Set!', description: 'Start using ScriptGenius' },
] as const;

// API routes
export const API_ROUTES = {
  ONBOARDING: '/api/onboarding',
};
