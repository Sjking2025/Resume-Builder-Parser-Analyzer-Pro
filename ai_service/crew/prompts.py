"""Prompt templates and helper functions for ResumeCrew"""

import json
import re
from typing import Optional


def extract_json(text: str) -> Optional[dict]:
    """Extract JSON object from text, handling markdown blocks."""
    try:
        if not text:
            return None
        text = re.sub(r'```json\s*', '', text)
        text = re.sub(r'```\s*', '', text)

        start = text.find('{')
        end = text.rfind('}')

        if start != -1 and end != -1:
            json_str = text[start:end + 1]
            return json.loads(json_str)
        return None
    except Exception:
        return None


def normalize_import_data(data: dict) -> dict:
    """Normalize imported data to match application schema."""
    template = {
        "personalInfo": {
            "fullName": "", "email": "", "phone": "", "location": "",
            "linkedin": "", "github": "", "portfolio": "", "summary": ""
        },
        "education": [],
        "experience": [],
        "projects": [],
        "skills": {"technical": [], "soft": [], "languages": []},
        "achievements": []
    }

    if not data:
        return template

    if "personalInfo" in data and isinstance(data["personalInfo"], dict):
        for k, v in data["personalInfo"].items():
            if k in template["personalInfo"]:
                template["personalInfo"][k] = v

    for list_field in ["education", "experience", "projects", "achievements"]:
        if list_field in data and isinstance(data[list_field], list):
            template[list_field] = data[list_field]

    if "skills" in data and isinstance(data["skills"], dict):
        for k, v in data["skills"].items():
            if k in template["skills"]:
                template["skills"][k] = v

    return template


def get_parsing_prompt(resume_text: str) -> str:
    """Generate the prompt for parsing resume text."""
    return f'''Analyze this resume and extract ALL information into JSON format.

RESUME TEXT:
{resume_text}

OUTPUT FORMAT (valid JSON only):
{{
  "personalInfo": {{
    "fullName": "name",
    "email": "email",
    "phone": "phone",
    "location": "city, state",
    "linkedin": "linkedin url or empty",
    "github": "github url or empty",
    "portfolio": "website url or empty",
    "summary": "professional summary"
  }},
  "education": [
    {{
      "degree": "degree name",
      "field": "field of study",
      "institution": "school name",
      "location": "school location",
      "graduationDate": "date",
      "gpa": "gpa or empty"
    }}
  ],
  "experience": [
    {{
      "title": "job title",
      "company": "company name",
      "location": "job location",
      "startDate": "start date",
      "endDate": "end date or empty if current",
      "current": false,
      "description": "bullet points as text"
    }}
  ],
  "projects": [
    {{
      "name": "project name",
      "technologies": "comma-separated tech",
      "description": "description",
      "link": "url or empty"
    }}
  ],
  "skills": {{
    "technical": ["skill1", "skill2"],
    "soft": ["skill1", "skill2"],
    "languages": ["language1"]
  }},
  "achievements": [
    {{
      "title": "achievement title",
      "date": "date or empty",
      "description": "description or empty"
    }}
  ]
}}

RULES:
1. Extract ALL information found
2. Use empty string "" if not found
3. Mark "current": true if job says Present/Current
4. Respond with ONLY valid JSON, no other text'''


def get_empty_template() -> dict:
    """Return empty template structure."""
    return {
        "personalInfo": {
            "fullName": "", "email": "", "phone": "", "location": "",
            "linkedin": "", "github": "", "portfolio": "", "summary": ""
        },
        "education": [],
        "experience": [],
        "projects": [],
        "skills": {"technical": [], "soft": [], "languages": []},
        "achievements": []
    }


def get_analysis_prompt(resume_text: str, job_description: Optional[str] = None) -> str:
    """Generate the 5-Agent Mega-Prompt for superior analysis."""
    jd_section = f"\n\nTARGET JOB DESCRIPTION:\n{job_description}" if job_description else ""

    return f'''
You are an orchestrator of 5 elite AI agents working together to provide a World-Class Resume Analysis.

────────────────────────────────────────────
1. AGENT ARCHITECTURE & BACKSTORIES
────────────────────────────────────────────

ACT AS THESE 5 AGENTS SEQUENTIALLY:

1. **Resume Analyst Agent ("The Resume Architect")**
   *Backstory:* Senior Executive Recruiter with 15 years at Fortune 500 companies. You identify potential and flaws in seconds.
   *Role:* Analyze structure, clarity, and seniority.

2. **ATS Optimization Agent ("The Algorithmic Gatekeeper")**
   *Backstory:* Lead Engineer who built parsing algorithms for Workday and Taleo.
   *Role:* Detect formatting, keyword density, and "unparseable" elements. Calculates the score.

3. **Job Matching Agent ("The Role Matchmaker")**
   *Backstory:* Expert Talent Acquisition Specialist. matches human potential to business needs.
   *Role:* Gap analysis. Matches skills/responsibilities to the JD (if provided).

4. **Career Coach Agent ("The Career Strategist")**
   *Backstory:* Top-tier Career Coach who guided professionals to C-suite.
   *Role:* Long-term trajectory, certifications, and high-level advice.

5. **Resume Enhancement Agent ("The Wordsmith")**
   *Backstory:* Professional Resume Writer and Editor. 
   *Role:* Rewrites passive bullet points into "Power Statements" with metrics.

────────────────────────────────────────────
2. CORE OBJECTIVES
────────────────────────────────────────────
• Analyze deeply, not superficially.
• Detect technical AND presentation weaknesses.
• No fluff. No generic praise. Be brutally honest but constructive.
• No emojis. Professional tone only.

────────────────────────────────────────────
3. INPUT DATA
────────────────────────────────────────────
RESUME CONTENT:
{resume_text}
{jd_section}

────────────────────────────────────────────
4. OUTPUT STRUCTURE (MANDATORY JSON)
────────────────────────────────────────────
You must return only valid JSON with this exact structure:

{{
  "resume_overview": "2 sentence executive summary of the profile.",

  "ats_compatibility_score": {{
      "score": 0-100,
      "explanation": "Why this score? Specific formatting or keyword reasons."
  }},

  "skill_and_keyword_match_analysis": {{
      "matched_skills": ["skill1", "skill2"],
      "missing_skills": ["missing1", "missing2"],
      "suggested_additions": ["suggestion1"]
  }},

  "experience_quality_review": {{
      "strengths": ["Strong impact in X", "Good metrics in Y"],
      "weak_areas": ["Vague description in Z", "Passive voice usage"],
      "rewrite_suggestions": [
           {{ "original": "Managed a team", "improved": "Led a cross-functional team of 5...", "reason": "Adds scope and metric" }}
      ]
  }},

  "career_growth_recommendations": {{
      "skills_to_learn_next": ["Advanced Skill A"],
      "certifications_to_consider": ["Cert B"],
      "project_ideas": ["Build X to demonstrate Y"],
      "top_prioritized_actions": ["Action 1", "Action 2", "Action 3", "Action 4", "Action 5"]
  }}
}}

RULES:
- Return ONLY valid JSON.
- Do not output markdown code blocks (```json). Just the raw JSON.
- If JD is missing, infer the target role from the resume content for matching.
'''


def get_empty_analysis() -> dict:
    """Return empty analysis structure."""
    return {
        "resume_overview": "Unable to analyze resume.",
        "ats_score": 0,
        "ats_breakdown": {},
        "ats_explanation": "Analysis failed.",
        "strengths": [],
        "weaknesses": [],
        "matched_keywords": [],
        "missing_keywords": [],
        "skill_gaps": [],
        "bullet_improvements": [],
        "career_guidance": "",
        "recommended_skills": [],
        "recommended_certifications": [],
        "project_ideas": []
    }


def get_portfolio_prompt(resume_data: dict, resume_text: str) -> str:
    """Generate the prompt for portfolio enhancement."""
    personal_info = resume_data.get("personalInfo", {})

    return f'''
You are a Portfolio Content Strategist. Transform this resume into engaging, web-optimized portfolio content.

────────────────────────────────────────────
RESUME DATA
────────────────────────────────────────────
{resume_text}

────────────────────────────────────────────
TASK
────────────────────────────────────────────
Create portfolio content that:
1. Sounds natural and engaging (not resume-speak)
2. Uses first-person perspective where appropriate
3. Highlights impact and achievements
4. Is SEO-friendly with relevant keywords
5. Appeals to potential employers/clients

────────────────────────────────────────────
OUTPUT (Valid JSON Only)
────────────────────────────────────────────
{{
  "hero": {{
    "name": "{personal_info.get('fullName', 'Your Name')}",
    "headline": "A compelling 5-8 word professional headline",
    "tagline": "A brief engaging tagline (10-15 words)",
    "ctaText": "Call-to-action button text"
  }},
  "about": {{
    "title": "About Me section title",
    "content": "2-3 paragraph engaging about me text in first person. Make it personable and professional.",
    "highlights": ["Key achievement 1", "Key achievement 2", "Key achievement 3"]
  }},
  "skills": {{
    "technical": [
      {{"name": "Skill Name", "level": 85}}
    ],
    "soft": ["Soft skill 1", "Soft skill 2"],
    "tools": ["Tool 1", "Tool 2"]
  }},
  "projects": [
    {{
      "name": "Project Name",
      "tagline": "Brief catchy tagline",
      "description": "Engaging 2-3 sentence description focusing on impact",
      "impact": "Quantified impact statement",
      "tech": ["Tech 1", "Tech 2"],
      "github": "github url or empty",
      "demo": "demo url or empty",
      "featured": true
    }}
  ],
  "experience": [
    {{
      "title": "Job Title",
      "company": "Company Name",
      "period": "Start - End",
      "description": "Engaging description of role and achievements",
      "highlights": ["Key achievement 1", "Key achievement 2"]
    }}
  ],
  "education": [
    {{
      "degree": "Degree Name",
      "institution": "School Name",
      "year": "Graduation Year",
      "highlights": ["Notable achievement"]
    }}
  ],
  "contact": {{
    "email": "{personal_info.get('email', '')}",
    "linkedin": "{personal_info.get('linkedin', '')}",
    "github": "{personal_info.get('github', '')}",
    "location": "{personal_info.get('location', '')}"
  }},
  "meta": {{
    "title": "SEO-friendly page title",
    "description": "SEO meta description (150-160 chars)",
    "keywords": ["keyword1", "keyword2"],
    "suggestedTheme": "minimal or technical",
    "colorScheme": "light or dark"
  }}
}}

RULES:
- Return ONLY valid JSON
- No markdown code blocks
- Make content engaging and personable
- For skills, estimate proficiency level 1-100 based on experience
- suggestedTheme: "technical" for developers/engineers, "minimal" for others
'''


def get_empty_portfolio(resume_data: dict) -> dict:
    """Return portfolio structure with original resume data as fallback."""
    personal_info = resume_data.get("personalInfo", {})
    skills = resume_data.get("skills", {})

    return {
        "hero": {
            "name": personal_info.get("fullName", ""),
            "headline": "Professional",
            "tagline": personal_info.get("summary", "")[:100] if personal_info.get("summary") else "",
            "ctaText": "Get In Touch"
        },
        "about": {
            "title": "About Me",
            "content": personal_info.get("summary", "Welcome to my portfolio."),
            "highlights": []
        },
        "skills": {
            "technical": [{"name": s, "level": 75} for s in skills.get("technical", [])[:10]],
            "soft": skills.get("soft", []),
            "tools": []
        },
        "projects": [
            {
                "name": p.get("name", "Project"),
                "tagline": "",
                "description": p.get("description", ""),
                "impact": "",
                "tech": p.get("technologies", "").split(",") if p.get("technologies") else [],
                "github": p.get("link", "") if "github" in p.get("link", "").lower() else "",
                "demo": p.get("link", "") if "github" not in p.get("link", "").lower() else "",
                "featured": i == 0
            }
            for i, p in enumerate(resume_data.get("projects", [])[:6])
        ],
        "experience": [
            {
                "title": e.get("title", ""),
                "company": e.get("company", ""),
                "period": f"{e.get('startDate', '')} - {e.get('endDate', 'Present') if not e.get('current') else 'Present'}",
                "description": e.get("description", ""),
                "highlights": []
            }
            for e in resume_data.get("experience", [])
        ],
        "education": [
            {
                "degree": ed.get("degree", ""),
                "institution": ed.get("institution", ""),
                "year": ed.get("graduationDate", ""),
                "highlights": []
            }
            for ed in resume_data.get("education", [])
        ],
        "contact": {
            "email": personal_info.get("email", ""),
            "linkedin": personal_info.get("linkedin", ""),
            "github": personal_info.get("github", ""),
            "location": personal_info.get("location", "")
        },
        "meta": {
            "title": f"{personal_info.get('fullName', 'Portfolio')} - Portfolio",
            "description": personal_info.get("summary", "")[:160] if personal_info.get("summary") else "Professional portfolio",
            "keywords": skills.get("technical", [])[:5],
            "suggestedTheme": "minimal",
            "colorScheme": "light"
        }
    }


def get_tailor_prompt(resume_text: str, job_description: str) -> str:
    """Generate the prompt to rewrite the resume."""
    return f'''
You are a Senior AI Software Architect, Agentic System Engineer, AI Resume Architect, and Career Strategist. 
Your responsibility is to design and execute a highly safe, controlled, and intelligent resume optimization system that aligns a user's resume with a target Job Role and Job Description (JD).

You must behave like a careful resume editor. Your goal is JD alignment, NOT content fabrication.
Always prefer minimal, intelligent edits over aggressive rewriting. 
NEVER fabricate experience, projects, or achievements.

────────────────────────────────────────────
1. SOURCE DATA
────────────────────────────────────────────
CURRENT RESUME:
{resume_text}

TARGET JOB DESCRIPTION:
{job_description}

────────────────────────────────────────────
2. REQUIRED REASONING LOOP
────────────────────────────────────────────
Before outputting any modifications, you MUST internally loop through the following 3 passes and explicitly confirm them in your "rewrite_plan".

PASS 1 — DATA SAFETY CHECK
Ensure Name, Phone, Email, LinkedIn, GitHub, and Portfolio URLs are untouched.

PASS 2 — MODIFICATION JUSTIFICATION CHECK
For every planned change, ask: Why is this necessary?
Each modification MUST: Match a JD requirement, Address a skill gap, Improve clarity, or Improve keyword alignment.
If a change does not satisfy these conditions, discard it.

PASS 3 — AUTHENTICITY CHECK
Does this invent new experience? Break tech stacks? Add technologies the candidate never used?
If yes, CANCEL the change.

────────────────────────────────────────────
3. REWRITE RULES
────────────────────────────────────────────
1. **Summary:** Improve clarity, align wording and tone with the target job role naturally. Do NOT fabricate.
2. **Skills:** 
   - Add missing skills identified by your internal skill gap analysis ONLY IF supported by the JD and the candidate can reasonably claim them. 
   - Remove irrelevant skills ONLY if they clearly do not match the role.
   - You MUST provide a short reasoning for every addition/removal.
3. **Experience:** Read the current experience bullets. Return REWRITTEN bullet points that incorporate JD keywords and use the STAR method. Keep factual accuracy.
4. **Projects:** Decide whether to "modify" or "remove" projects. The action MUST be "modify" or "remove". Highlight/Modify descriptions to emphasize problem solving and JD relevance.

────────────────────────────────────────────
4. EXACT OUTPUT FORMAT (VALID JSON ONLY)
────────────────────────────────────────────
{{
  "rewrite_plan": {{
    "jd_core_requirements": ["A", "B", "C"],
    "candidate_gap_analysis": "What is missing vs strong",
    "pass_1_safety_check_passed": true,
    "pass_2_justification_check_passed": true,
    "pass_3_authenticity_check_passed": true,
    "sections_to_modify": ["Summary", "Skills"],
    "sections_to_keep": ["Education", "Certifications"]
  }},
  "modifications": {{
    "tailoring_strategy": "A brief explanation",
    "new_summary": "The rewritten, powerful, tailored profile summary.",
    "skills_update": {{
      "technical_skills_to_add": [{{"name": "React", "reason": "Highly requested in JD"}}],
      "technical_skills_to_remove": [{{"name": "Cobol", "reason": "Irrelevant to this role"}}],
      "soft_skills_to_add": [{{"name": "Agile", "reason": "Required by employer"}}]
    }},
    "experience_updates": [
      {{
        "company": "Company Name from Resume",
        "new_description": "Rewritten bullet point 1.\\nRewritten bullet point 2."
      }}
    ],
    "projects_to_keep": [
      {{
        "original_name": "Project Name from Resume",
        "action": "modify", 
        "reasoning": "Why are we keeping this?",
        "new_description": "Rewritten description focusing on JD-relevant features.",
        "additional_technologies": ["Redux"]
      }},
      {{
        "original_name": "Calculator App",
        "action": "remove", 
        "reasoning": "Irrelevant for a Senior role."
      }}
    ]
  }}
}}

RULES:
1. Return ONLY valid JSON matching the exact schema above.
2. "action" for projects MUST be either "modify" or "remove".
3. Use \\n for bullet point line breaks in descriptions.
4. ONLY reference companies and projects that exist in the CURRENT RESUME block. Do not hallucinate.
'''
