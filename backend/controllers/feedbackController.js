import Feedback from "../model/Feedback.js";

// POST /api/feedback
export const submitFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const feedback = await Feedback.create({
      user: req.user,
      rating,
      comment,
    });

    res.status(201).json({ message: "Feedback submitted", feedback });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
