import pytest
from app.agent.base_agent import AuraAgent

def test_model_resilience_to_revenue_crash():
    """
    Test how the agent reacts when revenue drops significantly.
    """
    agent = AuraAgent(critical_threshold=2500000.0)
    
    # Healthy 20 days: 5M income
    healthy_incomes = [5000000.0] * 20
    # Crash 10 days: 1M income
    crash_incomes = [1000000.0] * 10
    
    incomes = healthy_incomes + crash_incomes
    
    prediction, decision = agent.process(incomes)
    
    print(f"\nCrash Scenario - Mean: {prediction.mean_income}, Prob: {prediction.probability_deficit}")
    
    # Mean will be (20*5 + 10*1) / 30 = 110/30 = 3.66M
    # However, std deviation will be quite high due to the jump from 5M to 1M
    # This should increase the probability of deficit
    
    assert prediction.probability_deficit > 0.20 # Should definitely see increased risk
    # Depending on the exact math, we want to ensure it's not "Aman" if things are crashing
    # With Mean=3.66M and high sigma, 2.5M threshold might be hit.

def test_model_zero_variance_fix():
    """
    If all incomes are identical, sigma is 0. 
    norm.cdf(x, loc, scale=0) can be undefined or raise errors depending on implementation.
    Our agent should handle this.
    """
    agent = AuraAgent(critical_threshold=2500000.0)
    incomes = [5000000.0] * 30 # Sigma = 0
    
    try:
        prediction, decision = agent.process(incomes)
        assert decision.zone == "Aman"
    except Exception as e:
        pytest.fail(f"Agent failed on zero variance: {e}")

def test_model_extreme_crisis():
    """
    Test how the agent reacts to an extreme, continuous drop in revenue (e.g., pandemic).
    This simulates the Skenario Krisis Lanjutan.
    """
    agent = AuraAgent(critical_threshold=2500000.0)
    
    # 5 days of normal income
    incomes = [5000000.0] * 5
    # Followed by 25 days of almost zero income
    incomes += [50000.0] * 25
    
    prediction, decision = agent.process(incomes)
    
    # With this much drop, the probability of deficit should be very high
    assert prediction.probability_deficit > 0.80
    assert decision.zone in ["Bahaya", "Darurat"]
