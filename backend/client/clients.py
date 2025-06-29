from utils.env_variables_loader import SUPABASE_KEY,SUPABASE_URL,GEMINI_API_KEY,MURF_API_KEY
from supabase import Client,create_client
from transformers import pipeline
import google.generativeai as genai
from murf import Murf
# Initialize Supabase,Gemini,Bart and Murf client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
genai.configure(api_key=GEMINI_API_KEY)
gemini_client = genai.GenerativeModel("gemini-2.0-flash")
murf_client = Murf(api_key=MURF_API_KEY)
bart_client = pipeline("summarization", model="facebook/bart-large-cnn")
