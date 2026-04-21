# ============================================================
# HairVision - Model Training Script  (v2 - corrected)
# Architecture : MobileNetV2 + softmax (single-label)
# Loss         : categorical_crossentropy
# Metrics      : confusion matrix, precision, recall per class
# Dataset      : Hair Diseases - Final (11 classes incl. Healthy)
# ============================================================

import os
import json
import numpy as np
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras import layers, models
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import matplotlib.pyplot as plt
import matplotlib.colors as mcolors
from sklearn.metrics import (
    confusion_matrix,
    classification_report,
    ConfusionMatrixDisplay,
)

# ── Step 1: Configuration ────────────────────────────────────

DATASET_DIR = os.path.join(os.path.dirname(__file__), "Hair Diseases - Final")
MODEL_OUT   = os.path.join(os.path.dirname(__file__), "hairvision_model.h5")
BEST_MODEL  = os.path.join(os.path.dirname(__file__), "best_model.keras")

IMG_SIZE   = (224, 224)
BATCH_SIZE = 32
EPOCHS_P1  = 10   # Phase 1: head only
EPOCHS_P2  = 10   # Phase 2: fine-tune

# Any disease scoring above this % is also reported (multi-disease output)
SECONDARY_THRESHOLD = 40.0

print("=" * 55)
print("HairVision Training  (softmax / categorical_crossentropy)")
print(f"Dataset    : {DATASET_DIR}")
print(f"Image size : {IMG_SIZE}  |  Batch : {BATCH_SIZE}")
print("=" * 55)


# ── Step 2: Load Data ────────────────────────────────────────
# Augmentation on train only — val/test get no augmentation

train_gen = ImageDataGenerator(
    rescale          = 1.0 / 255,
    horizontal_flip  = True,
    rotation_range   = 20,
    zoom_range       = 0.15,
    brightness_range = [0.8, 1.2],
    shear_range      = 0.1,
    fill_mode        = "nearest",
)
val_gen  = ImageDataGenerator(rescale=1.0 / 255)
test_gen = ImageDataGenerator(rescale=1.0 / 255)

train_data = train_gen.flow_from_directory(
    os.path.join(DATASET_DIR, "train"),
    target_size = IMG_SIZE,
    batch_size  = BATCH_SIZE,
    class_mode  = "categorical",
    shuffle     = True,
)
val_data = val_gen.flow_from_directory(
    os.path.join(DATASET_DIR, "val"),
    target_size = IMG_SIZE,
    batch_size  = BATCH_SIZE,
    class_mode  = "categorical",
    shuffle     = False,
)
test_data = test_gen.flow_from_directory(
    os.path.join(DATASET_DIR, "test"),
    target_size = IMG_SIZE,
    batch_size  = BATCH_SIZE,
    class_mode  = "categorical",
    shuffle     = False,
)

NUM_CLASSES = len(train_data.class_indices)
CLASS_NAMES = list(train_data.class_indices.keys())

print(f"\nClasses ({NUM_CLASSES}):")
for name in CLASS_NAMES:
    print(f"  {name}")
print(f"\nTrain: {train_data.samples} | Val: {val_data.samples} | Test: {test_data.samples}\n")


# ── Step 3: Build Model ──────────────────────────────────────
# softmax  → outputs NUM_CLASSES probabilities that SUM TO 1
#            the highest one is the primary prediction
# categorical_crossentropy → correct loss for single-label classification

base_model = MobileNetV2(
    input_shape = (*IMG_SIZE, 3),
    include_top = False,
    weights     = "imagenet",
)
base_model.trainable = False   # freeze pretrained weights for Phase 1

model = models.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.Dense(256, activation="relu"),
    layers.Dropout(0.4),
    layers.Dense(NUM_CLASSES, activation="softmax"),  # ← softmax
])

model.compile(
    optimizer = tf.keras.optimizers.Adam(learning_rate=1e-3),
    loss      = "categorical_crossentropy",            # ← correct loss
    metrics   = ["accuracy"],
)

model.summary()


# ── Step 4: Phase 1 — Train head only ───────────────────────

print("\n--- Phase 1: Training classification head ---")

callbacks_p1 = [
    tf.keras.callbacks.EarlyStopping(
        monitor="val_accuracy", patience=4, restore_best_weights=True
    ),
    tf.keras.callbacks.ModelCheckpoint(
        BEST_MODEL, monitor="val_accuracy", save_best_only=True, verbose=1
    ),
    tf.keras.callbacks.ReduceLROnPlateau(
        monitor="val_loss", factor=0.5, patience=2, verbose=1
    ),
]

history1 = model.fit(
    train_data,
    validation_data = val_data,
    epochs          = EPOCHS_P1,
    callbacks       = callbacks_p1,
)


# ── Step 5: Phase 2 — Fine-tune top layers ───────────────────

print("\n--- Phase 2: Fine-tuning top MobileNetV2 layers ---")

base_model.trainable = True
for layer in base_model.layers[:-30]:
    layer.trainable = False

model.compile(
    optimizer = tf.keras.optimizers.Adam(learning_rate=1e-5),
    loss      = "categorical_crossentropy",
    metrics   = ["accuracy"],
)

callbacks_p2 = [
    tf.keras.callbacks.EarlyStopping(
        monitor="val_accuracy", patience=5, restore_best_weights=True
    ),
    tf.keras.callbacks.ModelCheckpoint(
        BEST_MODEL, monitor="val_accuracy", save_best_only=True, verbose=1
    ),
    tf.keras.callbacks.ReduceLROnPlateau(
        monitor="val_loss", factor=0.5, patience=3, verbose=1
    ),
]

history2 = model.fit(
    train_data,
    validation_data = val_data,
    epochs          = EPOCHS_P2,
    callbacks       = callbacks_p2,
)


# ── Step 6: Evaluate on Test Set ─────────────────────────────

print("\n--- Final Evaluation on Test Set ---")
test_loss, test_acc = model.evaluate(test_data)
print(f"Test Accuracy : {test_acc * 100:.2f}%")
print(f"Test Loss     : {test_loss:.4f}")


# ── Step 7: Confusion Matrix + Precision / Recall ────────────
#
# Confusion matrix: a grid where:
#   rows = actual disease
#   cols = what the model predicted
#   diagonal = correct predictions
#   off-diagonal = mistakes (e.g. Psoriasis predicted as Seborrheic)
#
# Precision = of all images predicted as X, how many actually are X?
#             (avoids false alarms)
# Recall    = of all actual X images, how many did the model catch?
#             (avoids missing cases)
# F1-score  = balance between precision and recall

print("\n--- Confusion Matrix & Classification Report ---")

test_data.reset()
preds       = model.predict(test_data, verbose=1)
pred_labels = np.argmax(preds, axis=1)   # index of highest score
true_labels = test_data.classes

# Classification report — precision, recall, f1 per class
print("\nClassification Report:")
print(classification_report(
    true_labels,
    pred_labels,
    target_names = CLASS_NAMES,
    digits       = 3,
))

# Confusion matrix
cm = confusion_matrix(true_labels, pred_labels)

fig, ax = plt.subplots(figsize=(14, 12))
disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=CLASS_NAMES)
disp.plot(ax=ax, colorbar=True, cmap="Blues", xticks_rotation=45)
ax.set_title("Confusion Matrix — HairVision Test Set", fontsize=14, pad=15)
plt.tight_layout()
cm_path = os.path.join(os.path.dirname(__file__), "confusion_matrix.png")
plt.savefig(cm_path, dpi=150)
print(f"\nConfusion matrix saved → {cm_path}")


# ── Step 8: Multi-disease inference demo ─────────────────────
#
# Even with softmax, we can report secondary diseases:
# If the 2nd highest score is also above SECONDARY_THRESHOLD,
# we report it too. This handles cases where two conditions
# are visually present in one image.

print(f"\n--- Multi-disease demo (secondary threshold = {SECONDARY_THRESHOLD}%) ---")
print("Example predictions on first 5 test images:\n")

test_data.reset()
sample_preds = model.predict(test_data, verbose=0)

for i in range(5):
    scores = {CLASS_NAMES[j]: round(float(sample_preds[i][j]) * 100, 1)
              for j in range(NUM_CLASSES)}
    sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)

    primary = sorted_scores[0]
    secondary = [(name, score) for name, score in sorted_scores[1:]
                 if score >= SECONDARY_THRESHOLD]

    print(f"  Image {i+1}:")
    print(f"    Primary   : {primary[0]} ({primary[1]}%)")
    if secondary:
        for name, score in secondary:
            print(f"    Secondary : {name} ({score}%)")
    else:
        print(f"    Secondary : none above {SECONDARY_THRESHOLD}%")
    print()


# ── Step 9: Save final model ──────────────────────────────────
# Save in .keras format (recommended over .h5)
MODEL_OUT_KERAS = os.path.join(os.path.dirname(__file__), "hairvision_model.keras")
model.save(MODEL_OUT_KERAS)
print(f"Model saved → {MODEL_OUT_KERAS}")

# Save class indices to classes.json so app.py loads them automatically
class_path = os.path.join(os.path.dirname(__file__), "classes.json")
with open(class_path, "w") as f:
    json.dump(train_data.class_indices, f, indent=2)
print(f"Classes saved → {class_path}")


# ── Step 10: Training curves ──────────────────────────────────

all_acc      = history1.history["accuracy"]     + history2.history["accuracy"]
all_val_acc  = history1.history["val_accuracy"] + history2.history["val_accuracy"]
all_loss     = history1.history["loss"]         + history2.history["loss"]
all_val_loss = history1.history["val_loss"]     + history2.history["val_loss"]
p1_end       = len(history1.history["accuracy"])

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

ax1.plot(all_acc,     label="Train Accuracy", color="steelblue")
ax1.plot(all_val_acc, label="Val Accuracy",   color="orange")
ax1.axvline(p1_end - 1, color="gray", linestyle="--", label="Phase 2 start")
ax1.set_title("Accuracy over Epochs")
ax1.set_xlabel("Epoch"); ax1.set_ylabel("Accuracy")
ax1.legend(); ax1.grid(True)

ax2.plot(all_loss,     label="Train Loss", color="steelblue")
ax2.plot(all_val_loss, label="Val Loss",   color="orange")
ax2.axvline(p1_end - 1, color="gray", linestyle="--", label="Phase 2 start")
ax2.set_title("Loss over Epochs")
ax2.set_xlabel("Epoch"); ax2.set_ylabel("Loss")
ax2.legend(); ax2.grid(True)

plt.tight_layout()
plot_path = os.path.join(os.path.dirname(__file__), "training_plot.png")
plt.savefig(plot_path, dpi=150)
print(f"Training plot saved → {plot_path}")
plt.show()
