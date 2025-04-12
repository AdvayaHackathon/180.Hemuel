import json
import subprocess

# Load preferences from preferences.json
with open("preferences.json", "r") as f:
    preferences = json.load(f)

with open("scrape_result.json", "r") as f:
    webdata = json.load(f)

# Extract values
interests = preferences.get("content", "")

# Build prompt for the LLM
prompt = f"""
You are a GuideBot travel expert AI who creates beautiful, personalized itineraries. You are friendly and enthusiastic and love to
help people explore new places as well as learn more about the places they are in. Where you can give them information about the
average cost everything would come up to and make sure to show it in Indian Rupees.

Here is the user’s profile:
- Interests: {interests}

Use this as extra context:
- Webdata: {webdata}


Please create a friendly and detailed itinerary for this person. 
Make it time-managed, include descriptions of each place and wherever possible talk about
the cultural and historical significance of the location, and ensure it fits within the time limit. remember this is the final itinary
so dont ask for further assistance
"""

# Run LLaMA 3.1 via Ollama
result = subprocess.run(
    ["ollama", "run", "llama3.1", prompt],
    capture_output=True,
    text=True
)

with open("final_itinerary.json", "w", encoding="utf-8") as f:
    json.dump({"itinerary": result.stdout}, f, ensure_ascii=False, indent=2)

