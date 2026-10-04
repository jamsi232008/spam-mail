import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'smart-spam-shield-college-ml-project-supersecret-key-2026')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', f"sqlite:///{BASE_DIR / 'smart_spam_shield.db'}")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Model and Data Paths
    MODEL_DIR = BASE_DIR / 'model'
    DATA_DIR = BASE_DIR / 'data'
    
    MODEL_PATH = MODEL_DIR / 'spam_model.pkl'
    VECTORIZER_PATH = MODEL_DIR / 'tfidf_vectorizer.pkl'
    DATASET_PATH = DATA_DIR / 'dataset.csv'
    DEMO_EMAILS_PATH = DATA_DIR / 'demo_emails.csv'
    
    # JWT Settings
    JWT_SECRET = os.environ.get('JWT_SECRET', 'jwt-shield-token-secret-999')
    JWT_EXPIRATION_HOURS = 24
    
    # ML Threshold
    SPAM_THRESHOLD = 0.50
