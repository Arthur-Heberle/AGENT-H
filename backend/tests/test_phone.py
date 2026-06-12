from core.phone import is_private_phone, normalize_phone


def test_strips_plus_prefix():
    assert normalize_phone("+5549988788878") == "554988788878"


def test_removes_brazilian_ninth_digit():
    # 55 + DDD 49 + 9 9194-2504 (13 digits) -> ninth digit dropped
    assert normalize_phone("5549991942504") == "554991942504"


def test_already_canonical_unchanged():
    assert normalize_phone("554991942504") == "554991942504"


def test_strips_formatting_characters():
    assert normalize_phone("+55 (49) 99194-2504") == "554991942504"


def test_non_brazilian_number_only_digits():
    # US number: just strip non-digits, never drop digits
    assert normalize_phone("+1 415 555 2671") == "14155552671"


def test_brazilian_13_digits_without_9_in_fifth_position_unchanged():
    # 13 digits starting 55 but fifth digit not 9 -> leave digits as-is
    assert normalize_phone("5549881942504") == "5549881942504"


def test_empty_and_none_safe():
    assert normalize_phone("") == ""
    assert normalize_phone(None) == ""


def test_private_phone_brazilian_numbers():
    assert is_private_phone("554991942504") is True
    assert is_private_phone("5549991942504") is True


def test_private_phone_international_number():
    assert is_private_phone("14155552671") is True


def test_group_id_is_not_private():
    # modern WhatsApp group JIDs are 18-digit IDs
    assert is_private_phone("120363038135166547") is False


def test_legacy_group_id_is_not_private():
    # legacy group JIDs are number-timestamp
    assert is_private_phone("554195465161-1593219120") is False


def test_broadcast_is_not_private():
    assert is_private_phone("status@broadcast") is False


def test_empty_is_not_private():
    assert is_private_phone("") is False
    assert is_private_phone(None) is False
