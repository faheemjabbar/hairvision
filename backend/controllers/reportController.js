import Report from "../model/Report.js";
import Tip from "../model/Tip.js";

// GET /api/reports/my  — all reports for the logged-in user
export const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user })
      .populate("upload", "fileUrl")
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/reports/:id  — single report with tips
export const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate("upload", "fileUrl");

    if (!report) return res.status(404).json({ message: "Report not found" });

    // Only the owner can view their report
    if (report.user.toString() !== req.user.toString()) {
      return res.status(403).json({ message: "Not authorised" });
    }

    const tips = await Tip.find({ conditionTag: report.condition }).limit(5);

    res.json({ ...report.toObject(), tips });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
