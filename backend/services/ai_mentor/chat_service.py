from sqlalchemy import text


def create_chat_session(db, student_id, title="New Chat"):
    """
    Creates a new mentor chat session.
    """

    session = db.execute(
        text("""
            INSERT INTO mentor_chat_sessions
            (
                student_id,
                title
            )
            VALUES
            (
                :student_id,
                :title
            )
            RETURNING session_id
        """),
        {
            "student_id": student_id,
            "title": title
        }
    ).scalar()

    db.commit()

    return session

def get_latest_chat_session(db, student_id):
    """
    Returns latest active session.
    """

    return db.execute(
        text("""
            SELECT session_id
            FROM mentor_chat_sessions
            WHERE student_id=:student_id
            AND is_deleted=FALSE
            ORDER BY updated_at DESC
            LIMIT 1
        """),
        {
            "student_id": student_id
        }
    ).scalar()

def save_chat_message(
    db,
    session_id,
    sender,
    message,
    model_name
):
    """
    Saves one chat message.
    """

    db.execute(
        text("""
            INSERT INTO mentor_chat_messages
            (
                session_id,
                sender,
                message,
                model_name
            )
            VALUES
            (
                :session_id,
                :sender,
                :message,
                :model_name
            )
        """),
        {
            "session_id": session_id,
            "sender": sender,
            "message": message,
            "model_name": model_name
        }
    )

    db.execute(
        text("""
            UPDATE mentor_chat_sessions
            SET updated_at=CURRENT_TIMESTAMP
            WHERE session_id=:session_id
        """),
        {
            "session_id": session_id
        }
    )

    db.commit()


def get_active_chat_sessions(db, student_id):
    """
    Returns latest active chat sessions for a student, sorted by updated_at DESC.
    """
    rows = db.execute(
        text("""
            SELECT session_id, title, updated_at, created_at
            FROM mentor_chat_sessions
            WHERE student_id = :student_id
            AND is_deleted = FALSE
            ORDER BY updated_at DESC
        """),
        {
            "student_id": student_id
        }
    ).mappings().all()
    return [dict(row) for row in rows]


def get_chat_messages(db, session_id):
    """
    Returns all messages in a chat session ordered oldest -> newest.
    """
    rows = db.execute(
        text("""
            SELECT sender, message, model_name, created_at
            FROM mentor_chat_messages
            WHERE session_id = :session_id
            ORDER BY created_at ASC
        """),
        {
            "session_id": session_id
        }
    ).mappings().all()
    return [dict(row) for row in rows]


def get_chat_session_owner(db, session_id):
    """
    Returns the student_id owner of the chat session if not deleted, else None.
    """
    return db.execute(
        text("""
            SELECT student_id
            FROM mentor_chat_sessions
            WHERE session_id = :session_id
            AND is_deleted = FALSE
        """),
        {
            "session_id": session_id
        }
    ).scalar()


def rename_chat_session(db, session_id, title):
    """
    Renames a chat session.
    """
    db.execute(
        text("""
            UPDATE mentor_chat_sessions
            SET title = :title, updated_at = CURRENT_TIMESTAMP
            WHERE session_id = :session_id
        """),
        {
            "session_id": session_id,
            "title": title
        }
    )
    db.commit()


def delete_chat_session(db, session_id):
    """
    Soft deletes a chat session.
    """
    db.execute(
        text("""
            UPDATE mentor_chat_sessions
            SET is_deleted = TRUE, updated_at = CURRENT_TIMESTAMP
            WHERE session_id = :session_id
        """),
        {
            "session_id": session_id
        }
    )
    db.commit()