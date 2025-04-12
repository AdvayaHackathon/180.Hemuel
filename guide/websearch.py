from scrapegraphai.graphs import SearchLinkGraph
import json
from scrapegraphai.graphs import SearchGraph
from scrapegraphai.utils import prettify_exec_info

with open("preferences.json", "r") as file:
    preferences_data = json.load(file)
    user_preferences = preferences_data["content"]

custom_query = f"""Find around 10
 tourist attractions and places matching these preferences: {user_preferences} 
 Check for Hotels and resorts they can stay in too along with their pricing.
List them in the format of 
Name:
Location
Description:
Activity:
"""

# Define the configuration for the graph
# This dictionary sets up the parameters for the SearchLinkGraph instance.
graph_config = {
    # Configuration for the language model (LLM)
    "llm": {
        "model": "ollama/llama3.1",  # Specify the LLM model to use
        "temperature": 0.3,  # Set the temperature for deterministic outputs
        "format": "json",  # Output format explicitly required by Ollama
        "base_url": "http://localhost:11434",  # Base URL for the LLM API
    },
    "verbose": True,  # Enable verbose logging for debugging or detailed execution
    "headless": False,  # Run the scraper in a non-headless mode (browser visible)
    "filter_config": {  # Configuration for filtering URLs during scraping
        "diff_domain_filter": True,  # Filter out links from different domains
    },
}

# Create the SearchLinkGraph instance and configure it for scraping
search_graph = SearchGraph(
    prompt=f"{custom_query}",
    config=graph_config
)

# ✅ Manually specify the search query
search_graph.search_query = f"{custom_query} site:incredibleindia.gov.in, https://www.lonelyplanet.com/india"

# Run the scraper and print the result
result = search_graph.run()
print(result)

with open("scrape_result.json", "w", encoding="utf-8") as outfile:
    json.dump(result, outfile, ensure_ascii=False, indent=4)

# Retrieve and prettify graph execution information for debugging
graph_exec_info = search_graph.get_execution_info()
print(prettify_exec_info(graph_exec_info))

