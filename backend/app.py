import os
import sys
from pathlib import Path
from flask import Flask, jsonify
from flask_cors import CORS

# Add backend directory to sys.path
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from config import Config
from database import db, init_db
from models import User, Email, ModelInfo
from routes.auth import auth_bp
from routes.emails import emails_bp
from routes.prediction import prediction_bp
from routes.dashboard import dashboard_bp
from ml.predict import load_model_and_vectorizer
from services.email_service import load_demo_emails_into_system

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for frontend Vite dev server and production builds
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # Initialize Database
    init_db(app)

    # Register Route Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(emails_bp)
    app.register_blueprint(prediction_bp)
    app.register_blueprint(dashboard_bp)

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'service': 'Smart Spam Shield Backend',
            'version': '1.0.0',
            'ml_model': 'Multinomial Naive Bayes'
        }), 200

    # Initialize model and initial seed data
    with app.app_context():
        # Ensure model is trained and loaded
        try:
            load_model_and_vectorizer()
        except Exception as e:
            print(f"[!] Warning during model load: {e}")

        # Seed default demo user if none exists
        try:
            demo_user = User.query.filter_by(email='demo@spamshield.ai').first()
            if not demo_user:
                demo_user = User(name="Alex Rivera", email="demo@spamshield.ai")
                demo_user.set_password("password123")
                db.session.add(demo_user)
                db.session.commit()
                print("[+] Demo user created: demo@spamshield.ai (password: password123)")

            # Seed demo emails if database is empty so panel can view immediate data
            if Email.query.count() == 0:
                print("[*] Initializing database with demo emails through ML classifier...")
                load_demo_emails_into_system(receiver_email="demo@spamshield.ai", user_id=demo_user.id)
                print(f"[+] Loaded {Email.query.count()} emails into SQLite database.")
        except Exception as e:
            print(f"[!] Warning during database seed: {e}")

    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"==================================================")
    print(f"  SMART SPAM SHIELD - AI EMAIL SECURITY BACKEND   ")
    print(f"  Running on: http://127.0.0.1:{port}              ")
    print(f"==================================================")
    app.run(host='0.0.0.0', port=port, debug=False)
