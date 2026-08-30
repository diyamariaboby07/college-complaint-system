import {
  categorizeComplaint,
  summarizeComplaint,
  classifyImageIssue,
} from '../services/aiService.js';
import { checkDuplicateComplaint } from '../services/duplicateService.js';

export const categorize = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const result = await categorizeComplaint({ title, description });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const summarize = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const result = await summarizeComplaint({ title, description });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const imageClassify = async (req, res, next) => {
  try {
    const { category, title, description } = req.body;
    const result = await classifyImageIssue({ category, title, description });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const checkDuplicate = async (req, res, next) => {
  try {
    const { category, location, title, description } = req.body;
    const result = await checkDuplicateComplaint({ category, location, title, description });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
