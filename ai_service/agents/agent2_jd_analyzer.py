"""
AGENT 2 — Job Description Analyzer Agent
==========================================
Purpose:
    Perform a deep, structured analysis of the Job Description text.
    Extract every relevant signal to inform tailoring decisions.

Responsibilities:
    - Extract required and preferred technical skills
    - Identify tools and frameworks
    - Extract ATS keywords
    - Identify soft skill expectations
    - Extract experience signals (seniority, years, domain)

Output:
    {
        requiredSkills: [],
        preferredSkills: [],
        tools: [],
        frameworks: [],
        softSkills: [],
        atsKeywords: [],
        experienceSignals: [],
        roleTitle: "",
        companyCulture: ""
    }
"""

import json
from crew.resume_crew import SystemLogger


JD_ANALYSIS_PROMPT = """
You are a highly skilled ATS Strategist and Job Description Analyst.

Analyze the following Job Description deeply and extract all important signals.

JOB DESCRIPTION:
{job_description}

OUTPUT FORMAT (Return valid JSON only):
{{
  "requiredSkills": ["Python", "React", "AWS"],
  "preferredSkills": ["Docker", "Kubernetes"],
  "tools": ["JIRA", "Figma", "GitHub"],
  "frameworks": ["FastAPI", "Next.js", "TailwindCSS"],
  "softSkills": ["Communication", "Problem Solving", "Team Leadership"],
  "atsKeywords": ["microservices", "RESTful APIs", "CI/CD", "Agile"],
  "experienceSignals": ["3+ years", "backend development", "cloud infrastructure"],
  "roleTitle": "Senior Full Stack Developer",
  "companyCulture": "Fast-paced startup environment, Agile-first"
}}

RULES:
1. Return ONLY valid JSON. No markdown, no explanation.
2. Use EXACT wording from the JD for atsKeywords — these are what ATS systems scan for.
3. Separate "requiredSkills" (mandatory) from "preferredSkills" (nice-to-have).
4. "tools" means specific software tools (JIRA, Figma). "frameworks" means dev frameworks.
"""


class JDAnalyzerAgent:
    """
    Agent 2: Job Description Analyzer
    Uses LLM to extract structured signals from raw JD text.
    """

    AGENT_NAME = "Agent2:JDAnalyzer"

    def __init__(self, model):
        self.model = model

    def run(self, job_description: str) -> dict:
        """
        Analyze the job description and return a structured JD analysis.
        """
        SystemLogger.working_agent("ATSEngine", "Performing deep JD analysis and ATS keyword extraction")

        if not job_description or not job_description.strip():
            SystemLogger.warn(self.AGENT_NAME, "Empty JD provided — returning empty analysis")
            return self._empty_analysis()

        SystemLogger.agent_action("Extracting required skills, ATS keywords, and experience signals from JD")

        prompt = JD_ANALYSIS_PROMPT.format(job_description=job_description[:4000])  # Token budget

        try:
            safety_settings = [
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
            ]
            response = self.model.generate_content(prompt, safety_settings=safety_settings)

            if not response.text:
                SystemLogger.error(self.AGENT_NAME, "Empty response from AI")
                return self._empty_analysis()

            analysis = self._extract_json(response.text)

            if not analysis:
                SystemLogger.warn(self.AGENT_NAME, "JSON extraction failed — returning empty analysis")
                return self._empty_analysis()

            SystemLogger.agent_complete(
                f"JD analyzed: {len(analysis.get('requiredSkills', []))} required skills, "
                f"{len(analysis.get('atsKeywords', []))} ATS keywords extracted"
            )
            return analysis

        except Exception as e:
            SystemLogger.error(self.AGENT_NAME, f"JD analysis failed: {str(e)}")
            return self._empty_analysis()

    def _extract_json(self, text: str) -> dict:
        """Extract JSON from AI response."""
        import re
        text = text.strip()
        # Try to find JSON block
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

    def _empty_analysis(self) -> dict:
        return {
            "requiredSkills": [],
            "preferredSkills": [],
            "tools": [],
            "frameworks": [],
            "softSkills": [],
            "atsKeywords": [],
            "experienceSignals": [],
            "roleTitle": "",
            "companyCulture": ""
        }
