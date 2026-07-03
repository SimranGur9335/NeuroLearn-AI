from sqlalchemy import text


def create_chat_history_tables(db):
    """
    Creates mentor chat tables if they do not already exist.
    """

    # ==========================
    # Chat Sessions
    # ==========================
    db.execute(text("""
    CREATE TABLE IF NOT EXISTS mentor_chat_sessions (

        session_id SERIAL PRIMARY KEY,

        student_id INTEGER NOT NULL,

        title VARCHAR(255) NOT NULL DEFAULT 'New Chat',

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        is_deleted BOOLEAN DEFAULT FALSE,

        FOREIGN KEY (student_id)
            REFERENCES students(student_id)
            ON DELETE CASCADE

    );
    """))

    # ==========================
    # Chat Messages
    # ==========================
    db.execute(text("""
    CREATE TABLE IF NOT EXISTS mentor_chat_messages (

        message_id SERIAL PRIMARY KEY,

        session_id INTEGER NOT NULL,

        sender VARCHAR(20) NOT NULL,

        message TEXT NOT NULL,

        model_name VARCHAR(100),

        tokens_used INTEGER DEFAULT 0,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (session_id)
            REFERENCES mentor_chat_sessions(session_id)
            ON DELETE CASCADE

    );
    """))

    db.commit()

    print("✅ mentor_chat_sessions verified")
    print("✅ mentor_chat_messages verified")