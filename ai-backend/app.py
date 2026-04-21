# ============================================================
# HairVision - Flask AI Server (Production-Ready)
# ============================================================

from flask import Flask, request, jsonify
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing import image
import os
import json
import uuid

# ── App Init ────────────────────────────────────────────────
app = Flask(__name__)

# ── Config ─────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "hairvision_model.h5")
CLASS_PATH = os.path.join(BASE_DIR, "classes.json")
IMG_SIZE   = (224, 224)

# ── Load Class Names from classes.json ──────────────────────
# classes.json is saved automatically during training
# Format: {"Alopecia Areata": 0, "Contact Dermatitis": 1, ...}
def load_classes():
    if not os.path.exists(CLASS_PATH):
        raise FileNotFoundError("classes.json not found. Run train.py first.")
    with open(CLASS_PATH, "r") as f:
        class_indices = json.load(f)
    # Sort by index value to get correct order
    return [cls for cls, _ in sorted(class_indices.items(), key=lambda x: x[1])]

CLASSES = load_classes()

# ── Plain English names & descriptions ──────────────────────
# Medical term → what a normal person would understand
PLAIN_NAME = {
    "Alopecia Areata":       "Patchy Hair Loss",
    "Contact Dermatitis":    "Scalp Skin Reaction",
    "Folliculitis":          "Infected Hair Roots",
    "Head Lice":             "Head Lice (Nits)",
    "Healthy":               "Healthy Hair & Scalp",
    "Lichen Planus":         "Scalp Rash & Irritation",
    "Male Pattern Baldness": "Common Hair Thinning / Baldness",
    "Psoriasis":             "Thick Scaly Scalp Patches",
    "Seborrheic Dermatitis": "Dandruff & Oily Flakes",
    "Telogen Effluvium":     "Temporary Hair Shedding",
    "Tinea Capitis":         "Scalp Fungal Infection (Ringworm)",
}

PLAIN_DESC = {
    "Alopecia Areata":       "Your immune system is causing sudden round bald patches on your scalp.",
    "Contact Dermatitis":    "Your scalp is reacting to something it touched — likely a shampoo, dye, or product.",
    "Folliculitis":          "The tiny pores your hair grows from are infected, causing small red bumps or pimples.",
    "Head Lice":             "Tiny insects are living in your hair and feeding on your scalp, causing itching.",
    "Healthy":               "Your hair and scalp appear healthy with no signs of disease.",
    "Lichen Planus":         "An inflammatory condition causing an itchy rash on your scalp that can lead to hair loss.",
    "Male Pattern Baldness": "Your hair is gradually thinning due to genetics and hormones — very common in men.",
    "Psoriasis":             "Your skin cells are growing too fast, creating thick, silvery-white flaky patches on your scalp.",
    "Seborrheic Dermatitis": "Your scalp is producing too much oil, causing white or yellow flakes (dandruff) and itching.",
    "Telogen Effluvium":     "More hair than usual is falling out, often triggered by stress, illness, or diet changes. It usually grows back.",
    "Tinea Capitis":         "A fungal infection (like athlete's foot but on your scalp) causing itchy, scaly, or bald patches.",
}
SEVERITY = {
    "Alopecia Areata":       "moderate",
    "Contact Dermatitis":    "mild",
    "Folliculitis":          "moderate",
    "Head Lice":             "mild",
    "Healthy":               "healthy",
    "Lichen Planus":         "moderate",
    "Male Pattern Baldness": "severe",
    "Psoriasis":             "severe",
    "Seborrheic Dermatitis": "mild",
    "Telogen Effluvium":     "moderate",
    "Tinea Capitis":         "moderate",
}

TIPS = {
    "Alopecia Areata":       "Consult a dermatologist. Corticosteroid injections may help.",
    "Contact Dermatitis":    "Avoid irritants and use mild shampoos.",
    "Folliculitis":          "Keep scalp clean; antibacterial treatment may help.",
    "Head Lice":             "Use medicated lice shampoo and wash all bedding.",
    "Healthy":               "Your scalp looks healthy. Maintain your routine.",
    "Lichen Planus":         "Consult a dermatologist for anti-inflammatory treatment.",
    "Male Pattern Baldness": "Consider minoxidil or finasteride.",
    "Psoriasis":             "Use medicated shampoos and manage stress.",
    "Seborrheic Dermatitis": "Use anti-dandruff shampoos regularly.",
    "Telogen Effluvium":     "Reduce stress and improve nutrition.",
    "Tinea Capitis":         "Requires antifungal medication — see a doctor.",
}

# ── Load Model ──────────────────────────────────────────────
model = None

def load_model():
    global model
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model not found at {MODEL_PATH}. Run train.py first.")
    model = tf.keras.models.load_model(MODEL_PATH)
    print(f"✓ Model loaded: {MODEL_PATH}")

# ── Helpers ─────────────────────────────────────────────────
def preprocess_image(img_path):
    """Load, resize, normalise image → ready for model."""
    img = image.load_img(img_path, target_size=IMG_SIZE)
    arr = image.img_to_array(img) / 255.0
    return np.expand_dims(arr, axis=0)   # (224,224,3) → (1,224,224,3)

def get_top_predictions(preds, top_k=3):
    """
    Return top-k predictions with name, confidence and severity.
    Rules:
    - If primary is Healthy with high confidence, return only Healthy
    - Only include secondary conditions if they score above 15%
    - Never mix Healthy with disease conditions
    """
    scores = [
        {
            "name":            CLASSES[i],
            "condition_plain": PLAIN_NAME.get(CLASSES[i], CLASSES[i]),
            "description":     PLAIN_DESC.get(CLASSES[i], ""),
            "confidence":      round(float(preds[i]) * 100, 2),
            "severity":        SEVERITY.get(CLASSES[i], "unknown"),
        }
        for i in range(len(CLASSES))
    ]
    sorted_scores = sorted(scores, key=lambda x: x["confidence"], reverse=True)
    primary = sorted_scores[0]

    # If primary is Healthy — return only Healthy, ignore everything else
    if primary["name"] == "Healthy":
        return [primary]

    # If primary is a disease — return top conditions above 15% (excluding Healthy)
    results = [
        s for s in sorted_scores
        if s["confidence"] >= 15.0 and s["name"] != "Healthy"
    ]

    return results[:top_k] if results else [primary]

# ── Routes ──────────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status":       "ok",
        "model_loaded": model is not None,
        "classes":      CLASSES,
    })

@app.route("/predict", methods=["POST"])
def predict():
    if model is None:
        return jsonify({"error": "Model not loaded"}), 503

    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400

    file = request.files["image"]

    # Unique temp filename — safe for concurrent requests
    temp_path = os.path.join(BASE_DIR, f"{uuid.uuid4().hex}.jpg")

    try:
        file.save(temp_path)

        arr   = preprocess_image(temp_path)
        preds = model.predict(arr, verbose=0)[0]

        # Primary prediction
        top_idx    = int(np.argmax(preds))
        primary    = CLASSES[top_idx]
        confidence = round(float(preds[top_idx]) * 100, 2)

        # Top 3 predictions (useful for borderline cases)
        top_predictions = get_top_predictions(preds, top_k=3)

        return jsonify({
            "condition":       primary,
            "condition_plain": PLAIN_NAME.get(primary, primary),
            "description":     PLAIN_DESC.get(primary, ""),
            "confidence":      confidence,
            "severity":        SEVERITY.get(primary, "unknown"),
            "top_predictions": [
                {
                    **p,
                    "condition_plain": PLAIN_NAME.get(p["name"], p["name"]),
                    "description":     PLAIN_DESC.get(p["name"], ""),
                }
                for p in top_predictions
            ],
            "tips":            [TIPS.get(primary, "")],
            "low_confidence":  confidence < 50.0,
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

# ── Start Server ────────────────────────────────────────────
if __name__ == "__main__":
    load_model()
    print("HairVision AI running on http://localhost:5001")
    app.run(host="0.0.0.0", port=5001, debug=False)
