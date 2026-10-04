import re
import string

def clean_text(text: str) -> str:
    """
    Standardize and clean email subject and body text for ML training and inference.
    1. Converts to lowercase.
    2. Strips HTML tags.
    3. Normalizes URLs to 'httpurl'.
    4. Normalizes email addresses to 'emailaddr'.
    5. Normalizes currency/monetary symbols to 'moneysymb'.
    6. Removes punctuation and excess whitespace.
    """
    if not text or not isinstance(text, str):
        return ""
    
    text = text.lower()
    
    # Strip HTML tags
    text = re.sub(r'<[^>]+>', ' ', text)
    
    # Normalize URLs
    text = re.sub(r'https?://\S+|www\.\S+', ' httpurl ', text)
    
    # Normalize email addresses
    text = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', ' emailaddr ', text)
    
    # Normalize currency symbols ($ € £ ¥ ₹)
    text = re.sub(r'[\$€£¥₹]', ' moneysymb ', text)
    
    # Normalize numbers (e.g. 1000000, 500)
    text = re.sub(r'\b\d+\b', ' number ', text)
    
    # Remove punctuation
    translator = str.maketrans('', '', string.punctuation)
    text = text.translate(translator)
    
    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

def extract_spam_indicators(text: str):
    """
    Identifies common high-risk spam keywords and patterns present in the email.
    Useful for explainable AI in the frontend.
    """
    high_risk_terms = [
        'urgent', 'congratulations', 'won', 'winner', 'cash prize', 'lottery',
        'free money', 'click here', 'verify your account', 'account suspended',
        'claim now', 'risk free', 'million dollars', 'crypto', 'bitcoin',
        'inheritance', 'wire transfer', 'limited time', 'act immediately',
        'exclusive offer', 'gift card', 'password reset', 'bank alert',
        'unauthorized access', 'guaranteed', '100% free', 'moneysymb', 'httpurl'
    ]
    
    found = []
    lower = text.lower()
    for term in high_risk_terms:
        if term in lower:
            found.append(term)
    return list(set(found))
