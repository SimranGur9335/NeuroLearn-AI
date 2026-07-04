import os
import re
import json
import asyncio
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import text

from backend.database import SessionLocal
from backend.schemas.mentor import AiChatInput, RenameChatInput, MentorChatInput
from backend.core.security import get_current_user
from backend.core.helpers import handle_exception_securely
from backend.services.notification_service import create_notification

from backend.services.ai_mentor.prompt_builder import build_prompt
from backend.services.ai_mentor.groq_service import generate_response
from backend.services.ai_mentor.context_builder import build_student_context
from backend.services.ai_mentor.memory_service import (get_memory, add_message, clear_memory)
from backend.services.ai_mentor.chat_service import (
    create_chat_session,
    get_latest_chat_session,
    save_chat_message,
    get_active_chat_sessions,
    get_chat_messages,
    get_chat_session_owner,
    rename_chat_session,
    delete_chat_session
)

router = APIRouter(
    tags=["AI Mentor"]
)

@router.get("/api/v1/ai/chat/history")
def get_ai_chat_history(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student" or not current_user["student_id"]:
        raise HTTPException(status_code=403, detail="Only students can access AI Mentor Chat history.")
    
    db = SessionLocal()
    try:
        sid = current_user["student_id"]
        result = db.execute(
            text("""
                SELECT sender, message_text, code_text, created_at 
                FROM mentor_messages 
                WHERE student_id = :sid 
                ORDER BY created_at ASC
            """),
            {"sid": sid}
        ).fetchall()
        
        return [
            {
                "role": r.sender,
                "text": r.message_text,
                "code": r.code_text,
                "date": r.created_at.strftime("%I:%M:%S %p") if r.created_at else ""
            } for r in result
        ]
    finally:
        db.close()


@router.post("/api/v1/ai/chat/stream")
def stream_ai_chat_message(data: AiChatInput, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student" or not current_user["student_id"]:
        raise HTTPException(status_code=403, detail="Only students can chat with the AI Mentor.")
    
    db = SessionLocal()
    try:
        sid = current_user["student_id"]
        prompt = data.prompt.strip()
        if not prompt:
            raise HTTPException(status_code=400, detail="Prompt cannot be empty.")
        
        # 1. Log the user's message in Supabase
        db.execute(
            text("""
                INSERT INTO mentor_messages (student_id, sender, message_text, code_text)
                VALUES (:sid, 'user', :msg, NULL)
            """),
            {"sid": sid, "msg": prompt}
        )
        db.commit()
    finally:
        db.close()

    async def event_generator():
        db_gen = SessionLocal()
        try:
            # Fetch some brief context history (last 5 messages)
            history_records = db_gen.execute(
                text("""
                    SELECT sender, message_text 
                    FROM mentor_messages 
                    WHERE student_id = :sid 
                    ORDER BY created_at DESC 
                    LIMIT 6
                """),
                {"sid": sid}
            ).fetchall()
            history_records.reverse()
            
            chat_history = []
            for hr in history_records[:-1]: # exclude the one we just inserted
                role = "user" if hr.sender == "user" else "model"
                chat_history.append({"role": role, "parts": [hr.message_text]})
            
            reply = ""
            gemini_key = os.getenv("GEMINI_API_KEY")
            
            system_instruction = """You are an expert AI Academic and Career Mentor.
Always try to include short, concrete learning suggestions (e.g. quiz links like '/quiz?domain=ai-ml&node=aiml-3'), career recommendations, or roadmap tips when relevant.
Be supportive, clear, and structured.
"""
            
            if gemini_key:
                try:
                    import google.generativeai as genai
                    genai.configure(api_key=gemini_key)
                    model = genai.GenerativeModel('gemini-1.5-flash', system_instruction=system_instruction)
                    
                    contents = []
                    for h in chat_history:
                        contents.append(h)
                    contents.append({"role": "user", "parts": [prompt]})
                    
                    response_stream = model.generate_content(contents, stream=True)
                    for chunk in response_stream:
                        chunk_text = chunk.text
                        reply += chunk_text
                        yield chunk_text
                except Exception as e:
                    print(f"Gemini API streaming error: {e}")
                    gemini_key = None # trigger fallback
            
            if not gemini_key:
                lower_prompt = prompt.lower()
                mock_text = ""
                if "vanishing gradient" in lower_prompt or "vanishing gradients" in lower_prompt:
                    mock_text = """The vanishing gradient problem occurs during the training of deep neural networks using backpropagation. As gradients are propagated backward through layers, repeated multiplication of small derivatives (e.g. < 0.25 for Sigmoid) causes gradients to shrink exponentially.

### Mathematical Breakdown
During backpropagation, the gradient of the loss function L with respect to weight w1 in the first layer is computed using the Chain Rule:
$$\\frac{\\partial L}{\\partial w_1} = \\frac{\\partial L}{\\partial a_d} \\times \\dots \\times \\frac{\\partial a_1}{\\partial w_1}$$

### Solutions
1. **Activation Functions**: Use ReLU (f(x) = max(0, x)) or its variants (Leaky ReLU) in hidden layers since their derivative is 1 for positive inputs.
2. **Weight Initialization**: Implement He (Kaiming) or Xavier (Glorot) initializations to maintain stable variance across layers.
3. **Batch Normalization**: Normalize inputs to each layer, preventing activations from saturated bounds.
4. **Residual Connections**: Skip connections (e.g. ResNet) allow gradients to bypass layers without shrinking.

*Learning Recommendation:* Check out our quiz [Deep Learning & Neural Networks](/quiz?domain=ai-ml&node=aiml-3).
*Roadmap Suggestion:* Complete the AI/ML track to master MLOps containerization.
"""
                elif "secure" in lower_prompt and ("express" in lower_prompt or "sqli" in lower_prompt):
                    mock_text = """Securing an Express application against SQL Injection (SQLi) requires preventing user inputs from being interpreted as database query commands.

### Best Practices for Secure Node/SQL Design
1. **Never Concatenate Inputs**: Do not write strings like "SELECT * FROM users WHERE name = '" + req.body.name + "'".
2. **Prepared Statements**: Leverage parameterized queries. Database drivers compile the query structure first, ensuring user variables are treated strictly as data indices.
3. **ORM/Query Builders**: Use libraries like Sequelize, Knex, or Prisma which implement prepared parameters out of the box.
4. **Input Validation**: Use schemas (e.g., Joi, Zod) to validate and sanitize incoming payloads.

*Learning Recommendation:* Complete the [REST APIs & Databases](/quiz?domain=full-stack&node=fs-3) quiz.
*Career Suggestion:* Consider the Cyber Security Analyst track if you love secure architectures.
"""
                elif "kubernetes" in lower_prompt or "fastapi" in lower_prompt or "capstone" in lower_prompt:
                    mock_text = """Here is a high-yield, college Capstone-level project architecture that integrates FastAPI, Kubernetes (K8s), and Distributed Systems principles.

### Project Title: "AeroPulse - High-Frequency IoT Analytics Engine"

### Core Architecture Components
1. **Ingress Layer**: Ingress routing HTTP telemetry packets to the K8s cluster.
2. **Compute Nodes (FastAPI)**: Lightweight, asynchronous FastAPI microservices running in Docker containers. Auto-scaled using K8s Horizontal Pod Autoscaler (HPA) based on load.
3. **Broker (Redis/RabbitMQ)**: A queue container cluster separating compute ingestion from database persistence.
4. **Analytics Worker**: Python scripts analyzing anomalies (e.g., sensor outlier spikes) utilizing scientific libraries.
5. **UI (Vite + Recharts)**: Real-time visualization charting engine.

*Learning Recommendation:* Complete the [Microservices & Kubernetes](/quiz?domain=cloud&node=cloud-4) quiz.
*Career Recommendation:* This project perfectly targets Cloud Engineer or DevOps Engineer pathways.
"""
                else:
                    mock_text = f"That's an interesting technical question about '{prompt}'! As your AI Mentor, I suggest exploring this concept by building small prototype scripts. Let's look at the learning resources in the sidebar for tutorials.\n\n*Quiz Recommendation:* Take the matching domain quiz to earn +100 XP!\n*Roadmap Suggestion:* Review your progress tracker under 'Roadmap & Gaps' to identify key milestones."
                
                # Stream word-by-word
                words = mock_text.split(" ")
                for i in range(0, len(words), 3):
                    chunk = " ".join(words[i:i+3]) + " "
                    reply += chunk
                    yield chunk
                    await asyncio.sleep(0.08)
            
            # Extract code block if any
            code_block = None
            code_match = re.search(r'```(?:\w*)\n(.*?)```', reply, re.DOTALL)
            if code_match:
                code_block = code_match.group(1).strip()
                reply_clean = re.sub(r'```(?:\w*)\n(.*?)```', '', reply, flags=re.DOTALL).strip()
            else:
                reply_clean = reply
                
            db_gen.execute(
                text("""
                    INSERT INTO mentor_messages (student_id, sender, message_text, code_text)
                    VALUES (:sid, 'assistant', :msg, :code)
                """),
                {"sid": sid, "msg": reply_clean, "code": code_block}
            )
            db_gen.commit()
            
        except Exception as e:
            print(f"Error in stream event generator: {e}")
        finally:
            db_gen.close()
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.post("/api/v1/ai/chat")
def send_ai_chat_message(data: AiChatInput, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student" or not current_user["student_id"]:
        raise HTTPException(status_code=403, detail="Only students can chat with the AI Mentor.")
    
    db = SessionLocal()
    try:
        sid = current_user["student_id"]
        prompt = data.prompt.strip()
        if not prompt:
            raise HTTPException(status_code=400, detail="Prompt cannot be empty.")
        
        # 1. Log the user's message in Supabase
        db.execute(
            text("""
                INSERT INTO mentor_messages (student_id, sender, message_text, code_text)
                VALUES (:sid, 'user', :msg, NULL)
            """),
            {"sid": sid, "msg": prompt}
        )
        db.commit()
        
        # 2. Get LLM response
        reply = ""
        code_block = None
        
        gemini_key = os.getenv("GEMINI_API_KEY")
        if gemini_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=gemini_key)
                model = genai.GenerativeModel('gemini-1.5-flash')
                
                # Fetch some brief context history (last 5 messages)
                history_records = db.execute(
                    text("""
                        SELECT sender, message_text 
                        FROM mentor_messages 
                        WHERE student_id = :sid 
                        ORDER BY created_at DESC 
                        LIMIT 6
                    """),
                    {"sid": sid}
                ).fetchall()
                history_records.reverse()
                
                chat_history = []
                for hr in history_records[:-1]: # exclude the one we just inserted
                    role = "user" if hr.sender == "user" else "model"
                    chat_history.append({"role": role, "parts": [hr.message_text]})
                
                chat = model.start_chat(history=chat_history)
                response = chat.send_message(prompt)
                full_response = response.text
                
                # Extract code block if any (markdown ``` block)
                code_match = re.search(r'```(?:\w*)\n(.*?)```', full_response, re.DOTALL)
                if code_match:
                    code_block = code_match.group(1).strip()
                    # Remove code block from standard text response
                    reply = re.sub(r'```(?:\w*)\n(.*?)```', '', full_response, flags=re.DOTALL).strip()
                else:
                    reply = full_response
            except Exception as e:
                print(f"Gemini API execution error: {e}")
                reply = f"System Error executing AI prompt. Falling back to local offline diagnostics..."
        
        # Heuristics Fallback
        if not reply or reply.startswith("System Error"):
            lower_prompt = prompt.lower()
            if "vanishing gradient" in lower_prompt or "vanishing gradients" in lower_prompt:
                reply = """The vanishing gradient problem occurs during the training of deep neural networks using backpropagation, where gradients shrink exponentially as they propagate backward through the network layers.

### Mathematical Breakdown
During backpropagation, the gradient of the loss function L with respect to weight w1 in the first layer is computed using the Chain Rule:
∂L/∂w1 = (∂L/∂a_d) * (∂a_d/∂a_d-1) * ... * (∂a_2/∂a_1) * (∂a_1/∂w_1)

If the activation functions (like Sigmoid or Tanh) have derivatives strictly less than 1 (f'(x) <= 0.25 for Sigmoid), multiplying many of these terms together causes the product to approach 0. Consequently, the weights of early layers update extremely slowly, halting learning.

### Standard Solutions
1. Activation Functions: Use ReLU (f(x) = max(0, x)) or its variants (Leaky ReLU) in hidden layers since their derivative is 1 for positive inputs.
2. Weight Initialization: Implement He (Kaiming) or Xavier (Glorot) initializations to maintain stable variance across layers.
3. Batch Normalization: Normalize inputs to each layer, preventing activations from saturated bounds.
4. Residual Connections: Skip connections (e.g. ResNet) allow gradients to bypass layers without shrinking."""
                code_block = """import torch.nn as nn

# Correct implementation using Residual connections and ReLU
class ResidualBlock(nn.Module):
    def __init__(self, channels):
        super().__init__()
        self.conv1 = nn.Conv2d(channels, channels, kernel_size=3, padding=1)
        self.bn1 = nn.BatchNorm2d(channels)
        self.relu = nn.ReLU()
        
    def forward(self, x):
        residual = x
        out = self.conv1(x)
        out = self.bn1(out)
        out = self.relu(out)
        # Adding residual connection preserves gradients
        return out + residual"""
            elif "secure" in lower_prompt and ("express" in lower_prompt or "sqli" in lower_prompt):
                reply = """Securing an Express application against SQL Injection (SQLi) requires preventing user inputs from being interpreted as database query commands.

### Best Practices for Secure Node/SQL Design
1. Never Concatenate Inputs: Do not write strings like "SELECT * FROM users WHERE name = '" + req.body.name + "'".
2. Prepared Statements: Leverage parameterized queries. Database drivers compile the query structure first, ensuring user variables are treated strictly as data indices.
3. ORM/Query Builders: Use libraries like Sequelize, Knex, or Prisma which implement prepared parameters out of the box.
4. Input Validation: Use schemas (e.g., Joi, Zod) to validate and sanitize incoming payloads."""
                code_block = """const express = require('express');
const mysql = require('mysql2/promise');
const app = express();

const pool = mysql.createPool({ host: 'localhost', database: 'college_db' });

// SECURE: Parameterized Query
app.post('/api/student-profile', async (req, res) => {
  const { rollNumber } = req.body;
  try {
    // The '?' acts as a placeholder. mysql2 safely sanitizes variables.
    const [rows] = await pool.execute(
      'SELECT * FROM students WHERE roll_number = ?',
      [rollNumber]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).send("Database error");
  }
});"""
            elif "kubernetes" in lower_prompt or "fastapi" in lower_prompt or "capstone" in lower_prompt:
                reply = """Here is a high-yield, college Capstone-level project architecture that integrates FastAPI, Kubernetes (K8s), and Distributed Systems principles.

### Project Title: "AeroPulse - High-Frequency IoT Analytics Engine"

### Core Architecture Components
1. Ingress Layer: Ingress routing HTTP telemetry packets to the K8s cluster.
2. Compute Nodes (FastAPI): Lightweight, asynchronous FastAPI microservices running in Docker containers. Auto-scaled using K8s Horizontal Pod Autoscaler (HPA) based on load.
3. Broker (Redis/RabbitMQ): A queue container cluster separating compute ingestion from database persistence.
4. Analytics Worker: Python scripts analyzing anomalies (e.g., sensor outlier spikes) utilizing scientific libraries.
5. UI (Vite + Recharts): Real-time visualization charting engine.

### Learning Projections & Faculty Selling Point
- Concurrency: Showcases FastAPI's async execution handling 5,000+ mock IoT sensor readings/sec.
- Resilience: Simulates container failure to prove Kubernetes self-healing replica policies.
- Scaling: Demonstrates dynamic container scale-out when CPU load exceeds 70%."""
                code_block = """# deployment.yaml (Kubernetes HPA config)
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: aeropulse-ingestion-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: aeropulse-ingestion
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70"""
            else:
                reply = f"That's an interesting technical question! I can help you model that concept, draft an architecture, or review configurations. (Using offline fallback mode. Configure GEMINI_API_KEY in .env for active generative support.)"
                code_block = None

        # 3. Log the AI's response in Supabase
        db.execute(
            text("""
                INSERT INTO mentor_messages (student_id, sender, message_text, code_text)
                VALUES (:sid, 'assistant', :msg, :code)
            """),
            {"sid": sid, "msg": reply, "code": code_block}
        )
        db.commit()
        
        return {
            "role": "assistant",
            "text": reply,
            "code": code_block,
            "date": datetime.now().strftime("%I:%M:%S %p")
        }
    except Exception as e:
        handle_exception_securely(db, e)
    finally:
        db.close()


@router.post("/api/v1/mentor/chat")
def mentor_chat(
    data: MentorChatInput,
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "student":
        raise HTTPException(status_code=400, detail="Only students can chat with the AI Mentor")
        
    db = SessionLocal()
    try:
        student_id = current_user["student_id"]

        session_id = data.session_id
        if session_id:
            owner_id = get_chat_session_owner(db, session_id)
            if not owner_id:
                raise HTTPException(status_code=404, detail="Chat session not found")
            if owner_id != student_id:
                raise HTTPException(status_code=403, detail="Unauthorized access to this chat session")
        else:
            session_id = get_latest_chat_session(db, student_id)
            if not session_id:
                session_id = create_chat_session(db, student_id)

        student_context = build_student_context(current_user)

        # Retrieve history from the database for this specific session
        db_messages = db.execute(
            text("""
                SELECT sender, message
                FROM mentor_chat_messages
                WHERE session_id = :session_id
                ORDER BY created_at DESC
                LIMIT 10
            """),
            {"session_id": session_id}
        ).mappings().all()
        # Reverse because query was DESC
        history = [{"role": m["sender"], "content": m["message"]} for m in reversed(db_messages)]

        messages = build_prompt(
            user_message=data.message,
            student_context=student_context,
            history=history
        )

        reply = generate_response(messages)
        save_chat_message(
            db=db,
            session_id=session_id,
            sender="user",
            message=data.message,
            model_name="openai/gpt-oss-120b"
        )

        save_chat_message(
            db=db,
            session_id=session_id,
            sender="assistant",
            message=reply,
            model_name="openai/gpt-oss-120b"
        )

        # Maintain short term memory cache for compatibility
        add_message(student_id, "user", data.message)
        add_message(student_id, "assistant", reply)

        # Automatic Chat Title generation
        # If session title == "New Chat", automatically rename after first user message
        session_row = db.execute(
            text("SELECT title FROM mentor_chat_sessions WHERE session_id = :session_id"),
            {"session_id": session_id}
        ).fetchone()
        if session_row and session_row.title == "New Chat":
            title_prompt = [
                {"role": "system", "content": "You are a helpful assistant. Generate a very short title (maximum 3-4 words) for a chat session based on the user's first prompt. Do not include quotes, punctuation, or extra words. Just return the clean title."},
                {"role": "user", "content": f"Prompt: {data.message}"}
            ]
            new_title = generate_response(title_prompt).strip()
            if not new_title or len(new_title) > 50 or "sorry" in new_title.lower() or ("ai" in new_title.lower() and len(new_title) > 20):
                words = data.message.split()
                new_title = " ".join(words[:4])
                if len(data.message) > len(new_title):
                    new_title += "..."
            
            new_title = new_title.replace('"', '').replace("'", "").strip()
            rename_chat_session(db, session_id, new_title)

        MODEL_NAME = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
        return {
            "success": True,
            "provider": "Groq",
            "model": MODEL_NAME,
            "reply": reply,
            "session_id": session_id,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
    finally:
        db.close()


@router.get("/api/v1/mentor/chats")
def get_chats(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=400, detail="Only students can access mentor chat list")
    
    student_id = current_user["student_id"]
    db = SessionLocal()
    try:
        sessions = get_active_chat_sessions(db, student_id)
        formatted_sessions = []
        for s in sessions:
            formatted_sessions.append({
                "session_id": s["session_id"],
                "title": s["title"],
                "created_at": s["created_at"].isoformat() if isinstance(s["created_at"], datetime) else str(s["created_at"]),
                "updated_at": s["updated_at"].isoformat() if isinstance(s["updated_at"], datetime) else str(s["updated_at"])
            })
        return formatted_sessions
    finally:
        db.close()


@router.get("/api/v1/mentor/chat/{session_id}")
def get_chat_conversation(session_id: int, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=400, detail="Only students can access mentor chat conversation")
    
    student_id = current_user["student_id"]
    db = SessionLocal()
    try:
        owner_id = get_chat_session_owner(db, session_id)
        if not owner_id:
            raise HTTPException(status_code=404, detail="Chat session not found")
        if owner_id != student_id:
            raise HTTPException(status_code=403, detail="Unauthorized access to this chat session")
        
        messages = get_chat_messages(db, session_id)
        formatted_messages = []
        for m in messages:
            formatted_messages.append({
                "sender": m["sender"],
                "message": m["message"],
                "model_name": m["model_name"],
                "created_at": m["created_at"].isoformat() if isinstance(m["created_at"], datetime) else str(m["created_at"])
            })
        return formatted_messages
    finally:
        db.close()


@router.post("/api/v1/mentor/new-chat")
def create_new_chat(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=400, detail="Only students can create mentor chat sessions")
    
    student_id = current_user["student_id"]
    db = SessionLocal()
    try:
        session_id = create_chat_session(db, student_id, title="New Chat")
        return {
            "session_id": session_id,
            "title": "New Chat"
        }
    finally:
        db.close()


@router.put("/api/v1/mentor/chat/{session_id}/title")
def rename_chat(session_id: int, data: RenameChatInput, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=400, detail="Only students can rename mentor chat sessions")
    
    student_id = current_user["student_id"]
    db = SessionLocal()
    try:
        owner_id = get_chat_session_owner(db, session_id)
        if not owner_id:
            raise HTTPException(status_code=404, detail="Chat session not found")
        if owner_id != student_id:
            raise HTTPException(status_code=403, detail="Unauthorized access to this chat session")
        
        title = data.title.strip()
        if not title:
            raise HTTPException(status_code=400, detail="Title cannot be empty")
            
        rename_chat_session(db, session_id, title)
        return {
            "success": True,
            "session_id": session_id,
            "title": title
        }
    finally:
        db.close()


@router.delete("/api/v1/mentor/chat/{session_id}")
def delete_chat(session_id: int, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=400, detail="Only students can delete mentor chat sessions")
    
    student_id = current_user["student_id"]
    db = SessionLocal()
    try:
        owner_id = get_chat_session_owner(db, session_id)
        if not owner_id:
            raise HTTPException(status_code=404, detail="Chat session not found")
        if owner_id != student_id:
            raise HTTPException(status_code=403, detail="Unauthorized access to this chat session")
        
        delete_chat_session(db, session_id)
        return {
            "success": True,
            "message": "Chat session deleted successfully"
        }
    finally:
        db.close()


@router.delete("/api/v1/mentor/chat/history")
def clear_chat(current_user: dict = Depends(get_current_user)):
    student_id = current_user["student_id"]
    db = SessionLocal()

    try:
        db.execute(
            text("""
                UPDATE mentor_chat_sessions
                SET is_deleted = TRUE, updated_at = CURRENT_TIMESTAMP
                WHERE student_id = :student_id AND is_deleted = FALSE
            """),
            {"student_id": student_id}
        )
        db.commit()
        clear_memory(student_id)

        return {
            "success": True,
            "message": "Conversation cleared."
        }
    finally:
        db.close()
