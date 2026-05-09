import logging
from datetime import datetime
from typing import Optional, List, Dict

logger = logging.getLogger("aura.audit")

class AuditLogger:
    """
    Implements Audit Logging for compliance with UU Pelindungan Data Pribadi (UU PDP No. 27/2022).
    Tracks all access to sensitive financial data.
    """
    
    # Using a dictionary to store logs per user to avoid crosstalk in multi-user demo
    # In production, this would be a persistent database table.
    LOG_STORE: Dict[str, List[Dict]] = {}

    @staticmethod
    def log_access(user_id: str, resource: str, action: str, status: str = "SUCCESS", details: Optional[str] = None):
        """
        Logs a data access event.
        """
        uid = str(user_id)
        timestamp = datetime.now().isoformat()
        audit_entry = {
            "timestamp": timestamp,
            "user_id": uid,
            "resource": resource,
            "action": action,
            "status": status,
            "details": details
        }
        
        if uid not in AuditLogger.LOG_STORE:
            AuditLogger.LOG_STORE[uid] = []
            
        AuditLogger.LOG_STORE[uid].append(audit_entry)
        
        # Keep last 100 logs per user
        if len(AuditLogger.LOG_STORE[uid]) > 100:
            AuditLogger.LOG_STORE[uid].pop(0)
            
        logger.info(f"AUDIT | {timestamp} | User:{uid} | Resource:{resource} | Action:{action} | Status:{status} | Details:{details}")
        
    @staticmethod
    def get_recent_logs(user_id: str):
        """
        Returns recent audit logs for a specific user.
        """
        uid = str(user_id)
        return AuditLogger.LOG_STORE.get(uid, [])[::-1]

    @staticmethod
    def log_sensitive_export(user_id: str, partner_id: str, data_type: str):
        """
        Logs when sensitive data is shared with B2B partners (e.g., AURA Score).
        """
        AuditLogger.log_access(
            user_id, 
            resource=f"partner_gateway:{partner_id}", 
            action="DATA_EXPORT", 
            details=f"Shared {data_type} with external entity."
        )

