# run_pipeline.py
import os
import subprocess
import sys



def run_pref_scraper():
    subprocess.run([sys.executable, "prefscrapper.py"],cwd=".")

def run_web_search():
    subprocess.run([sys.executable, "websearch.py"],cwd=".")

def run_itenary_generator():
    subprocess.run([sys.executable, "itenaryplan.py"],cwd=".")
    subprocess.run([sys.executable, "generatepdf.py"],cwd=".")

def run_full_pipeline():    
    print("🔍 Scraping chat to extract preferences...")
    run_pref_scraper()
    
    print("🌐 Running web scraper with preferences...")
    run_web_search()
    
    print("📝 Generating final itinerary...")
    run_itenary_generator()

if __name__ == "__main__":
    run_full_pipeline()
