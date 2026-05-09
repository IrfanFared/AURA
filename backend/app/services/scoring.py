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
            return {"total_score": 0, "dimensions": {}, "rating": "D (Risiko Tinggi)"}

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
        """
        Stability: How consistent is the income?
        Uses Coefficient of Variation (CV = std/mean).
        Lower CV = higher stability score.
        """
        values = df['y'].astype(float)
        if len(values) < 2:
            return 50
        mean_val = values.mean()
        if mean_val == 0:
            return 0
        cv = values.std() / mean_val
        # CV of 0 -> 100, CV of 1+ -> 0
        score = max(0, min(100, int(100 * (1 - cv))))
        return score

    def _calc_growth(self, df: pd.DataFrame) -> int:
        """
        Growth: Is income trending upward?
        Compares the second half average to first half average.
        """
        values = df['y'].astype(float).values
        if len(values) < 4:
            return 50
        mid = len(values) // 2
        first_half = np.mean(values[:mid])
        second_half = np.mean(values[mid:])
        if first_half == 0:
            return 50
        growth_ratio = (second_half - first_half) / first_half
        # -50% decline -> 0, 0% -> 60, +50% growth -> 100
        score = max(0, min(100, int(60 + growth_ratio * 80)))
        return score

    def _calc_resilience(self, df: pd.DataFrame) -> int:
        """
        Resilience: How fast does cashflow recover after a drop?
        Counts how many dips below 70% of moving average recover within 3 periods.
        """
        values = df['y'].astype(float).values
        if len(values) < 5:
            return 50
        ma = pd.Series(values).rolling(window=3, min_periods=1).mean().values
        threshold = ma * 0.7
        dips = 0
        recoveries = 0
        in_dip = False
        for i in range(len(values)):
            if values[i] < threshold[i]:
                if not in_dip:
                    dips += 1
                    in_dip = True
            else:
                if in_dip:
                    recoveries += 1
                    in_dip = False
        if dips == 0:
            return 95  # No dips = excellent resilience
        recovery_rate = recoveries / dips
        return max(0, min(100, int(recovery_rate * 100)))

    def _calc_liquidity(self, df: pd.DataFrame) -> int:
        """
        Liquidity: Current cash availability ratio.
        Uses the ratio of recent income to the overall mean as a proxy.
        """
        values = df['y'].astype(float).values
        if len(values) < 3:
            return 50
        recent = np.mean(values[-3:])
        overall = np.mean(values)
        if overall == 0:
            return 0
        ratio = recent / overall
        # ratio of 0.5 -> 40, 1.0 -> 80, 1.5 -> 100
        score = max(0, min(100, int(ratio * 80)))
        return score

    def _calc_predictability(self, df: pd.DataFrame, forecast: pd.DataFrame) -> int:
        """
        Predictability: How accurate are forecasts vs actual?
        Uses a simplified MAPE-like calculation between recent actuals and forecast.
        """
        try:
            actual = df['y'].astype(float).values
            predicted = forecast['yhat'].astype(float).values
            
            # Align lengths to the shorter one
            min_len = min(len(actual), len(predicted))
            if min_len == 0:
                return 50
            actual = actual[-min_len:]
            predicted = predicted[:min_len]
            
            # MAPE calculation
            non_zero = actual != 0
            if not np.any(non_zero):
                return 50
            mape = np.mean(np.abs((actual[non_zero] - predicted[non_zero]) / actual[non_zero]))
            # MAPE of 0 -> 100, MAPE of 1 -> 0
            score = max(0, min(100, int(100 * (1 - mape))))
            return score
        except Exception:
            return 75  # Fallback

    def _get_rating(self, score: float) -> str:
        if score >= 85: return "A (Sangat Layak)"
        if score >= 70: return "B (Layak dengan Syarat)"
        if score >= 55: return "C (Risiko Sedang)"
        return "D (Risiko Tinggi)"
