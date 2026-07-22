"""
PDF Text Extraction Utilities
"""

import io
from typing import Optional


def extract_text_from_pdf(pdf_content: bytes) -> Optional[str]:
    """Extract text from PDF file content."""
    try:
        from PyPDF2 import PdfReader
        pdf_file = io.BytesIO(pdf_content)
        reader = PdfReader(pdf_file)
        
        text_parts = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                text_parts.append(text)
        
        return "\n\n".join(text_parts)
    except Exception as e:
        print(f"Error extracting PDF text: {e}")
        return None


def extract_text_from_docx(docx_content: bytes) -> Optional[str]:
    """Extract text from DOCX file content."""
    try:
        import docx
        doc = docx.Document(io.BytesIO(docx_content))
        text_parts = [para.text for para in doc.paragraphs if para.text]
        return "\n\n".join(text_parts)
    except Exception as e:
        print(f"Error extracting DOCX text: {e}")
        return None

def resume_data_to_text(resume_data: dict) -> str:
    """Convert resume/CV data dict to plain text for analysis."""
    parts = []
    
    # Personal info
    pi = resume_data.get("personalInfo", {})
    if pi.get("fullName"):
        parts.append(f"Name: {pi['fullName']}")
    if pi.get("email"):
        parts.append(f"Email: {pi['email']}")
    if pi.get("summary"):
        parts.append(f"\nSummary:\n{pi['summary']}")
    
    # Experience
    experience = resume_data.get("experience", [])
    if experience:
        parts.append("\nExperience:")
        for exp in experience:
            parts.append(f"- {exp.get('title', '')} at {exp.get('company', '')}")
            if exp.get("description"):
                parts.append(f"  {exp['description']}")
    
    # Education
    education = resume_data.get("education", [])
    if education:
        parts.append("\nEducation:")
        for edu in education:
            parts.append(f"- {edu.get('degree', '')} in {edu.get('field', '')} from {edu.get('institution', '')}")
    
    # Skills
    skills = resume_data.get("skills", {})
    if skills.get("technical"):
        parts.append(f"\nTechnical Skills: {', '.join(skills['technical'])}")
    if skills.get("soft"):
        parts.append(f"Soft Skills: {', '.join(skills['soft'])}")
        
    # Projects
    projects = resume_data.get("projects", [])
    if projects:
        parts.append("\nProjects:")
        for proj in projects:
            parts.append(f"- {proj.get('name', '')}")
            if proj.get("description"):
                parts.append(f"  {proj['description']}")
                
    # Achievements
    achievements = resume_data.get("achievements", [])
    if achievements:
        parts.append("\nAchievements:")
        for ach in achievements:
            parts.append(f"- {ach.get('title', '')}")
            if ach.get("description"):
                parts.append(f"  {ach['description']}")
                
    # CV Sections
    cv_sections = [
        "publications", "research", "certifications", "awards", "patents",
        "conferences", "workshops", "internships", "leadership", "volunteer",
        "interests", "references"
    ]
    for section in cv_sections:
        items = resume_data.get(section, [])
        if items:
            parts.append(f"\n{section.capitalize()}:")
            for item in items:
                title = item.get("title") or item.get("name") or "Item"
                parts.append(f"- {title}")
                if item.get("description"):
                    parts.append(f"  {item['description']}")
                    
    # Custom Sections
    custom_sections = resume_data.get("customSections", [])
    for section in custom_sections:
        if section.get("title") and section.get("items"):
            parts.append(f"\n{section['title']}:")
            for item in section["items"]:
                parts.append(f"- {item.get('title', '')}")
                if item.get("description"):
                    parts.append(f"  {item['description']}")
    
    return "\n".join(parts)
