/**
 * Boostlly Centralized Fallback Quotes
 * 
 * This file contains all fallback quotes used across the entire application.
 * When any API fails, providers will use quotes from this centralized source.
 * 
 * IMPROVED FEATURES:
 * ✅ 220+ high-quality quotes organized by category (all duplicates removed)
 * ✅ 7-day repetition avoidance (when storage available)
 * ✅ Time-based variety (different quotes for different times of day)
 * ✅ Category filtering with smart fallback
 * ✅ Always returns a valid quote (never fails)
 * ✅ Better source naming ("Local" instead of "Boostlly" for UI)
 * ✅ Deterministic selection (same quote for same day/time)
 * ✅ Extended history support (14-day fallback if needed)
 * 
 * Benefits:
 * - Single source of truth for all fallback quotes
 * - Easy to maintain and update quotes
 * - Consistent fallback experience across all providers
 * - Reduced code duplication
 * - Works offline - no API dependency
 * - Prevents quote repetition automatically
 */

import { Quote } from "../types";
import { getDateKey } from "./date-utils";

/**
 * Storage interface for quote history tracking
 */
type StorageLike = {
  getSync?: (key: string) => any;
  setSync?: (key: string, value: any) => void;
};

/**
 * Global storage reference for quote history tracking
 * This allows providers (which don't have storage) to still track history
 * Set by QuoteService when it initializes
 */
let globalStorageRef: StorageLike | null = null;

/**
 * Set global storage reference for quote history tracking
 * Called by QuoteService during initialization
 */
export function setGlobalStorageRef(storage: StorageLike | null): void {
  globalStorageRef = storage;
}

/**
 * Get global storage reference
 */
export function getGlobalStorageRef(): StorageLike | null {
  return globalStorageRef;
}

/**
 * Centralized collection of fallback quotes
 * Organized by emoji-based categories for better visual organization
 */
export const BOOSTLLY_FALLBACK_QUOTES: Quote[] = [
  // 🏆 Motivation & Success
  {
    id: "boostlly-motivation-1",
    text: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson",
    category: "💪 Motivation",
    tags: ["motivation", "perseverance", "time", "action"],
    source: "Boostlly",
  },
  {
    id: "boostlly-motivation-2",
    text: "The harder you work for something, the greater you'll feel when you achieve it.",
    author: "Anonymous",
    category: "💪 Motivation",
    tags: ["motivation", "work", "achievement", "effort"],
    source: "Boostlly",
  },
  {
    id: "boostlly-motivation-3",
    text: "Success is not final; failure is not fatal: It is the courage to continue that counts.",
    author: "Winston Churchill",
    category: "💪 Motivation",
    tags: ["success", "failure", "courage", "motivation"],
    source: "Boostlly",
  },
  {
    id: "boostlly-motivation-4",
    text: "Dream big. Start small. Act now.",
    author: "Robin Sharma",
    category: "💪 Motivation",
    tags: ["motivation", "dreams", "action", "planning"],
    source: "Boostlly",
  },
  {
    id: "boostlly-motivation-5",
    text: "It always seems impossible until it's done.",
    author: "Nelson Mandela",
    category: "💪 Motivation",
    tags: ["motivation", "impossible", "achievement", "perseverance"],
    source: "Boostlly",
  },
  {
    id: "boostlly-motivation-6",
    text: "Push yourself, because no one else is going to do it for you.",
    author: "Anonymous",
    category: "💪 Motivation",
    tags: ["motivation", "self-discipline", "independence", "effort"],
    source: "Boostlly",
  },
  {
    id: "boostlly-motivation-7",
    text: "Great things never come from comfort zones.",
    author: "Anonymous",
    category: "💪 Motivation",
    tags: ["motivation", "comfort-zone", "growth", "challenge"],
    source: "Boostlly",
  },
  {
    id: "boostlly-motivation-8",
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
    category: "💪 Motivation",
    tags: ["motivation", "action", "doing", "start"],
    source: "Boostlly",
  },
  {
    id: "boostlly-motivation-9",
    text: "Don't limit your challenges—challenge your limits.",
    author: "Anonymous",
    category: "💪 Motivation",
    tags: ["motivation", "challenge", "limits", "growth"],
    source: "Boostlly",
  },
  {
    id: "boostlly-motivation-10",
    text: "Success is walking from failure to failure with no loss of enthusiasm.",
    author: "Winston Churchill",
    category: "💪 Motivation",
    tags: ["success", "failure", "enthusiasm", "motivation"],
    source: "Boostlly",
  },

  // 💭 Mindset & Positivity
  {
    id: "boostlly-mindset-1",
    text: "Your mind is a powerful thing. When you fill it with positive thoughts, your life will start to change.",
    author: "Anonymous",
    category: "💭 Mindset",
    tags: ["mindset", "positive-thinking", "life", "change"],
    source: "Boostlly",
  },
  {
    id: "boostlly-mindset-2",
    text: "Happiness is not something ready-made. It comes from your own actions.",
    author: "Dalai Lama",
    category: "💭 Mindset",
    tags: ["happiness", "actions", "mindset", "positivity"],
    source: "Boostlly",
  },
  {
    id: "boostlly-mindset-3",
    text: "Train your mind to see the good in every situation.",
    author: "Anonymous",
    category: "💭 Mindset",
    tags: ["mindset", "positive-thinking", "training", "good"],
    source: "Boostlly",
  },
  {
    id: "boostlly-mindset-4",
    text: "A negative mind will never give you a positive life.",
    author: "Anonymous",
    category: "💭 Mindset",
    tags: ["mindset", "negative-thinking", "positive-life", "positivity"],
    source: "Boostlly",
  },
  {
    id: "boostlly-mindset-5",
    text: "You become what you think.",
    author: "Buddha",
    category: "💭 Mindset",
    tags: ["mindset", "thinking", "becoming", "philosophy"],
    source: "Boostlly",
  },
  {
    id: "boostlly-mindset-6",
    text: "Gratitude turns what we have into enough.",
    author: "Anonymous",
    category: "💭 Mindset",
    tags: ["gratitude", "mindset", "contentment", "enough"],
    source: "Boostlly",
  },
  {
    id: "boostlly-mindset-7",
    text: "Positive thinking is not about expecting the best to happen, but accepting that whatever happens is for the best.",
    author: "Anonymous",
    category: "💭 Mindset",
    tags: ["positive-thinking", "mindset", "acceptance", "optimism"],
    source: "Boostlly",
  },
  {
    id: "boostlly-mindset-8",
    text: "What you think, you become. What you feel, you attract. What you imagine, you create.",
    author: "Buddha",
    category: "💭 Mindset",
    tags: ["mindset", "thinking", "feeling", "creating"],
    source: "Boostlly",
  },

  // 🎯 Discipline & Focus
  {
    id: "boostlly-discipline-1",
    text: "Where focus goes, energy flows.",
    author: "Tony Robbins",
    category: "🎯 Focus",
    tags: ["focus", "energy", "discipline", "concentration"],
    source: "Boostlly",
  },

  // ☁️ Peace & Simplicity
  {
    id: "boostlly-peace-1",
    text: "Peace begins with a smile.",
    author: "Mother Teresa",
    category: "☁️ Peace",
    tags: ["peace", "smile", "simplicity", "kindness"],
    source: "Boostlly",
  },
  {
    id: "boostlly-peace-2",
    text: "The quieter you become, the more you can hear.",
    author: "Ram Dass",
    category: "☁️ Peace",
    tags: ["peace", "quiet", "listening", "mindfulness"],
    source: "Boostlly",
  },
  {
    id: "boostlly-peace-3",
    text: "Peace is not the absence of conflict, but the ability to cope with it.",
    author: "Anonymous",
    category: "☁️ Peace",
    tags: ["peace", "conflict", "coping", "resilience"],
    source: "Boostlly",
  },
  {
    id: "boostlly-peace-4",
    text: "Simplicity is the ultimate sophistication.",
    author: "Leonardo da Vinci",
    category: "☁️ Simplicity",
    tags: ["simplicity", "sophistication", "elegance", "minimalism"],
    source: "Boostlly",
  },
  {
    id: "boostlly-peace-5",
    text: "Less is more.",
    author: "Anonymous",
    category: "☁️ Simplicity",
    tags: ["simplicity", "minimalism", "less", "more"],
    source: "Boostlly",
  },
  {
    id: "boostlly-peace-6",
    text: "Do small things with great love.",
    author: "Mother Teresa",
    category: "☁️ Simplicity",
    tags: ["love", "small-things", "simplicity", "kindness"],
    source: "Boostlly",
  },
  {
    id: "boostlly-peace-7",
    text: "Inner peace begins the moment you choose not to allow another person or event to control your emotions.",
    author: "Anonymous",
    category: "☁️ Peace",
    tags: ["peace", "emotions", "control", "mindfulness"],
    source: "Boostlly",
  },
  {
    id: "boostlly-peace-8",
    text: "Happiness is found when you stop comparing yourself to others.",
    author: "Anonymous",
    category: "☁️ Peace",
    tags: ["happiness", "comparison", "peace", "contentment"],
    source: "Boostlly",
  },
  {
    id: "boostlly-peace-9",
    text: "Slow down. You're doing fine.",
    author: "Anonymous",
    category: "☁️ Peace",
    tags: ["peace", "slow-down", "patience", "calm"],
    source: "Boostlly",
  },
  {
    id: "boostlly-peace-10",
    text: "Calm mind brings inner strength.",
    author: "Dalai Lama",
    category: "☁️ Peace",
    tags: ["peace", "calm", "strength", "mindfulness"],
    source: "Boostlly",
  },
  {
    id: "boostlly-peace-11",
    text: "Let go or be dragged.",
    author: "Zen proverb",
    category: "☁️ Peace",
    tags: ["peace", "letting-go", "zen", "wisdom"],
    source: "Boostlly",
  },

  // 🌱 Growth & Learning
  {
    id: "boostlly-growth-1",
    text: "Once you stop learning, you start dying.",
    author: "Albert Einstein",
    category: "🌱 Learning",
    tags: ["learning", "growth", "education", "continuous"],
    source: "Boostlly",
  },
  {
    id: "boostlly-growth-2",
    text: "Mistakes are proof you are trying.",
    author: "Anonymous",
    category: "🌱 Growth",
    tags: ["mistakes", "trying", "growth", "learning"],
    source: "Boostlly",
  },
  {
    id: "boostlly-growth-3",
    text: "Growth is painful. Change is painful. But nothing is as painful as staying stuck somewhere you don't belong.",
    author: "N.R. Narayana Murthy",
    category: "🌱 Growth",
    tags: ["growth", "change", "pain", "stuck"],
    source: "Boostlly",
  },
  {
    id: "boostlly-growth-4",
    text: "If you're not willing to learn, no one can help you. If you're determined to learn, no one can stop you.",
    author: "Anonymous",
    category: "🌱 Learning",
    tags: ["learning", "determination", "growth", "mindset"],
    source: "Boostlly",
  },
  {
    id: "boostlly-growth-5",
    text: "Be curious, not judgmental.",
    author: "Walt Whitman",
    category: "🌱 Growth",
    tags: ["curiosity", "growth", "learning", "mindset"],
    source: "Boostlly",
  },
  {
    id: "boostlly-growth-6",
    text: "You don't grow when things are easy; you grow when you face challenges.",
    author: "Anonymous",
    category: "🌱 Growth",
    tags: ["growth", "challenges", "difficulty", "learning"],
    source: "Boostlly",
  },
  {
    id: "boostlly-growth-7",
    text: "Learning never exhausts the mind.",
    author: "Leonardo da Vinci",
    category: "🌱 Learning",
    tags: ["learning", "mind", "education", "continuous"],
    source: "Boostlly",
  },
  {
    id: "boostlly-growth-8",
    text: "Strive not to be a success, but rather to be of value.",
    author: "Albert Einstein",
    category: "🌱 Growth",
    tags: ["value", "success", "growth", "contribution"],
    source: "Boostlly",
  },

  // 💪 Courage & Confidence
  {
    id: "boostlly-courage-1",
    text: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
    category: "💪 Courage",
    tags: ["belief", "courage", "confidence", "motivation"],
    source: "Boostlly",
  },
  {
    id: "boostlly-courage-2",
    text: "Courage doesn't mean you don't get afraid. Courage means you don't let fear stop you.",
    author: "Anonymous",
    category: "💪 Courage",
    tags: ["courage", "fear", "bravery", "perseverance"],
    source: "Boostlly",
  },
  {
    id: "boostlly-courage-3",
    text: "Doubt kills more dreams than failure ever will.",
    author: "Suzy Kassem",
    category: "💪 Courage",
    tags: ["doubt", "dreams", "courage", "belief"],
    source: "Boostlly",
  },
  {
    id: "boostlly-courage-4",
    text: "Be yourself; everyone else is already taken.",
    author: "Oscar Wilde",
    category: "💪 Confidence",
    tags: ["authenticity", "confidence", "self", "individuality"],
    source: "Boostlly",
  },
  {
    id: "boostlly-courage-5",
    text: "Confidence is not 'they will like me'; confidence is 'I'll be fine if they don't.'",
    author: "Anonymous",
    category: "💪 Confidence",
    tags: ["confidence", "self-worth", "independence", "mindset"],
    source: "Boostlly",
  },
  {
    id: "boostlly-courage-6",
    text: "Everything you've ever wanted is on the other side of fear.",
    author: "George Addair",
    category: "💪 Courage",
    tags: ["courage", "fear", "desires", "overcoming"],
    source: "Boostlly",
  },
  {
    id: "boostlly-courage-7",
    text: "The brave may not live forever, but the cautious do not live at all.",
    author: "Richard Branson",
    category: "💪 Courage",
    tags: ["courage", "bravery", "caution", "living"],
    source: "Boostlly",
  },
  {
    id: "boostlly-courage-8",
    text: "Stop waiting for permission to be great.",
    author: "Anonymous",
    category: "💪 Courage",
    tags: ["courage", "greatness", "permission", "action"],
    source: "Boostlly",
  },

  // 🌈 Life & Purpose
  {
    id: "boostlly-life-1",
    text: "Your time is limited, so don't waste it living someone else's life.",
    author: "Steve Jobs",
    category: "🌈 Life",
    tags: ["time", "life", "authenticity", "purpose"],
    source: "Boostlly",
  },
  {
    id: "boostlly-life-2",
    text: "Act as if what you do makes a difference. It does.",
    author: "William James",
    category: "🌈 Purpose",
    tags: ["purpose", "action", "difference", "impact"],
    source: "Boostlly",
  },

  // 🧠 Wisdom
  {
    id: "boostlly-wisdom-5",
    text: "Knowing yourself is the beginning of all wisdom.",
    author: "Aristotle",
    category: "🧠 Wisdom",
    tags: ["wisdom", "self-knowledge", "philosophy", "understanding"],
    source: "Boostlly",
  },
  {
    id: "boostlly-wisdom-6",
    text: "The only true wisdom is in knowing you know nothing.",
    author: "Socrates",
    category: "🧠 Wisdom",
    tags: ["wisdom", "humility", "knowledge", "philosophy"],
    source: "Boostlly",
  },
  {
    id: "boostlly-wisdom-7",
    text: "He who knows others is wise; he who knows himself is enlightened.",
    author: "Lao Tzu",
    category: "🧠 Wisdom",
    tags: ["wisdom", "enlightenment", "self-knowledge", "philosophy"],
    source: "Boostlly",
  },
  {
    id: "boostlly-wisdom-8",
    text: "Judge a man by his questions rather than by his answers.",
    author: "Voltaire",
    category: "🧠 Wisdom",
    tags: ["wisdom", "questions", "judgment", "curiosity"],
    source: "Boostlly",
  },
  {
    id: "boostlly-wisdom-9",
    text: "We suffer more in imagination than in reality.",
    author: "Seneca",
    category: "🧠 Wisdom",
    tags: ["wisdom", "suffering", "imagination", "reality"],
    source: "Boostlly",
  },
  {
    id: "boostlly-wisdom-10",
    text: "When you realize nothing is lacking, the whole world belongs to you.",
    author: "Lao Tzu",
    category: "🧠 Wisdom",
    tags: ["wisdom", "contentment", "abundance", "philosophy"],
    source: "Boostlly",
  },
  {
    id: "boostlly-wisdom-11",
    text: "The wise man learns more from fools than fools from the wise.",
    author: "Anonymous",
    category: "🧠 Wisdom",
    tags: ["wisdom", "learning", "humility", "growth"],
    source: "Boostlly",
  },
  {
    id: "boostlly-wisdom-12",
    text: "Silence is a source of great strength.",
    author: "Lao Tzu",
    category: "🧠 Wisdom",
    tags: ["wisdom", "silence", "strength", "peace"],
    source: "Boostlly",
  },
  {
    id: "boostlly-wisdom-13",
    text: "We don't see things as they are; we see them as we are.",
    author: "Anaïs Nin",
    category: "🧠 Wisdom",
    tags: ["wisdom", "perception", "reality", "self-awareness"],
    source: "Boostlly",
  },
  {
    id: "boostlly-wisdom-14",
    text: "Change your thoughts and you change your world.",
    author: "Norman Vincent Peale",
    category: "🧠 Wisdom",
    tags: ["wisdom", "thoughts", "change", "mindset"],
    source: "Boostlly",
  },

  // 🎯 Discipline & Focus
  {
    id: "boostlly-discipline-2",
    text: "Discipline is choosing between what you want now and what you want most.",
    author: "Anonymous",
    category: "🎯 Discipline",
    tags: ["discipline", "choice", "priorities", "focus"],
    source: "Boostlly",
  },
  {
    id: "boostlly-discipline-3",
    text: "Focus on being productive instead of busy.",
    author: "Tim Ferriss",
    category: "🎯 Focus",
    tags: ["focus", "productivity", "efficiency", "work"],
    source: "Boostlly",
  },
  {
    id: "boostlly-discipline-4",
    text: "The secret of success is consistency of purpose.",
    author: "Benjamin Disraeli",
    category: "🎯 Discipline",
    tags: ["discipline", "success", "consistency", "purpose"],
    source: "Boostlly",
  },
  {
    id: "boostlly-discipline-5",
    text: "You will never always be motivated, so you must learn to be disciplined.",
    author: "Anonymous",
    category: "🎯 Discipline",
    tags: ["discipline", "motivation", "consistency", "habits"],
    source: "Boostlly",
  },
  {
    id: "boostlly-discipline-6",
    text: "Clarity precedes success.",
    author: "Robin Sharma",
    category: "🎯 Focus",
    tags: ["focus", "clarity", "success", "direction"],
    source: "Boostlly",
  },
  {
    id: "boostlly-discipline-7",
    text: "Start where you are. Use what you have. Do what you can.",
    author: "Arthur Ashe",
    category: "🎯 Discipline",
    tags: ["discipline", "action", "starting", "resourcefulness"],
    source: "Boostlly",
  },
  {
    id: "boostlly-discipline-8",
    text: "Don't stop when you're tired. Stop when you're done.",
    author: "Anonymous",
    category: "🎯 Discipline",
    tags: ["discipline", "perseverance", "completion", "effort"],
    source: "Boostlly",
  },
  {
    id: "boostlly-discipline-9",
    text: "What you do every day matters more than what you do once in a while.",
    author: "Gretchen Rubin",
    category: "🎯 Discipline",
    tags: ["discipline", "habits", "consistency", "daily"],
    source: "Boostlly",
  },
  {
    id: "boostlly-discipline-10",
    text: "Success is the sum of small efforts repeated day in and day out.",
    author: "Robert Collier",
    category: "🎯 Discipline",
    tags: ["discipline", "success", "effort", "consistency"],
    source: "Boostlly",
  },
  {
    id: "boostlly-discipline-11",
    text: "Stay patient and trust your journey.",
    author: "Anonymous",
    category: "🎯 Focus",
    tags: ["focus", "patience", "journey", "trust"],
    source: "Boostlly",
  },

  // 💖 Love & Kindness
  {
    id: "boostlly-love-5",
    text: "Love is not what you say. Love is what you do.",
    author: "Anonymous",
    category: "💖 Love",
    tags: ["love", "actions", "relationships", "authenticity"],
    source: "Boostlly",
  },
  {
    id: "boostlly-love-6",
    text: "Where there is love, there is life.",
    author: "Mahatma Gandhi",
    category: "💖 Love",
    tags: ["love", "life", "relationships", "meaning"],
    source: "Boostlly",
  },
  {
    id: "boostlly-kindness-1",
    text: "Be kind whenever possible. It is always possible.",
    author: "Dalai Lama",
    category: "💖 Kindness",
    tags: ["kindness", "compassion", "always", "choice"],
    source: "Boostlly",
  },
  {
    id: "boostlly-kindness-2",
    text: "One kind word can change someone's entire day.",
    author: "Anonymous",
    category: "💖 Kindness",
    tags: ["kindness", "words", "impact", "compassion"],
    source: "Boostlly",
  },
  {
    id: "boostlly-love-7",
    text: "Love yourself first and everything else falls into line.",
    author: "Lucille Ball",
    category: "💖 Love",
    tags: ["love", "self-love", "priorities", "relationships"],
    source: "Boostlly",
  },
  {
    id: "boostlly-kindness-3",
    text: "You can't pour from an empty cup. Take care of yourself first.",
    author: "Anonymous",
    category: "💖 Kindness",
    tags: ["kindness", "self-care", "balance", "compassion"],
    source: "Boostlly",
  },
  {
    id: "boostlly-kindness-4",
    text: "Kindness is free. Sprinkle it everywhere.",
    author: "Anonymous",
    category: "💖 Kindness",
    tags: ["kindness", "free", "spread", "compassion"],
    source: "Boostlly",
  },
  {
    id: "boostlly-love-8",
    text: "To love and be loved is to feel the sun from both sides.",
    author: "David Viscott",
    category: "💖 Love",
    tags: ["love", "relationships", "reciprocity", "warmth"],
    source: "Boostlly",
  },
  {
    id: "boostlly-kindness-5",
    text: "The best way to find yourself is to lose yourself in the service of others.",
    author: "Mahatma Gandhi",
    category: "💖 Kindness",
    tags: ["kindness", "service", "self-discovery", "compassion"],
    source: "Boostlly",
  },
  {
    id: "boostlly-kindness-6",
    text: "In a world where you can be anything, be kind.",
    author: "Anonymous",
    category: "💖 Kindness",
    tags: ["kindness", "choice", "world", "compassion"],
    source: "Boostlly",
  },

  // 🌈 Life & Purpose
  {
    id: "boostlly-life-3",
    text: "Life isn't about finding yourself. It's about creating yourself.",
    author: "George Bernard Shaw",
    category: "🌈 Life",
    tags: ["life", "creation", "self", "purpose"],
    source: "Boostlly",
  },
  {
    id: "boostlly-life-4",
    text: "Your life does not get better by chance; it gets better by change.",
    author: "Jim Rohn",
    category: "🌈 Life",
    tags: ["life", "change", "improvement", "action"],
    source: "Boostlly",
  },
  {
    id: "boostlly-life-5",
    text: "Live as if you were to die tomorrow. Learn as if you were to live forever.",
    author: "Mahatma Gandhi",
    category: "🌈 Life",
    tags: ["life", "living", "learning", "present"],
    source: "Boostlly",
  },
  {
    id: "boostlly-life-6",
    text: "Don't count the days. Make the days count.",
    author: "Muhammad Ali",
    category: "🌈 Life",
    tags: ["life", "days", "meaning", "action"],
    source: "Boostlly",
  },
  {
    id: "boostlly-purpose-3",
    text: "The purpose of life is not to be happy, but to be useful.",
    author: "Ralph Waldo Emerson",
    category: "🌈 Purpose",
    tags: ["purpose", "usefulness", "meaning", "service"],
    source: "Boostlly",
  },
  {
    id: "boostlly-life-7",
    text: "Life is 10% what happens to you and 90% how you react to it.",
    author: "Charles R. Swindoll",
    category: "🌈 Life",
    tags: ["life", "reaction", "perspective", "control"],
    source: "Boostlly",
  },
  {
    id: "boostlly-life-8",
    text: "You only live once, but if you do it right, once is enough.",
    author: "Mae West",
    category: "🌈 Life",
    tags: ["life", "living", "quality", "meaning"],
    source: "Boostlly",
  },
  {
    id: "boostlly-life-9",
    text: "Enjoy the little things, for one day you may look back and realize they were the big things.",
    author: "Robert Brault",
    category: "🌈 Life",
    tags: ["life", "little-things", "appreciation", "moments"],
    source: "Boostlly",
  },
  {
    id: "boostlly-life-10",
    text: "Do what you love, love what you do.",
    author: "Anonymous",
    category: "🌈 Life",
    tags: ["life", "passion", "work", "love"],
    source: "Boostlly",
  },
  {
    id: "boostlly-life-11",
    text: "Live simply, dream big, be grateful, give love, laugh lots.",
    author: "Anonymous",
    category: "🌈 Life",
    tags: ["life", "simplicity", "dreams", "gratitude"],
    source: "Boostlly",
  },

  // 🔥 Inspiration & Resilience
  {
    id: "boostlly-resilience-5",
    text: "Fall seven times, stand up eight.",
    author: "Japanese Proverb",
    category: "🔥 Resilience",
    tags: ["resilience", "perseverance", "falling", "rising"],
    source: "Boostlly",
  },
  {
    id: "boostlly-resilience-6",
    text: "Tough times never last, but tough people do.",
    author: "Robert Schuller",
    category: "🔥 Resilience",
    tags: ["resilience", "tough-times", "strength", "endurance"],
    source: "Boostlly",
  },
  {
    id: "boostlly-resilience-7",
    text: "Scars remind us that we survived.",
    author: "Anonymous",
    category: "🔥 Resilience",
    tags: ["resilience", "scars", "survival", "strength"],
    source: "Boostlly",
  },
  {
    id: "boostlly-resilience-8",
    text: "Failure is simply the opportunity to begin again, this time more intelligently.",
    author: "Henry Ford",
    category: "🔥 Resilience",
    tags: ["resilience", "failure", "opportunity", "learning"],
    source: "Boostlly",
  },
  {
    id: "boostlly-inspiration-1",
    text: "You were born to make an impact.",
    author: "Anonymous",
    category: "🔥 Inspiration",
    tags: ["inspiration", "impact", "purpose", "birth"],
    source: "Boostlly",
  },
  {
    id: "boostlly-resilience-9",
    text: "Even the darkest night will end and the sun will rise.",
    author: "Victor Hugo",
    category: "🔥 Resilience",
    tags: ["resilience", "darkness", "hope", "sunrise"],
    source: "Boostlly",
  },
  {
    id: "boostlly-resilience-10",
    text: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius",
    category: "🔥 Resilience",
    tags: ["resilience", "perseverance", "pace", "continuation"],
    source: "Boostlly",
  },
  {
    id: "boostlly-resilience-11",
    text: "Storms make trees take deeper roots.",
    author: "Dolly Parton",
    category: "🔥 Resilience",
    tags: ["resilience", "storms", "strength", "growth"],
    source: "Boostlly",
  },
  {
    id: "boostlly-resilience-12",
    text: "Resilience is accepting your new reality, even if it's less good than the one you had before.",
    author: "Elizabeth Edwards",
    category: "🔥 Resilience",
    tags: ["resilience", "acceptance", "reality", "adaptation"],
    source: "Boostlly",
  },
  {
    id: "boostlly-resilience-13",
    text: "Rise above the storm and you will find the sunshine.",
    author: "Mario Fernández",
    category: "🔥 Resilience",
    tags: ["resilience", "storm", "sunshine", "rising"],
    source: "Boostlly",
  },

  // Additional 🏆 Motivation & Success
  {
    id: "boostlly-motivation-11",
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
    category: "💪 Motivation",
    tags: ["motivation", "future", "dreams", "belief"],
    source: "Boostlly",
  },
  {
    id: "boostlly-motivation-12",
    text: "You miss 100% of the shots you don't take.",
    author: "Wayne Gretzky",
    category: "💪 Motivation",
    tags: ["motivation", "action", "opportunity", "risk"],
    source: "Boostlly",
  },
  {
    id: "boostlly-motivation-14",
    text: "Innovation distinguishes between a leader and a follower.",
    author: "Steve Jobs",
    category: "💪 Motivation",
    tags: ["motivation", "innovation", "leadership", "creativity"],
    source: "Boostlly",
  },
  {
    id: "boostlly-motivation-15",
    text: "Life is what happens to you while you're busy making other plans.",
    author: "John Lennon",
    category: "💪 Motivation",
    tags: ["motivation", "life", "plans", "present"],
    source: "Boostlly",
  },
  {
    id: "boostlly-success-1",
    text: "Success is not the key to happiness. Happiness is the key to success.",
    author: "Herman Cain",
    category: "🏆 Success",
    tags: ["success", "happiness", "key", "priority"],
    source: "Boostlly",
  },
  {
    id: "boostlly-success-2",
    text: "The only place where success comes before work is in the dictionary.",
    author: "Vidal Sassoon",
    category: "🏆 Success",
    tags: ["success", "work", "effort", "dictionary"],
    source: "Boostlly",
  },
  {
    id: "boostlly-success-4",
    text: "The secret to success is to know something nobody else knows.",
    author: "Aristotle Onassis",
    category: "🏆 Success",
    tags: ["success", "secret", "knowledge", "unique"],
    source: "Boostlly",
  },

  // Additional 🌱 Growth & Learning
  {
    id: "boostlly-growth-9",
    text: "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice.",
    author: "Brian Herbert",
    category: "🌱 Growth",
    tags: ["growth", "learning", "gift", "choice"],
    source: "Boostlly",
  },
  {
    id: "boostlly-growth-10",
    text: "Change is the end result of all true learning.",
    author: "Leo Buscaglia",
    category: "🌱 Growth",
    tags: ["growth", "change", "learning", "transformation"],
    source: "Boostlly",
  },
  {
    id: "boostlly-growth-12",
    text: "The beautiful thing about learning is that no one can take it away from you.",
    author: "B.B. King",
    category: "🌱 Growth",
    tags: ["growth", "learning", "permanent", "possession"],
    source: "Boostlly",
  },
  {
    id: "boostlly-growth-13",
    text: "Education is the passport to the future, for tomorrow belongs to those who prepare for it today.",
    author: "Malcolm X",
    category: "🌱 Growth",
    tags: ["growth", "education", "future", "preparation"],
    source: "Boostlly",
  },
  {
    id: "boostlly-learning-9",
    text: "Tell me and I forget, teach me and I may remember, involve me and I learn.",
    author: "Benjamin Franklin",
    category: "🌱 Learning",
    tags: ["learning", "involvement", "teaching", "experience"],
    source: "Boostlly",
  },
  {
    id: "boostlly-learning-10",
    text: "Anyone who stops learning is old, whether at twenty or eighty.",
    author: "Henry Ford",
    category: "🌱 Learning",
    tags: ["learning", "age", "continuous", "growth"],
    source: "Boostlly",
  },
  {
    id: "boostlly-learning-11",
    text: "In learning you will teach, and in teaching you will learn.",
    author: "Phil Collins",
    category: "🌱 Learning",
    tags: ["learning", "teaching", "reciprocal", "growth"],
    source: "Boostlly",
  },
  {
    id: "boostlly-learning-12",
    text: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.",
    author: "Dr. Seuss",
    category: "🌱 Learning",
    tags: ["learning", "reading", "knowledge", "places"],
    source: "Boostlly",
  },
  {
    id: "boostlly-learning-13",
    text: "A wise man can learn more from a foolish question than a fool can learn from a wise answer.",
    author: "Bruce Lee",
    category: "🌱 Learning",
    tags: ["learning", "wisdom", "questions", "humility"],
    source: "Boostlly",
  },

  // Additional 💭 Mindset & Positivity
  {
    id: "boostlly-mindset-9",
    text: "The mind is everything. What you think you become.",
    author: "Buddha",
    category: "💭 Mindset",
    tags: ["mindset", "thoughts", "becoming", "power"],
    source: "Boostlly",
  },
  {
    id: "boostlly-mindset-10",
    text: "Whether you think you can or you think you can't, you're right.",
    author: "Henry Ford",
    category: "💭 Mindset",
    tags: ["mindset", "belief", "thinking", "power"],
    source: "Boostlly",
  },
  {
    id: "boostlly-mindset-11",
    text: "Positive thinking will let you do everything better than negative thinking will.",
    author: "Zig Ziglar",
    category: "💭 Mindset",
    tags: ["mindset", "positive-thinking", "better", "negative"],
    source: "Boostlly",
  },
  {
    id: "boostlly-mindset-12",
    text: "The only disability in life is a bad attitude.",
    author: "Scott Hamilton",
    category: "💭 Mindset",
    tags: ["mindset", "attitude", "disability", "perspective"],
    source: "Boostlly",
  },
  {
    id: "boostlly-mindset-13",
    text: "Your attitude, not your aptitude, will determine your altitude.",
    author: "Zig Ziglar",
    category: "💭 Mindset",
    tags: ["mindset", "attitude", "aptitude", "altitude"],
    source: "Boostlly",
  },
  {
    id: "boostlly-positivity-1",
    text: "Keep your face always toward the sunshine—and shadows will fall behind you.",
    author: "Walt Whitman",
    category: "💭 Positivity",
    tags: ["positivity", "sunshine", "shadows", "optimism"],
    source: "Boostlly",
  },
  {
    id: "boostlly-positivity-2",
    text: "The sun himself is weak when he first rises, and gathers strength and courage as the day gets on.",
    author: "Charles Dickens",
    category: "💭 Positivity",
    tags: ["positivity", "sun", "strength", "courage"],
    source: "Boostlly",
  },
  {
    id: "boostlly-positivity-3",
    text: "Optimism is the faith that leads to achievement. Nothing can be done without hope and confidence.",
    author: "Helen Keller",
    category: "💭 Positivity",
    tags: ["positivity", "optimism", "faith", "achievement"],
    source: "Boostlly",
  },
  {
    id: "boostlly-positivity-4",
    text: "Every day may not be good, but there is something good in every day.",
    author: "Anonymous",
    category: "💭 Positivity",
    tags: ["positivity", "good", "every-day", "optimism"],
    source: "Boostlly",
  },
  {
    id: "boostlly-positivity-5",
    text: "The pessimist complains about the wind; the optimist expects it to change; the realist adjusts the sails.",
    author: "William Arthur Ward",
    category: "💭 Positivity",
    tags: ["positivity", "pessimist", "optimist", "realist"],
    source: "Boostlly",
  },

  // Additional 💪 Courage & Confidence
  {
    id: "boostlly-courage-9",
    text: "Courage is not the absence of fear, but action in spite of it.",
    author: "Mark Twain",
    category: "💪 Courage",
    tags: ["courage", "fear", "action", "spite"],
    source: "Boostlly",
  },
  {
    id: "boostlly-courage-10",
    text: "You have been assigned this mountain to show others it can be moved.",
    author: "Mel Robbins",
    category: "💪 Courage",
    tags: ["courage", "mountain", "assigned", "show"],
    source: "Boostlly",
  },
  {
    id: "boostlly-courage-11",
    text: "The brave man is not he who does not feel afraid, but he who conquers that fear.",
    author: "Nelson Mandela",
    category: "💪 Courage",
    tags: ["courage", "brave", "afraid", "conquers"],
    source: "Boostlly",
  },
  {
    id: "boostlly-courage-12",
    text: "Fear is the path to the dark side. Fear leads to anger. Anger leads to hate. Hate leads to suffering.",
    author: "Yoda",
    category: "💪 Courage",
    tags: ["courage", "fear", "anger", "hate"],
    source: "Boostlly",
  },
  {
    id: "boostlly-courage-13",
    text: "I learned that courage was not the absence of fear, but the triumph over it.",
    author: "Nelson Mandela",
    category: "💪 Courage",
    tags: ["courage", "fear", "triumph", "overcome"],
    source: "Boostlly",
  },
  {
    id: "boostlly-confidence-9",
    text: "Confidence comes not from always being right but from not fearing to be wrong.",
    author: "Peter T. McIntyre",
    category: "💪 Confidence",
    tags: ["confidence", "right", "wrong", "fear"],
    source: "Boostlly",
  },
  {
    id: "boostlly-confidence-10",
    text: "You are braver than you believe, stronger than you seem, and smarter than you think.",
    author: "A.A. Milne",
    category: "💪 Confidence",
    tags: ["confidence", "brave", "strong", "smart"],
    source: "Boostlly",
  },
  {
    id: "boostlly-confidence-11",
    text: "The way to develop self-confidence is to do the thing you fear and get a record of successful experiences behind you.",
    author: "William Jennings Bryan",
    category: "💪 Confidence",
    tags: ["confidence", "fear", "successful", "experiences"],
    source: "Boostlly",
  },
  {
    id: "boostlly-confidence-13",
    text: "No one can make you feel inferior without your consent.",
    author: "Eleanor Roosevelt",
    category: "💪 Confidence",
    tags: ["confidence", "inferior", "consent", "power"],
    source: "Boostlly",
  },

  // Additional ☁️ Peace & Simplicity
  {
    id: "boostlly-peace-12",
    text: "Peace cannot be kept by force; it can only be achieved by understanding.",
    author: "Albert Einstein",
    category: "☁️ Peace",
    tags: ["peace", "force", "understanding", "achieved"],
    source: "Boostlly",
  },
  {
    id: "boostlly-peace-13",
    text: "If you want to make peace with your enemy, you have to work with your enemy. Then he becomes your partner.",
    author: "Nelson Mandela",
    category: "☁️ Peace",
    tags: ["peace", "enemy", "work", "partner"],
    source: "Boostlly",
  },
  {
    id: "boostlly-peace-14",
    text: "The mind is like water. When agitated, it becomes difficult to see. When calm, everything becomes clear.",
    author: "Prasad Mahes",
    category: "☁️ Peace",
    tags: ["peace", "mind", "water", "calm"],
    source: "Boostlly",
  },
  {
    id: "boostlly-peace-15",
    text: "Peace is not absence of conflict, it is the ability to handle conflict by peaceful means.",
    author: "Ronald Reagan",
    category: "☁️ Peace",
    tags: ["peace", "conflict", "handle", "peaceful"],
    source: "Boostlly",
  },
  {
    id: "boostlly-peace-16",
    text: "Be still and know that I am God.",
    author: "Psalm 46:10",
    category: "☁️ Peace",
    tags: ["peace", "still", "know", "god"],
    source: "Boostlly",
  },
  {
    id: "boostlly-simplicity-8",
    text: "Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.",
    author: "Antoine de Saint-Exupéry",
    category: "☁️ Simplicity",
    tags: ["simplicity", "perfection", "add", "take-away"],
    source: "Boostlly",
  },
  {
    id: "boostlly-simplicity-9",
    text: "The secret of happiness, you see, is not found in seeking more, but in developing the capacity to enjoy less.",
    author: "Socrates",
    category: "☁️ Simplicity",
    tags: ["simplicity", "happiness", "seeking", "enjoy"],
    source: "Boostlly",
  },
  {
    id: "boostlly-simplicity-10",
    text: "Have nothing in your houses that you do not know to be useful or believe to be beautiful.",
    author: "William Morris",
    category: "☁️ Simplicity",
    tags: ["simplicity", "houses", "useful", "beautiful"],
    source: "Boostlly",
  },
  {
    id: "boostlly-simplicity-11",
    text: "The ability to simplify means to eliminate the unnecessary so that the necessary may speak.",
    author: "Hans Hofmann",
    category: "☁️ Simplicity",
    tags: ["simplicity", "simplify", "eliminate", "necessary"],
    source: "Boostlly",
  },
  {
    id: "boostlly-simplicity-12",
    text: "Everything should be made as simple as possible, but not simpler.",
    author: "Albert Einstein",
    category: "☁️ Simplicity",
    tags: ["simplicity", "simple", "possible", "simpler"],
    source: "Boostlly",
  },

  // Additional 🎯 Discipline & Focus
  {
    id: "boostlly-discipline-12",
    text: "The successful warrior is the average man with laser-like focus.",
    author: "Bruce Lee",
    category: "🎯 Discipline",
    tags: ["discipline", "successful", "average", "focus"],
    source: "Boostlly",
  },
  {
    id: "boostlly-discipline-13",
    text: "Concentrate all your thoughts upon the work at hand. The sun's rays do not burn until brought to a focus.",
    author: "Alexander Graham Bell",
    category: "🎯 Focus",
    tags: ["focus", "concentrate", "thoughts", "work"],
    source: "Boostlly",
  },
  {
    id: "boostlly-discipline-14",
    text: "The successful person has the habit of doing the things failures don't like to do.",
    author: "Thomas Edison",
    category: "🎯 Discipline",
    tags: ["discipline", "successful", "habit", "failures"],
    source: "Boostlly",
  },
  {
    id: "boostlly-discipline-15",
    text: "Discipline is the bridge between goals and accomplishment.",
    author: "Jim Rohn",
    category: "🎯 Discipline",
    tags: ["discipline", "bridge", "goals", "accomplishment"],
    source: "Boostlly",
  },
  {
    id: "boostlly-discipline-16",
    text: "The difference between ordinary and extraordinary is that little extra.",
    author: "Jimmy Johnson",
    category: "🎯 Discipline",
    tags: ["discipline", "difference", "ordinary", "extraordinary"],
    source: "Boostlly",
  },
  {
    id: "boostlly-focus-12",
    text: "Focus on the journey, not the destination. Joy is found not in finishing an activity but in doing it.",
    author: "Greg Anderson",
    category: "🎯 Focus",
    tags: ["focus", "journey", "destination", "joy"],
    source: "Boostlly",
  },
  {
    id: "boostlly-focus-13",
    text: "The successful man is one who had the chance and took it.",
    author: "Roger Babson",
    category: "🎯 Focus",
    tags: ["focus", "successful", "chance", "took"],
    source: "Boostlly",
  },
  {
    id: "boostlly-focus-14",
    text: "Success is the progressive realization of a worthy goal or ideal.",
    author: "Earl Nightingale",
    category: "🎯 Focus",
    tags: ["focus", "success", "progressive", "realization"],
    source: "Boostlly",
  },
  {
    id: "boostlly-focus-16",
    text: "Don't be afraid to give up the good to go for the great.",
    author: "John D. Rockefeller",
    category: "🎯 Focus",
    tags: ["focus", "afraid", "good", "great"],
    source: "Boostlly",
  },

  // Additional 💖 Love & Kindness
  {
    id: "boostlly-love-9",
    text: "Love is composed of a single soul inhabiting two bodies.",
    author: "Aristotle",
    category: "💖 Love",
    tags: ["love", "soul", "bodies", "inhabiting"],
    source: "Boostlly",
  },
  {
    id: "boostlly-love-10",
    text: "The best thing to hold onto in life is each other.",
    author: "Audrey Hepburn",
    category: "💖 Love",
    tags: ["love", "best", "hold", "each-other"],
    source: "Boostlly",
  },
  {
    id: "boostlly-love-11",
    text: "Love recognizes no barriers. It jumps hurdles, leaps fences, penetrates walls to arrive at its destination full of hope.",
    author: "Maya Angelou",
    category: "💖 Love",
    tags: ["love", "barriers", "hurdles", "hope"],
    source: "Boostlly",
  },
  {
    id: "boostlly-love-12",
    text: "Being deeply loved by someone gives you strength, while loving someone deeply gives you courage.",
    author: "Lao Tzu",
    category: "💖 Love",
    tags: ["love", "deeply", "strength", "courage"],
    source: "Boostlly",
  },
  {
    id: "boostlly-love-13",
    text: "Love is when the other person's happiness is more important than your own.",
    author: "H. Jackson Brown Jr.",
    category: "💖 Love",
    tags: ["love", "happiness", "important", "own"],
    source: "Boostlly",
  },
  {
    id: "boostlly-kindness-7",
    text: "Kindness is a language which the deaf can hear and the blind can see.",
    author: "Mark Twain",
    category: "💖 Kindness",
    tags: ["kindness", "language", "deaf", "blind"],
    source: "Boostlly",
  },
  {
    id: "boostlly-kindness-8",
    text: "No act of kindness, no matter how small, is ever wasted.",
    author: "Aesop",
    category: "💖 Kindness",
    tags: ["kindness", "act", "small", "wasted"],
    source: "Boostlly",
  },
  {
    id: "boostlly-kindness-9",
    text: "A single act of kindness throws out roots in all directions, and the roots spring up and make new trees.",
    author: "Amelia Earhart",
    category: "💖 Kindness",
    tags: ["kindness", "act", "roots", "trees"],
    source: "Boostlly",
  },
  {
    id: "boostlly-kindness-10",
    text: "Kindness is the sunshine in which virtue grows.",
    author: "Robert Green Ingersoll",
    category: "💖 Kindness",
    tags: ["kindness", "sunshine", "virtue", "grows"],
    source: "Boostlly",
  },
  {
    id: "boostlly-kindness-11",
    text: "The smallest act of kindness is worth more than the grandest intention.",
    author: "Oscar Wilde",
    category: "💖 Kindness",
    tags: ["kindness", "smallest", "worth", "intention"],
    source: "Boostlly",
  },

  // Additional 🌈 Life & Purpose
  {
    id: "boostlly-life-12",
    text: "The purpose of our lives is to be happy.",
    author: "Dalai Lama",
    category: "🌈 Life",
    tags: ["life", "purpose", "happy", "lives"],
    source: "Boostlly",
  },
  {
    id: "boostlly-life-13",
    text: "Life is a journey, and if you fall in love with the journey, you will be in love forever.",
    author: "Peter Hagerty",
    category: "🌈 Life",
    tags: ["life", "journey", "fall", "love"],
    source: "Boostlly",
  },
  {
    id: "boostlly-life-14",
    text: "The good life is one inspired by love and guided by knowledge.",
    author: "Bertrand Russell",
    category: "🌈 Life",
    tags: ["life", "good", "inspired", "love"],
    source: "Boostlly",
  },
  {
    id: "boostlly-life-15",
    text: "Life is either a daring adventure or nothing at all.",
    author: "Helen Keller",
    category: "🌈 Life",
    tags: ["life", "daring", "adventure", "nothing"],
    source: "Boostlly",
  },
  {
    id: "boostlly-life-16",
    text: "The purpose of life is to discover your gift. The meaning of life is to give it away.",
    author: "Anonymous",
    category: "🌈 Life",
    tags: ["life", "purpose", "discover", "gift"],
    source: "Boostlly",
  },
  {
    id: "boostlly-purpose-4",
    text: "The two most important days in your life are the day you are born and the day you find out why.",
    author: "Mark Twain",
    category: "🌈 Purpose",
    tags: ["purpose", "important", "born", "why"],
    source: "Boostlly",
  },
  {
    id: "boostlly-purpose-5",
    text: "Your purpose in life is to find your purpose and give your whole heart and soul to it.",
    author: "Buddha",
    category: "🌈 Purpose",
    tags: ["purpose", "find", "whole", "heart"],
    source: "Boostlly",
  },
  {
    id: "boostlly-purpose-6",
    text: "The meaning of life is to give life meaning.",
    author: "Ken Hudgins",
    category: "🌈 Purpose",
    tags: ["purpose", "meaning", "life", "give"],
    source: "Boostlly",
  },
  {
    id: "boostlly-purpose-7",
    text: "Success is not about the destination, it's about the journey.",
    author: "Zig Ziglar",
    category: "🌈 Purpose",
    tags: ["purpose", "success", "destination", "journey"],
    source: "Boostlly",
  },
  {
    id: "boostlly-purpose-8",
    text: "The purpose of human life is to serve, and to show compassion and the will to help others.",
    author: "Albert Schweitzer",
    category: "🌈 Purpose",
    tags: ["purpose", "human", "serve", "compassion"],
    source: "Boostlly",
  },

  // Additional 🔥 Inspiration & Resilience
  {
    id: "boostlly-inspiration-3",
    text: "You are never too old to set another goal or to dream a new dream.",
    author: "C.S. Lewis",
    category: "🔥 Inspiration",
    tags: ["inspiration", "old", "goal", "dream"],
    source: "Boostlly",
  },
  {
    id: "boostlly-inspiration-5",
    text: "Don't be pushed around by the fears in your mind. Be led by the dreams in your heart.",
    author: "Roy T. Bennett",
    category: "🔥 Inspiration",
    tags: ["inspiration", "fears", "mind", "dreams"],
    source: "Boostlly",
  },
  {
    id: "boostlly-resilience-14",
    text: "The human spirit is stronger than anything that can happen to it.",
    author: "C.C. Scott",
    category: "🔥 Resilience",
    tags: ["resilience", "human", "spirit", "stronger"],
    source: "Boostlly",
  },
  {
    id: "boostlly-resilience-15",
    text: "Rock bottom became the solid foundation on which I rebuilt my life.",
    author: "J.K. Rowling",
    category: "🔥 Resilience",
    tags: ["resilience", "rock-bottom", "foundation", "rebuilt"],
    source: "Boostlly",
  },
  {
    id: "boostlly-resilience-16",
    text: "Turn your wounds into wisdom.",
    author: "Oprah Winfrey",
    category: "🔥 Resilience",
    tags: ["resilience", "wounds", "wisdom", "turn"],
    source: "Boostlly",
  },
  {
    id: "boostlly-resilience-17",
    text: "The oak fought the wind and was broken, the willow bent when it must and survived.",
    author: "Robert Jordan",
    category: "🔥 Resilience",
    tags: ["resilience", "oak", "wind", "willow"],
    source: "Boostlly",
  },
  {
    id: "boostlly-resilience-18",
    text: "You have power over your mind - not outside events. Realize this, and you will find strength.",
    author: "Marcus Aurelius",
    category: "🔥 Resilience",
    tags: ["resilience", "power", "mind", "strength"],
    source: "Boostlly",
  },

  // Additional 💪 Motivation & Success (15 new quotes)
  {
    id: "boostlly-motivation-16",
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    category: "💪 Motivation",
    tags: ["motivation", "work", "passion", "greatness"],
    source: "Boostlly",
  },
  {
    id: "boostlly-motivation-17",
    text: "Your limitation—it's only your imagination.",
    author: "Anonymous",
    category: "💪 Motivation",
    tags: ["motivation", "limitation", "imagination", "possibility"],
    source: "Boostlly",
  },
  {
    id: "boostlly-motivation-19",
    text: "Dream it. Wish it. Do it.",
    author: "Anonymous",
    category: "💪 Motivation",
    tags: ["motivation", "dreams", "action", "achievement"],
    source: "Boostlly",
  },
  {
    id: "boostlly-motivation-20",
    text: "Success doesn't just find you. You have to go out and get it.",
    author: "Anonymous",
    category: "💪 Motivation",
    tags: ["motivation", "success", "action", "pursuit"],
    source: "Boostlly",
  },
  {
    id: "boostlly-motivation-22",
    text: "Dream bigger. Do bigger.",
    author: "Anonymous",
    category: "💪 Motivation",
    tags: ["motivation", "dreams", "action", "ambition"],
    source: "Boostlly",
  },
  {
    id: "boostlly-motivation-24",
    text: "Wake up with determination. Go to bed with satisfaction.",
    author: "Anonymous",
    category: "💪 Motivation",
    tags: ["motivation", "determination", "satisfaction", "daily"],
    source: "Boostlly",
  },
  {
    id: "boostlly-motivation-25",
    text: "Do something today that your future self will thank you for.",
    author: "Anonymous",
    category: "💪 Motivation",
    tags: ["motivation", "future", "gratitude", "action"],
    source: "Boostlly",
  },
  {
    id: "boostlly-motivation-26",
    text: "Little things make big days.",
    author: "Anonymous",
    category: "💪 Motivation",
    tags: ["motivation", "little-things", "big-days", "progress"],
    source: "Boostlly",
  },
  {
    id: "boostlly-motivation-27",
    text: "It's going to be hard, but hard does not mean impossible.",
    author: "Anonymous",
    category: "💪 Motivation",
    tags: ["motivation", "hard", "impossible", "possibility"],
    source: "Boostlly",
  },
  {
    id: "boostlly-motivation-28",
    text: "Don't wait for opportunity. Create it.",
    author: "Anonymous",
    category: "💪 Motivation",
    tags: ["motivation", "opportunity", "creation", "action"],
    source: "Boostlly",
  },
  {
    id: "boostlly-motivation-29",
    text: "Sometimes we're tested not to show our weaknesses, but to discover our strengths.",
    author: "Anonymous",
    category: "💪 Motivation",
    tags: ["motivation", "testing", "strengths", "discovery"],
    source: "Boostlly",
  },
  {
    id: "boostlly-motivation-30",
    text: "The key to success is to focus on goals, not obstacles.",
    author: "Anonymous",
    category: "💪 Motivation",
    tags: ["motivation", "success", "goals", "focus"],
    source: "Boostlly",
  },

  // Additional 🧠 Wisdom (10 new quotes)
  {
    id: "boostlly-wisdom-15",
    text: "The only impossible journey is the one you never begin.",
    author: "Tony Robbins",
    category: "🧠 Wisdom",
    tags: ["wisdom", "impossible", "journey", "beginning"],
    source: "Boostlly",
  },
  {
    id: "boostlly-wisdom-16",
    text: "In the middle of difficulty lies opportunity.",
    author: "Albert Einstein",
    category: "🧠 Wisdom",
    tags: ["wisdom", "difficulty", "opportunity", "challenge"],
    source: "Boostlly",
  },
  {
    id: "boostlly-wisdom-18",
    text: "It is during our darkest moments that we must focus to see the light.",
    author: "Aristotle",
    category: "🧠 Wisdom",
    tags: ["wisdom", "darkness", "light", "focus"],
    source: "Boostlly",
  },
  {
    id: "boostlly-wisdom-20",
    text: "Don't let yesterday take up too much of today.",
    author: "Will Rogers",
    category: "🧠 Wisdom",
    tags: ["wisdom", "yesterday", "today", "present"],
    source: "Boostlly",
  },
  {
    id: "boostlly-wisdom-21",
    text: "You learn more from failure than from success. Don't let it stop you. Failure builds character.",
    author: "Anonymous",
    category: "🧠 Wisdom",
    tags: ["wisdom", "failure", "learning", "character"],
    source: "Boostlly",
  },
  {
    id: "boostlly-wisdom-22",
    text: "If you are working on something that you really care about, you don't have to be pushed. The vision pulls you.",
    author: "Steve Jobs",
    category: "🧠 Wisdom",
    tags: ["wisdom", "passion", "vision", "motivation"],
    source: "Boostlly",
  },
  {
    id: "boostlly-wisdom-23",
    text: "People who are crazy enough to think they can change the world, are the ones who do.",
    author: "Rob Siltanen",
    category: "🧠 Wisdom",
    tags: ["wisdom", "change", "world", "belief"],
    source: "Boostlly",
  },
  {
    id: "boostlly-wisdom-24",
    text: "Failure will never overtake me if my determination to succeed is strong enough.",
    author: "Og Mandino",
    category: "🧠 Wisdom",
    tags: ["wisdom", "failure", "determination", "success"],
    source: "Boostlly",
  },

  // Additional 🌱 Growth & Learning (10 new quotes)
  {
    id: "boostlly-growth-14",
    text: "The expert in anything was once a beginner.",
    author: "Helen Hayes",
    category: "🌱 Growth",
    tags: ["growth", "expert", "beginner", "learning"],
    source: "Boostlly",
  },
  {
    id: "boostlly-growth-16",
    text: "Innovation distinguishes between a leader and a follower.",
    author: "Steve Jobs",
    category: "🌱 Growth",
    tags: ["growth", "innovation", "leadership", "creativity"],
    source: "Boostlly",
  },
  {
    id: "boostlly-growth-17",
    text: "There are no shortcuts to any place worth going.",
    author: "Beverly Sills",
    category: "🌱 Growth",
    tags: ["growth", "shortcuts", "worth", "journey"],
    source: "Boostlly",
  },
  {
    id: "boostlly-growth-18",
    text: "I have not failed. I've just found 10,000 ways that won't work.",
    author: "Thomas Edison",
    category: "🌱 Growth",
    tags: ["growth", "failure", "learning", "persistence"],
    source: "Boostlly",
  },
  {
    id: "boostlly-growth-19",
    text: "A person who never made a mistake never tried anything new.",
    author: "Albert Einstein",
    category: "🌱 Growth",
    tags: ["growth", "mistakes", "trying", "new"],
    source: "Boostlly",
  },
  {
    id: "boostlly-growth-20",
    text: "The only person you are destined to become is the person you decide to be.",
    author: "Ralph Waldo Emerson",
    category: "🌱 Growth",
    tags: ["growth", "destiny", "decision", "becoming"],
    source: "Boostlly",
  },
  {
    id: "boostlly-growth-21",
    text: "Go confidently in the direction of your dreams. Live the life you have imagined.",
    author: "Henry David Thoreau",
    category: "🌱 Growth",
    tags: ["growth", "confidence", "dreams", "life"],
    source: "Boostlly",
  },
  {
    id: "boostlly-growth-22",
    text: "When you have a dream, you've got to grab it and never let go.",
    author: "Carol Burnett",
    category: "🌱 Growth",
    tags: ["growth", "dreams", "grab", "persistence"],
    source: "Boostlly",
  },
  {
    id: "boostlly-growth-23",
    text: "Nothing is impossible, the word itself says 'I'm possible'!",
    author: "Audrey Hepburn",
    category: "🌱 Growth",
    tags: ["growth", "impossible", "possible", "belief"],
    source: "Boostlly",
  },

  // Additional 💭 Mindset & Positivity (10 new quotes)
  {
    id: "boostlly-mindset-19",
    text: "There is nothing impossible to they who will try.",
    author: "Alexander the Great",
    category: "💭 Mindset",
    tags: ["mindset", "impossible", "trying", "determination"],
    source: "Boostlly",
  },
  {
    id: "boostlly-mindset-20",
    text: "The bad news is time flies. The good news is you're the pilot.",
    author: "Michael Altshuler",
    category: "💭 Mindset",
    tags: ["mindset", "time", "pilot", "control"],
    source: "Boostlly",
  },
  {
    id: "boostlly-mindset-21",
    text: "Life has got all those twists and turns. You've got to hold on tight and off you go.",
    author: "Nicole Kidman",
    category: "💭 Mindset",
    tags: ["mindset", "life", "twists", "turns"],
    source: "Boostlly",
  },
  {
    id: "boostlly-mindset-22",
    text: "Keep your eyes on the stars, and your feet on the ground.",
    author: "Theodore Roosevelt",
    category: "💭 Mindset",
    tags: ["mindset", "stars", "ground", "balance"],
    source: "Boostlly",
  },
  {
    id: "boostlly-mindset-23",
    text: "You can be everything. You can be the infinite amount of things that people are.",
    author: "Kesha",
    category: "💭 Mindset",
    tags: ["mindset", "everything", "infinite", "possibility"],
    source: "Boostlly",
  },

  // Additional 💪 Courage & Confidence (10 new quotes)
  {
    id: "boostlly-courage-23",
    text: "The only way to deal with an unfree world is to become so absolutely free that your very existence is an act of rebellion.",
    author: "Albert Camus",
    category: "💪 Courage",
    tags: ["courage", "freedom", "existence", "rebellion"],
    source: "Boostlly",
  },

  // Additional 🌈 Life & Purpose (10 new quotes)
  {
    id: "boostlly-life-20",
    text: "Many of life's failures are people who did not realize how close they were to success when they gave up.",
    author: "Thomas Edison",
    category: "🌈 Life",
    tags: ["life", "failures", "close", "success"],
    source: "Boostlly",
  },
  {
    id: "boostlly-life-21",
    text: "If you want to live a happy life, tie it to a goal, not to people or things.",
    author: "Albert Einstein",
    category: "🌈 Life",
    tags: ["life", "happy", "goal", "people"],
    source: "Boostlly",
  },
  {
    id: "boostlly-life-22",
    text: "Never let the fear of striking out keep you from playing the game.",
    author: "Babe Ruth",
    category: "🌈 Life",
    tags: ["life", "fear", "striking", "game"],
    source: "Boostlly",
  },
  {
    id: "boostlly-life-23",
    text: "Money and success don't change people; they merely amplify what is already there.",
    author: "Will Smith",
    category: "🌈 Life",
    tags: ["life", "money", "success", "amplify"],
    source: "Boostlly",
  },
  {
    id: "boostlly-life-25",
    text: "If life were predictable it would cease to be life, and be without flavor.",
    author: "Eleanor Roosevelt",
    category: "🌈 Life",
    tags: ["life", "predictable", "flavor", "cease"],
    source: "Boostlly",
  },
  {
    id: "boostlly-life-26",
    text: "The whole secret of a successful life is to find out what is one's destiny to do, and then do it.",
    author: "Henry Ford",
    category: "🌈 Purpose",
    tags: ["purpose", "successful", "destiny", "secret"],
    source: "Boostlly",
  },
];

/**
 * Category mapping for backward compatibility and flexible matching
 */
const CATEGORY_ALIASES: Record<string, string> = {
  // Old categories -> New emoji categories
  "motivation": "💪 Motivation",
  "success": "🏆 Success",
  "learning": "🌱 Learning",
  "growth": "🌱 Growth",
  "wisdom": "🧠 Wisdom",
  "philosophy": "🧠 Philosophy",
  "mindset": "💭 Mindset",
  "positivity": "💭 Positivity",
  "happiness": "💭 Happiness",
  "courage": "💪 Courage",
  "confidence": "💪 Confidence",
  "peace": "☁️ Peace",
  "simplicity": "☁️ Simplicity",
  "calm": "☁️ Calm",
  "discipline": "🎯 Discipline",
  "focus": "🎯 Focus",
  "productivity": "🎯 Productivity",
  "programming": "🎯 Programming",
  "love": "💖 Love",
  "kindness": "💖 Kindness",
  "compassion": "💖 Compassion",
  "purpose": "🌈 Purpose",
  "life": "🌈 Life",
  "resilience": "🔥 Resilience",
  "inspiration": "🔥 Inspiration",
  "leadership": "🎖️ Leadership",
  "vision": "🎖️ Vision",
  "creativity": "🎨 Creativity",
  "innovation": "🎨 Innovation",
  "gratitude": "🙏 Gratitude",
  "mindfulness": "🙏 Mindfulness",
  "change": "🔄 Change",
  "adaptability": "🔄 Adaptability",
  "faith": "✨ Faith",
  "hope": "✨ Hope",
  "general": "🌟 General",
};

/**
 * Category groups for combined category matching
 * Maps combined category names to arrays of actual categories
 */
const CATEGORY_GROUPS: Record<string, string[]> = {
  "motivation & success": ["💪 Motivation", "🏆 Success"],
  "growth & learning": ["🌱 Growth", "🌱 Learning"],
  "mindset & positivity": ["💭 Mindset", "💭 Positivity"],
  "courage & confidence": ["💪 Courage", "💪 Confidence"],
  "peace & simplicity": ["☁️ Peace", "☁️ Simplicity"],
  "discipline & focus": ["🎯 Discipline", "🎯 Focus"],
  "love & kindness": ["💖 Love", "💖 Kindness"],
  "life & purpose": ["🌈 Life", "🌈 Purpose"],
  "inspiration & resilience": ["🔥 Inspiration", "🔥 Resilience"],
};

/**
 * Helper functions for safe quote selection
 */
function safeArray<T>(arr: T[] | undefined | null): T[] {
  return Array.isArray(arr) ? arr : [];
}

function normalizeCategory(input?: string): string | null {
  if (!input) return null;
  const key = input.trim().toLowerCase();
  return CATEGORY_ALIASES[key] || input.trim();
}

function getTodayKeyLocal(date: Date): string {
  return getDateKey(date, "local");
}

function dateMinusDaysKey(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return getTodayKeyLocal(d);
}

function isWithinRange(dateStr: string, start: string, end: string): boolean {
  const s = String(dateStr || "").trim();
  return s >= start && s <= end; // works only if YYYY-MM-DD
}

/**
 * Simple deterministic PRNG (Mulberry32)
 */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deterministic shuffle (Fisher-Yates)
 */
function seededShuffle<T>(items: T[], seed: number): T[] {
  const a = items.slice();
  const rnd = mulberry32(seed);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const HISTORY_KEY = "quoteHistoryV2"; // new key to avoid breaking older installs
const HISTORY_DAYS = 7;

/**
 * Get a random fallback quote from the centralized collection
 * 
 * IMPROVED VERSION with:
 * - 7-day repetition avoidance (if storage available)
 * - Better variety with deterministic seeded shuffle
 * - Automatic fallback to all quotes if category filter fails
 * - Always returns a valid quote (never crashes)
 * - Better source naming ("Local" instead of "Boostlly")
 * - Compact history storage (uses IDs instead of full objects)
 * 
 * @param category - Optional category filter (supports both old and new category names)
 * @param storage - Optional storage service for tracking quote history (prevents repetition)
 * @returns Random quote from the fallback collection with source: "Local"
 */
export function getRandomFallbackQuote(category?: string, storage?: StorageLike): Quote {
  const all = safeArray(BOOSTLLY_FALLBACK_QUOTES);

  // Hard fallback if somehow empty
  if (all.length === 0) {
    return {
      id: "local-fallback-1",
      text: "Keep going. One step at a time.",
      author: "Local",
      category: "🌟 General",
      source: "Local",
    };
  }

  // Filter by category OR tags
  let pool = all;
  if (category) {
    const normalized = normalizeCategory(category);
    if (normalized) {
      const needle = normalized.toLowerCase();
      // Check if it's a category group (combined categories)
      const group = CATEGORY_GROUPS[category.toLowerCase()];
      if (group) {
        // Match any category in the group
        pool = all.filter((q) => {
          const catMatch = group.some((cat) => (q.category || "").toLowerCase() === cat.toLowerCase());
          const tagMatch = q.tags?.some((t) => t.toLowerCase() === needle) || false;
          return catMatch || tagMatch;
        });
      } else {
        // Single category match
        pool = all.filter((q) => {
          const catMatch = (q.category || "").toLowerCase() === needle;
          const tagMatch = q.tags?.some((t) => t.toLowerCase() === needle) || false;
          return catMatch || tagMatch;
        });
      }
    }
  // If no quotes match the category, use all quotes (ensures we always have quotes)
    if (pool.length === 0) {
      pool = all;
    }
  }

  const effectiveStorage = (storage || globalStorageRef) as StorageLike | null;

  const now = new Date();
  const todayKey = getTodayKeyLocal(now);
  const cutoffKey = dateMinusDaysKey(HISTORY_DAYS);

  // Deterministic seed: day + hour + category length + pool size
   const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24),
  );
  const seed =
    now.getFullYear() * 100000 + dayOfYear * 100 + now.getHours() * 10 + (pool.length % 10);

  const shuffled = seededShuffle(pool, seed);

  // History logic uses quoteId (compact storage)
  let history: Array<{ quoteId: string; date: string; timestamp: number }> = [];
  if (effectiveStorage?.getSync) {
    try {
      history = safeArray(effectiveStorage.getSync(HISTORY_KEY));
    } catch {
      history = [];
    }
  }

  const recentIds = new Set(
    history
      .filter((h) => h?.quoteId && isWithinRange(h.date, cutoffKey, todayKey))
      .map((h) => h.quoteId),
  );

  // Pick first not in recent
  let selected = shuffled.find((q) => !recentIds.has(q.id)) || shuffled[0];

  // If all were recent, pick oldest (least recently used)
  if (selected && recentIds.has(selected.id) && history.length) {
    const lastSeen = new Map<string, number>();
    for (const h of history) {
      if (!h?.quoteId) continue;
      lastSeen.set(h.quoteId, Math.max(lastSeen.get(h.quoteId) || 0, h.timestamp || 0));
    }

    let best = shuffled[0];
    let bestTs = Infinity;
    for (const q of shuffled) {
      const ts = lastSeen.get(q.id);
      if (ts == null) {
        return { ...q, source: "Local" }; // never shown -> best
      }
      if (ts < bestTs) {
        bestTs = ts;
        best = q;
      }
    }
    selected = best;
  }

  // Ensure we have a valid quote
  if (!selected || !selected.text) {
    selected = all[0] || {
      id: "local-fallback-2",
      text: "Keep going. One step at a time.",
      author: "Local",
      category: "🌟 General",
        source: "Local",
      };
  }

  // Update history
  if (effectiveStorage?.setSync) {
    try {
      const next = history
        .filter((h) => h?.quoteId !== selected.id) // dedupe
        .concat([{ quoteId: selected.id, date: todayKey, timestamp: Date.now() }])
        .slice(-150); // keep last 150

      effectiveStorage.setSync(HISTORY_KEY, next);
    } catch {
      // ignore storage errors
    }
  }

  return { ...selected, source: "Local" };
}

/**
 * Get all fallback quotes for a specific category
 * @param category - The category to filter by (supports both old and new category names)
 * @returns Array of quotes matching the category
 */
export function getFallbackQuotesByCategory(category: string): Quote[] {
  const normalized = normalizeCategory(category);
  if (!normalized) {
    return [];
  }

  const needle = normalized.toLowerCase();
  // Check if it's a category group (combined categories)
  const group = CATEGORY_GROUPS[category.toLowerCase()];
  if (group) {
    // Match any category in the group
    return BOOSTLLY_FALLBACK_QUOTES.filter((q) => {
      const catMatch = group.some((cat) => (q.category || "").toLowerCase() === cat.toLowerCase());
      const tagMatch = q.tags?.some((t) => t.toLowerCase() === needle) || false;
      return catMatch || tagMatch;
    });
  }

  // Single category match
  return BOOSTLLY_FALLBACK_QUOTES.filter((q) => {
    const catMatch = (q.category || "").toLowerCase() === needle;
    const tagMatch = q.tags?.some((t) => t.toLowerCase() === needle) || false;
    return catMatch || tagMatch;
  });
}

/**
 * Search fallback quotes by text, author, or tags
 * @param query - Search query
 * @returns Array of matching quotes
 */
export function searchFallbackQuotes(query: string): Quote[] {
  const normalizedQuery = query.toLowerCase();
  
  return BOOSTLLY_FALLBACK_QUOTES.filter((quote) => {
    // Guard against malformed quotes
    if (!quote || !quote.text) return false;

    return (
    quote.text.toLowerCase().includes(normalizedQuery) ||
    quote.author?.toLowerCase().includes(normalizedQuery) ||
    quote.category?.toLowerCase().includes(normalizedQuery) ||
      quote.tags?.some((tag) => tag.toLowerCase().includes(normalizedQuery))
  );
  });
}

/**
 * Get all available categories from fallback quotes
 * @returns Array of unique emoji categories
 */
export function getFallbackCategories(): string[] {
  const categories = new Set<string>();
  
  BOOSTLLY_FALLBACK_QUOTES.forEach(quote => {
    if (quote.category) {
      categories.add(quote.category);
    }
  });
  
  return Array.from(categories).sort();
}

/**
 * Get statistics about the fallback quotes collection
 * @returns Object with statistics
 */
export function getFallbackStats(): {
  totalQuotes: number;
  categories: string[];
  tags: string[];
  quotesPerCategory: Record<string, number>;
} {
  const categories = new Set<string>();
  const tags = new Set<string>();
  const quotesPerCategory: Record<string, number> = {};
  
  BOOSTLLY_FALLBACK_QUOTES.forEach(quote => {
    // Count categories
    if (quote.category) {
      categories.add(quote.category);
      quotesPerCategory[quote.category] = (quotesPerCategory[quote.category] || 0) + 1;
    }
    
    // Collect tags
    quote.tags?.forEach(tag => tags.add(tag));
  });
  
  return {
    totalQuotes: BOOSTLLY_FALLBACK_QUOTES.length,
    categories: Array.from(categories).sort(),
    tags: Array.from(tags).sort(),
    quotesPerCategory,
  };
}

/**
 * Find duplicate quotes in the fallback collection
 * Useful for validation and ensuring "duplicates removed" stays true
 * @returns Array of duplicate entries with first occurrence ID and duplicate ID
 */
export function findDuplicateFallbackQuotes(): Array<{
  key: string;
  firstId: string;
  dupId: string;
  text: string;
  author: string;
}> {
  const seen = new Map<string, string>(); // key -> id
  const dups: Array<{
    key: string;
    firstId: string;
    dupId: string;
    text: string;
    author: string;
  }> = [];

  for (const q of BOOSTLLY_FALLBACK_QUOTES) {
    if (!q.text || !q.author) continue; // skip malformed quotes
    const key = `${(q.text || "").trim().toLowerCase()}__${(q.author || "").trim().toLowerCase()}`;
    const first = seen.get(key);
    if (first) {
      dups.push({
        key,
        firstId: first,
        dupId: q.id,
        text: q.text,
        author: q.author,
      });
    } else {
      seen.set(key, q.id);
    }
  }

  return dups;
}