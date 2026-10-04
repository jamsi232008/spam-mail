# SMART SPAM SHIELD 🛡️
### AI-Powered Email Spam Detection and Automatic Filtering
*College Machine Learning Capstone / Demonstration Project*

---

## 📌 Executive Summary
**SMART SPAM SHIELD** is a full-stack Machine Learning web application designed to safeguard email communications through automated classification and instant threat routing. 

Unlike traditional email clients that require manual junk tagging or rely on third-party commercial APIs, Smart Spam Shield deploys an on-premise, trained **Natural Language Processing (NLP)** pipeline utilizing **TF-IDF (Term Frequency-Inverse Document Frequency)** and a **Multinomial Naive Bayes** classifier.

### 🎯 Key Objective & The Automatic BIN Feature
When an email arrives or is dispatched in the application:
1. **Content Extraction:** The backend combines the email subject and message body.
2. **Text Preprocessing:** Normalizes URLs, email addresses, numbers, currency symbols, and removes noise.
3. **ML Inference:** The model computes the real probability of the message being **SPAM** or **LEGITIMATE**.
4. **Autonomous Routing (The Most Important Feature):**
   - **If SPAM ($\ge 50\%$ risk):** The email **never enters the Inbox**. It is automatically tagged and routed directly into the **SPAM BIN** (`folder = 'BIN'`).
   - **If LEGITIMATE ($< 50\%$ risk):** The email is approved and delivered directly to the user's **INBOX** (`folder = 'INBOX'`).
5. **Audit Logging:** Every prediction, confidence score, and timestamp is stored in the database for compliance and review.
6. **User Control:** Users can inspect quarantined emails in the Bin, view explainable trigger keywords, restore false alarms back to the Inbox, or permanently delete threats.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Vite, JavaScript (ES6+), React Router DOM, Axios, Lucide Icons, Custom Cybersecurity Design System |
| **Backend API** | Python 3, Flask, Flask-CORS, SQLAlchemy, PyJWT, Werkzeug (Password Hashing) |
| **Database** | SQLite (Embedded, zero configuration required) |
| **Machine Learning** | scikit-learn, pandas, numpy, TF-IDF Vectorizer, Multinomial Naive Bayes, joblib |
| **Security** | JWT Authentication, PBKDF2 Password Hashing, Input Sanitization |

> **Note on Simulated Architecture:**  
> This application operates as an **application-level simulated email gateway** designed for live academic evaluation. It functions completely without Gmail API credentials, Outlook licenses, or paid external APIs. In a production enterprise deployment, the ingestion pipeline can connect directly to OAuth2-authorized Gmail APIs (`users.messages.watch`) or Microsoft 365 Graph APIs (`/me/mailFolders`).

---

## 🧠 Machine Learning Architecture & Metrics

### 1. Preprocessing Pipeline (`backend/ml/preprocess.py`)
- **Lowercasing:** Standardizes capitalization.
- **HTML Stripping:** Eliminates malicious markup and tags.
- **Entity Normalization:**
  - `https://...` or `www...` $\rightarrow$ `httpurl`
  - `user@domain.com` $\rightarrow$ `emailaddr`
  - `$`, `€`, `£`, `₹` $\rightarrow$ `moneysymb`
  - Numbers $\rightarrow$ `number`
- **Punctuation & Whitespace Stripping:** Eliminates redundant characters.

### 2. Feature Extraction & Modeling (`backend/ml/train_model.py`)
- **Vectorizer:** `TfidfVectorizer(ngram_range=(1, 2), max_features=3500, sublinear_tf=True, stop_words='english')`
- **Classifier:** `MultinomialNB(alpha=0.15)` (Laplace-smoothed probabilistic classifier)

### 3. Actual Evaluated Metrics (Stratified Test Split)
These metrics are computed on the actual test split and recorded in SQLite table `model_info`:
- **Model Name:** Multinomial Naive Bayes
- **Dataset Size:** 134 balanced samples (67 spam, 67 legitimate)
- **Vocabulary Size:** 2,194 features
- **Accuracy:** `96.30%`
- **Precision:** `100.00%` (Zero false alarms on legitimate emails)
- **Recall:** `92.31%`
- **F1 Score:** `96.00%`
- **Confusion Matrix:**
  $$\begin{bmatrix} 14 & 0 \\ 1 & 12 \end{bmatrix} \quad (\text{TN}=14, \, \text{FP}=0, \, \text{FN}=1, \, \text{TP}=12)$$

---

## 📂 Project Directory Structure

```
smart spam email/
├── backend/
│   ├── app.py                      # Flask factory, route registration, auto-seeding
│   ├── config.py                   # Configuration and directory paths
│   ├── database.py                 # SQLAlchemy database instance
│   ├── models.py                   # User, Email, DetectionLog, ModelInfo schemas
│   ├── requirements.txt            # Python dependencies
│   ├── routes/
│   │   ├── auth.py                 # Register, Login, Me (JWT)
│   │   ├── emails.py               # Email CRUD, auto ML routing, restore, delete
│   │   ├── prediction.py           # Standalone /predict, /detections, /model/info
│   │   └── dashboard.py            # SQLite aggregated stats, demo batch loader
│   ├── services/
│   │   ├── spam_detector.py        # ML prediction wrapper and audit logger
│   │   └── email_service.py        # Email processing and spam-to-bin logic
│   ├── ml/
│   │   ├── preprocess.py           # Text cleaning and token normalization
│   │   ├── train_model.py          # Training script & metric calculation
│   │   └── predict.py              # In-memory ML inference module
│   ├── model/
│   │   ├── spam_model.pkl          # Trained Naive Bayes model
│   │   └── tfidf_vectorizer.pkl    # Fitted TF-IDF vectorizer
│   └── data/
│       ├── dataset.csv             # Labeled training dataset (100+ samples)
│       └── demo_emails.csv         # 34 pre-configured demo emails
├── frontend/
│   ├── index.html                  # HTML entry point with cybersecurity branding
│   ├── package.json                # React, Vite, Axios, Lucide dependencies
│   ├── vite.config.js              # Dev server and proxy configuration
│   └── src/
│       ├── main.jsx                # React DOM entry wrapped in BrowserRouter
│       ├── App.jsx                 # Route definitions and responsive layout
│       ├── index.css               # Modern glassmorphism cybersecurity theme
│       ├── services/
│       │   └── api.js              # Axios client with JWT interceptor
│       ├── components/
│       │   ├── Sidebar.jsx         # Navigation sidebar with real-time badges
│       │   ├── Navbar.jsx          # Top bar with demo loader and compose button
│       │   ├── EmailCard.jsx       # Email card with spam badges & restore
│       │   ├── StatCard.jsx        # Glassmorphic statistic cards
│       │   └── ProtectedRoute.jsx  # Authentication route guard
│       └── pages/
│           ├── Login.jsx           # Sign in with One-Click Demo Credentials
│           ├── Register.jsx        # User registration with password hashing
│           ├── Dashboard.jsx       # Analytics, real metrics, confusion matrix
│           ├── Inbox.jsx           # Clean legitimate inbox view
│           ├── EmailDetails.jsx    # Email inspector with ML confidence gauge
│           ├── ComposeEmail.jsx    # Send email with live spam-to-bin alert
│           ├── Bin.jsx             # Quarantined spam list with restore actions
│           ├── SpamDetection.jsx   # Interactive AI sandbox / live tester
│           ├── DetectionHistory.jsx# Historical audit log table with filters
│           └── Settings.jsx        # Pipeline configuration & threshold slider
├── setup.bat                       # Automated 1-click Windows setup
├── start_backend.bat               # 1-click backend launcher (Flask)
├── start_frontend.bat              # 1-click frontend launcher (Vite)
└── README.md                       # Comprehensive project documentation
```

---

## ⚡ Quick Start (Windows)

### Option A: Automated Batch Scripts (Recommended)

1. **First-time setup:**
   Double-click `setup.bat` (or run in terminal):
   ```cmd
   setup.bat
   ```
   *Installs Python packages, trains the ML model, persists real metrics, and installs npm modules.*

2. **Start Backend Server:**
   Double-click `start_backend.bat`:
   ```cmd
   start_backend.bat
   ```
   *Runs Flask on `http://127.0.0.1:5000`.*

3. **Start Frontend Server:**
   Double-click `start_frontend.bat`:
   ```cmd
   start_frontend.bat
   ```
   *Runs Vite React development server on `http://localhost:5173`.*

4. **Open in Browser:**
   Navigate to: **[http://localhost:5173](http://localhost:5173)**

---

### Option B: Manual Terminal Execution

#### 1. Setup Backend
```powershell
# Open terminal in project root
python -m pip install -r backend/requirements.txt
python backend/ml/train_model.py
python backend/app.py
```

#### 2. Setup Frontend
```powershell
# In a separate terminal
cd frontend
npm install
npm run dev
```

---

## 🔑 Demo Login Credentials
The application includes a pre-seeded evaluator account:

- **Email:** `demo@spamshield.ai`
- **Password:** `password123`
- *Or simply click the **"Log in as Demo User"** button on the Login page.*

---

## 🔌 API Endpoint Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT token |
| `GET` | `/api/auth/me` | Fetch authenticated user profile |
| `GET` | `/api/emails?folder=INBOX` | Fetch legitimate inbox emails |
| `GET` | `/api/emails?folder=BIN` | Fetch quarantined spam emails |
| `GET` | `/api/emails/<id>` | Fetch email details and detection log |
| `POST` | `/api/emails` | Create email, run ML prediction, and auto-route to INBOX or BIN |
| `PUT` | `/api/emails/<id>/read` | Update read/unread status |
| `PUT` | `/api/emails/<id>/restore` | Restore email from BIN back to INBOX |
| `DELETE` | `/api/emails/<id>` | Permanently delete email from database |
| `POST` | `/api/predict` | Direct ML inference test on arbitrary subject & body |
| `GET` | `/api/dashboard/stats` | Aggregated dashboard statistics and confusion matrix |
| `GET` | `/api/detections` | Historical ML audit log (`DetectionLog`) |
| `POST` | `/api/demo/load` | Batch run demo emails through model and populate database |
| `GET` | `/api/model/info` | Fetch current model architecture and test metrics |
| `POST` | `/api/model/retrain` | Retrain pipeline on dataset and update metrics |

---

## 🎓 College Panel Demonstration Script

Follow this step-by-step sequence to demonstrate the application to examiners and panel members:

1. **Login Screen:**
   - Open `http://localhost:5173/login`.
   - Highlight the cybersecurity visual theme.
   - Click the **"Log in as Demo User (Alex Rivera)"** button.

2. **Security Dashboard (`/dashboard`):**
   - Point out the 4 live statistic cards: **Total Emails**, **Spam Intercepted**, **Legitimate Clean**, and **Emails in Bin**.
   - Show the **ML Model Performance Card**: Point to the **real calculated metrics** (Accuracy: `96.30%`, Precision: `100.00%`, F1: `96.00%`).
   - Explain the **Confusion Matrix**: Show True Legitimate (14), False Alarms (0), and Caught Spam (12).

3. **Inspect the Clean Inbox (`/inbox`):**
   - Navigate to **Inbox**.
   - Show that **only legitimate emails** (course notifications, project meetings, internships) appear here.
   - Explain that no spam was allowed to reach this view.

4. **Demonstrate Autonomous Spam-to-BIN Routing (`/compose`):**
   - Navigate to **Compose**.
   - Click the preset button **"Spam: Cash Prize"** (or type a custom scam email).
     - *Subject:* `Congratulations! You won a cash prize`
     - *Body:* `You have been selected for a special reward. Click the link below immediately to claim your prize.`
   - Click **SEND EMAIL**.
   - Watch the backend intercept the email:
     - The alert displays: **"🚨 SPAM DETECTED (Confidence: 99.57%)! This email was automatically moved to Bin."**
     - Trigger keywords (`cash prize`, `congratulations`, `won`) are highlighted.

5. **Verify the Spam Bin (`/bin`):**
   - Click **"View Quarantined Email in Bin"** (or click **Spam Bin** on the sidebar).
   - Show the email quarantined inside the Bin with its **SPAM** badge and confidence score.
   - Click the **Restore** button on the email card.
   - Show the alert: *"Email moved back to Inbox."*
   - Return to **Inbox** to confirm the restored email is now present.

6. **Live AI Sandbox Testing (`/spam-detection`):**
   - Navigate to **AI Spam Sandbox**.
   - Click the preset **"Spam: Bank Phishing Alert"** or paste any custom phishing text.
   - Click **CHECK EMAIL**.
   - Demonstrate the real-time probability gauge and model inference.

7. **Audit & Compliance Log (`/detection-history`):**
   - Navigate to **Detection History**.
   - Show that every email dispatched or tested is immutably logged with its confidence score, timestamp, and verdict.
   - Demonstrate filtering between **All**, **Spam Only**, and **Legitimate Only**.

8. **Wrap-up at Dashboard (`/dashboard`):**
   - Return to the Dashboard to show that all statistics and traffic ratios have automatically recalculated from SQLite.

---

## 🛡️ License & Academic Integrity
This project is developed for educational and academic presentation purposes as a college Machine Learning demonstration. Free for academic use and adaptation.
