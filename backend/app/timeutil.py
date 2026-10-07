from datetime import datetime, timezone


def utcnow() -> datetime:
    """Current UTC time as a naive datetime (the DB columns are naive UTC).

    Replaces the deprecated datetime.utcnow().
    """
    return datetime.now(timezone.utc).replace(tzinfo=None)