import requests
import time
import sqlite3
import json
# Set your system prompt once
messages = [
    {
        "role": "system",
        "content": (
                "You are GuideBot, a helpful and enthusiastic travel guide. Speak in a warm, friendly tone. Your job is to help "
                "attain information from users, make sure to get information "
                "from the user such as they kind of places they like to see, for example historic monuments, ask the user what kind of "
                "weather they prefer, what the budget is and what kind of activities they like to do, ask them the kind of food they like to eat as well and "
                "try not to list out all the questions you want to ask them but instead ease"
                "into the questions by having a conversation with them like a friend would. If you have attained sufficient information and context"
                "ask the user to type exit or plan."
        )
    },
]

print("Hey there!!  Ready to go exploring? Tell me where you're headed or what kind of adventure you're in the mood for!")
print("When you're satisfied make sure to type 'exit' to quit\n")

while True:
    user_input = input("You: ")
    
    if user_input.lower() in ["exit", "quit","plan"]:
        break

    # Add the user's message to the history
    messages.append({
        "role": "user",
        "content": user_input
    })

    # Send to Ollama
    response = requests.post("http://localhost:11434/api/chat", json={
        "model": "llama3.1",  # Change if you're using another model
        "stream": False,
        "messages": messages
    })

    # Get assistant's message
    response_json = response.json()
    assistant_reply = response_json["message"]["content"]

    # Print the reply
    print(f"GuideBot: {assistant_reply}\n")

    # Add assistant's message to the history
    messages.append({
        "role": "assistant",
        "content": assistant_reply
    })

with open("chat_history.json", "w", encoding="utf-8") as f:
    json.dump(messages, f, ensure_ascii=False, indent=2)