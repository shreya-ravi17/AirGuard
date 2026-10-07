from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/settings", tags=["settings"])


def _get_or_create(db: Session, device_id: str) -> models.DeviceSettings:
    settings = db.query(models.DeviceSettings).filter_by(device_id=device_id).first()
    if not settings:
        settings = models.DeviceSettings(device_id=device_id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.get("", response_model=schemas.SettingsOut)
def get_settings(device_id: str = "airguard_01", db: Session = Depends(get_db)):
    return _get_or_create(db, device_id)


@router.put("", response_model=schemas.SettingsOut)
def update_settings(
    data: schemas.SettingsInput,
    device_id: str = "airguard_01",
    db: Session = Depends(get_db),
):
    # Create defaults if the frontend saves before ever loading settings
    settings = _get_or_create(db, device_id)

    for field, value in data.model_dump(exclude_unset=True).items():
        if field == "notifications_enabled" and value is not None:
            value = 1 if value else 0
        setattr(settings, field, value)

    db.commit()
    db.refresh(settings)
    return settings