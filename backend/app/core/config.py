import os
from dotenv import load_dotenv

load_dotenv()  # reads .env into environment

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY is None:
    raise RuntimeError("GEMINI_API_KEY is not set")
