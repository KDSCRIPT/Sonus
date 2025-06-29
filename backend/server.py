from flask import Flask
from flask_cors import CORS
from views.download_views import download_bp
from views.file_views import file_bp
from views.folder_views import folder_bp
from views.tts_views import tts_bp
import os 

# Initialize Flask
app = Flask(__name__)
CORS(app,resources={r"/*": {"origins": ["http://localhost:3000","https://sonusmurf.vercel.app"]}})

app.register_blueprint(download_bp) 
app.register_blueprint(file_bp) 
app.register_blueprint(folder_bp)
app.register_blueprint(tts_bp)

if __name__ == '__main__':
    app.run(host="0.0.0.0", debug=True)