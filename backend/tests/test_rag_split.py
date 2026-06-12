from models.process import ChatMessage
from services.rag import _split_messages


def _msg(role: str, content: str, status: str | None = None) -> ChatMessage:
    return ChatMessage(role=role, content=content, processing_status=status)


def test_answers_only_in_progress():
    msgs = [
        _msg("user", "oi bom dia", "done"),
        _msg("assistant", "Olá! Como posso ajudar?", "done"),
        _msg("user", "gostaria de um sofa novo", "in_progress"),
    ]
    context, to_answer = _split_messages(msgs)
    assert [m.content for m in to_answer] == ["gostaria de um sofa novo"]
    assert [m.content for m in context] == ["oi bom dia", "Olá! Como posso ajudar?"]


def test_pending_is_excluded_entirely():
    msgs = [
        _msg("user", "quero um sofa", "in_progress"),
        _msg("user", "alias, tem mesas?", "pending"),
    ]
    context, to_answer = _split_messages(msgs)
    assert [m.content for m in to_answer] == ["quero um sofa"]
    assert context == []


def test_assistant_without_status_is_context():
    msgs = [
        _msg("assistant", "Temos o Sofa Rubi."),
        _msg("user", "qual o preço?", "in_progress"),
    ]
    context, to_answer = _split_messages(msgs)
    assert [m.content for m in context] == ["Temos o Sofa Rubi."]
    assert [m.content for m in to_answer] == ["qual o preço?"]


def test_no_in_progress_returns_empty_to_answer():
    msgs = [
        _msg("user", "oi", "done"),
        _msg("user", "tudo bem?", "pending"),
    ]
    context, to_answer = _split_messages(msgs)
    assert to_answer == []
    assert [m.content for m in context] == ["oi"]


def test_legacy_payload_without_statuses_returns_none():
    # no message carries processing_status -> caller keeps today's behavior
    msgs = [
        _msg("user", "oi bom dia"),
        _msg("user", "gostaria de um sofa novo"),
    ]
    assert _split_messages(msgs) is None


def test_multiple_in_progress_kept_in_order():
    msgs = [
        _msg("user", "oi bom dia", "in_progress"),
        _msg("user", "tudo bem?", "in_progress"),
        _msg("user", "gostaria de um sofa novo", "in_progress"),
    ]
    context, to_answer = _split_messages(msgs)
    assert [m.content for m in to_answer] == [
        "oi bom dia",
        "tudo bem?",
        "gostaria de um sofa novo",
    ]
    assert context == []
