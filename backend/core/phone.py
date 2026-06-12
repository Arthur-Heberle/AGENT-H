import re


def normalize_phone(phone: str | None) -> str:
    """Canonical tenant key for business_phone: digits only, Brazilian ninth
    digit removed — matches the WhatsApp JID format n8n/Evolution sends."""
    digits = re.sub(r"\D", "", phone or "")
    # BR mobile with ninth digit: 55 + DDD(2) + 9XXXXXXXX (13 digits) -> drop the 9
    if len(digits) == 13 and digits.startswith("55") and digits[4] == "9":
        digits = digits[:4] + digits[5:]
    return digits
