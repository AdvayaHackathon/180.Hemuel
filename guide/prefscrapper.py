from scrapegraphai.graphs import SmartScraperGraph
from scrapegraphai.utils import prettify_exec_info
import json

# Load your chat history from file
with open("chat_history.json", "r", encoding="utf-8") as f:
    chat_data = json.load(f)

# Extract only the user messages
user_messages = "\n".join([msg["content"] for msg in chat_data if msg["role"] == "user"])

# Your Ollama config
graph_config = {
    "llm": {
        "model": "ollama/llama3.1",
        "temperature": 0.3,
        "format": "json",
        "base_url": "http://localhost:11434"
    },
    "verbose": True
}

# Prompt to extract relevant user preferences
prompt = """
From the given conversation, extract the user's preferences and give it as a short essay of the user
"""

# Build the SmartScraperGraph using the chat as the "source"
graph = SmartScraperGraph(
    prompt=prompt,
    source=user_messages,
    config=graph_config
)

# Run it
result = graph.run()
print("🎯 Extracted Preferences:")
print(json.dumps(result, indent=2))
with open("preferences.json", "w") as f:
    json.dump(result, f, indent=2)

# Optional: Get detailed info
# print(prettify_exec_info(graph.get_execution_info()))
