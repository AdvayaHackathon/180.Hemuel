# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import subprocess
from flask import send_file
import sys


app = Flask(__name__)
CORS(app)

# Initial system prompt
messages = [
    {
        "role": "system",
        "content": (
            "You are GuideBot, a helpful and enthusiastic travel guide. Speak in a warm, friendly tone. Your job is to help "
            "attain information from users, make sure to get information "
            "from the user such as they kind of places they like to see, for example historic monuments, ask the user what kind of "
            "weather they prefer, what the budget is and what kind of activities they like to do, ask them the kind of food they like to eat as well and "
            "try not to list out all the questions you want to ask them but instead ease and make sure not to give winded out"
            "into the questions by having a conversation with them like a friend would. If you have attained sufficient information and context"
            "ask the user to type exit or plan."
        )
    },
]

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        user_input = data.get('message', '')

        if not user_input:
            return jsonify({'error': 'No message provided'}), 400

        # Append user input to conversation history
        messages.append({"role": "user", "content": user_input})

        if user_input.lower() in ["exit", "quit", "plan"]:
            print("Running full pipeline...")
            try:
                subprocess.run([sys.executable, "runpipeline.py"], check=True)
                final_message = "Thanks for chatting! Your itinerary has been created. 🎉"
                
                # Send the itinerary.pdf file to the front end
                return send_file("itinerary.pdf", as_attachment=True, mimetype='application/pdf')
            except Exception as e:
                print("Pipeline error:", str(e))
                return jsonify({"message": "Oops! Something went wrong while generating the itinerary.", "error": str(e)}), 500

        # Send to Ollama
        response = requests.post("http://localhost:11434/api/chat", json={
            "model": "llama3.1",
            "stream": False,
            "messages": messages
        })

        response_json = response.json()
        assistant_reply = response_json["message"]["content"]

        # Add bot response to history
        messages.append({"role": "assistant", "content": assistant_reply})

        # Save conversation history
        with open("chat_history.json", "w", encoding="utf-8") as f:
            json.dump(messages, f, ensure_ascii=False, indent=2)

        return jsonify({"reply": assistant_reply})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
