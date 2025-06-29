# backend/app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
from google.cloud.firestore import Client, FieldFilter # Import FieldFilter
from google.auth.credentials import AnonymousCredentials # For local dev if no auth token
from ai_email_generator import AIEmailGenerator # Import the AIEmailGenerator class
import os
import json # Import json for parsing __firebase_config

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# --- Firestore Initialization ---
db = None
app_id = None # Global variable to store app_id
ai_generator = None # Global variable for AI email generator instance

def initialize_services():
    global db, app_id, ai_generator
    try:
        # __app_id is a global variable provided by the Canvas environment
        app_id = os.environ.get('__app_id', 'default-phishing-app-id')
        print(f"Attempting to initialize Firestore for app_id: {app_id}")

        # __firebase_config is a global variable provided by the Canvas environment
        firebase_config_str = os.environ.get('__firebase_config')
        if firebase_config_str:
            firebase_config = json.loads(firebase_config_str)
            db = Client(
                project=firebase_config.get('projectId'),
                credentials=AnonymousCredentials() # Using AnonymousCredentials for client init
            )
            print("Firestore client initialized successfully.")
        else:
            print("WARNING: __firebase_config not found. Firestore will not be fully initialized.")
            print("Falling back to dummy Firestore client (will not persist data).")
            db = None

    except Exception as e:
        print(f"Error initializing Firestore: {e}")
        db = None # Ensure db is None if initialization fails

    try:
        # Initialize the AI email generator
        ai_generator = AIEmailGenerator()
        print("AI Email Generator initialized successfully.")
    except Exception as e:
        print(f"Error initializing AI Email Generator: {e}")
        ai_generator = None

# Initialize Firestore and Gemini on app startup
with app.app_context():
    initialize_services()


# --- API Routes ---

@app.route('/api/status', methods=['GET'])
def status():
    """
    Simple status endpoint to check if the backend is running and connected to services.
    """
    firestore_status = "offline"
    if db:
        try:
            # Try a simple Firestore operation to verify connectivity
            # For a quick test, we can try to get a non-existent doc from a test collection.
            # This doesn't require read/write permissions on existing data.
            db.collection('__connection_test').document('ping').get()
            firestore_status = "online"
        except Exception as e:
            print(f"Firestore connection test failed: {e}")
            firestore_status = "error"

    ai_generator_status = "offline"
    if ai_generator:
        ai_generator_status = "online" # Assumed online if object is created

    return jsonify({
        "status": "Phishing Simulator Backend is running!",
        "firestore_status": firestore_status,
        "ai_generator_status": ai_generator_status
    }), 200

@app.route('/api/generate-email', methods=['POST'])
def generate_email():
    """
    Endpoint to generate phishing email content using AI.
    """
    data = request.get_json()
    prompt = data.get('prompt')

    if not prompt:
        return jsonify({"error": "Prompt is required"}), 400

    if not ai_generator:
        return jsonify({"error": "AI Email Generator not initialized"}), 500

    generated_text = ai_generator.generate_email_content(prompt)

    if generated_text.startswith("Error:"):
        return jsonify({"error": generated_text}), 500
    else:
        return jsonify({"generated_text": generated_text}), 200


if __name__ == '__main__':
    # Run the Flask app on port 5000
    # In a production environment, use a WSGI server like Gunicorn or uWSGI
    app.run(debug=True, port=5000)
