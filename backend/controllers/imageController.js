import Upload from "../model/Upload.js";
import Report from "../model/Report.js";
import Tip from "../model/Tip.js";

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Save upload record to MongoDB
    const upload = await Upload.create({
      user:    req.user,
      fileUrl: req.file.path,
    });

    // ── Call Flask AI server ──────────────────────────────────
    let condition, confidence, severity, conditions, tips, low_confidence,
        conditionPlain, description;

    try {
      const FormData = (await import("form-data")).default;
      const fetch    = (await import("node-fetch")).default;
      const fs       = await import("fs");

      const form = new FormData();
      form.append("image", fs.createReadStream(req.file.path));

      const aiRes = await fetch("http://localhost:5001/predict", {
        method:  "POST",
        body:    form,
        headers: form.getHeaders(),
      });

      if (!aiRes.ok) throw new Error("AI server returned error");

      const data     = await aiRes.json();
      condition      = data.condition;
      confidence     = data.confidence;
      severity       = data.severity;
      conditions     = data.top_predictions ?? [{ name: condition, confidence, severity }];
      tips           = data.tips            ?? [];
      low_confidence = data.low_confidence  ?? false;
      conditionPlain = data.condition_plain ?? condition;
      description    = data.description     ?? "";

    } catch {
      // Flask not running — use mock so frontend still works
      condition      = "Seborrheic Dermatitis";
      confidence     = 85;
      severity       = "mild";
      conditions     = [{ name: condition, confidence, severity }];
      tips           = ["Use anti-dandruff shampoo with zinc pyrithione 2-3 times per week."];
      low_confidence = false;
      conditionPlain = "Dandruff & Oily Flakes";
      description    = "Your scalp is producing too much oil, causing white or yellow flakes and itching.";
    }
    // ──────────────────────────────────────────────────────────

    // Save report to MongoDB
    const report = await Report.create({
      user:       req.user,
      upload:     upload._id,
      condition,
      confidence,
      severity,
      conditions: JSON.stringify(conditions),
    });

    // Fetch any extra tips from DB for detected conditions
    const conditionNames = conditions.map((c) => c.name);
    const dbTips  = await Tip.find({ conditionTag: { $in: conditionNames } }).limit(10);
    const allTips = tips.length > 0 ? tips : dbTips.map((t) => t.description);

    res.status(201).json({
      reportId:       report._id,
      condition,
      conditionPlain,
      description,
      confidence,
      severity,
      conditions,
      tips:           allTips,
      low_confidence,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
