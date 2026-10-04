import os
import sys
import json
from pathlib import Path
import pandas as pd
import numpy as np
import joblib
from datetime import datetime, timezone
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

# Ensure backend root is on sys.path
CURRENT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = CURRENT_DIR.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from config import Config
from ml.preprocess import clean_text

def load_and_prepare_data():
    """
    Loads dataset.csv and demo_emails.csv, merges them, cleans text, and normalizes labels.
    """
    frames = []
    
    # 1. Main dataset
    if Config.DATASET_PATH.exists():
        df_main = pd.read_csv(Config.DATASET_PATH)
        if 'label' in df_main.columns and 'text' in df_main.columns:
            frames.append(df_main[['label', 'text']])
            
    # 2. Demo emails dataset
    if Config.DEMO_EMAILS_PATH.exists():
        df_demo = pd.read_csv(Config.DEMO_EMAILS_PATH)
        # Combine subject and body
        demo_texts = (df_demo['subject'].fillna('') + ' ' + df_demo['body'].fillna('')).astype(str)
        labels = df_demo['intended_label'].astype(str)
        demo_df = pd.DataFrame({'label': labels, 'text': demo_texts})
        frames.append(demo_df)
        
    if not frames:
        raise FileNotFoundError(f"No dataset found at {Config.DATASET_PATH} or {Config.DEMO_EMAILS_PATH}")
        
    combined_df = pd.concat(frames, ignore_index=True)
    combined_df = combined_df.dropna(subset=['text', 'label'])
    
    # Normalize labels: 'spam' -> 1, 'ham' / 'legitimate' -> 0
    def normalize_label(val):
        v = str(val).strip().lower()
        if v in ['spam', '1', 'true']:
            return 1
        return 0

    combined_df['target'] = combined_df['label'].apply(normalize_label)
    
    # Clean text using preprocess pipeline
    combined_df['cleaned_text'] = combined_df['text'].apply(clean_text)
    
    # Drop rows with empty cleaned_text
    combined_df = combined_df[combined_df['cleaned_text'].str.len() > 0]
    
    print(f"[*] Dataset loaded successfully: {len(combined_df)} total records.")
    print(f"    - Spam count: {int((combined_df['target'] == 1).sum())}")
    print(f"    - Legitimate count: {int((combined_df['target'] == 0).sum())}")
    
    return combined_df

def train_and_save_model():
    """
    Trains TF-IDF + MultinomialNB pipeline, calculates real evaluation metrics,
    saves joblib artifacts, and records metrics to database.
    """
    Config.MODEL_DIR.mkdir(parents=True, exist_ok=True)
    
    df = load_and_prepare_data()
    X = df['cleaned_text'].values
    y = df['target'].values
    
    # Stratified train/test split (80% train, 20% test)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    
    print(f"[*] Split: {len(X_train)} train samples, {len(X_test)} test samples.")
    
    # TF-IDF Vectorizer
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=3500,
        sublinear_tf=True,
        stop_words='english'
    )
    
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)
    
    # Classifier: Multinomial Naive Bayes
    classifier = MultinomialNB(alpha=0.15)
    classifier.fit(X_train_vec, y_train)
    
    # Evaluate model
    y_pred = classifier.predict(X_test_vec)
    
    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred, zero_division=0))
    rec = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    cm = confusion_matrix(y_test, y_pred).tolist()
    
    print("==================================================")
    print("   SMART SPAM SHIELD - MODEL EVALUATION METRICS   ")
    print("==================================================")
    print(f"Model: Multinomial Naive Bayes (alpha=0.15)")
    print(f"Dataset Size: {len(df)} samples")
    print(f"Vocabulary Size: {len(vectorizer.vocabulary_)} features")
    print(f"Accuracy:  {acc * 100:.2f}%")
    print(f"Precision: {prec * 100:.2f}%")
    print(f"Recall:    {rec * 100:.2f}%")
    print(f"F1 Score:  {f1 * 100:.2f}%")
    print(f"Confusion Matrix: {cm} (TN={cm[0][0]}, FP={cm[0][1]}, FN={cm[1][0]}, TP={cm[1][1]})")
    print("==================================================")
    
    # Save artifacts
    joblib.dump(classifier, Config.MODEL_PATH)
    joblib.dump(vectorizer, Config.VECTORIZER_PATH)
    print(f"[+] Model saved to: {Config.MODEL_PATH}")
    print(f"[+] Vectorizer saved to: {Config.VECTORIZER_PATH}")
    
    # Persist metrics to database table 'model_info'
    try:
        from database import db
        from models import ModelInfo
        from flask import Flask
        
        app = Flask(__name__)
        app.config.from_object(Config)
        db.init_app(app)
        
        with app.app_context():
            db.create_all()
            # Clear previous model info or insert newest
            info = ModelInfo(
                model_name="Multinomial Naive Bayes",
                accuracy=acc,
                precision=prec,
                recall=rec,
                f1_score=f1,
                trained_at=datetime.now(timezone.utc),
                dataset_size=len(df),
                confusion_matrix=json.dumps(cm)
            )
            db.session.add(info)
            db.session.commit()
            print(f"[+] Model evaluation metrics recorded to SQLite database (id: {info.id}).")
    except Exception as e:
        print(f"[!] Warning: Could not write metrics to SQLite (train script standalone): {e}")
        
    return {
        'model_name': 'Multinomial Naive Bayes',
        'accuracy': acc,
        'precision': prec,
        'recall': rec,
        'f1_score': f1,
        'confusion_matrix': cm,
        'dataset_size': len(df)
    }

if __name__ == '__main__':
    train_and_save_model()
