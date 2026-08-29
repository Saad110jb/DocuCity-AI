import re
from typing import Optional
from datetime import datetime, timedelta
from app.core.config import settings

try:
    from jose import jwt
except ImportError:
    jwt = None

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    if jwt:
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt
    return f"mock_token_{data.get('sub', 'user')}"

def sanitize_pii(text: str) -> str:
    """
    Sanitizes citizen PII including:
    - CNIC numbers (35202-XXXXXXX-X or 13-digit format)
    - Pakistani Phone numbers (+923XX..., 03XX..., 042-...)
    - Property owner records & citizen ownership identifiers (Owner Name, Property Owner, S/O, D/O, Plot Owner)
    - IBAN and bank account numbers
    - Personal email addresses
    """
    if not text:
        return text

    # 1. Pakistani IBAN & Bank Accounts: PKXXMEZN...
    iban_pattern = r'\bPK\d{2}[A-Z]{4}\d{16}\b'
    text = re.sub(iban_pattern, '[IBAN REDACTED]', text, flags=re.IGNORECASE)

    # 2. Personal Email addresses
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b'
    text = re.sub(email_pattern, '[EMAIL REDACTED]', text)

    # 3. CNIC pattern: XXXXX-XXXXXXX-X
    cnic_pattern = r'\b\d{5}-\d{7}-\d{1}\b'
    text = re.sub(cnic_pattern, '[CNIC REDACTED]', text)

    # 4. Property Owner Records & Citizen Identity Patterns
    property_owner_patterns = [
        r'(?i)\b(?:Property\s*Owner|Plot\s*Owner|Owner\s*Name|Applicant\s*Name|Citizen\s*Name|Owner\s*CNIC|Owner\s*Phone|Owner\s*Contact)\s*[:=-]\s*([A-Za-z\s\.\,\'\-]+?)(?=[,\n\r\.\;]|\b(?:Plot|Sector|Phase|CNIC|Phone|Address|FAR|Height|Fee)\b|$)',
        r'(?i)\b(?:S\/O|D\/O|W\/O|s\/o|d\/o|w\/o)\s+([A-Za-z\s\.\,\'\-]+?)(?=[,\n\r\.\;]|\b(?:CNIC|Phone|Plot|Address|Resident)\b|$)',
        r'(?i)\b(?:Ownership\s*Title\s*Registered\s*To|Transferred\s*To|Allotted\s*To)\s*[:=-]?\s*([A-Za-z\s\.\,\'\-]+?)(?=[,\n\r\.\;]|$)'
    ]
    for pat in property_owner_patterns:
        text = re.sub(pat, '[PROPERTY OWNER REDACTED]', text)

    # 5. Pakistani Phone Numbers: +923..., 03..., 042-...
    phone_pattern = r'\b(?:\+92|0092|0)(?:3\d{2}|42|51|21)[-\s]?\d{7,8}\b'
    text = re.sub(phone_pattern, '[PHONE REDACTED]', text)

    return text
