import pytest
from app.agent.base_agent import AuraAgent

def test_aura_agent_aman_zone():
    # Stable high income (5M/day) with low volatility
    # Critical threshold 2.5M
    agent = AuraAgent(critical_threshold=2500000.0)
    incomes = [5000000.0] * 30 # Perfect stability
    
    # Add a tiny bit of noise because std_dev=0 causes issues in norm.cdf
    incomes[0] = 5000001.0
    
    prediction, decision = agent.process(incomes)
    
    assert decision.zone == "Aman"
    assert decision.hedging_percentage == 0.0
    assert prediction.probability_deficit < 0.01

def test_aura_agent_kritis_zone():
    # Mean is 3M, Std Dev is 1M. Threshold is 2.5M.
    # Z-score = (2.5 - 3) / 1 = -0.5
    # P(Z < -0.5) is approx 30.85% -> Still Aman? 
    # Let's adjust to hit Kritis (60%-80%)
    # Threshold 2.5M, Mean 2.2M, Std Dev 0.5M
    # Z = (2.5 - 2.2) / 0.5 = 0.6
    # P(Z < 0.6) is approx 72.57% -> Kritis.
    
    agent = AuraAgent(critical_threshold=2500000.0)
    # We want Mean=2,200,000 and StdDev=500,000
    incomes = [1700000.0, 2700000.0] * 15 # Mean 2.2M, StdDev 508k
    
    prediction, decision = agent.process(incomes)
    
    assert decision.zone == "Kritis"
    assert decision.hedging_percentage == 0.025

def test_aura_agent_darurat_zone():
    # Very low mean, high probability of being below threshold
    agent = AuraAgent(critical_threshold=2500000.0)
    incomes = [1000000.0, 1500000.0, 1200000.0] * 10 # Mean ~1.2M
    
    prediction, decision = agent.process(incomes)
    
    assert decision.zone == "Darurat"
    assert decision.hedging_percentage == 0.05
    assert prediction.probability_deficit > 0.90

def test_aura_agent_insufficient_data():
    agent = AuraAgent()
    with pytest.raises(ValueError, match="Not enough data"):
        agent.process([1000000.0])
