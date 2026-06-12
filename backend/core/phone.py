import re

# Private 1:1 chats have a plain phone number (8-14 digits). WhatsApp group JIDs
# are 18-digit IDs (120363...) or legacy number-timestamp; broadcasts contain '@'.
# Must stay in sync with the SQL predicate customer_phone ~ '^[0-9]{8,14}$'.
_PRIVATE_PHONE = re.compile(r"^\d{8,14}$")


def is_private_phone(phone: str | None) -> bool:
    return bool(_PRIVATE_PHONE.fullmatch(phone or ""))


def normalize_phone(phone: str | None) -> str:
    """Canonical tenant key for business_phone: digits only, Brazilian ninth
    digit removed — matches the WhatsApp JID format n8n/Evolution sends."""
    digits = re.sub(r"\D", "", phone or "")
    # BR mobile with ninth digit: 55 + DDD(2) + 9XXXXXXXX (13 digits) -> drop the 9
    if len(digits) == 13 and digits.startswith("55") and digits[4] == "9":
        digits = digits[:4] + digits[5:]
    return digits
