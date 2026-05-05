import httpx
import logging
from datetime import datetime, date, timedelta
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

class OpenBankingAPI:
    """
    Mock implementation of Indonesian SNAP (Standar Nasional Open API Pembayaran)
    for fetching real-time bank mutation data.
    """
    def __init__(self, client_id: str = "mock_client_id", client_secret: str = "mock_secret"):
        self.client_id = client_id
        self.client_secret = client_secret
        # Supporting multiple bank backends for fallback (Risiko R05)
        self.bank_endpoints = [
            "https://api.bank-utama.co.id/snap/v1",
            "https://api.bank-cadangan.co.id/snap/v1"
        ]
        self.current_endpoint_idx = 0
        self.access_token = None

    async def authenticate(self) -> bool:
        """
        Simulate OAuth2 authentication as per SNAP standards (B2B).
        """
        logger.info(f"Authenticating with {self.bank_endpoints[self.current_endpoint_idx]}...")
        # Simulate network delay and successful authentication
        self.access_token = f"mock_snap_access_token_{self.current_endpoint_idx}"
        return True

    async def fetch_transactions(self, account_number: str, start_date: date, end_date: date) -> List[Dict[str, Any]]:
        """
        Fetch bank mutations/transactions for a given date range with fallback logic.
        """
        try:
            if not self.access_token:
                await self.authenticate()
                
            logger.info(f"Fetching from {self.bank_endpoints[self.current_endpoint_idx]} for account {account_number}")
            
            # Simulate a primary bank failure (e.g., maintenance) to trigger fallback
            if self.current_endpoint_idx == 0:
                # raise httpx.ConnectError("Primary bank API is down") 
                pass # For now, let's assume it works, but logic is ready
            
            return self._generate_mock_mutations(start_date, end_date)
            
        except Exception as e:
            logger.warning(f"Primary bank failed: {e}. Attempting fallback...")
            self.current_endpoint_idx = (self.current_endpoint_idx + 1) % len(self.bank_endpoints)
            self.access_token = None # Clear token for new endpoint
            return await self.fetch_transactions(account_number, start_date, end_date)

    def _generate_mock_mutations(self, start_date: date, end_date: date) -> List[Dict[str, Any]]:
        # This acts as a real-time mock replacing seed.py
        mutations = []
        current_date = start_date
        while current_date <= end_date:
            mutations.append({
                "transactionDate": current_date.isoformat(),
                "amount": "5000000.00",
                "type": "Credit", # Income
                "description": "Daily Revenue Settlement"
            })
            mutations.append({
                "transactionDate": current_date.isoformat(),
                "amount": "1500000.00",
                "type": "Debit", # Expense
                "description": "Operational Costs"
            })
            current_date += timedelta(days=1)
        return mutations
