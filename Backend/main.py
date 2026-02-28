import os
from flask import Flask
from flask_cors import CORS
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
# CORS is needed for communication between frontend and backend
CORS(app)

supabase: Client = create_client(
    os.environ.get("SUPABASE_URL"),
    os.environ.get("SUPABASE_KEY")
)

@app.route('/')
def index():
    print("Route got called")
    return "hello from backend 👋"

if __name__ == '__main__':
    # This line is needed for Railway port assignment
    port = int(os.environ.get("PORT", 3001))
    app.run(host="0.0.0.0", port=port, debug=port == 3001)
