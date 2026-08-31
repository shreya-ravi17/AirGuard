from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base
from . import models
from .routes import sensor, dashboard, settings

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AirGuard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # for development; restrict later if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sensor.router)
app.include_router(dashboard.router)
app.include_router(settings.router)

@app.get("/")
def root():
    return {"message": "AirGuard API running"}