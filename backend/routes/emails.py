from flask import Blueprint, request, jsonify
from database import db
from models import Email, User
from services.email_service import (
    process_and_create_email,
    restore_email_to_inbox,
    delete_email_permanently,
    mark_email_read_status
)
import jwt
from config import Config

emails_bp = Blueprint('emails', __name__, url_prefix='/api/emails')

def get_optional_user_id():
    """
    Extracts user_id from Authorization header if present, without failing if guest.
    """
    auth_header = request.headers.get('Authorization')
    if auth_header:
        parts = auth_header.split()
        token = parts[1] if len(parts) == 2 else parts[0]
        try:
            data = jwt.decode(token, Config.JWT_SECRET, algorithms=['HS256'])
            return data.get('user_id')
        except Exception:
            return None
    return None

@emails_bp.route('', methods=['GET'])
def get_emails():
    """
    Fetches emails filtered by folder ('INBOX' or 'BIN'), search query, or read status.
    """
    folder = request.args.get('folder')
    search = request.args.get('search', '').strip().lower()
    
    query = Email.query
    
    if folder:
        query = query.filter(Email.folder == folder.upper())
        
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Email.subject.ilike(search_filter)) |
            (Email.sender.ilike(search_filter)) |
            (Email.body.ilike(search_filter))
        )
        
    emails = query.order_by(Email.created_at.desc()).all()
    
    inbox_count = Email.query.filter_by(folder='INBOX').count()
    bin_count = Email.query.filter_by(folder='BIN').count()
    unread_count = Email.query.filter_by(folder='INBOX', is_read=False).count()
    
    return jsonify({
        'emails': [e.to_dict() for e in emails],
        'total': len(emails),
        'stats': {
            'inbox_count': inbox_count,
            'bin_count': bin_count,
            'unread_count': unread_count
        }
    }), 200

@emails_bp.route('/<int:email_id>', methods=['GET'])
def get_email(email_id):
    """
    Fetches full email details and its associated detection log.
    """
    email = Email.query.get(email_id)
    if not email:
        return jsonify({'error': 'Email not found.'}), 404
        
    data = email.to_dict()
    # Add detection logs
    logs = [log.to_dict() for log in email.detection_logs]
    data['detection_logs'] = logs
    return jsonify({'email': data}), 200

@emails_bp.route('', methods=['POST'])
def create_email():
    """
    Creates an email, submits text to the ML model, and routes to INBOX or BIN.
    """
    data = request.get_json() or {}
    sender = data.get('sender', '').strip()
    receiver = data.get('receiver', '').strip()
    subject = data.get('subject', '').strip()
    body = data.get('body', '').strip()
    
    if not sender:
        sender = 'user@smartspamshield.ai'
    if not receiver:
        receiver = 'inbox@smartspamshield.ai'
        
    if not subject and not body:
        return jsonify({'error': 'Email must have at least a subject or body content.'}), 400
        
    user_id = get_optional_user_id()
    
    email, meta = process_and_create_email(
        sender=sender,
        receiver=receiver,
        subject=subject,
        body=body,
        user_id=user_id
    )
    
    return jsonify({
        'message': meta['notification'],
        'email': email.to_dict(),
        'routing': {
            'folder': meta['folder'],
            'prediction': meta['prediction'],
            'confidence': meta['confidence'],
            'spam_probability': meta['spam_probability'],
            'features_highlighted': meta['features_highlighted']
        }
    }), 201

@emails_bp.route('/<int:email_id>/read', methods=['PUT'])
def mark_read(email_id):
    """
    Marks an email as read or unread.
    """
    data = request.get_json() or {}
    is_read = data.get('is_read', True)
    
    email, msg = mark_email_read_status(email_id, is_read=is_read)
    if not email:
        return jsonify({'error': msg}), 404
        
    return jsonify({'message': msg, 'email': email.to_dict()}), 200

@emails_bp.route('/<int:email_id>/restore', methods=['PUT'])
def restore_email(email_id):
    """
    Restores an email from BIN back to INBOX.
    """
    email, msg = restore_email_to_inbox(email_id)
    if not email:
        return jsonify({'error': msg}), 404
        
    return jsonify({'message': msg, 'email': email.to_dict()}), 200

@emails_bp.route('/<int:email_id>/move-to-bin', methods=['PUT'])
def move_to_bin(email_id):
    """
    Manually moves an email from INBOX to BIN.
    """
    email = Email.query.get(email_id)
    if not email:
        return jsonify({'error': 'Email not found.'}), 404
        
    from datetime import datetime, timezone
    email.folder = 'BIN'
    email.moved_to_bin_at = datetime.now(timezone.utc)
    db.session.commit()
    return jsonify({'message': 'Email moved to Bin.', 'email': email.to_dict()}), 200

@emails_bp.route('/<int:email_id>', methods=['DELETE'])
def delete_email(email_id):
    """
    Permanently deletes an email from the database.
    """
    success, msg = delete_email_permanently(email_id)
    if not success:
        return jsonify({'error': msg}), 404
        
    return jsonify({'message': msg, 'id': email_id}), 200

