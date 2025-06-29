from flask import request, jsonify,Blueprint
from client.clients import supabase
from werkzeug.utils import secure_filename
from utils.helper import decode_file
from pipeline.summarization_pipeline import summarize_text
from client.client_auth import auth_required
import uuid

file_bp = Blueprint("file", __name__)

@file_bp.route("/api/filesystem/file", methods=["DELETE"])
@auth_required
def delete_file():
    user_id = request.user['id']
    storage_bucket=request.args.get("storage_bucket")
    data = request.get_json()
    path = data.get("path")  # Full relative path, e.g. "user123/folder/file.txt"
    path=f"{user_id}/{path}"
    if not path:
        return jsonify({"error": "Missing file path"}), 400

    try:
        supabase.storage.from_(storage_bucket).remove([path])
        return jsonify({"message": "File deleted", "path": path}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@file_bp.route("/api/filesystem/file", methods=["PUT"])
@auth_required
def update_file():
    user_id=request.user['id']
    storage_bucket=request.args.get("storage_bucket")
    data = request.get_json()
    old_path = data.get("old_path")  # e.g. "dummy_user/old.pdf"
    new_path = data.get("new_path")  # e.g. "dummy_user/new.pdf"
    old_path=f"{user_id}/{old_path}"
    new_path=f"{user_id}/{new_path}"

    if not old_path or not new_path:
        return jsonify({"error": "Missing old_path or new_path"}), 400

    try:
        # Copy old file to new location
        supabase.storage.from_(storage_bucket).copy(old_path, new_path)

        # Delete old file
        supabase.storage.from_(storage_bucket).remove([old_path])

        return jsonify({"message": "File updated", "from": old_path, "to": new_path}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@file_bp.route("/api/filesystem/file", methods=["POST"])
@auth_required
def upload_file():
    user_id = request.user['id']  # Replace this with actual logic to identify the user

    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        filename = secure_filename(f"${str(uuid.uuid4().hex)}"+file.filename)
        file_path = f"{user_id}/{filename}"
        file_content = file.read()
        content_type = file.content_type or "application/octet-stream"

        # Upload the file to Supabase storage
        supabase.storage.from_("murf-documents").upload(
            path=file_path,
            file=file_content,
            file_options={
                "content-type": content_type,
                "upsert": "true"
            }
        )

        # Download the uploaded file
        file_bytes = supabase.storage.from_("murf-documents").download(file_path)

        if not file_bytes:
            return jsonify({"error": "Uploaded file could not be read"}), 404

        text = decode_file(file_bytes,filename)
        results = summarize_text(text)

        return jsonify(
            results
        ), 200

    except Exception as e:
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500