from apscheduler.schedulers.background import BackgroundScheduler

from app.db.session import SessionLocal
from app.services.session_cleanup import cleanup_expired_sessions

scheduler = BackgroundScheduler()

def cleanup_job():
    db = SessionLocal()
    try:
        count = cleanup_expired_sessions(db)
        print(f"Cleanup completed. Removed {count} expired items.")
    except Exception as e:
        print(f"Error during cleanup: {e}")
    finally:
        db.close()

def start_scheduler():
    if scheduler.running:
        return
    print("Starting cleanup scheduler")
    scheduler.add_job(cleanup_job, 'interval', hours=24, id="session_cleanup", replace_existing=True)
    scheduler.start()