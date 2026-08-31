from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/settings", tags=["settings"])

@router.get("", response_model=schemas.SettingsOut)
def get_settings(device_id: str = "airguard_01", db: Session = Depends(get_db)):
    settings = db.query(models.DeviceSettings).filter_by(device_id=device_id).first()
    if not settings:
        settings = models.DeviceSettings(device_id=device_id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@router.put("", response_model=schemas.SettingsOut)
def update_settings(data: schemas.SettingsInput, device_id: str = "airguard_01", db: Session = Depends(get_db)):
    settings = db.query(models.DeviceSettings).filter_by(device_id=device_id).first()
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found")

    for field, value in data.dict(exclude_unset=True).items():
        setattr(settings, field, value)

    db.commit()
    db.refresh(settings)
    return settings