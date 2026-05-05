import logging
from datetime import date, timedelta
from sqlalchemy.orm import Session
import pandas as pd

from app.agent.base_agent import AuraAgent
from app.services.open_banking import OpenBankingAPI
from app.services.vault import SmartVaultExecutor
from app.services.notifications import NotificationService
from app.services.scoring import AuraScoreEngine
from app.models.transaction import Transaction

logger = logging.getLogger(__name__)

class AuraOrchestrator:
    def __init__(self, db: Session):
        self.db = db
        self.agent = AuraAgent()
        self.bank_api = OpenBankingAPI()
        self.vault = SmartVaultExecutor()
        self.notifier = NotificationService()
        self.scorer = AuraScoreEngine()

    async def run_daily_sync(self, user_id: str, account_number: str):
        """
        The core autonomous routine:
        1. Sync bank mutations
        2. Run risk analysis
        3. Execute smart hedging
        4. Update credit score
        5. Notify user
        """
        logger.info(f"Starting daily sync for user {user_id}")
        
        # 1. Sync Bank Data
        end_date = date.today()
        start_date = end_date - timedelta(days=30)
        
        mutations = await self.bank_api.fetch_transactions(account_number, start_date, end_date)
        
        # Save mutations to DB (simplified)
        for m in mutations:
            # Check if exists (mock logic)
            txn = Transaction(
                date=date.fromisoformat(m['transactionDate']),
                amount=float(m['amount']),
                type='income' if m['type'] == 'Credit' else 'expense',
                description=m['description']
            )
            self.db.add(txn)
        self.db.commit()

        # 2. Run Risk Analysis
        # Fetch last 30 days from DB
        incomes = [float(m['amount']) for m in mutations if m['type'] == 'Credit']
        prediction, decision = self.agent.process(incomes)
        
        # 3. Generate Forecast (Prophet)
        df_history = pd.DataFrame(mutations)
        df_history = df_history[df_history['type'] == 'Credit']
        df_history = df_history.rename(columns={'transactionDate': 'ds', 'amount': 'y'})
        df_history['y'] = df_history['y'].astype(float)
        
        forecast = self.agent.generate_forecast(df_history)

        # 4. Execute Hedge
        hedge_result = self.vault.execute_hedge(user_id, incomes[-1], decision.hedging_percentage)
        
        # 5. Update AURA Score
        score_result = self.scorer.calculate_score(df_history, forecast)

        # 6. Notify User
        if decision.zone in ["Kritis", "Bahaya", "Darurat"]:
            await self.notifier.send_alert(
                user_id, 
                f"🚨 Peringatan: Zona {decision.zone}", 
                f"Probabilitas defisit kas Anda mencapai {decision.probability:.1%}. Amankan pengeluaran Anda."
            )
        
        if hedge_result['status'] == 'success':
            await self.notifier.notify_hedge_executed(user_id, hedge_result['amount_hedged'], decision.hedging_percentage)

        return {
            "prediction": prediction,
            "decision": decision,
            "forecast": forecast.to_dict(orient='records'),
            "score": score_result,
            "hedge": hedge_result
        }
