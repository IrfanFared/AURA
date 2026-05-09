from database.session import SessionLocal
from app.models.transaction import Transaction

def clear_data():
    db = SessionLocal()
    try:
        num_deleted = db.query(Transaction).delete()
        db.commit()
        print(f"Successfully deleted {num_deleted} sample transactions.")
    except Exception as e:
        print(f"Error clearing data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    clear_data()
