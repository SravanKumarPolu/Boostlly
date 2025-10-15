/**
 * Category Display Utilities
 * 
 * This file provides utilities for displaying categories with emojis in the UI.
 * It maps raw category names to their emoji-prefixed display versions.
 */

/**
 * Maps raw category names to their emoji-prefixed display versions
 */
export const CATEGORY_DISPLAY_MAP: Record<string, string> = {
  // Core categories
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
  
  // Handle combined category names from external APIs
  "motivation & success": "💪 Motivation & Success",
  "growth & learning": "🌱 Growth & Learning",
  "mindset & positivity": "💭 Mindset & Positivity",
  "courage & confidence": "💪 Courage & Confidence",
  "peace & simplicity": "☁️ Peace & Simplicity",
  "discipline & focus": "🎯 Discipline & Focus",
  "love & kindness": "💖 Love & Kindness",
  "life & purpose": "🌈 Life & Purpose",
  "inspiration & resilience": "🔥 Inspiration & Resilience",
  "leadership & vision": "🎖️ Leadership & Vision",
  "creativity & innovation": "🎨 Creativity & Innovation",
  "gratitude & mindfulness": "🙏 Gratitude & Mindfulness",
  "change & adaptability": "🔄 Change & Adaptability",
  "faith & hope": "✨ Faith & Hope",

  // Additional common categories
  "advice": "💡 Advice",
  "health": "💚 Health",
  "money": "💰 Money",
  "relationships": "💕 Relationships",
  "work": "💼 Work",
  "business": "🏢 Business",
  "technology": "💻 Technology",
  "science": "🔬 Science",
  "art": "🎨 Art",
  "music": "🎵 Music",
  "sports": "⚽ Sports",
  "travel": "✈️ Travel",
  "food": "🍽️ Food",
  "nature": "🌿 Nature",
  "time": "⏰ Time",
  "dreams": "🌙 Dreams",
  "goals": "🎯 Goals",
  "freedom": "🕊️ Freedom",
  "truth": "🔍 Truth",
  "beauty": "✨ Beauty",
  "justice": "⚖️ Justice",
  "education": "📚 Education",
  "family": "👨‍👩‍👧‍👦 Family",
  "friendship": "🤝 Friendship",
  "humor": "😄 Humor",
  "laughter": "😂 Laughter",
  "smile": "😊 Smile",
  "energy": "⚡ Energy",
  "strength": "💪 Strength",
  "patience": "⏳ Patience",
  "forgiveness": "🤗 Forgiveness",
  "empathy": "❤️ Empathy",
  "integrity": "🛡️ Integrity",
  "honesty": "🤝 Honesty",
  "trust": "🤝 Trust",
  "loyalty": "🤝 Loyalty",
  "respect": "🙏 Respect",
  "dignity": "👑 Dignity",
  "honor": "🏆 Honor",
  "pride": "🦁 Pride",
  "determination": "🔥 Determination",
  "persistence": "💪 Persistence",
  "endurance": "🏃 Endurance",
  "optimism": "☀️ Optimism",
  "pessimism": "☁️ Pessimism",
  "realism": "🔍 Realism",
  "idealism": "✨ Idealism",
  "practicality": "🔧 Practicality",
  "efficiency": "⚡ Efficiency",
  "effectiveness": "🎯 Effectiveness",
  "quality": "⭐ Quality",
  "excellence": "🌟 Excellence",
  "perfection": "💎 Perfection",
  "improvement": "📈 Improvement",
  "progress": "🚀 Progress",
  "development": "🌱 Development",
  "evolution": "🦋 Evolution",
  "transformation": "🔄 Transformation",
  "renewal": "🌅 Renewal",
  "rebirth": "🌱 Rebirth",
  "revival": "🔥 Revival",
  "renaissance": "🎨 Renaissance",
  "awakening": "🌅 Awakening",
  "enlightenment": "💡 Enlightenment",
  "consciousness": "🧠 Consciousness",
  "awareness": "👁️ Awareness",
  "meditation": "🧘 Meditation",
  "reflection": "🪞 Reflection",
  "contemplation": "🤔 Contemplation",
  "introspection": "🔍 Introspection",
  "self-awareness": "👁️ Self-Awareness",
  "self-discovery": "🔍 Self-Discovery",
  "self-improvement": "📈 Self-Improvement",
  "self-development": "🌱 Self-Development",
  "self-growth": "🌿 Self-Growth",
  "personal-growth": "🌱 Personal Growth",
  "spiritual-growth": "🕊️ Spiritual Growth",
  "emotional-growth": "❤️ Emotional Growth",
  "intellectual-growth": "🧠 Intellectual Growth",
  "professional-growth": "💼 Professional Growth",
  "career-growth": "📈 Career Growth",
  "financial-growth": "💰 Financial Growth",
  "relationship-growth": "💕 Relationship Growth",
  "social-growth": "👥 Social Growth",
  "community-growth": "🏘️ Community Growth",
  "global-growth": "🌍 Global Growth",
  "universal-growth": "🌌 Universal Growth",
};

/**
 * Get the emoji-prefixed display version of a category name
 * @param category - The raw category name
 * @returns The emoji-prefixed display version
 */
export function getCategoryDisplay(category: string): string {
  if (!category) return "";
  
  // Check if it already has an emoji
  if (category.match(/^[\u{1F600}-\u{1F64F}]|^[\u{1F300}-\u{1F5FF}]|^[\u{1F680}-\u{1F6FF}]|^[\u{1F1E0}-\u{1F1FF}]|^[\u{2600}-\u{26FF}]|^[\u{2700}-\u{27BF}]/u)) {
    return category;
  }
  
  // Map to emoji version
  const displayCategory = CATEGORY_DISPLAY_MAP[category.toLowerCase()];
  
  // If no mapping found, capitalize first letter and return as-is
  return displayCategory || category.charAt(0).toUpperCase() + category.slice(1);
}

/**
 * Get all available categories with their emoji prefixes
 * @returns Array of category display names
 */
export function getAllCategoryDisplays(): string[] {
  return Object.values(CATEGORY_DISPLAY_MAP).sort();
}

/**
 * Get raw category names (for backward compatibility)
 * @returns Array of raw category names
 */
export function getRawCategories(): string[] {
  return Object.keys(CATEGORY_DISPLAY_MAP).sort();
}

/**
 * Check if a category has an emoji mapping
 * @param category - The category to check
 * @returns True if the category has an emoji mapping
 */
export function hasCategoryMapping(category: string): boolean {
  return category.toLowerCase() in CATEGORY_DISPLAY_MAP;
}

/**
 * Get the emoji for a category (without the text)
 * @param category - The raw category name
 * @returns The emoji character(s)
 */
export function getCategoryEmoji(category: string): string {
  const display = getCategoryDisplay(category);
  const emojiMatch = display.match(/^[\u{1F600}-\u{1F64F}]|^[\u{1F300}-\u{1F5FF}]|^[\u{1F680}-\u{1F6FF}]|^[\u{1F1E0}-\u{1F1FF}]|^[\u{2600}-\u{26FF}]|^[\u{2700}-\u{27BF}]/u);
  return emojiMatch ? emojiMatch[0] : "";
}

/**
 * Get the text part of a category (without the emoji)
 * @param category - The raw category name
 * @returns The text part
 */
export function getCategoryText(category: string): string {
  const display = getCategoryDisplay(category);
  return display.replace(/^[\u{1F600}-\u{1F64F}]|^[\u{1F300}-\u{1F5FF}]|^[\u{1F680}-\u{1F6FF}]|^[\u{1F1E0}-\u{1F1FF}]|^[\u{2600}-\u{26FF}]|^[\u{2700}-\u{27BF}]/u, "").trim();
}
