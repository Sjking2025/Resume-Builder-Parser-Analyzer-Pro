"""
AGENT 3 — Skill Gap Agent
===========================
Purpose:
    Compare resume skills against JD requirements and generate a structured gap map.
    This agent is fast — it runs locally without an LLM call.

Responsibilities:
    - Identify matched skills (resume ∩ JD)
    - Identify missing skills (JD - resume)
    - Identify weak skills (partial matches)
    - Rank missing skills by priority (required > preferred)
    - Flag recommended additions for Agent 4

Output:
    {
        matchedSkills: [{name, confidence}],
        missingSkills: [{name, priority, source}],
        weakSkills: [{name, currentLevel, requiredLevel}],
        recommendedSkillsToAdd: [],
        overallMatchScore: 0-100
    }
"""

from crew.resume_crew import SystemLogger


class SkillGapAgent:
    """
    Agent 3: Skill Gap Mapper
    Pure local logic — no LLM call needed.
    """

    AGENT_NAME = "Agent3:SkillGapMapper"

    def __init__(self, model=None):
        self.model = model

    def run(self, parsed_resume: dict, jd_analysis: dict) -> dict:
        """
        Compare resume skills to JD requirements.
        Returns a detailed skill gap map.
        """
        SystemLogger.working_agent("SkillAnalyzer", "Mapping resume skills against JD requirements")

        # Collect ALL skills from resume (normalize to lowercase set for matching)
        resume_tech_skills = [s.lower().strip() for s in parsed_resume.get("skills", {}).get("technical", []) if s]
        resume_soft_skills = [s.lower().strip() for s in parsed_resume.get("skills", {}).get("soft", []) if s]
        resume_all_skills = set(resume_tech_skills + resume_soft_skills)

        # Also scan projects for technology mentions
        for proj in parsed_resume.get("projects", []):
            techs = proj.get("technologies", "") or proj.get("techStack", "")
            if isinstance(techs, str):
                for t in techs.split(","):
                    resume_all_skills.add(t.strip().lower())
            elif isinstance(techs, list):
                resume_all_skills.update(t.lower() for t in techs)

        # Gather JD skills
        required_skills = jd_analysis.get("requiredSkills", [])
        preferred_skills = jd_analysis.get("preferredSkills", [])
        tools = jd_analysis.get("tools", [])
        frameworks = jd_analysis.get("frameworks", [])
        all_jd_skills = required_skills + preferred_skills + tools + frameworks

        SystemLogger.agent_action(
            f"Comparing {len(resume_all_skills)} resume skills against {len(all_jd_skills)} JD requirements"
        )

        matched = []
        missing = []
        weak = []
        recommended_to_add = []

        for skill in required_skills:
            skill_lower = skill.lower().strip()
            if skill_lower in resume_all_skills:
                matched.append({"name": skill, "confidence": "strong", "source": "required"})
            elif self._partial_match(skill_lower, resume_all_skills):
                weak.append({"name": skill, "currentLevel": "partial", "requiredLevel": "proficient"})
            else:
                missing.append({"name": skill, "priority": "high", "source": "required"})
                recommended_to_add.append(skill)

        for skill in preferred_skills + tools + frameworks:
            skill_lower = skill.lower().strip()
            if skill_lower in resume_all_skills:
                matched.append({"name": skill, "confidence": "moderate", "source": "preferred"})
            elif self._partial_match(skill_lower, resume_all_skills):
                weak.append({"name": skill, "currentLevel": "partial", "requiredLevel": "familiar"})
            else:
                missing.append({"name": skill, "priority": "medium", "source": "preferred"})

        # Compute overall match score
        total_jd = len(all_jd_skills) or 1
        match_score = int((len(matched) / total_jd) * 100)

        result = {
            "matchedSkills": matched,
            "missingSkills": missing,
            "weakSkills": weak,
            "recommendedSkillsToAdd": recommended_to_add,
            "overallMatchScore": match_score,
        }

        SystemLogger.agent_complete(
            f"Skill gap mapped — Match Score: {match_score}% | "
            f"Matched: {len(matched)} | Missing: {len(missing)} | Weak: {len(weak)}"
        )
        return result

    def _partial_match(self, skill: str, resume_skills: set) -> bool:
        """Check if any resume skill contains or overlaps with the target skill."""
        for rs in resume_skills:
            if skill in rs or rs in skill:
                return True
        return False
