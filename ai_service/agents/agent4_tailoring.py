"""
AGENT 4 — Resume Tailoring Agent (Core Intelligence)
======================================================
Purpose:
    The core intelligence agent. Performs controlled, non-destructive resume optimization.
    Receives outputs from Agents 1, 2, and 3 and generates a precise Modification Plan.

Safety Architecture:
    PASS 1 — Data Protection: Name, email, phone, LinkedIn, GitHub, Portfolio NEVER touched.
    PASS 2 — Justification: Every change must match a JD requirement or gap finding.
    PASS 3 — Authenticity: Never invent experience, projects, or skills.
    PYTHON GUARD — Hard backend assertion that vererts any protected field changes.

Output:
    Modified structured resume + tailoring_log (changes made, rejected, and why)
"""

import copy
import json
import re
from crew.resume_crew import SystemLogger


# ─── PROTECTED PERSONAL FIELDS — NEVER MODIFY ────────────────────────────────
PROTECTED_FIELDS = ["fullName", "email", "phone", "linkedin", "github", "portfolio", "location"]


TAILORING_PROMPT = """
You are a Senior AI Career Strategist and ATS Optimization Expert.

Your mission is to produce a precise, safe Modification Plan to optimize a resume for a specific job.

You must:
- Think like a careful professional resume editor, NOT a resume generator.
- Prefer minimal, intelligent changes over aggressive rewriting.
- NEVER invent experience, projects, skills, or certifications.
- NEVER modify personal info (Name, Email, Phone, LinkedIn, GitHub, Portfolio).

────────────────────────────────────
INPUT DATA
────────────────────────────────────
RESUME (Full Structure):
{resume_text}

JOB DESCRIPTION ANALYSIS:
Role: {role_title}
Required Skills: {required_skills}
ATS Keywords: {ats_keywords}
Tools & Frameworks: {tools_and_frameworks}
Experience Signals: {experience_signals}

SKILL GAP SUMMARY:
Missing Skills (High Priority): {missing_high}
Missing Skills (Medium Priority): {missing_medium}
Matched Skills: {matched_count} skills already match
Overall Match Score: {match_score}%

────────────────────────────────────
YOUR INTERNAL REASONING PROCESS
────────────────────────────────────
Before outputting, internally confirm:

PASS 1 — DATA SAFETY: Name, email, phone, LinkedIn, GitHub, Portfolio are UNTOUCHED.
PASS 2 — JUSTIFICATION: Every change matches a JD requirement, gap finding, or keyword.
PASS 3 — AUTHENTICITY: No invented experience, projects, or skills the candidate never used.

────────────────────────────────────
REWRITE RULES
────────────────────────────────────
PROFILE SUMMARY:
- Rewrite to align with target role and insert ATS keywords naturally.
- Preserve the candidate's experience level and factual claims.

SKILLS:
- ADD only skills from the "Missing Skills" list above that the candidate can reasonably claim (evidenced in projects or experience).
- REMOVE skills only if irrelevant to the role.
- JUSTIFY every addition and removal.

PROJECTS:
- MODIFY description to emphasize problem-solving, impact, and JD-relevant technologies.
- PRESERVE project name, GitHub links, and original tech stacks exactly.
- REMOVE only if completely unrelated (e.g., simple calculator for a senior ML role).

EXPERIENCE:
- Rewrite bullet points to incorporate JD keywords and STAR method.
- Keep all factual claims intact.

CERTIFICATIONS & ACHIEVEMENTS:
- Reorder to highlight JD-relevant items first. Rephrase for clarity if needed.
- NEVER fabricate.

────────────────────────────────────
OUTPUT FORMAT (VALID JSON ONLY)
────────────────────────────────────
{{
  "rewrite_plan": {{
    "jd_core_requirements": ["list", "of", "top", "requirements"],
    "candidate_gap_analysis": "1-2 sentence summary of the gap",
    "pass_1_safety_check_passed": true,
    "pass_2_justification_check_passed": true,
    "pass_3_authenticity_check_passed": true,
    "sections_to_modify": ["Summary", "Skills", "Projects"],
    "sections_to_keep_unchanged": ["Education", "Certifications"]
  }},
  "modifications": {{
    "tailoring_strategy": "1-2 sentence overview of your plan",
    "new_summary": "The rewritten, JD-tailored profile summary.",
    "skills_update": {{
      "technical_skills_to_add": [{{"name": "Kubernetes", "reason": "Required by JD, evidenced in Docker project"}}],
      "technical_skills_to_remove": [{{"name": "COBOL", "reason": "No relevance to modern web role"}}],
      "soft_skills_to_add": [{{"name": "Agile", "reason": "Explicitly required by employer"}}]
    }},
    "experience_updates": [
      {{
        "company": "Company Name from Resume",
        "new_description": "Rewritten bullet 1.\\nRewritten bullet 2."
      }}
    ],
    "projects_to_keep": [
      {{
        "original_name": "Project Name (exact match from resume)",
        "action": "modify",
        "reasoning": "Core tech stack aligns with JD requirements",
        "new_description": "Rewritten description emphasizing impact and JD relevance.",
        "additional_technologies": []
      }}
    ]
  }}
}}

CRITICAL RULES:
1. Return ONLY valid JSON — no markdown, no preamble.
2. "action" for projects must be "modify" or "remove" ONLY.
3. Use \\n for bullet point line breaks.
4. ONLY reference companies and projects that exist in the RESUME above.
"""


class TailoringAgent:
    """
    Agent 4: The Core Resume Tailoring Agent.
    Runs the 3-pass safety loop and applies controlled modifications.
    """

    AGENT_NAME = "Agent4:TailoringAgent"

    # Protected personal info fields - hard-coded safeguard
    PROTECTED_FIELDS = PROTECTED_FIELDS

    def __init__(self, model):
        self.model = model

    def run(self, parsed_resume: dict, jd_analysis: dict, skill_gap: dict) -> dict:
        """
        Core tailoring logic. Takes parsed resume + JD analysis + skill gap.
        Returns a modified resume with a tailoring log.
        """
        import time
        start_time = time.time()

        SystemLogger.working_agent("ResumeEnhancer", "Running controlled resume tailoring — 3-pass safety validation active")

        # Deep copy to ensure we never mutate the original
        tailored = copy.deepcopy(parsed_resume)

        # Build the prompt with all context
        prompt = self._build_prompt(tailored, jd_analysis, skill_gap)

        SystemLogger.agent_action("Generating Rewrite Plan and Modification Instructions")

        try:
            safety_settings = [
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
            ]
            response = self.model.generate_content(prompt, safety_settings=safety_settings)

            if not response.text:
                SystemLogger.error(self.AGENT_NAME, "Empty AI response — returning original resume")
                return tailored

            parsed_json = self._extract_json(response.text)
            if not parsed_json:
                SystemLogger.warn(self.AGENT_NAME, "JSON parse failed — returning original resume")
                return tailored

            # Extract the plan and modifications
            rewrite_plan = parsed_json.get("rewrite_plan", {})
            mods = parsed_json.get("modifications", parsed_json)  # Fallback if no nesting

            # Log the internal reasoning
            self._log_rewrite_plan(rewrite_plan)

            # Apply all modifications
            tailored = self._apply_modifications(tailored, mods)

            # PYTHON-LEVEL HARD GUARD — Pass 1: Data Safety Enforcement
            tailored = self._enforce_data_safety(tailored, parsed_resume)

            # Attach the tailoring log for Agent 5
            tailored["_tailoring_log"] = {
                "rewritePlan": rewrite_plan,
                "strategy": mods.get("tailoring_strategy", ""),
                "skillsAdded": mods.get("skills_update", {}).get("technical_skills_to_add", []),
                "skillsRemoved": mods.get("skills_update", {}).get("technical_skills_to_remove", []),
                "projectsModified": [p for p in mods.get("projects_to_keep", []) if p.get("action") == "modify"],
                "projectsRemoved": [p for p in mods.get("projects_to_keep", []) if p.get("action") == "remove"],
            }

            elapsed = time.time() - start_time
            SystemLogger.agent_complete(
                f"Tailoring complete in {elapsed:.2f}s — "
                f"{len(tailored['_tailoring_log']['skillsAdded'])} skills added, "
                f"{len(tailored['_tailoring_log']['projectsModified'])} projects enhanced"
            )
            return tailored

        except Exception as e:
            SystemLogger.error(self.AGENT_NAME, f"Tailoring failed: {str(e)}")
            return parsed_resume

    def _build_prompt(self, resume: dict, jd: dict, gap: dict) -> str:
        """Build the full prompt string with all context injected."""
        resume_text = json.dumps({
            "personalInfo": {k: v for k, v in resume.get("personalInfo", {}).items() if k not in ["summary"]},
            "profileSummary": resume.get("profileSummary", ""),
            "skills": resume.get("skills", {}),
            "experience": resume.get("experience", []),
            "projects": resume.get("projects", []),
            "achievements": resume.get("achievements", []),
        }, indent=2)

        missing_high = [s["name"] for s in gap.get("missingSkills", []) if s.get("priority") == "high"]
        missing_medium = [s["name"] for s in gap.get("missingSkills", []) if s.get("priority") == "medium"]

        return TAILORING_PROMPT.format(
            resume_text=resume_text[:5000],  # Token budget
            role_title=jd.get("roleTitle", "the target role"),
            required_skills=", ".join(jd.get("requiredSkills", [])[:15]),
            ats_keywords=", ".join(jd.get("atsKeywords", [])[:20]),
            tools_and_frameworks=", ".join(jd.get("tools", []) + jd.get("frameworks", []))[:200],
            experience_signals=", ".join(jd.get("experienceSignals", [])[:5]),
            missing_high=", ".join(missing_high[:8]) or "None",
            missing_medium=", ".join(missing_medium[:8]) or "None",
            matched_count=len(gap.get("matchedSkills", [])),
            match_score=gap.get("overallMatchScore", 0),
        )

    def _apply_modifications(self, tailored: dict, mods: dict) -> dict:
        """Apply all modifications from the AI's plan."""

        # 1. Profile Summary
        new_summary = mods.get("new_summary", "")
        if new_summary and new_summary.strip():
            if "personalInfo" not in tailored:
                tailored["personalInfo"] = {}
            tailored["personalInfo"]["summary"] = new_summary
            tailored["profileSummary"] = new_summary

        # 2. Skills
        skills_update = mods.get("skills_update", {})
        if "skills" not in tailored:
            tailored["skills"] = {"technical": [], "soft": []}

        tech_skills = list(tailored["skills"].get("technical", []))
        tech_skill_lower = {s.lower(): s for s in tech_skills}  # lowercase → original

        # Remove skills
        for to_remove in skills_update.get("technical_skills_to_remove", []):
            name = to_remove.get("name", "")
            if name.lower() in tech_skill_lower:
                orig = tech_skill_lower[name.lower()]
                if orig in tech_skills:
                    tech_skills.remove(orig)
                    SystemLogger.info(f"Skills", f"Removed: '{name}' — {to_remove.get('reason', '')}")

        # Add skills
        tech_lower_set = {s.lower() for s in tech_skills}
        for to_add in skills_update.get("technical_skills_to_add", []):
            name = to_add.get("name", "")
            if name and name.lower() not in tech_lower_set:
                tech_skills.append(name)
                tech_lower_set.add(name.lower())
                SystemLogger.info("Skills", f"Added: '{name}' — {to_add.get('reason', '')}")

        tailored["skills"]["technical"] = tech_skills

        # Soft skills
        soft_skills = list(tailored["skills"].get("soft", []))
        soft_lower_set = {s.lower() for s in soft_skills}
        for to_add in skills_update.get("soft_skills_to_add", []):
            name = to_add.get("name", "")
            if name and name.lower() not in soft_lower_set:
                soft_skills.append(name)
                soft_lower_set.add(name.lower())
        tailored["skills"]["soft"] = soft_skills

        # 3. Experience
        for update in mods.get("experience_updates", []):
            company_match = update.get("company", "").lower()
            for i, exp in enumerate(tailored.get("experience", [])):
                if company_match in exp.get("company", "").lower():
                    tailored["experience"][i]["description"] = update.get("new_description", exp.get("description"))

        # 4. Projects
        proj_instructions = mods.get("projects_to_keep", [])
        if proj_instructions and "projects" in tailored:
            final_projects = []
            for proj in tailored["projects"]:
                proj_name_lower = proj.get("name", "").lower()
                instruction = next(
                    (p for p in proj_instructions if p.get("original_name", "").lower() == proj_name_lower),
                    None
                )
                if instruction:
                    if instruction.get("action") == "remove":
                        SystemLogger.info("Projects", f"Removed: '{proj.get('name')}' — {instruction.get('reasoning', '')}")
                        continue  # Skip = remove
                    elif instruction.get("action") == "modify":
                        # Update description — preserve title, GitHub link, and tech stack
                        new_desc = instruction.get("new_description", "")
                        if new_desc:
                            proj["description"] = new_desc
                        # Optionally expand tech list (never replace)
                        extra_techs = instruction.get("additional_technologies", [])
                        if extra_techs:
                            old_techs = proj.get("technologies", "")
                            if isinstance(old_techs, str):
                                proj["technologies"] = f"{old_techs}, {', '.join(extra_techs)}".strip(", ")
                            elif isinstance(old_techs, list):
                                proj["technologies"] = list(set(old_techs + extra_techs))
                final_projects.append(proj)
            tailored["projects"] = final_projects

        return tailored

    def _enforce_data_safety(self, tailored: dict, original: dict) -> dict:
        """
        PYTHON-LEVEL GUARD: Enforce Pass 1 — Data Safety.
        If AI attempted to modify any protected personal info field, revert it.
        """
        issues_found = False
        for field in self.PROTECTED_FIELDS:
            original_val = original.get("personalInfo", {}).get(field)
            tailored_val = tailored.get("personalInfo", {}).get(field)
            if original_val != tailored_val:
                SystemLogger.error(
                    "DataSafetyGuard",
                    f"BLOCKED: AI attempted to change protected field '{field}'. Reverting."
                )
                if "personalInfo" not in tailored:
                    tailored["personalInfo"] = {}
                tailored["personalInfo"][field] = original_val
                issues_found = True

        if not issues_found:
            SystemLogger.ok("DataSafetyGuard", "PASS 1 VERIFIED: All protected fields intact ✓")

        return tailored

    def _log_rewrite_plan(self, plan: dict):
        """Log the AI's internal reasoning to the console."""
        if not plan:
            return
        SystemLogger.agent_thinking(f"Gap Analysis: {plan.get('candidate_gap_analysis', 'N/A')}")
        p1 = plan.get("pass_1_safety_check_passed", False)
        p2 = plan.get("pass_2_justification_check_passed", False)
        p3 = plan.get("pass_3_authenticity_check_passed", False)

        if p1 and p2 and p3:
            SystemLogger.ok("SelfCheck", "AI Self-Checks PASSED: Pass 1 (Safety) ✓ | Pass 2 (Justification) ✓ | Pass 3 (Authenticity) ✓")
        else:
            SystemLogger.warn(
                "SelfCheck",
                f"AI raised internal flag — P1:{p1} P2:{p2} P3:{p3}. Proceeding with caution."
            )

    def _extract_json(self, text: str) -> dict:
        """Robust JSON extraction from AI response."""
        text = text.strip()
        # Remove markdown fences
        text = re.sub(r'^```(?:json)?\s*', '', text, flags=re.MULTILINE)
        text = re.sub(r'\s*```$', '', text, flags=re.MULTILINE)
        match = re.search(r'\{[\s\S]*\}', text)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            return {}
