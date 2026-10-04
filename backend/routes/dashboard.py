from flask import Blueprint, jsonify
from database import db
from models import Email, DetectionLog, ModelInfo
from services.spam_detector import get_latest_model_metrics
from services.email_service import load_demo_emails_into_system

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api')

@dashboard_bp.route('/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    """
    Computes all dashboard metrics and dynamic distribution charts from SQLite.
    No hardcoded values.
    """
    total_emails = Email.query.count()
    spam_detected = Email.query.filter_by(is_spam=True).count()
    legitimate_emails = Email.query.filter_by(is_spam=False).count()
    emails_in_bin = Email.query.filter_by(folder='BIN').count()
    emails_in_inbox = Email.query.filter_by(folder='INBOX').count()
    unread_count = Email.query.filter_by(folder='INBOX', is_read=False).count()
    
    # Recent detections (latest 6)
    recent_logs = DetectionLog.query.order_by(DetectionLog.detected_at.desc()).limit(6).all()
    recent_detections = [log.to_dict() for log in recent_logs]
    
    # Model evaluation metrics from database
    model_metrics = get_latest_model_metrics()
    
    # Confidence breakdown
    high_conf = DetectionLog.query.filter(DetectionLog.confidence >= 0.90).count()
    med_conf = DetectionLog.query.filter((DetectionLog.confidence >= 0.75) & (DetectionLog.confidence < 0.90)).count()
    low_conf = DetectionLog.query.filter(DetectionLog.confidence < 0.75).count()
    
    return jsonify({
        'summary': {
            'total_emails': total_emails,
            'spam_detected': spam_detected,
            'legitimate_emails': legitimate_emails,
            'emails_in_bin': emails_in_bin,
            'emails_in_inbox': emails_in_inbox,
            'unread_inbox': unread_count
        },
        'charts': {
            'distribution': [
                {'name': 'Legitimate', 'value': legitimate_emails, 'color': '#10b981'},
                {'name': 'Spam Intercepted', 'value': spam_detected, 'color': '#ef4444'}
            ],
            'confidence_ranges': [
                {'range': '90% - 100% High', 'count': high_conf},
                {'range': '75% - 89% Medium', 'count': med_conf},
                {'range': '< 75% Low', 'count': low_conf}
            ]
        },
        'recent_detections': recent_detections,
        'model_info': model_metrics
    }), 200

@dashboard_bp.route('/demo/load', methods=['POST'])
def load_demo_data():
    """
    Demo Mode Trigger:
    Loads demo_emails.csv, runs every single email through the ML model,
    saves spam into BIN and legitimate into INBOX, and records detection logs.
    """
    result = load_demo_emails_into_system()
    if 'error' in result:
        return jsonify({'error': result['error']}), 500
        
    return jsonify({
        'message': f"Successfully analyzed and loaded {result['total_loaded']} demo emails.",
        'details': result
    }), 200
