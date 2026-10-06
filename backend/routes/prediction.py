from flask import Blueprint, request, jsonify
from services.spam_detector import analyze_email_content, record_detection_log, get_latest_model_metrics
from models import DetectionLog
from ml.predict import load_model_and_vectorizer

prediction_bp = Blueprint('prediction', __name__, url_prefix='/api')

@prediction_bp.route('/predict', methods=['POST'])
def predict():
    """
    Direct ML model testing endpoint.
    Accepts subject and body, runs inference, saves detection log, and returns prediction.
    """
    data = request.get_json() or {}
    subject = data.get('subject', '').strip()
    body = data.get('body', '').strip()
    
    if not subject and not body:
        return jsonify({'error': 'Please provide subject or body content to test.'}), 400
        
    result = analyze_email_content(subject, body)
    
    # Record standalone detection log
    record_detection_log(
        email_id=None,
        prediction=result['prediction'],
        confidence=result['confidence'],
        subject=subject or (body[:50] + '...'),
        model_name="Multinomial Naive Bayes"
    )
    
    return jsonify({
        'prediction': result['prediction'],
        'confidence': result['confidence'],
        'spam_probability': result['spam_probability'],
        'is_spam': result['is_spam'],
        'features_highlighted': result['features_highlighted']
    }), 200

@prediction_bp.route('/detections', methods=['GET'])
def get_detections():
    """
    Returns historical ML detection logs with optional filtering.
    """
    filter_type = request.args.get('filter', 'all').lower()
    
    query = DetectionLog.query
    if filter_type == 'spam':
        query = query.filter_by(prediction='SPAM')
    elif filter_type in ['legitimate', 'ham']:
        query = query.filter_by(prediction='LEGITIMATE')
        
    logs = query.order_by(DetectionLog.detected_at.desc()).limit(100).all()
    
    return jsonify({
        'detections': [log.to_dict() for log in logs],
        'total': len(logs)
    }), 200

@prediction_bp.route('/model/info', methods=['GET'])
def get_model_info():
    """
    Returns current model architecture details and performance metrics.
    """
    metrics = get_latest_model_metrics()
    return jsonify({'model_info': metrics}), 200

@prediction_bp.route('/model/retrain', methods=['POST'])
def retrain_model():
    """
    Retrains the Multinomial Naive Bayes classifier on the latest dataset,
    re-evaluates test metrics, and reloads in-memory models.
    """
    try:
        from ml.train_model import train_and_save_model
        metrics = train_and_save_model()
        load_model_and_vectorizer(force_reload=True)
        return jsonify({
            'message': 'Model retrained successfully.',
            'metrics': metrics
        }), 200
    except Exception as e:
        return jsonify({'error': f'Retraining failed: {str(e)}'}), 500
