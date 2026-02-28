import os
from flask import Flask
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

supabase: Client = create_client(
    os.environ.get("SUPABASE_URL"),
    os.environ.get("SUPABASE_KEY")
)

@app.route('/')
def index():
    # response = supabase.table('instruments').select("*").execute()
    # instruments = response.data

    # html = '<h1>Instruments</h1><ul>'
    # for instrument in instruments:
    #     html += f'<li>{instrument["name"]}</li>'
    # html += '</ul>'

    # return html
    return "hello from backend"

if __name__ == '__main__':
    # This line is needed for Railway port assignment
    port = int(os.environ.get("PORT", 3001))
    app.run(host="0.0.0.0", port=port, debug=port == 3001)
