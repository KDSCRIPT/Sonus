from flask import request, jsonify, Response
from pipeline.recommendation_pipeline import *
from flask import request, jsonify,Blueprint,send_file
import os
import uuid
from client.clients import supabase  # Assuming already configured
from utils.helper import download_murf_clip,combine_mp3_files_binary
from client.client_auth import auth_required

tts_bp = Blueprint("tts", __name__)

@tts_bp.route("/api/tts/recommend-options", methods=["POST"])
def recommend_tts_options():
    """Comprehensive TTS configuration recommendation using Gemini AI"""
    data = request.get_json()
    text = data.get("text")
    
    if not text:
        return jsonify({"error": "Missing 'text' in request body"}), 400
    
    if len(text.strip()) < 3:
        return jsonify({"error": "Text too short for meaningful analysis"}), 400
    
    try:
        recommendations = get_story_tts_configs_with_voice_assignment(text)
        return jsonify(recommendations), 200
    except Exception as e:
        return jsonify({
            "error": f"Recommendation failed: {str(e)}",
            "fallback": fallback_config(text)
        }), 500


@tts_bp.route("/api/tts/voice", methods=["GET"])
@auth_required
def get_voice():
    """Get all available voices with their capabilities"""
    voices = fetch_murf_voices()
    selected_voiceId=request.args.get("voiceId")
    for voice in voices:
        if voice["voice_id"]==selected_voiceId:
            return jsonify({"voice_details": voice}), 200
    return jsonify({"voice_details": {}}), 404


@tts_bp.route("/api/tts/voices", methods=["GET"])
@auth_required
def get_voices():
    """Get all available voices with their capabilities"""
    voices = fetch_murf_voices()
    if voices:
        return jsonify({"voices": voices}), 200
    return jsonify({"voices": []}), 404

     
res = murf_client.text_to_speech.stream(
    text="Hi, how are you doing today?", 
    voice_id="en-US-natalie",
    format="MP3"
)
@tts_bp.route("/api/tts/playvoice", methods=["POST"])
@auth_required
def play_voice():
    """Get all available voices with their capabilities"""
    voices = fetch_murf_voices()
    if voices:
        return jsonify({"voices": voices}), 200
    return jsonify({"voices": []}), 404

@tts_bp.route("/api/tts/export-audio", methods=["POST"])
@auth_required
def generate_combined_audio():
    temp_files = []
    user_id = request.user['id']
    combined_filename = request.json.get("file_name")
    configs=request.json.get("configs")

    try:
        # Step 1: Generate & download all MP3 clips
        for cfg in configs:
            filename = f"temp_{uuid.uuid4().hex[:8]}.mp3"
            download_murf_clip(cfg, filename)
            temp_files.append(filename)

        # Step 2: Combine all MP3s into one
        combine_mp3_files_binary(temp_files, combined_filename)

        # Step 3: Upload to Supabase
        bucket_name = "murf-audiofiles"
        path_in_storage = f"{user_id}/{combined_filename}"

        with open(combined_filename, "rb") as file:
            result = supabase.storage.from_(bucket_name).upload(path_in_storage, file,file_options={
                "upsert":"true"
            })

        return jsonify({
            "status": "success",
            "message": "Audio generated and uploaded successfully.",
            "supabase_path": path_in_storage,
            "file_name": combined_filename
        })

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

    finally:
        for f in temp_files:
            if os.path.exists(f):
                os.remove(f)
        if os.path.exists(combined_filename):
            os.remove(combined_filename)
        print("Temporary files cleaned up.")

@tts_bp.route("/api/audiosystem/play",methods=["POST"])
@auth_required
def stream_audio():
    data = request.get_json()
    def generate():
        for chunk in murf_client.text_to_speech.stream(
          **data.get("config")
        ):
            yield chunk
    return Response(generate(), mimetype="audio/mpeg")