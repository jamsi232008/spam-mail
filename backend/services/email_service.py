from datetime import datetime, timezone
import pandas as pd
from database import db
from models import Email, DetectionLog
from services.spam_detector import analyze_email_content, record_detection_log
from config import Config

def process_and_create_email(sender: str, receiver: str, subject: str, body: str, user_id: int = None):
    """
    Main Email Creation Workflow:
    1. Validates input
    2. Runs ML model on combined subject + body
    3. If SPAM: folder = 'BIN', is_spam = True, records moved_to_bin_at
    4. If LEGITIMATE: folder = 'INBOX', is_spam = False
    5. Saves to SQLite
    6. Logs detection to DetectionLog table
    7. Returns email object and notification message
    """
    subject_clean = (subject or '').strip()
    body_clean = (body or '').strip()
    
    # Run ML prediction on backend
    ml_result = analyze_email_content(subject_clean, body_clean)
    
    is_spam = ml_result['is_spam']
    prediction = ml_result['prediction']
    confidence = ml_result['confidence']
    spam_prob = ml_result['spam_probability']
    now = datetime.now(timezone.utc)
    
    if is_spam:
        folder = 'BIN'
        moved_to_bin_at = now
        notification_message = "Spam detected. This email was automatically moved to Bin."
    else:
        folder = 'INBOX'
        moved_to_bin_at = None
        notification_message = "Legitimate email verified. Successfully delivered to Inbox."

    email = Email(
        sender=sender.strip(),
        receiver=receiver.strip(),
        subject=subject_clean,
        body=body_clean,
        folder=folder,
        is_read=False,
        is_spam=is_spam,
        spam_probability=spam_prob,
        prediction=prediction,
        created_at=now,
        moved_to_bin_at=moved_to_bin_at,
        user_id=user_id
    )
    
    db.session.add(email)
    db.session.commit()
    
    # Record Detection Log linked to email
    record_detection_log(
        email_id=email.id,
        prediction=prediction,
        confidence=confidence,
        subject=subject_clean,
        model_name="Multinomial Naive Bayes"
    )
    
    return email, {
        'notification': notification_message,
        'prediction': prediction,
        'confidence': confidence,
        'spam_probability': spam_prob,
        'features_highlighted': ml_result.get('features_highlighted', []),
        'folder': folder
    }

def restore_email_to_inbox(email_id: int):
    """
    Restores an email from BIN to INBOX.
    """
    email = Email.query.get(email_id)
    if not email:
        return None, "Email not found"
        
    email.folder = 'INBOX'
    email.moved_to_bin_at = None
    db.session.commit()
    return email, "Email successfully restored to Inbox."

def delete_email_permanently(email_id: int):
    """
    Permanently deletes an email from the database.
    """
    email = Email.query.get(email_id)
    if not email:
        return False, "Email not found"
        
    db.session.delete(email)
    db.session.commit()
    return True, "Email permanently deleted."

def mark_email_read_status(email_id: int, is_read: bool = True):
    """
    Updates the is_read status of an email.
    """
    email = Email.query.get(email_id)
    if not email:
        return None, "Email not found"
        
    email.is_read = is_read
    db.session.commit()
    return email, "Email read status updated."

def load_demo_emails_into_system(receiver_email: str = 'student@college.edu', user_id: int = None):
    """
    Loads demo emails from demo_emails.csv, executes ML model inference on each,
    and populates SQLite database. Spam goes to BIN, legitimate goes to INBOX.
    """
    if not Config.DEMO_EMAILS_PATH.exists():
        return {'error': 'demo_emails.csv not found'}
        
    df = pd.read_csv(Config.DEMO_EMAILS_PATH)
    
    loaded_count = 0
    spam_count = 0
    ham_count = 0
    
    for _, row in df.iterrows():
        sender = str(row.get('sender', 'unknown@sender.com'))
        receiver = receiver_email or str(row.get('receiver', 'student@college.edu'))
        subject = str(row.get('subject', 'No Subject'))
        body = str(row.get('body', ''))
        
        email, meta = process_and_create_email(
            sender=sender,
            receiver=receiver,
            subject=subject,
            body=body,
            user_id=user_id
        )
        loaded_count += 1
        if email.is_spam:
            spam_count += 1
        else:
            ham_count += 1
            
    return {
        'total_loaded': loaded_count,
        'spam_routed_to_bin': spam_count,
        'legitimate_routed_to_inbox': ham_count
    }
