from flask import request, jsonify,Blueprint
from client.clients import supabase
from client.client_auth import auth_required
from utils.helper import get_sort_date

folder_bp = Blueprint("folder", __name__)

@folder_bp.route("/api/filesystem/folder", methods=["POST"])
@auth_required
def create_directory():
    user_id = request.user['id']
    data = request.get_json()
    storage_bucket=request.args.get("storage_bucket")
    directory = data.get("folder")
    if not directory:
        return jsonify({"error": "Missing directory name"}), 400
    placeholder_path = f"{user_id}/{directory}/.placeholder"
    try:
        supabase.storage.from_(storage_bucket).upload(
            path=placeholder_path,
            file=b"",
            file_options={"upsert": "true"}
        )
        return jsonify({"message": "Directory created"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@folder_bp.route("/api/filesystem/folder", methods=["DELETE"])
@auth_required
def delete_folder():
    user_id = request.user['id']
    storage_bucket=request.args.get("storage_bucket")
    data = request.get_json()
    folder_path = data.get("folder")  # e.g. "dummy_user/myfolder"
    folder_path=f"{user_id}/{folder_path}"
    if not folder_path:
        return jsonify({"error": "Missing folder path"}), 400

    folder_path = folder_path.rstrip("/")  # sanitize

    try:
        # Step 1: List all files in the folder
        files = supabase.storage.from_(storage_bucket).list(path=folder_path)

        file_paths = [
            f"{folder_path}/{file['name']}" for file in files if file.get("metadata") is not None
        ]

        if not file_paths:
            return jsonify({"message": "No files found in folder", "path": folder_path}), 200

        # Step 2: Delete all files
        supabase.storage.from_(storage_bucket).remove(file_paths)

        return jsonify({"message": "Folder deleted", "deleted_files": file_paths}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@folder_bp.route("/api/filesystem/folder", methods=["PUT"])
@auth_required
def update_folder():
    user_id=request.user['id']
    storage_bucket=request.args.get("storage_bucket")
    data = request.get_json()
    old_path = data.get("old_path")  # e.g. "dummy_user/old_folder"
    new_path = data.get("new_path")  # e.g. "dummy_user/new_folder"
    old_path=f"{user_id}/{old_path}"
    new_path=f"{user_id}/{new_path}"
    if not old_path or not new_path:
        return jsonify({"error": "Missing old_path or new_path"}), 400

    try:
        # List all files under the old folder path
        files = supabase.storage.from_(storage_bucket).list(path=old_path)

        moved_files = []

        for file in files:
            if file.get("metadata") is None:
                continue  # skip subfolders

            file_name = file["name"]
            source = f"{old_path}/{file_name}"
            target = f"{new_path}/{file_name}"
            # Move the file by copying then deleting
            supabase.storage.from_("murf-documents").copy(source, target)
            supabase.storage.from_("murf-documents").remove([source])
            moved_files.append({"from": source, "to": target})

        return jsonify({"message": "Folder updated", "files_moved": moved_files}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@folder_bp.route("/api/filesystem/list-directory", methods=["GET"])
@auth_required
def list_directory():
    user_id = request.user['id']
    storage_bucket=request.args.get("storage_bucket")
    directory = request.args.get("directory", "")
    folder_path = f"{user_id}/{directory}".rstrip("/")
    try:
        files = supabase.storage.from_(storage_bucket).list(path=folder_path)
        print(files)
        result = []
        for file in files:
            item_name = file['name']
            full_path = f"{folder_path}/{item_name}".lstrip("/")
            
            if file['metadata'] is None:
                # It's a directory
                result.append({
                    "name": item_name,
                    "type": "directory"
                })
            else:
                # It's a file, generate signed URL
                signed_url_response = supabase.storage.from_(storage_bucket).create_signed_url(
                    path=full_path,
                    expires_in=3600  # 1 hour expiry
                )
                result.append({
                    "name": item_name,
                    "type": "file",
                    "size": file['metadata'].get('size') if file['metadata'] else None,
                    "created_at": file.get('created_at'),
                    "updated_at": file.get('updated_at'),
                    "last_modified": file['metadata'].get('lastModified') if file['metadata'] else None,
                    "url": signed_url_response['signedURL']
                })
        result.sort(key=get_sort_date, reverse=True)
        return jsonify({"items": result}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500