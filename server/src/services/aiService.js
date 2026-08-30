import { env } from '../config/env.js';

/**
 * Deterministic rule-based category classifier fallback
 */
export const classifyCategoryDeterministic = (text = '') => {
  const t = text.toLowerCase();

  if (/(wifi|wi-fi|internet|network|router|bandwidth|lan|ethernet|slow connection|no signal)/.test(t)) {
    return 'Wi-Fi / Internet';
  }
  if (/(hostel|warden|mess|dorm|roommate|geyser|bed|cot|hostel block)/.test(t)) {
    return 'Hostel';
  }
  if (/(bus|transport|vehicle|driver|route|shuttle|commute|cab)/.test(t)) {
    return 'Transportation';
  }
  if (/(dust|garbage|waste|clean|trash|dirty|smell|sweep|washroom|restroom|toilet|hygiene)/.test(t)) {
    return 'Cleanliness';
  }
  if (/(lab|laboratory|practical|computer|monitor|keyboard|pc|software|hardware|equipment|server|compiler)/.test(t)) {
    return 'Laboratory';
  }
  if (/(projector|board|chalkboard|blackboard|podium|desk|bench|fan|air condition|ac|classroom|lecture hall|room \d+)/.test(t)) {
    return 'Classroom';
  }
  if (/(building|door|window|switch|ceiling|wall|elevator|lift|water supply|pipe|leakage|stairs|roof|crack)/.test(t)) {
    return 'Infrastructure';
  }

  return 'Other';
};

/**
 * AI Categorization Service with Gemini / OpenRouter API and instant deterministic fallback
 */
export const categorizeComplaint = async ({ title = '', description = '' }) => {
  const combinedText = `${title} ${description}`.trim();
  if (!combinedText) {
    return { category: 'Other', source: 'fallback' };
  }

  // Attempt Gemini API if key is present
  if (env.GEMINI_API_KEY) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Categorize the following college complaint into EXACTLY ONE of these categories: [Classroom, Laboratory, Hostel, Wi-Fi / Internet, Infrastructure, Transportation, Cleanliness, Other].
Respond ONLY with the exact category name.
Complaint Title: "${title}"
Complaint Description: "${description}"`,
                  },
                ],
              },
            ],
            generationConfig: { temperature: 0.1, maxOutputTokens: 20 },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const rawCategory = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        const validCategories = [
          'Classroom',
          'Laboratory',
          'Hostel',
          'Wi-Fi / Internet',
          'Infrastructure',
          'Transportation',
          'Cleanliness',
          'Other',
        ];
        const matched = validCategories.find((c) => rawCategory?.toLowerCase().includes(c.toLowerCase()));
        if (matched) {
          return { category: matched, source: 'gemini' };
        }
      }
    } catch (err) {
      console.warn('Gemini API categorization error, falling back to deterministic:', err.message);
    }
  }

  // Deterministic rule fallback
  const suggested = classifyCategoryDeterministic(combinedText);
  return { category: suggested, source: 'deterministic-rules' };
};

/**
 * AI Summary Generator with deterministic text extraction fallback
 */
export const summarizeComplaint = async ({ title = '', description = '' }) => {
  const combined = `${title}. ${description}`.trim();
  if (!combined || combined.length < 20) {
    return { summary: description || title, source: 'fallback' };
  }

  if (env.GEMINI_API_KEY) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Summarize this college campus complaint in ONE clear, concise sentence (under 25 words):
Title: ${title}
Description: ${description}`,
                  },
                ],
              },
            ],
            generationConfig: { temperature: 0.2, maxOutputTokens: 60 },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const summaryText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (summaryText) {
          return { summary: summaryText, source: 'gemini' };
        }
      }
    } catch (err) {
      console.warn('Gemini API summarize error, falling back to deterministic:', err.message);
    }
  }

  // Deterministic summary fallback: First clean sentence or truncated first 120 characters
  const firstSentence = description.split(/[.?!]\s+/)[0]?.trim();
  let fallbackSummary = firstSentence || title;
  if (fallbackSummary.length > 140) {
    fallbackSummary = fallbackSummary.substring(0, 137) + '...';
  }
  return { summary: fallbackSummary, source: 'deterministic-rules' };
};

/**
 * Image Classification Service (Lightweight fallback as required by spec)
 */
export const classifyImageIssue = async ({ category, title, description }) => {
  const cat = category || classifyCategoryDeterministic(`${title} ${description}`);
  const mapping = {
    'Wi-Fi / Internet': 'Network / Router Disruption',
    Hostel: 'Hostel Maintenance Issue',
    Transportation: 'Vehicle / Transit Discrepancy',
    Cleanliness: 'Sanitation / Cleaning Required',
    Laboratory: 'Lab Equipment Fault',
    Classroom: 'Classroom Facility Damage',
    Infrastructure: 'Infrastructure Repair Needed',
    Other: 'Pending Manual Review',
  };

  return {
    possibleIssue: mapping[cat] || 'Pending Manual Review',
    status: 'Auto-Tagged',
  };
};
