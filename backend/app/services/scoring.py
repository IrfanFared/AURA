import pandas as pd
import numpy as np

class AuraScoreEngine:
    def __init__(self):
        pass

    def calculate_score(self, transactions_df: pd.DataFrame, forecast_df: pd.DataFrame) -> dict:
        """
        Calculate the AURA Credit Score based on 5 dimensions:
        - Stability (25%)
        - Growth (20%)
        - Resilience (25%)
        - Liquidity (20%)
        - Predictability (10%)
        """
        if transactions_df.empty:
            return {"total_score": 0, "dimensions": {}}

        # Simplified dummy implementations for the logic
        stability_score = self._calc_stability(transactions_df)
        growth_score = self._calc_growth(transactions_df)
        resilience_score = self._calc_resilience(transactions_df)
        liquidity_score = self._calc_liquidity(transactions_df)
        predictability_score = self._calc_predictability(transactions_df, forecast_df)

        total = (
            (stability_score * 0.25) +
            (growth_score * 0.20) +
            (resilience_score * 0.25) +
            (liquidity_score * 0.20) +
            (predictability_score * 0.10)
        )

        return {
            "total_score": round(total, 2),
            "rating": self._get_rating(total),
            "dimensions": {
                "stability": stability_score,
                "growth": growth_score,
                "resilience": resilience_score,
                "liquidity": liquidity_score,
                "predictability": predictability_score
            }
        }

    def _calc_stability(self, df: pd.DataFrame) -> int:
        # Based on variance/standard deviation
        return 85

    def _calc_growth(self, df: pd.DataFrame) -> int:
        # Based on Month-over-Month growth
        return 78

    def _calc_resilience(self, df: pd.DataFrame) -> int:
        # Based on recovery time after cash drops
        return 90

    def _calc_liquidity(self, df: pd.DataFrame) -> int:
        # Based on cash vs obligations
        return 82

    def _calc_predictability(self, df: pd.DataFrame, forecast: pd.DataFrame) -> int:
        # Based on MAPE (Mean Absolute Percentage Error)
        return 88

    def _get_rating(self, score: float) -> str:
        if score >= 85: return "A (Sangat Layak)"
        if score >= 70: return "B (Layak dengan Syarat)"
        if score >= 55: return "C (Risiko Sedang)"
        return "D (Risiko Tinggi)"
