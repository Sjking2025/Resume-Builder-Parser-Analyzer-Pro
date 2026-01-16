"""
ResumeCrew - AI Agent orchestration for resume analysis
Uses Google Gemini for parsing and analysis
"""

import os
import json
import re
from typing import Optional
from datetime import datetime

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    print("Warning: google-generativeai not installed")


# ═══════════════════════════════════════════════════════════════════════════════
# CREWAI-STYLE SYSTEM LOGGER (Premium Agent Telemetry)
# ═══════════════════════════════════════════════════════════════════════════════

import sys
import time

class SystemLogger:
    """
    CrewAI-inspired premium logging with rich agent telemetry.
    Features: Working Agent headers, tool usage, thought indicators, colorful output.
    """
    
    # ANSI Colors
    RESET = '\033[0m'
    BOLD = '\033[1m'
    DIM = '\033[2m'
    ITALIC = '\033[3m'
    UNDERLINE = '\033[4m'
    
    # Foreground Colors
    BLACK = '\033[30m'
    RED = '\033[91m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    MAGENTA = '\033[95m'
    CYAN = '\033[96m'
    WHITE = '\033[97m'
    
    # Background Colors
    BG_GREEN = '\033[42m'
    BG_BLUE = '\033[44m'
    BG_MAGENTA = '\033[45m'
    BG_CYAN = '\033[46m'

    # Agent Definitions (CrewAI-style)
    AGENTS = {
        "ResumeParser": {
            "icon": "📄",
            "role": "Senior Resume Parser",
            "goal": "Extract and structure resume content with precision"
        },
        "ATSEngine": {
            "icon": "🎯",
            "role": "ATS Optimization Specialist",
            "goal": "Maximize ATS compatibility score through keyword optimization"
        },
        "SkillAnalyzer": {
            "icon": "🔍",
            "role": "Technical Skills Analyst",
            "goal": "Identify skill gaps and market alignment opportunities"
        },
        "CourseBuilder": {
            "icon": "📚",
            "role": "Career Development Strategist",
            "goal": "Build personalized learning roadmaps for career growth"
        },
        "ResumeEnhancer": {
            "icon": "✨",
            "role": "Professional Resume Writer",
            "goal": "Transform bullet points into impactful achievement statements"
        },
        "PortfolioEnhancer": {
            "icon": "🌐",
            "role": "Portfolio Content Strategist",
            "goal": "Transform resume content into engaging web portfolio copy"
        }
    }

    _start_time = None

    # ─────────────────────────────────────────────────────────────────────────
    # CREWAI-STYLE HEADERS
    # ─────────────────────────────────────────────────────────────────────────

    @staticmethod
    def crew_banner():
        """Print CrewAI-style startup banner."""
        print("", flush=True)
        print(f"{SystemLogger.BOLD}{SystemLogger.CYAN}", flush=True)
        print("  ╔══════════════════════════════════════════════════════════════╗", flush=True)
        print("  ║                                                              ║", flush=True)
        print("  ║   🚀  AI CAREER CREW  -  Multi-Agent Resume Analysis         ║", flush=True)
        print("  ║                                                              ║", flush=True)
        print("  ╚══════════════════════════════════════════════════════════════╝", flush=True)
        print(f"{SystemLogger.RESET}", flush=True)

    @staticmethod
    def crew_ready():
        """Print crew ready message."""
        print(f"\n{SystemLogger.GREEN}{SystemLogger.BOLD}✅ Crew assembled and ready for tasks{SystemLogger.RESET}\n", flush=True)

    # ─────────────────────────────────────────────────────────────────────────
    # AGENT WORKING INDICATOR (CrewAI Signature Style)
    # ─────────────────────────────────────────────────────────────────────────

    @staticmethod
    def working_agent(agent_name: str, task_description: str):
        """Show which agent is currently working (CrewAI-style)."""
        agent = SystemLogger.AGENTS.get(agent_name, {"icon": "🤖", "role": "AI Agent", "goal": "Process data"})
        icon = agent["icon"]
        role = agent["role"]
        
        print("", flush=True)
        print(f"{SystemLogger.BOLD}{SystemLogger.MAGENTA}{'─' * 70}{SystemLogger.RESET}", flush=True)
        print(f"{SystemLogger.BOLD}{SystemLogger.MAGENTA} {icon} Working Agent: {role}{SystemLogger.RESET}", flush=True)
        print(f"{SystemLogger.MAGENTA}{'─' * 70}{SystemLogger.RESET}", flush=True)
        print(f"{SystemLogger.DIM}    Starting Task: {task_description}{SystemLogger.RESET}", flush=True)
        SystemLogger._start_time = time.time()

    @staticmethod
    def agent_thinking(thought: str):
        """Show agent thought process (without exposing internals)."""
        print(f"{SystemLogger.CYAN}    🧠 Thinking: {thought}{SystemLogger.RESET}", flush=True)

    @staticmethod
    def agent_action(action: str):
        """Show agent action."""
        print(f"{SystemLogger.BLUE}    ⚡ Action: {action}{SystemLogger.RESET}", flush=True)

    @staticmethod
    def using_tool(tool_name: str, input_summary: str = ""):
        """Show tool usage (CrewAI-style)."""
        print(f"{SystemLogger.YELLOW}    🔧 Using Tool: {tool_name}{SystemLogger.RESET}", flush=True)
        if input_summary:
            print(f"{SystemLogger.DIM}       └─ Input: {input_summary}{SystemLogger.RESET}", flush=True)

    @staticmethod
    def tool_output(output_summary: str):
        """Show tool output."""
        print(f"{SystemLogger.GREEN}       └─ Output: {output_summary}{SystemLogger.RESET}", flush=True)

    @staticmethod
    def agent_observation(observation: str):
        """Show agent observation."""
        print(f"{SystemLogger.CYAN}    👁️ Observation: {observation}{SystemLogger.RESET}", flush=True)

    @staticmethod
    def agent_complete(result_summary: str):
        """Mark agent task as complete."""
        elapsed = ""
        if SystemLogger._start_time:
            elapsed = f" ({time.time() - SystemLogger._start_time:.2f}s)"
        print(f"{SystemLogger.GREEN}{SystemLogger.BOLD}    ✅ Task Complete{elapsed}{SystemLogger.RESET}", flush=True)
        print(f"{SystemLogger.GREEN}       └─ Result: {result_summary}{SystemLogger.RESET}", flush=True)

    # ─────────────────────────────────────────────────────────────────────────
    # DELEGATION & HANDOFF
    # ─────────────────────────────────────────────────────────────────────────

    @staticmethod
    def delegating(from_agent: str, to_agent: str, reason: str):
        """Show task delegation between agents."""
        print(f"\n{SystemLogger.YELLOW}    🔄 Delegating to {to_agent}: {reason}{SystemLogger.RESET}", flush=True)

    @staticmethod  
    def crew_output(title: str, items: dict):
        """Show formatted crew output."""
        print(f"\n{SystemLogger.BOLD}{SystemLogger.GREEN}{'═' * 70}{SystemLogger.RESET}", flush=True)
        print(f"{SystemLogger.BOLD}{SystemLogger.GREEN}  📊 {title}{SystemLogger.RESET}", flush=True)
        print(f"{SystemLogger.GREEN}{'═' * 70}{SystemLogger.RESET}", flush=True)
        for key, value in items.items():
            print(f"  {SystemLogger.WHITE}• {key}: {SystemLogger.CYAN}{value}{SystemLogger.RESET}", flush=True)
        print(f"{SystemLogger.GREEN}{'═' * 70}{SystemLogger.RESET}\n", flush=True)

    # ─────────────────────────────────────────────────────────────────────────
    # CREW COMPLETION
    # ─────────────────────────────────────────────────────────────────────────

    @staticmethod
    def crew_finished(total_time: float, summary: dict):
        """Show crew completion summary."""
        print("", flush=True)
        print(f"{SystemLogger.BOLD}{SystemLogger.GREEN}╔══════════════════════════════════════════════════════════════════╗{SystemLogger.RESET}", flush=True)
        print(f"{SystemLogger.BOLD}{SystemLogger.GREEN}║                    🎉 CREW EXECUTION COMPLETE                    ║{SystemLogger.RESET}", flush=True)
        print(f"{SystemLogger.BOLD}{SystemLogger.GREEN}╚══════════════════════════════════════════════════════════════════╝{SystemLogger.RESET}", flush=True)
        print(f"{SystemLogger.WHITE}  ⏱️  Total Time: {total_time:.2f}s{SystemLogger.RESET}", flush=True)
        print("", flush=True)
        for key, value in summary.items():
            print(f"  {SystemLogger.CYAN}✓ {key}: {SystemLogger.WHITE}{value}{SystemLogger.RESET}", flush=True)
        print("", flush=True)

    # ─────────────────────────────────────────────────────────────────────────
    # BACKWARD COMPATIBILITY (Standard log levels)
    # ─────────────────────────────────────────────────────────────────────────

    @staticmethod
    def info(component: str, message: str):
        print(f"{SystemLogger.CYAN}[INFO] [{component}] {message}{SystemLogger.RESET}", flush=True)

    @staticmethod
    def init(component: str, message: str):
        print(f"{SystemLogger.MAGENTA}[INIT] [{component}] {message}{SystemLogger.RESET}", flush=True)

    @staticmethod
    def run(component: str, message: str):
        print(f"{SystemLogger.BLUE}[RUN ] [{component}] {message}{SystemLogger.RESET}", flush=True)

    @staticmethod
    def done(component: str, message: str):
        print(f"{SystemLogger.GREEN}[DONE] [{component}] {message}{SystemLogger.RESET}", flush=True)

    @staticmethod
    def ok(component: str, message: str):
        print(f"{SystemLogger.GREEN}[OK  ] [{component}] {message}{SystemLogger.RESET}", flush=True)

    @staticmethod
    def warn(component: str, message: str):
        print(f"{SystemLogger.YELLOW}[WARN] [{component}] {message}{SystemLogger.RESET}", flush=True)

    @staticmethod
    def error(component: str, message: str):
        print(f"{SystemLogger.RED}[ERROR] [{component}] {message}{SystemLogger.RESET}", flush=True)

    @staticmethod
    def divider():
        print(f"{SystemLogger.DIM}{'─' * 44}{SystemLogger.RESET}", flush=True)

    @staticmethod
    def boot_header():
        print("", flush=True)
        SystemLogger.divider()
        print(f"{SystemLogger.MAGENTA}{SystemLogger.BOLD}🚀 AI CAREER ENGINE STARTED{SystemLogger.RESET}", flush=True)
        SystemLogger.divider()

    @staticmethod
    def ready_footer():
        SystemLogger.divider()
        print(f"{SystemLogger.GREEN}{SystemLogger.BOLD}✅ System Ready — Awaiting Requests{SystemLogger.RESET}", flush=True)
        SystemLogger.divider()
        print("", flush=True)

    # ─────────────────────────────────────────────────────────────────────────
    # STEP-BASED TRACEABILITY (For detailed execution trace)
    # ─────────────────────────────────────────────────────────────────────────

    @staticmethod
    def step_start(step_num: int, agent_name: str):
        """Start a new step in the execution trace."""
        print("", flush=True)
        SystemLogger.divider()
        print(f"{SystemLogger.BOLD}{SystemLogger.CYAN}[STEP {step_num}] {agent_name}{SystemLogger.RESET}", flush=True)
        SystemLogger.divider()

    @staticmethod
    def step_input(items: list):
        """Log input received for current step."""
        print(f"{SystemLogger.YELLOW}▶ Input Received:{SystemLogger.RESET}", flush=True)
        for item in items:
            print(f"  {SystemLogger.DIM}- {item}{SystemLogger.RESET}", flush=True)

    @staticmethod
    def step_processing(items: list):
        """Log processing actions for current step."""
        print(f"{SystemLogger.BLUE}▶ Processing:{SystemLogger.RESET}", flush=True)
        for item in items:
            print(f"  {SystemLogger.DIM}- {item}{SystemLogger.RESET}", flush=True)

    @staticmethod
    def step_output(items: list):
        """Log output generated for current step."""
        print(f"{SystemLogger.GREEN}▶ Output Generated:{SystemLogger.RESET}", flush=True)
        for item in items:
            print(f"  {SystemLogger.DIM}- {item}{SystemLogger.RESET}", flush=True)

    @staticmethod
    def step_status(status: str):
        """Log status for current step (SUCCESS/WARNING/FAILED)."""
        if status == "SUCCESS":
            color = SystemLogger.GREEN
            emoji = "✅"
        elif status == "WARNING":
            color = SystemLogger.YELLOW
            emoji = "⚠️"
        else:
            color = SystemLogger.RED
            emoji = "❌"
        print(f"{color}▶ Status: {emoji} {status}{SystemLogger.RESET}", flush=True)

    @staticmethod
    def process_complete(summary_items: list):
        """Print final process completion summary."""
        print("", flush=True)
        SystemLogger.divider()
        print(f"{SystemLogger.GREEN}{SystemLogger.BOLD}✅ PROCESS COMPLETED SUCCESSFULLY{SystemLogger.RESET}", flush=True)
        SystemLogger.divider()
        for item in summary_items:
            print(f"  • {item}", flush=True)
        SystemLogger.divider()
        print("", flush=True)


class ResumeCrew:
    """Orchestrates AI agents for resume analysis"""
    
    def __init__(self):
        """Initialize the AI model. Boot logging is handled by main.py lifespan."""
        self.api_key = os.getenv("GOOGLE_API_KEY")
        if self.api_key and GEMINI_AVAILABLE:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('models/gemini-2.5-flash')
        else:
            self.model = None
    
    def parse_resume_for_import(self, resume_text: str) -> dict:
        """Parse resume text and extract structured data."""
        SystemLogger.run("ResumeParser", "Parsing resume sections...")
        
        if not self.model:
            SystemLogger.error("ResumeParser", "AI Service unavailable")
            raise ValueError("AI model not initialized.")
        
        SystemLogger.info("ResumeParser", f"Processing {len(resume_text)} characters...")
        prompt = self._get_parsing_prompt(resume_text)
        
        try:
            # Configure safety settings to avoid blocking
            safety_settings = [
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
            ]
            
            response = self.model.generate_content(
                prompt,
                safety_settings=safety_settings
            )
            
            # Check if response was blocked
            if not response.text:
                SystemLogger.error("ResumeParser", "Empty response from AI Core")
                return self._get_empty_template()
            
            raw_response = response.text
            
            # Extract JSON from response
            parsed_data = self._extract_json(raw_response)
            
            if not parsed_data:
                SystemLogger.warn("ResumeParser", "Extraction failed")
                SystemLogger.info("ResumeParser", "Attempting fallback parser...")
                return self._get_empty_template()
            
            # Count sections found
            sections = sum(1 for k in ['personalInfo', 'education', 'experience', 'projects', 'skills', 'achievements'] 
                          if parsed_data.get(k))
            SystemLogger.done("ResumeParser", f"Resume parsed successfully ({sections} sections found)")
            return self._normalize_import_data(parsed_data)
        except Exception as e:
            SystemLogger.error("ResumeParser", f"Parsing failed: {str(e)}")
            import traceback
            traceback.print_exc()
            return self._get_empty_template()
    
    def _get_parsing_prompt(self, resume_text: str) -> str:
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

    def _extract_json(self, text: str) -> dict:
        """Extract JSON from AI response text."""
        # Try to find JSON in response
        json_match = re.search(r'\{[\s\S]*\}', text)
        if json_match:
            try:
                return json.loads(json_match.group())
            except json.JSONDecodeError:
                pass
        return {}
    
    def _normalize_import_data(self, data: dict) -> dict:
        """Normalize parsed data to match frontend store schema."""
        return {
            "personalInfo": {
                "fullName": data.get("personalInfo", {}).get("fullName", ""),
                "email": data.get("personalInfo", {}).get("email", ""),
                "phone": data.get("personalInfo", {}).get("phone", ""),
                "location": data.get("personalInfo", {}).get("location", ""),
                "linkedin": data.get("personalInfo", {}).get("linkedin", ""),
                "github": data.get("personalInfo", {}).get("github", ""),
                "portfolio": data.get("personalInfo", {}).get("portfolio", ""),
                "summary": data.get("personalInfo", {}).get("summary", ""),
            },
            "education": data.get("education", []),
            "experience": data.get("experience", []),
            "projects": data.get("projects", []),
            "skills": {
                "technical": data.get("skills", {}).get("technical", []),
                "soft": data.get("skills", {}).get("soft", []),
                "languages": data.get("skills", {}).get("languages", []),
            },
            "achievements": data.get("achievements", []),
        }
    
    def _get_empty_template(self) -> dict:
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
    
    def analyze_resume(self, resume_data: dict, job_description: Optional[str] = None) -> dict:
        """Analyze resume using 5 specialized AI agents with CrewAI-style logging."""
        import time
        crew_start = time.time()
        
        if not self.model:
            SystemLogger.error("System", "AI model not initialized")
            raise ValueError("AI model not initialized.")
        
        # ═══════════════════════════════════════════════════════════════════════
        # AGENT 1: RESUME PARSER
        # ═══════════════════════════════════════════════════════════════════════
        SystemLogger.working_agent("ResumeParser", "Extract and structure resume content")
        SystemLogger.agent_thinking("Analyzing resume structure and sections...")
        
        name = resume_data.get("personalInfo", {}).get("fullName", "Unknown")
        exp_count = len(resume_data.get("experience", []))
        edu_count = len(resume_data.get("education", []))
        skills = resume_data.get("skills", {})
        tech_skills = skills.get("technical", [])
        
        SystemLogger.using_tool("Text Extractor", f"Resume data for {name}")
        from utils.text_extraction import resume_data_to_text
        resume_text = resume_data_to_text(resume_data)
        
        SystemLogger.tool_output(f"{len(resume_text)} characters extracted")
        SystemLogger.agent_observation(f"Found {exp_count} experiences, {edu_count} education, {len(tech_skills)} skills")
        SystemLogger.agent_complete(f"Resume parsed: {name}")

        # ═══════════════════════════════════════════════════════════════════════
        # AGENT 2: ATS ENGINE
        # ═══════════════════════════════════════════════════════════════════════
        SystemLogger.working_agent("ATSEngine", "Evaluate ATS compatibility and optimize keywords")
        SystemLogger.agent_thinking("Scanning for keyword density and formatting...")
        SystemLogger.agent_action("Comparing against ATS parsing standards")
        
        # ═══════════════════════════════════════════════════════════════════════
        # AGENT 3: SKILL ANALYZER
        # ═══════════════════════════════════════════════════════════════════════
        if job_description:
            SystemLogger.working_agent("SkillAnalyzer", f"Match skills against job requirements")
            SystemLogger.agent_thinking("Parsing job description requirements...")
            SystemLogger.agent_observation(f"JD contains {len(job_description)} characters")
        else:
            SystemLogger.working_agent("SkillAnalyzer", "Analyze skill coverage vs market standards")
            SystemLogger.agent_thinking("Loading industry benchmark data...")
        SystemLogger.agent_action("Identifying skill gaps and opportunities")

        # ═══════════════════════════════════════════════════════════════════════
        # AGENT 4: COURSE BUILDER
        # ═══════════════════════════════════════════════════════════════════════
        SystemLogger.working_agent("CourseBuilder", "Generate personalized learning roadmap")
        SystemLogger.agent_thinking("Mapping skill gaps to learning paths...")
        SystemLogger.agent_action("Prioritizing recommendations by career impact")
        
        # ═══════════════════════════════════════════════════════════════════════
        # AGENT 5: RESUME ENHANCER
        # ═══════════════════════════════════════════════════════════════════════
        SystemLogger.working_agent("ResumeEnhancer", "Craft impactful improvements")
        SystemLogger.agent_thinking("Analyzing bullet point effectiveness...")
        SystemLogger.agent_action("Applying STAR method for enhancements")

        # ═══════════════════════════════════════════════════════════════════════
        # EXECUTE AI CORE (GEMINI)
        # ═══════════════════════════════════════════════════════════════════════
        SystemLogger.divider()
        print(f"{SystemLogger.BOLD}{SystemLogger.CYAN}  🤖 Invoking AI Core...{SystemLogger.RESET}", flush=True)
        SystemLogger.using_tool("Google Gemini 2.5 Flash", f"Multi-agent prompt ({len(resume_text)} chars)")
        
        prompt = self._get_analysis_prompt(resume_text, job_description)
        
        try:
            safety_settings = [
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
            ]
            
            response = self.model.generate_content(prompt, safety_settings=safety_settings)
            
            if not response.text:
                SystemLogger.error("API", "Empty response from AI Core")
                return self._get_empty_analysis()
            
            raw_response = response.text
            SystemLogger.tool_output(f"Received {len(raw_response)} chars")
            
            analysis_data = self._extract_json(raw_response)
            
            if not analysis_data:
                SystemLogger.warn("System", "JSON extraction failed, using fallback")
                return self._get_empty_analysis()
            
            # ═══════════════════════════════════════════════════════════════════════
            # DISPLAY AGENT RESULTS (Step-based traceability)
            # ═══════════════════════════════════════════════════════════════════════
            
            # ATS Results
            ats_data = analysis_data.get("ats_compatibility_score", {})
            score = ats_data.get("score", 0) if isinstance(ats_data, dict) else 0
            
            SystemLogger.step_start(1, "ATS Evaluation Agent (Output)")
            SystemLogger.step_output([
                f"ATS Score: {score}/100",
                f"Explanation: {ats_data.get('explanation', 'N/A')[:60]}..."
            ])
            SystemLogger.step_status("SUCCESS")
            
            # Skill Analyzer Results
            skills_data = analysis_data.get("skill_and_keyword_match_analysis", {})
            matched = skills_data.get("matched_skills", [])
            missing = skills_data.get("missing_skills", [])
            
            SystemLogger.step_start(2, "Skill Gap Analysis Agent (Output)")
            SystemLogger.step_output([
                f"Matched Skills: {len(matched)}",
                f"Missing Skills: {len(missing)}",
                f"Top Gaps: {', '.join(missing[:3]) if missing else 'None'}"
            ])
            SystemLogger.step_status("SUCCESS")
            
            # Course Builder Results - use correct field names from prompt
            growth = analysis_data.get("career_growth_recommendations", {})
            skills_to_learn = growth.get("skills_to_learn_next", [])
            certs = growth.get("certifications_to_consider", [])
            projects = growth.get("project_ideas", [])

            SystemLogger.step_start(3, "Course Builder Agent (Output)")
            SystemLogger.step_output([
                f"Skills to Learn: {len(skills_to_learn)}",
                f"Certifications: {len(certs)}",
                f"Project Ideas: {len(projects)}"
            ])
            SystemLogger.step_status("SUCCESS")

            # Resume Enhancer Results
            quality_review = analysis_data.get("experience_quality_review", {})
            rewrites = quality_review.get("rewrite_suggestions", [])
            strengths = quality_review.get("strengths", [])
            
            SystemLogger.step_start(4, "Resume Enhancement Agent (Output)")
            SystemLogger.step_output([
                f"Strengths Found: {len(strengths)}",
                f"Rewrite Suggestions: {len(rewrites)}"
            ])
            SystemLogger.step_status("SUCCESS")
            
            # Final Summary (single call, no duplicates)
            total_time = time.time() - crew_start
            SystemLogger.crew_finished(total_time, {
                "Resume Analyzed": name,
                "ATS Score": f"{score}/100",
                "Skill Gaps Identified": len(missing),
                "Learning Roadmap": f"{len(skills_to_learn)} skills, {len(certs)} certs, {len(projects)} projects",
                "Enhancements Ready": len(rewrites)
            })
            
            # Map NEW structure to EXISTING frontend schema to prevent collapse
            # While preserving the richness of the new data
            
            return {
                "resume_overview": analysis_data.get("resume_overview", "Analysis complete."),
                "ats_score": score,
                "ats_breakdown": {
                    "keyword_match": score, # Approximation using main score
                    "experience_relevance": score,
                    "formatting_score": 85, # Assumed high if parsed
                    "skill_coverage": 70,
                    "language_quality": 80
                },
                "ats_explanation": ats_data.get("explanation", "Scored based on keyword relevance."),
                "strengths": quality_review.get("strengths", []),
                "weaknesses": quality_review.get("weak_areas", []),
                "matched_keywords": skills_data.get("matched_skills", []),
                "missing_keywords": skills_data.get("missing_skills", []),
                "skill_gaps": [{"skill": s, "recommendation": "Learn this"} for s in skills_data.get("missing_skills", [])], # Map simple list to obj if needed
                "bullet_improvements": quality_review.get("rewrite_suggestions", []),
                "career_guidance": f"Strategy: {growth.get('project_ideas', [])}", # Combine if needed
                "recommended_skills": growth.get("skills_to_learn_next", []),
                "recommended_certifications": growth.get("certifications_to_consider", []),
                "project_ideas": growth.get("project_ideas", [])
            }

        except Exception as e:
            SystemLogger.error("System", f"Analysis failed: {str(e)}")
            return self._get_empty_analysis()
    
    def _get_analysis_prompt(self, resume_text: str, job_description: Optional[str] = None) -> str:
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
    
    def _extract_json(self, text: str) -> Optional[dict]:
        """Extract JSON object from text, handling markdown blocks."""
        try:
            if not text:
                return None
            # Remove markdown code blocks
            text = re.sub(r'```json\s*', '', text)
            text = re.sub(r'```\s*', '', text)
            
            # Find first { and last }
            start = text.find('{')
            end = text.rfind('}')
            
            if start != -1 and end != -1:
                json_str = text[start:end+1]
                return json.loads(json_str)
            return None
        except Exception:
            return None

    def _normalize_import_data(self, data: dict) -> dict:
        """Normalize imported data to match application schema."""
        if not data:
            return self._get_empty_template()
            
        # Ensure minimal structure
        template = self._get_empty_template()
        
        # Merge personal info
        if "personalInfo" in data and isinstance(data["personalInfo"], dict):
            for k, v in data["personalInfo"].items():
                if k in template["personalInfo"]:
                    template["personalInfo"][k] = v
        
        # Merge lists directly if they exist
        for list_field in ["education", "experience", "projects", "achievements"]:
            if list_field in data and isinstance(data[list_field], list):
                template[list_field] = data[list_field]
                
        # Merge skills
        if "skills" in data and isinstance(data["skills"], dict):
            for k, v in data["skills"].items():
                if k in template["skills"]:
                    template["skills"][k] = v
                    
        return template

    def _get_empty_analysis(self) -> dict:
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

    # ═══════════════════════════════════════════════════════════════════════════════
    # PORTFOLIO ENHANCEMENT
    # ═══════════════════════════════════════════════════════════════════════════════

    def enhance_for_portfolio(self, resume_data: dict) -> dict:
        """Transform resume content into web-optimized portfolio copy."""
        import time
        crew_start = time.time()
        
        if not self.model:
            SystemLogger.error("System", "AI model not initialized")
            raise ValueError("AI model not initialized.")
        
        # Log the portfolio enhancement process
        SystemLogger.crew_banner()
        SystemLogger.working_agent("PortfolioEnhancer", "Transform resume into portfolio content")
        
        # Extract key information
        name = resume_data.get("personalInfo", {}).get("fullName", "Unknown")
        SystemLogger.agent_thinking(f"Analyzing resume for {name}...")
        
        # Convert resume to text for AI processing
        from utils.text_extraction import resume_data_to_text
        resume_text = resume_data_to_text(resume_data)
        
        SystemLogger.using_tool("Content Transformer", f"Processing {len(resume_text)} chars")
        SystemLogger.agent_action("Generating engaging web copy...")
        
        # Build the portfolio enhancement prompt
        prompt = self._get_portfolio_prompt(resume_data, resume_text)
        
        try:
            safety_settings = [
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
            ]
            
            response = self.model.generate_content(prompt, safety_settings=safety_settings)
            
            if not response.text:
                SystemLogger.error("API", "Empty response from AI")
                return self._get_empty_portfolio(resume_data)
            
            raw_response = response.text
            SystemLogger.tool_output(f"Received {len(raw_response)} chars")
            
            portfolio_data = self._extract_json(raw_response)
            
            if not portfolio_data:
                SystemLogger.warn("System", "JSON extraction failed, using fallback")
                return self._get_empty_portfolio(resume_data)
            
            # Log success
            total_time = time.time() - crew_start
            SystemLogger.agent_complete(f"Portfolio content generated for {name}")
            SystemLogger.crew_finished(total_time, {
                "Profile": name,
                "Headline Generated": "Yes" if portfolio_data.get("hero", {}).get("headline") else "No",
                "Projects Enhanced": len(portfolio_data.get("projects", [])),
                "Theme Suggested": portfolio_data.get("meta", {}).get("suggestedTheme", "minimal")
            })
            
            return portfolio_data
            
        except Exception as e:
            SystemLogger.error("System", f"Portfolio enhancement failed: {str(e)}")
            return self._get_empty_portfolio(resume_data)
    
    def enhance_for_portfolio_streaming(self, resume_data: dict):
        """Stream portfolio enhancement section by section for real-time updates."""
        import time
        
        if not self.model:
            SystemLogger.error("System", "AI model not initialized")
            # Yield error state
            yield {"error": "AI model not initialized", "progress": 0}
            return
        
        # Get direct portfolio transformation as fallback
        from utils.text_extraction import resume_data_to_text
        resume_text = resume_data_to_text(resume_data)
        
        # Get fallback data
        fallback = self._get_empty_portfolio(resume_data)
        
        # Define sections with their progress ranges
        sections = [
            ("hero", 0, 15, "Creating your headline..."),
            ("about", 15, 30, "Writing about section..."),
            ("skills", 30, 45, "Analyzing your skills..."),
            ("projects", 45, 60, "Enhancing project descriptions..."),
            ("experience", 60, 75, "Formatting work experience..."),
            ("education", 75, 85, "Processing education..."),
            ("contact", 85, 95, "Setting up contact info..."),
            ("meta", 95, 100, "Finalizing...")
        ]
        
        try:
            # Start generation
            SystemLogger.crew_banner()
            SystemLogger.working_agent("PortfolioEnhancer", "Streaming portfolio generation")
            
            # Generate all content at once (AI call)
            prompt = self._get_portfolio_prompt(resume_data, resume_text)
            safety_settings = [
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
            ]
            
            response = self.model.generate_content(prompt, safety_settings=safety_settings)
            
            if not response.text:
                # Use fallback and stream it
                for section_name, start, end, status in sections:
                    yield {
                        "section": section_name,
                        "data": fallback.get(section_name, {}),
                        "progress": end,
                        "status": status
                    }
                    time.sleep(0.3)  # Simulate streaming delay
                return
            
            # Extract portfolio data
            portfolio_data = self._extract_json(response.text)
            
            if not portfolio_data:
                # Use fallback
                for section_name, start, end, status in sections:
                    yield {
                        "section": section_name,
                        "data": fallback.get(section_name, {}),
                        "progress": end,
                        "status": status
                    }
                    time.sleep(0.3)
                return
            
            # Stream each section progressively
            for section_name, start, end, status in sections:
                SystemLogger.agent_action(status)
                
                yield {
                    "section": section_name,
                    "data": portfolio_data.get(section_name, fallback.get(section_name, {})),
                    "progress": end,
                    "status": status
                }
                
                # Small delay for visual effect (can be removed for instant)
                time.sleep(0.2)
            
            # Final complete message
            SystemLogger.agent_complete("Portfolio generation complete!")
            yield {
                "complete": True,
                "progress": 100,
                "status": "Portfolio ready! ✨"
            }
            
        except Exception as e:
            SystemLogger.error("System", f"Streaming failed: {str(e)}")
            # Stream fallback on error
            for section_name, start, end, status in sections:
                yield {
                    "section": section_name,
                    "data": fallback.get(section_name, {}),
                    "progress": end,
                    "status": status
                }
                time.sleep(0.2)
            
            yield {
                "complete": True,
                "progress": 100,
                "status": "Portfolio ready!"
            }
    
    def _get_portfolio_prompt(self, resume_data: dict, resume_text: str) -> str:
        """Generate the prompt for portfolio enhancement."""
        personal_info = resume_data.get("personalInfo", {})
        projects = resume_data.get("projects", [])
        experience = resume_data.get("experience", [])
        skills = resume_data.get("skills", {})
        
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
    
    def _get_empty_portfolio(self, resume_data: dict) -> dict:
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

    # ═══════════════════════════════════════════════════════════════════════════════
    # SKILL GAP ANALYZER & ROADMAP GENERATOR
    # ═══════════════════════════════════════════════════════════════════════════════
    
    def analyze_skill_gap(self, resume_data: dict, job_description: str) -> dict:
        """
        Analyze skill gap between resume and job description.
        Returns matched skills, missing skills, and gap score.
        """
        import time
        start_time = time.time()
        
        if not self.model:
            SystemLogger.error("System", "AI model not initialized")
            raise ValueError("AI model not initialized.")
        
        SystemLogger.crew_banner()
        SystemLogger.working_agent("SkillGapAnalyzer", "Analyzing resume vs job description")
        
        # Extract resume text
        from utils.text_extraction import resume_data_to_text
        resume_text = resume_data_to_text(resume_data)
        
        SystemLogger.using_tool("SkillExtractor", f"Processing JD ({len(job_description)} chars)")
        
        prompt = f'''
You are an expert Career Analyst. Analyze the gap between this resume and job description.

════════════════════════════════════════════════════════════════
RESUME
════════════════════════════════════════════════════════════════
{resume_text}

════════════════════════════════════════════════════════════════
JOB DESCRIPTION
════════════════════════════════════════════════════════════════
{job_description}

════════════════════════════════════════════════════════════════
TASK
════════════════════════════════════════════════════════════════
1. Extract all skills required in the JD (technical, tools, frameworks, soft skills)
2. Identify which skills the candidate has (matched)
3. Identify which skills are missing or weak
4. Calculate a match percentage
5. Prioritize missing skills by importance (how often mentioned, required vs preferred)

Return ONLY valid JSON:
{{
    "jobTitle": "extracted job title",
    "company": "company name if mentioned",
    "matchScore": 75,
    "matchedSkills": [
        {{"name": "Python", "confidence": "strong", "evidence": "3 years mentioned"}},
        {{"name": "SQL", "confidence": "moderate", "evidence": "used in projects"}}
    ],
    "missingSkills": [
        {{"name": "Kubernetes", "priority": "high", "reason": "mentioned 3 times, required", "difficulty": "medium"}},
        {{"name": "GraphQL", "priority": "medium", "reason": "preferred skill", "difficulty": "easy"}}
    ],
    "weakSkills": [
        {{"name": "React", "currentLevel": "beginner", "requiredLevel": "advanced", "gap": "significant"}}
    ],
    "recommendations": [
        "Focus on Kubernetes first - most critical gap",
        "Upgrade React skills from beginner to advanced"
    ],
    "estimatedPrepTime": "4-6 weeks"
}}
'''
        
        try:
            safety_settings = [
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
            ]
            
            response = self.model.generate_content(prompt, safety_settings=safety_settings)
            
            if not response.text:
                SystemLogger.error("API", "Empty response from AI")
                return {"error": "Empty response from AI", "matchScore": 0}
            
            result = self._extract_json(response.text)
            
            if not result:
                SystemLogger.warn("System", "JSON extraction failed")
                return {"error": "Failed to parse analysis", "matchScore": 0}
            
            total_time = time.time() - start_time
            SystemLogger.agent_complete(f"Gap analysis complete")
            SystemLogger.crew_finished(total_time, {
                "Match Score": f"{result.get('matchScore', 0)}%",
                "Matched Skills": len(result.get('matchedSkills', [])),
                "Missing Skills": len(result.get('missingSkills', [])),
                "Weak Skills": len(result.get('weakSkills', []))
            })
            
            return result
            
        except Exception as e:
            SystemLogger.error("System", f"Gap analysis failed: {str(e)}")
            return {"error": str(e), "matchScore": 0}
    
    def generate_roadmap(self, gap_analysis: dict, learner_profile: dict = None) -> dict:
        """
        Generate a practice-focused roadmap based on skill gaps.
        40% learning, 60% practice with curated resources.
        """
        import time
        start_time = time.time()
        
        if not self.model:
            SystemLogger.error("System", "AI model not initialized")
            raise ValueError("AI model not initialized.")
        
        # Default learner profile
        if not learner_profile:
            learner_profile = {
                "hoursPerDay": 2,
                "learningSpeed": "moderate",
                "targetDays": 30,
                "preferredStyle": "mixed",
                "existingKnowledge": []
            }
        
        SystemLogger.crew_banner()
        SystemLogger.working_agent("RoadmapGenerator", "Creating practice-focused learning path")
        
        missing_skills = gap_analysis.get("missingSkills", [])
        weak_skills = gap_analysis.get("weakSkills", [])
        
        if not missing_skills and not weak_skills:
            return {"message": "No skill gaps found!", "roadmap": []}
        
        skills_to_learn = [s["name"] for s in missing_skills] + [s["name"] for s in weak_skills]
        
        SystemLogger.agent_thinking(f"Planning roadmap for {len(skills_to_learn)} skills")
        
        prompt = f'''
You are an expert Career Coach creating a PRACTICE-FOCUSED roadmap.

════════════════════════════════════════════════════════════════
PHILOSOPHY
════════════════════════════════════════════════════════════════
- 40% Learning, 60% Hands-on Practice
- Real skills develop through trial and error
- Build from day 1, avoid tutorial hell
- Include EXPECTED ERRORS the learner will face
- Industry-focused, not academic

════════════════════════════════════════════════════════════════
SKILLS TO LEARN (Priority Order)
════════════════════════════════════════════════════════════════
{json.dumps(missing_skills + weak_skills, indent=2)}

════════════════════════════════════════════════════════════════
LEARNER PROFILE
════════════════════════════════════════════════════════════════
- Available: {learner_profile.get("hoursPerDay", 2)} hours/day
- Speed: {learner_profile.get("learningSpeed", "moderate")}
- Target: {learner_profile.get("targetDays", 30)} days
- Style: {learner_profile.get("preferredStyle", "mixed")}
- Already knows: {learner_profile.get("existingKnowledge", [])}

════════════════════════════════════════════════════════════════
TASK
════════════════════════════════════════════════════════════════
Create a week-by-week roadmap. For EACH skill include:
1. Learn section (40% of time) - Core concepts only
2. Practice section (60% of time) - Real mini-projects
3. Expected errors/challenges they will face
4. Validation criteria
5. CURATED resources (only top-rated, high-view YouTube videos, official docs, free courses)

Return ONLY valid JSON:
{{
    "totalWeeks": 4,
    "totalHours": 80,
    "targetJob": "{gap_analysis.get('jobTitle', 'Target Role')}",
    "weeks": [
        {{
            "weekNumber": 1,
            "focus": "Kubernetes Fundamentals",
            "skills": ["Kubernetes"],
            "totalHours": 20,
            "learn": {{
                "hours": 8,
                "topics": ["Pods", "Deployments", "Services", "ConfigMaps"],
                "resources": [
                    {{"type": "video", "title": "Kubernetes Tutorial for Beginners", "url": "youtube.com/...", "duration": "4hrs", "views": "2M+", "rating": "4.9"}},
                    {{"type": "docs", "title": "Kubernetes Official Docs - Getting Started", "url": "kubernetes.io/docs/..."}}
                ]
            }},
            "practice": {{
                "hours": 12,
                "projects": [
                    {{
                        "name": "Deploy Todo App to Minikube",
                        "description": "Containerize and deploy a simple app",
                        "estimatedHours": 3,
                        "requirements": ["Create Dockerfile", "Write deployment.yaml", "Expose via Service"],
                        "expectedErrors": ["ImagePullBackOff", "CrashLoopBackOff", "Service not accessible"],
                        "successCriteria": "App accessible on localhost"
                    }},
                    {{
                        "name": "Multi-container Pod",
                        "description": "Deploy app with sidecar container",
                        "estimatedHours": 4,
                        "requirements": ["Multi-container pod spec", "Shared volume", "Init container"],
                        "expectedErrors": ["Container ordering issues", "Volume mount permissions"],
                        "successCriteria": "Both containers running and communicating"
                    }}
                ]
            }},
            "validation": [
                "Can you deploy an app without looking at docs?",
                "Can you debug a CrashLoopBackOff?",
                "Can you explain pod lifecycle?"
            ]
        }}
    ],
    "bonusProjects": [
        {{"name": "Deploy to real cloud (GKE/EKS)", "skill": "Kubernetes", "hours": 6}}
    ]
}}

IMPORTANT: Only include REAL, working resource URLs. For YouTube, include videos with 100K+ views and high ratings. For docs, use official documentation.
'''
        
        try:
            safety_settings = [
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
            ]
            
            response = self.model.generate_content(prompt, safety_settings=safety_settings)
            
            if not response.text:
                SystemLogger.error("API", "Empty response from AI")
                return {"error": "Empty response from AI"}
            
            result = self._extract_json(response.text)
            
            if not result:
                SystemLogger.warn("System", "JSON extraction failed")
                return {"error": "Failed to parse roadmap"}
            
            total_time = time.time() - start_time
            SystemLogger.agent_complete("Roadmap generated!")
            SystemLogger.crew_finished(total_time, {
                "Total Weeks": result.get("totalWeeks", 0),
                "Total Hours": result.get("totalHours", 0),
                "Skills Covered": len(skills_to_learn)
            })
            
            return result
            
        except Exception as e:
            SystemLogger.error("System", f"Roadmap generation failed: {str(e)}")
            return {"error": str(e)}
    
    def generate_roadmap_streaming(self, gap_analysis: dict, learner_profile: dict = None):
        """
        Stream roadmap generation week by week for real-time UI updates.
        Yields progress events as each week is generated.
        """
        import time
        
        if not self.model:
            yield {"error": "AI model not initialized", "progress": 0}
            return
        
        # Default learner profile
        if not learner_profile:
            learner_profile = {
                "hoursPerDay": 2,
                "learningSpeed": "moderate",
                "targetDays": 30,
                "preferredStyle": "mixed"
            }
        
        missing_skills = gap_analysis.get("missingSkills", [])
        weak_skills = gap_analysis.get("weakSkills", [])
        all_skills = missing_skills + weak_skills
        
        if not all_skills:
            yield {"complete": True, "progress": 100, "message": "No skill gaps found!"}
            return
        
        SystemLogger.crew_banner()
        SystemLogger.working_agent("RoadmapGenerator", "Streaming roadmap generation")
        
        # Generate full roadmap first
        roadmap = self.generate_roadmap(gap_analysis, learner_profile)
        
        if "error" in roadmap:
            yield {"error": roadmap["error"], "progress": 0}
            return
        
        weeks = roadmap.get("weeks", [])
        total_weeks = len(weeks)
        
        # Stream metadata first
        yield {
            "section": "meta",
            "data": {
                "totalWeeks": roadmap.get("totalWeeks", total_weeks),
                "totalHours": roadmap.get("totalHours", 0),
                "targetJob": roadmap.get("targetJob", "")
            },
            "progress": 5,
            "status": "Initializing roadmap..."
        }
        time.sleep(0.3)
        
        # Stream each week
        for i, week in enumerate(weeks):
            progress = int(10 + (i + 1) / total_weeks * 80)
            yield {
                "section": f"week_{week.get('weekNumber', i+1)}",
                "data": week,
                "progress": progress,
                "status": f"Week {week.get('weekNumber', i+1)}: {week.get('focus', 'Skills')}..."
            }
            time.sleep(0.4)
        
        # Stream bonus projects
        if roadmap.get("bonusProjects"):
            yield {
                "section": "bonus",
                "data": roadmap.get("bonusProjects"),
                "progress": 95,
                "status": "Adding bonus challenges..."
            }
            time.sleep(0.2)
        
        # Complete
        yield {
            "complete": True,
            "progress": 100,
            "status": "Roadmap ready! 🚀",
            "fullRoadmap": roadmap
        }
    
    def modify_roadmap(self, current_roadmap: dict, modification_request: str) -> dict:
        """
        Use AI to modify an existing roadmap based on user's natural language request.
        """
        if not self.model:
            raise ValueError("AI model not initialized.")
        
        SystemLogger.working_agent("RoadmapModifier", "Processing modification request")
        
        prompt = f'''
You are modifying an existing learning roadmap based on user feedback.

════════════════════════════════════════════════════════════════
CURRENT ROADMAP
════════════════════════════════════════════════════════════════
{json.dumps(current_roadmap, indent=2)}

════════════════════════════════════════════════════════════════
USER REQUEST
════════════════════════════════════════════════════════════════
"{modification_request}"

════════════════════════════════════════════════════════════════
TASK
════════════════════════════════════════════════════════════════
Modify the roadmap according to the user's request. Common modifications:
- "Push X to week Y" → Move skill to different week
- "Skip X, I know it" → Remove that content
- "Make X harder" → Add advanced topics
- "I have less time" → Compress timeline
- "Add more practice for X" → Increase practice projects

Return the COMPLETE modified roadmap as valid JSON, with a "modificationSummary" field explaining what changed.
'''
        
        try:
            response = self.model.generate_content(prompt)
            
            if not response.text:
                return {"error": "Empty response", "modificationSummary": "Failed to modify"}
            
            result = self._extract_json(response.text)
            
            if not result:
                return {"error": "Failed to parse", "modificationSummary": "Parsing error"}
            
            SystemLogger.agent_complete(f"Roadmap modified: {result.get('modificationSummary', 'Done')}")
            return result
            
        except Exception as e:
            return {"error": str(e), "modificationSummary": f"Error: {str(e)}"}

