from sqlalchemy import text
from app.database import engine

with engine.connect() as conn:
    print(
        conn.execute(
            text("""
                SELECT
                    current_database(),
                    current_user,
                    current_schema(),
                    current_setting('search_path');
            """)
        ).fetchone()
    )