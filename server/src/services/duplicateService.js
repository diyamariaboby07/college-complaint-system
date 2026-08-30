import { Complaint } from '../models/Complaint.js';

/**
 * Tokenize and normalize text into word set
 */
const getTokens = (str = '') => {
  return new Set(
    str
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((word) => word.length > 2)
  );
};

/**
 * Compute Jaccard similarity between two token sets
 */
const calculateSimilarity = (setA, setB) => {
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersectionCount = 0;
  for (const token of setA) {
    if (setB.has(token)) intersectionCount++;
  }
  const unionCount = setA.size + setB.size - intersectionCount;
  return unionCount === 0 ? 0 : intersectionCount / unionCount;
};

/**
 * Check if a similar complaint already exists among active complaints
 */
export const checkDuplicateComplaint = async ({ category, location, title, description }) => {
  try {
    // Only check against open complaints (Submitted, Under Review, Assigned, In Progress)
    const activeComplaints = await Complaint.find({
      status: { $in: ['Submitted', 'Under Review', 'Assigned', 'In Progress'] },
      category: category,
    })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    if (!activeComplaints || activeComplaints.length === 0) {
      return { isDuplicate: false };
    }

    const newLocTokens = getTokens(location);
    const newTextTokens = getTokens(`${title} ${description}`);

    let bestMatch = null;
    let highestScore = 0;

    for (const comp of activeComplaints) {
      const compLocTokens = getTokens(comp.location);
      const compTextTokens = getTokens(`${comp.title} ${comp.description}`);

      const locSim = calculateSimilarity(newLocTokens, compLocTokens);
      const textSim = calculateSimilarity(newTextTokens, compTextTokens);

      // Weighted score: location is very indicative in campus complaints (50%), text is (50%)
      const combinedScore = locSim * 0.5 + textSim * 0.5;

      if (combinedScore > highestScore) {
        highestScore = combinedScore;
        bestMatch = comp;
      }
    }

    // Threshold of 0.40 triggers duplicate warning
    if (highestScore >= 0.4 && bestMatch) {
      return {
        isDuplicate: true,
        similarityScore: Math.round(highestScore * 100),
        matchedComplaint: {
          id: bestMatch._id,
          complaintId: bestMatch.complaintId,
          title: bestMatch.title,
          location: bestMatch.location,
          category: bestMatch.category,
          status: bestMatch.status,
          createdAt: bestMatch.createdAt,
        },
      };
    }

    return { isDuplicate: false };
  } catch (error) {
    console.error('Duplicate check error:', error.message);
    return { isDuplicate: false };
  }
};
