"""
AGENT 1 — Resume Parser Agent
==============================
Purpose:
    Validate, normalize, and deeply understand every field of the input resume.
    This is the first stage of the tailoring pipeline.

Responsibilities:
    - Accept the structured resume dict (from the resume editor)
    - Validate and normalize all sections
    - Preserve ALL personal info, links, and raw data untouched
    - Return a clean, enriched ParsedResume object for downstream agents

Output:
    {
        personalInfo, profileSummary, skills, projects,
        education, certifications, achievements,
        _meta: { technologiesDetected, totalSkills, hasGitHub, ... }
    }
"""

import copy
from crew.resume_crew import SystemLogger


class ResumeParserAgent:
    """
    Agent 1: Resume Parser
    Normalizes and validates an existing resume dict from the editor.
    Does NOT modify any content — purely structural normalization.
    """

    AGENT_NAME = "Agent1:ResumeParser"

    def __init__(self, model=None):
        self.model = model  # Not needed for this agent but kept for interface consistency

    def run(self, resume_data: dict) -> dict:
        """
        Parse and normalize a structured resume dict.
        Returns a validated, enriched resume with metadata.
        """
        SystemLogger.working_agent("ResumeParser", "Validating and normalizing full resume structure")

        # Deep copy to prevent any mutation of original
        parsed = copy.deepcopy(resume_data)

        # Normalize each section with safe defaults
        SystemLogger.agent_action("Extracting and normalizing all resume sections")
        parsed["personalInfo"] = self._normalize_personal_info(parsed.get("personalInfo", {}))
        parsed["profileSummary"] = parsed.get("profileSummary") or parsed.get("personalInfo", {}).get("summary", "")
        parsed["skills"] = self._normalize_skills(parsed.get("skills", {}))
        parsed["projects"] = self._normalize_list(parsed.get("projects", []))
        parsed["education"] = self._normalize_list(parsed.get("education", []))
        parsed["experience"] = self._normalize_list(parsed.get("experience", []))
        parsed["certifications"] = self._normalize_list(parsed.get("certifications", []))
        parsed["achievements"] = self._normalize_list(parsed.get("achievements", []))

        # Build metadata for downstream agents
        parsed["_meta"] = self._build_metadata(parsed)

        SystemLogger.agent_complete(
            f"Parsed resume for '{parsed['personalInfo'].get('fullName', 'Unknown')}' — "
            f"{parsed['_meta']['totalSkills']} skills, {parsed['_meta']['totalProjects']} projects"
        )
        return parsed

    def _normalize_personal_info(self, info: dict) -> dict:
        """Ensure all personal info fields exist. Never modify existing values."""
        defaults = {
            "fullName": "", "email": "", "phone": "",
            "linkedin": "", "github": "", "portfolio": "",
            "location": "", "summary": ""
        }
        # Only fill in missing keys — never overwrite existing
        for key, default in defaults.items():
            if key not in info:
                info[key] = default
        return info

    def _normalize_skills(self, skills) -> dict:
        """Normalize skills to consistent dict format."""
        if isinstance(skills, list):
            return {"technical": skills, "soft": [], "languages": []}
        if isinstance(skills, dict):
            return {
                "technical": skills.get("technical", []),
                "soft": skills.get("soft", []),
                "languages": skills.get("languages", [])
            }
        return {"technical": [], "soft": [], "languages": []}

    def _normalize_list(self, items) -> list:
        """Ensure section is a list."""
        if isinstance(items, list):
            return items
        return []

    def _build_metadata(self, parsed: dict) -> dict:
        """Build metadata summary for downstream agents."""
        tech_skills = parsed["skills"].get("technical", [])
        soft_skills = parsed["skills"].get("soft", [])
        projects = parsed["projects"]

        # Detect all technologies mentioned across projects
        technologies_detected = set(tech_skills)
        for proj in projects:
            techs = proj.get("technologies", "") or proj.get("techStack", "")
            if isinstance(techs, str):
                for t in techs.split(","):
                    technologies_detected.add(t.strip())
            elif isinstance(techs, list):
                technologies_detected.update(techs)

        return {
            "totalSkills": len(tech_skills) + len(soft_skills),
            "totalProjects": len(projects),
            "totalCertifications": len(parsed.get("certifications", [])),
            "technologiesDetected": list(technologies_detected),
            "hasGitHub": bool(parsed["personalInfo"].get("github")),
            "hasLinkedIn": bool(parsed["personalInfo"].get("linkedin")),
            "hasPortfolio": bool(parsed["personalInfo"].get("portfolio")),
            "hasExperience": len(parsed.get("experience", [])) > 0,
        }
