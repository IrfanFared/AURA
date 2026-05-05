from enum import Enum
from fastapi import HTTPException
from app.models.user import UserTier

class TieringManager:
    """
    Manages and enforces feature limits based on the user's subscription tier.
    Ref: BAB IV Model Bisnis (Laporan Final)
    """
    
    TIER_LIMITS = {
        UserTier.FREE.value: {
            "forecast_days": 0, # No forecast for free
            "history_days": 90,
            "max_accounts": 1,
            "features": ["basic_dashboard"]
        },
        UserTier.STARTER.value: {
            "forecast_days": 14,
            "history_days": 180,
            "max_accounts": 2,
            "features": ["basic_dashboard", "standard_alerts"]
        },
        UserTier.PRO.value: {
            "forecast_days": 90,
            "history_days": 365,
            "max_accounts": 5,
            "features": ["basic_dashboard", "standard_alerts", "smart_vault", "aura_score"]
        },
        UserTier.BUSINESS.value: {
            "forecast_days": 90,
            "history_days": 9999, # Unlimited
            "max_accounts": 99,
            "features": ["basic_dashboard", "standard_alerts", "smart_vault", "aura_score", "multi_outlet", "api_access"]
        }
    }

    @classmethod
    def check_feature_access(cls, user_tier: str, feature: str):
        limits = cls.TIER_LIMITS.get(user_tier)
        if not limits:
            raise HTTPException(status_code=400, detail="Invalid user tier")
            
        if feature not in limits["features"]:
            raise HTTPException(
                status_code=403, 
                detail=f"Feature '{feature}' is not available in {user_tier} tier. Please upgrade."
            )
        return True

    @classmethod
    def get_forecast_horizon(cls, user_tier: str) -> int:
        return cls.TIER_LIMITS.get(user_tier, {}).get("forecast_days", 0)
