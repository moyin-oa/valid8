import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.routes import health, interactions, pdf, pipeline, tts
from app.core.config import settings
from app.core.logging import configure_logging
from app.db.indexes import ensure_indexes
from app.db.mongo import close_mongo, connect_to_mongo

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    configure_logging()
    db = connect_to_mongo()
    try:
        await ensure_indexes(db)
        logger.info("Mongo indexes initialized")
    except Exception as exc:
        logger.warning("Mongo index initialization failed: %s", exc)
    yield
    close_mongo()


app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.include_router(health.router, prefix=settings.api_prefix)
app.include_router(interactions.router, prefix=settings.api_prefix)
app.include_router(pipeline.router, prefix=settings.api_prefix)
app.include_router(pdf.router, prefix=settings.api_prefix)
app.include_router(tts.router, prefix=settings.api_prefix)
