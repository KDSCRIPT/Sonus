from flask import request, jsonify,send_file,Blueprint
import zipfile
from io import BytesIO
import os
from client.clients import supabase
from client.client_auth import auth_required

download_bp = Blueprint("download", __name__)

@download_bp.route("/api/filesystem/file/download", methods=["POST"])
@auth_required
def download_file():
    user_id = request.user['id']
    data = request.get_json()
    storage_bucket=request.args.get("storage_bucket")
    file_path = data.get("file")  # e.g. "myfolder/myfile.txt"

    if not file_path:
        return jsonify({"error": "Missing file path"}), 400

    full_path = f"{user_id}/{file_path}"

    try:
        response = supabase.storage.from_(storage_bucket).download(full_path)
        file_content = response
        filename = os.path.basename(file_path)

        return send_file(
            BytesIO(file_content),
            mimetype='application/octet-stream',
            download_name=filename,
            as_attachment=True
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@download_bp.route("/api/filesystem/folder/download", methods=["POST"])
@auth_required
def download_folder():
    user_id = request.user['id']
    data = request.get_json()
    storage_bucket=request.args.get("storage_bucket")
    folder_path = data.get("folder")

    if not folder_path:
        return jsonify({"error": "Missing folder path"}), 400

    folder_path = f"{user_id}/{folder_path}".rstrip("/")

    try:
        # List all files in the folder
        files = supabase.storage.from_(storage_bucket).list(path=folder_path)

        file_paths = [
            f"{folder_path}/{file['name']}" for file in files if file.get("metadata") is not None
        ]

        if not file_paths:
            return jsonify({"message": "No files found in folder"}), 200

        # Create a zip in memory
        zip_buffer = BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w') as zipf:
            for file_path in file_paths:
                content = supabase.storage.from_("murf-documents").download(file_path)
                arcname = os.path.relpath(file_path, start=f"{user_id}/")
                zipf.writestr(arcname, content)

        zip_buffer.seek(0)
        return send_file(
            zip_buffer,
            mimetype='application/zip',
            download_name=f"{os.path.basename(folder_path)}.zip",
            as_attachment=True
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500