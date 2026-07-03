"""
Memory Service for NeuroLearn AI Mentor

Stores short-term conversation history for each student.
(Current session only.)
"""

from collections import defaultdict

# student_id -> conversation history
conversation_memory = defaultdict(list)

# Keep only last N messages
MAX_HISTORY = 10


def get_memory(student_id):
    """
    Returns previous conversation for a student.
    """
    return conversation_memory[student_id]


def add_message(student_id, role, content):
    """
    Adds a message to memory.
    """

    conversation_memory[student_id].append(
        {
            "role": role,
            "content": content
        }
    )

    # Keep only last MAX_HISTORY messages
    if len(conversation_memory[student_id]) > MAX_HISTORY:
        conversation_memory[student_id] = conversation_memory[student_id][-MAX_HISTORY:]


def clear_memory(student_id):
    """
    Clears conversation history.
    """
    conversation_memory[student_id] = []