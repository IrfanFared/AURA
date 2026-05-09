import pytest
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from app.agent.base_agent import AuraAgent
from app.services.scoring import AuraScoreEngine
from app.services.vault import SmartVaultExecutor
from app.services.audit import AuditLogger

class TestProposalValidation:
    
    @pytest.fixture
    def agent(self):
        return AuraAgent(critical_threshold=2500000.0)

    @pytest.fixture
    def scorer(self):
        return AuraScoreEngine()

    @pytest.fixture
    def vault(self):
        return SmartVaultExecutor()

    # 1. Validasi Tabel 4.1: Mekanisme Aktivasi Smart Vault
    @pytest.mark.parametrize("mean, std_dev, expected_zone, expected_hedge", [
        (5000000, 100000, "Aman", 0.0),       # Prob < 40%
        (2600000, 400000, "Waspada", 0.01),   # Prob 40-60%
        (2300000, 300000, "Kritis", 0.025),   # Prob 60-80%
        (2000000, 400000, "Bahaya", 0.05),    # Prob 80-90%
        (1000000, 100000, "Darurat", 0.05),   # Prob > 90%
    ])
    def test_table_4_1_vault_activation(self, agent, mean, std_dev, expected_zone, expected_hedge):
        # Generate dummy data to hit the target mean/std
        # Note: norm.cdf(x, mu, sigma)
        # Z = (x - mu) / sigma
        # We check P(X < 2.5M)
        
        from scipy import stats
        prob = stats.norm.cdf(2500000.0, loc=mean, scale=std_dev)
        
        # Mock prediction result
        from app.schemas.agent import PredictionResult
        pred = PredictionResult(
            mean_income=float(mean),
            std_dev_income=float(std_dev),
            probability_deficit=float(prob),
            threshold_used=2500000.0
        )
        
        decision = agent.determine_hedge(pred)
        assert decision.zone == expected_zone
        assert decision.hedging_percentage == expected_hedge

    # 2. Validasi Tabel 4.2: Dimensi AURA Score
    def test_table_4_2_score_dimensions(self, scorer):
        df_txn = pd.DataFrame({'ds': [datetime.now()], 'y': [100000]})
        df_forecast = pd.DataFrame({'ds': [datetime.now()], 'yhat': [100000]})
        
        result = scorer.calculate_score(df_txn, df_forecast)
        
        dims = result["dimensions"]
        assert "stability" in dims
        assert "growth" in dims
        assert "resilience" in dims
        assert "liquidity" in dims
        assert "predictability" in dims
        
        # Cek bobot (Stability 25%, Growth 20%, Resilience 25%, Liquidity 20%, Predictability 10%)
        # Kita verifikasi total score dihitung benar dari dimensi
        total_manual = (
            dims["stability"] * 0.25 +
            dims["growth"] * 0.20 +
            dims["resilience"] * 0.25 +
            dims["liquidity"] * 0.20 +
            dims["predictability"] * 0.10
        )
        assert result["total_score"] == round(total_manual, 2)

    # 3. Validasi Fungsi Penarikan & Audit Log (UU PDP Compliance)
    def test_vault_withdrawal_and_audit(self, vault):
        user_id = "test_user_99"
        vault.active_vaults[user_id] = 1000000.0 # Seed 1M
        
        # Test withdrawal
        result = vault.withdraw_funds(user_id, 400000.0)
        assert result["status"] == "success"
        assert result["vault_balance"] == 600000.0
        
        # Test audit log recording
        AuditLogger.log_access(user_id, "vault", "TEST_WITHDRAWAL", details="Testing logic")
        logs = AuditLogger.get_recent_logs(user_id)
        assert len(logs) > 0
        assert logs[0]["action"] == "TEST_WITHDRAWAL"

    # 4. Validasi Time-Series Forecast (Ensemble Prophet)
    def test_forecast_ensemble_logic(self, agent):
        # Generate 60 days of synthetic data
        dates = pd.date_range(start='2024-01-01', periods=60)
        data = pd.DataFrame({
            'ds': dates,
            'y': np.random.normal(3000000, 500000, 60)
        })
        
        forecast = agent.generate_forecast(data, periods=14)
        assert len(forecast) == 14
        assert 'yhat' in forecast.columns
        assert 'yhat_lower' in forecast.columns
        assert 'yhat_upper' in forecast.columns
