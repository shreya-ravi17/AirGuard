import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from . import models
from .routes import sensor, dashboard, settings, hardware

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AirGuard API")

# Vite dev server runs on 5173 (localhost or 127.0.0.1)
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
]
# Extra origins (e.g. a deployed frontend), comma separated in backend/.env
ALLOWED_ORIGINS += [
    o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sensor.router)
app.include_router(dashboard.router)
app.include_router(settings.router)
app.include_router(hardware.router)


@app.get("/")
def root():
    return {"message": "AirGuard API running"}