import logging
from datetime import datetime
from typing import Optional

logger = logging.getLogger("aura.audit")

class AuditLogger:
    """
    Implements Audit Logging for compliance with UU Pelindungan Data Pribadi (UU PDP No. 27/2022).
    Tracks all access to sensitive financial data.
    """
    
    @staticmethod
    def log_access(user_id: str, resource: str, action: str, status: str = "SUCCESS", details: Optional[str] = None):
        """
        Logs a data access event.
        """
        timestamp = datetime.now().isoformat()
        audit_entry = {
            "timestamp": timestamp,
            "user_id": user_id,
            "resource": resource,
            "action": action,
            "status": status,
            "details": details
        }
        
        # In production, this would be written to a dedicated secure audit database or immutable log
        logger.info(f"AUDIT | {timestamp} | User:{user_id} | Resource:{resource} | Action:{action} | Status:{status} | Details:{details}")
        
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
