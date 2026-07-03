import os

from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Groq client
client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


def generate_response(messages):
    """
    Sends messages to Groq and returns the AI response.
    """

    try:
        completion = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=messages,
            temperature=0.2,
            top_p=0.9,
            max_completion_tokens=700,
            reasoning_effort="medium",
            stream=False
        )

        return completion.choices[0].message.content

    except Exception as e:
        print(f"[Groq Error] {e}")
        return "Sorry, I couldn't generate a response at the moment."