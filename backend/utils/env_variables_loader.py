# --- Environment variables---
from dotenv import load_dotenv
import os
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
CLERK_PEM_PUBLIC_KEY = os.getenv("CLERK_PEM_PUBLIC_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
MURF_API_KEY = os.getenv("MURF_API_KEY")
MURF_VOICES_ENDPOINT = os.getenv("MURF_VOICES_ENDPOINT")
CLERK_PUBLISHABLE_KEY=os.getenv("CLERK_PUBLISHABLE_KEY")