import json
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib import colors
from reportlab.lib.units import inch
import re
# Load itinerary data
with open("final_itinerary.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# Extract itinerary text
itinerary_text = data.get("itinerary", "")
if isinstance(itinerary_text, dict):
    itinerary_text = itinerary_text.get("stdout", "")

# Initialize PDF document
doc = SimpleDocTemplate(
    "itinerary.pdf",
    pagesize=A4,
    rightMargin=50,
    leftMargin=50, 
    topMargin=50,
    bottomMargin=50,
)

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="CenterTitle", fontSize=20, leading=24, alignment=TA_CENTER, spaceAfter=20))
styles.add(ParagraphStyle(name="SectionHeader", fontSize=14, leading=18, textColor=colors.HexColor("#0a84ff"), spaceAfter=12, spaceBefore=12))
styles.add(ParagraphStyle(name="ItineraryText", fontSize=11, leading=16, alignment=TA_LEFT))

elements = []

# Add title
elements.append(Paragraph("GuideBot's Plan For You !", styles["CenterTitle"]))
elements.append(Spacer(1, 0.2 * inch))

# Break into sections by common headers
sections = ["Morning", "Afternoon", "Evening", "Night"]
current_section = None


def clean_markdown(text):
    text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)  # Remove bold
    text = re.sub(r'\*(.*?)\*', r'\1', text)      # Remove italic
    text = re.sub(r'_(.*?)_', r'\1', text)        # Remove underline
    return text

for line in itinerary_text.splitlines():
    line = clean_markdown(line.strip())
    if not line:
        continue

    # Detect section headers
    found_section = False
    for section in sections:
        if line.lower().startswith(section.lower()):
            current_section = section
            elements.append(Paragraph(f"☀️ {section}", styles["SectionHeader"]))
            found_section = True
            break

    # If it's not a section header, treat it as body text
    if not found_section:
        elements.append(Paragraph(line, styles["ItineraryText"]))
        elements.append(Spacer(1, 0.1 * inch))

# Add a little thank you at the end
elements.append(Spacer(1, 0.5 * inch))
elements.append(Paragraph("🎒 Have an amazing journey! Safe travels. 🌍", styles["CenterTitle"]))

# Build the PDF
doc.build(elements)
print("✅ itinerary.pdf created successfully!")
