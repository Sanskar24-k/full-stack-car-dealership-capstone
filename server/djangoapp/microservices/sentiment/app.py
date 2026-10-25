from flask import Flask, jsonify
import os
import re

POSITIVE_WORDS = {
    "amazing", "awesome", "best", "brilliant", "comfortable", "delightful", "enjoy", "excellent",
    "fantastic", "friendly", "good", "great", "happy", "helpful", "love", "perfect", "recommend",
    "reliable", "smooth", "wonderful", "yes",
}
NEGATIVE_WORDS = {
    "awful", "bad", "boring", "broken", "disappointing", "hate", "horrible", "late", "poor",
    "problem", "problems", "rude", "sad", "slow", "terrible", "unhappy", "unreliable", "worse", "worst",
}
NEGATIONS = {"not", "never", "no", "isn't", "wasn't", "don't", "didn't", "hardly"}
INTENSIFIERS = {"very", "really", "extremely", "so", "incredibly"}


def analyze_text(text):
    words = re.findall(r"[a-z]+(?:'[a-z]+)?", text.lower())
    raw_score = 0.0
    negate_next = 0
    intensity = 1.0

    for word in words:
        if word in NEGATIONS:
            negate_next = 3
            continue
        if word in INTENSIFIERS:
            intensity = 1.5
            continue
        value = 1.0 if word in POSITIVE_WORDS else -1.0 if word in NEGATIVE_WORDS else 0.0
        if value:
            if negate_next:
                value *= -1
            raw_score += value * intensity
            intensity = 1.0
        if negate_next:
            negate_next -= 1

    score = max(-1.0, min(1.0, raw_score / max(1, len(words) ** 0.5)))
    label = "positive" if score > 0.05 else "negative" if score < -0.05 else "neutral"
    return {"text": text, "sentiment": label, "score": round(score, 3)}


def create_app():
    app = Flask(__name__)

    @app.get("/health")
    def health():
        return jsonify({"service": "sentiment-analyzer", "status": "ok"})

    @app.get("/analyze/<path:text>")
    def analyze(text):
        return jsonify(analyze_text(text))

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=False)
