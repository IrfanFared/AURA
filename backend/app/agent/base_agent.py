import scipy.stats as stats
import pandas as pd
from typing import List
from app.schemas.agent import PredictionResult, HedgingDecision

class AuraAgent:
    def __init__(self, critical_threshold: float = 2500000.0):
        self.critical_threshold = critical_threshold

    def analyze_volatility(self, daily_incomes: List[float]) -> PredictionResult:
        if len(daily_incomes) < 2:
            raise ValueError("Not enough data to calculate volatility.")
            
        # Using Pandas to calculate 30-day moving average and standard deviation if needed
        # Assuming daily_incomes is already the last 30 days of data for simplicity
        df = pd.Series(daily_incomes)
        mu = df.mean()
        sigma = df.std()
        
        # Handle zero variance edge case
        if sigma == 0 or pd.isna(sigma):
            probability_deficit = 1.0 if mu < self.critical_threshold else 0.0
        else:
            # Calculate Probability Density Function (CDF is used for probability P(X < x))
            # P(X < x)
            probability_deficit = stats.norm.cdf(self.critical_threshold, loc=mu, scale=sigma)
        
        return PredictionResult(
            mean_income=float(mu),
            std_dev_income=float(sigma),
            probability_deficit=float(probability_deficit),
            threshold_used=self.critical_threshold
        )

    def determine_hedge(self, prediction: PredictionResult) -> HedgingDecision:
        prob = prediction.probability_deficit
        
        if prob < 0.40:
            zone = "Aman"
            hedge_pct = 0.0
            action = "Tidak aktif"
        elif prob < 0.60:
            zone = "Waspada"
            hedge_pct = 0.01
            action = "1% pendapatan harian"
        elif prob < 0.80:
            zone = "Kritis"
            hedge_pct = 0.025
            action = "2,5% pendapatan harian + alert"
        elif prob < 0.90:
            zone = "Bahaya"
            hedge_pct = 0.05
            action = "5% pendapatan harian + notifikasi darurat"
        else:
            zone = "Darurat"
            hedge_pct = 0.05
            action = "5% + Penguncian Vault"
            
        return HedgingDecision(
            probability=prob,
            zone=zone,
            hedging_percentage=hedge_pct,
            action=action
        )

    def process(self, daily_incomes: List[float]):
        prediction = self.analyze_volatility(daily_incomes)
        decision = self.determine_hedge(prediction)
        return prediction, decision
