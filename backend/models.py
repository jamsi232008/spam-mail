from datetime import datetime, timezone
import json
from database import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
    emails = db.relationship('Email', backref='user', lazy=True, cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Email(db.Model):
    __tablename__ = 'emails'
    
    id = db.Column(db.Integer, primary_key=True)
    sender = db.Column(db.String(150), nullable=False)
    receiver = db.Column(db.String(150), nullable=False)
    subject = db.Column(db.String(255), nullable=False)
    body = db.Column(db.Text, nullable=False)
    folder = db.Column(db.String(50), default='INBOX', nullable=False)  # 'INBOX' or 'BIN'
    is_read = db.Column(db.Boolean, default=False, nullable=False)
    is_spam = db.Column(db.Boolean, default=False, nullable=False)
    spam_probability = db.Column(db.Float, default=0.0)
    prediction = db.Column(db.String(50), default='LEGITIMATE')  # 'SPAM' or 'LEGITIMATE'
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    moved_to_bin_at = db.Column(db.DateTime, nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=True)
    
    detection_logs = db.relationship('DetectionLog', backref='email', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'sender': self.sender,
            'receiver': self.receiver,
            'subject': self.subject,
            'body': self.body,
            'folder': self.folder,
            'is_read': self.is_read,
            'is_spam': self.is_spam,
            'spam_probability': round(float(self.spam_probability or 0.0), 4),
            'prediction': self.prediction,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'moved_to_bin_at': self.moved_to_bin_at.isoformat() if self.moved_to_bin_at else None,
            'user_id': self.user_id
        }

class DetectionLog(db.Model):
    __tablename__ = 'detection_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    email_id = db.Column(db.Integer, db.ForeignKey('emails.id', ondelete='CASCADE'), nullable=True)
    prediction = db.Column(db.String(50), nullable=False)
    confidence = db.Column(db.Float, nullable=False)
    model_name = db.Column(db.String(100), default='Multinomial Naive Bayes')
    detected_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    subject = db.Column(db.String(255), nullable=True)  # Snapshot of subject for standalone testing

    def to_dict(self):
        return {
            'id': self.id,
            'email_id': self.email_id,
            'subject': self.subject or (self.email.subject if self.email else 'Direct ML Test'),
            'prediction': self.prediction,
            'confidence': round(float(self.confidence), 4),
            'model_name': self.model_name,
            'detected_at': self.detected_at.isoformat() if self.detected_at else None
        }

class ModelInfo(db.Model):
    __tablename__ = 'model_info'
    
    id = db.Column(db.Integer, primary_key=True)
    model_name = db.Column(db.String(100), nullable=False)
    accuracy = db.Column(db.Float, nullable=False)
    precision = db.Column(db.Float, nullable=False)
    recall = db.Column(db.Float, nullable=False)
    f1_score = db.Column(db.Float, nullable=False)
    trained_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    dataset_size = db.Column(db.Integer, nullable=False)
    confusion_matrix = db.Column(db.Text, nullable=True)  # JSON string

    def to_dict(self):
        cm = None
        if self.confusion_matrix:
            try:
                cm = json.loads(self.confusion_matrix)
            except Exception:
                cm = None
        return {
            'id': self.id,
            'model_name': self.model_name,
            'accuracy': round(float(self.accuracy), 4),
            'precision': round(float(self.precision), 4),
            'recall': round(float(self.recall), 4),
            'f1_score': round(float(self.f1_score), 4),
            'trained_at': self.trained_at.isoformat() if self.trained_at else None,
            'dataset_size': self.dataset_size,
            'confusion_matrix': cm
        }
