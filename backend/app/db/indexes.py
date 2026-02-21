from datetime import datetime, timezone

from pymongo import ASCENDING


async def ensure_indexes(db) -> None:
    cache = db.interaction_cache
    await cache.create_index([("pairKey", ASCENDING)], unique=True, name="pairKey_unique")
    await cache.create_index([("expiresAt", ASCENDING)], expireAfterSeconds=0, name="expires_ttl")

    await cache.update_one(
        {"pairKey": "__bootstrap__"},
        {
            "$setOnInsert": {
                "result": {},
                "createdAt": datetime.now(tz=timezone.utc),
                "expiresAt": datetime.now(tz=timezone.utc),
            }
        },
        upsert=True,
    )
