from typing import Optional

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import settings

client: Optional[AsyncIOMotorClient] = None


def connect_to_mongo() -> AsyncIOMotorDatabase:
    global client
    if client is None:
        client = AsyncIOMotorClient(
            settings.mongo_uri,
            serverSelectionTimeoutMS=settings.mongo_server_selection_timeout_ms,
            connectTimeoutMS=settings.mongo_connect_timeout_ms,
            socketTimeoutMS=settings.mongo_socket_timeout_ms,
        )
    return client[settings.mongo_db]


def close_mongo() -> None:
    global client
    if client is not None:
        client.close()
        client = None


def get_database() -> AsyncIOMotorDatabase:
    if client is None:
        return connect_to_mongo()
    return client[settings.mongo_db]
