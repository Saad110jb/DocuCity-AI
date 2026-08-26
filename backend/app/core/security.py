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
    Sanitizes CNIC numbers (35202-XXXXXXX-X) and phone numbers for privacy compliance.
    """
    if not text:
        return text

    # CNIC pattern: XXXXX-XXXXXXX-X
    cnic_pattern = r'\b\d{5}-\d{7}-\d{1}\b'
    text = re.sub(cnic_pattern, '[CNIC REDACTED]', text)

    # Pakistani Phone Numbers: 03XX-XXXXXXX or +923XXXXXXXXX
    phone_pattern = r'(\+92|0)?3\d{2}[-\s]?\d{7}\b'
    text = re.sub(phone_pattern, '[PHONE REDACTED]', text)

    return text
