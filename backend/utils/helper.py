from client.clients import murf_client
import requests
import mimetypes
import io
from PyPDF2 import PdfReader
from docx import Document
# === Helper: Download Murf Audio Clip ===
def download_murf_clip(config, output_filename):
    response = murf_client.text_to_speech.generate(**config)
    audio_url = response.audio_file
    if not audio_url:
        raise Exception("No audio URL returned from Murf API.")
    
    res = requests.get(audio_url)
    if res.status_code == 200:
        with open(output_filename, "wb") as f:
            f.write(res.content)
        print(f"Downloaded: {output_filename}")
    else:
        raise Exception(f"Failed to download audio. Status: {res.status_code}")

# === Helper: Combine MP3s using Pure Python ===
def combine_mp3_files_binary(mp3_files, output_path):
    with open(output_path, "wb") as outfile:
        for file in mp3_files:
            with open(file, "rb") as infile:
                outfile.write(infile.read())
    print(f"Combined MP3 saved to: {output_path}")

def decode_file(file_bytes, filename):
    mime_type, _ = mimetypes.guess_type(filename)

    if mime_type == "application/pdf":
        try:
            reader = PdfReader(io.BytesIO(file_bytes))
            return "\n".join(page.extract_text() or "" for page in reader.pages)
        except Exception as e:
            raise ValueError(f"PDF parsing failed: {e}")

    elif mime_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        try:
            doc = Document(io.BytesIO(file_bytes))
            return "\n".join(p.text for p in doc.paragraphs)
        except Exception as e:
            raise ValueError(f"DOCX parsing failed: {e}")

    else:
        try:
            return file_bytes.decode("utf-8")
        except Exception:
            return file_bytes.decode("latin-1")
    
def estimate_cost(text, rate_per_100_chars=0.05):
    character_count = len(text)
    estimated_price = (character_count) * 0.00003
    return character_count, round(estimated_price, 2)

def get_sort_date(item):
    return (
        item.get('updated_at') or 
        item.get('last_modified') or 
        item.get('created_at') or 
        '1970-01-01T00:00:00Z'
    )
