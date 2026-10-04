import sys
from pathlib import Path
import joblib
import numpy as np

# Ensure backend root is on sys.path
CURRENT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = CURRENT_DIR.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from config import Config
from ml.preprocess import clean_text, extract_spam_indicators

_model = None
_vectorizer = None

def load_model_and_vectorizer(force_reload=False):
    """
    Loads trained ML model and TF-IDF vectorizer from disk.
    Caches artifacts in module memory for high-performance inference.
    """
    global _model, _vectorizer
    if _model is not None and _vectorizer is not None and not force_reload:
        return _model, _vectorizer

    if not Config.MODEL_PATH.exists() or not Config.VECTORIZER_PATH.exists():
        # Automatically trigger training if models are missing
        from ml.train_model import train_and_save_model
        print("[!] Model files not found. Auto-training ML pipeline...")
        train_and_save_model()

    _model = joblib.load(Config.MODEL_PATH)
    _vectorizer = joblib.load(Config.VECTORIZER_PATH)
    return _model, _vectorizer

def predict_email(subject: str, body: str):
    """
    Runs full ML inference on an email (subject + body).
    Returns prediction ('SPAM' or 'LEGITIMATE'), confidence score,
    spam_probability, and detected risk indicator keywords.
    """
    model, vectorizer = load_model_and_vectorizer()
    
    raw_combined = f"{subject or ''} {body or ''}".strip()
    if not raw_combined:
        return {
            'prediction': 'LEGITIMATE',
            'confidence': 1.0,
            'spam_probability': 0.0,
            'is_spam': False,
            'features_highlighted': []
        }
        
    cleaned = clean_text(raw_combined)
    vec = vectorizer.transform([cleaned])
    
    # Probabilities: class 0 = LEGITIMATE (ham), class 1 = SPAM
    probabilities = model.predict_proba(vec)[0]
    classes = list(model.classes_)  # [0, 1]
    
    spam_idx = classes.index(1) if 1 in classes else 1
    ham_idx = classes.index(0) if 0 in classes else 0
    
    spam_prob = float(probabilities[spam_idx])
    ham_prob = float(probabilities[ham_idx])
    
    # Classification decision based on threshold
    threshold = getattr(Config, 'SPAM_THRESHOLD', 0.50)
    is_spam = bool(spam_prob >= threshold)
    prediction = 'SPAM' if is_spam else 'LEGITIMATE'
    confidence = spam_prob if is_spam else ham_prob
    
    # Feature indicators for explainability
    highlighted = extract_spam_indicators(raw_combined)
    
    return {
        'prediction': prediction,
        'confidence': round(float(confidence), 4),
        'spam_probability': round(float(spam_prob), 4),
        'is_spam': is_spam,
        'features_highlighted': highlighted
    }

if __name__ == '__main__':
    # Quick self-test
    test_spam = predict_email("Congratulations! You won a cash prize", "Click here to claim $1,000,000 cash reward.")
    print("Test Spam Result:", test_spam)
    test_ham = predict_email("CS401 Project Review", "The review will take place in Lab 304 on Thursday at 10 AM.")
    print("Test Ham Result:", test_ham)
