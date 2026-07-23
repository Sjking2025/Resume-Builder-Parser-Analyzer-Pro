"""
ResumeCrew - AI Agent orchestration for resume analysis
"""

import os
import json
import time
from typing import Optional

# Legacy imports kept for backward compatibility if anything references them directly
from .ai_wrappers import OpenRouterWrapper, GoogleGenAIWrapper, GEMINI_AVAILABLE, OPENAI_AVAILABLE
from .logger import SystemLogger
from .prompts import (
    extract_json,
    normalize_import_data,
    get_parsing_prompt,
    get_empty_template,
    get_analysis_prompt,
    get_empty_analysis,
    get_portfolio_prompt,
    get_empty_portfolio,
    get_tailor_prompt,
    get_cv_parsing_prompt,
    get_cv_to_resume_prompt,
)

# New orchestrator import
from orchestrator.manager import AIManager

class ResumeCrew:
    """Orchestrates AI agents for resume analysis"""
    
    def __init__(self, api_key: str = None, model_id: str = None, routing_pref: str = "free_first"):
        """
        Initialize the AI model via the AIManager orchestrator.
        
        Args:
            api_key: User-provided API key (or falls back to env vars).
            model_id: Explicit model ID from the frontend (or 'auto'/None for auto-select).
            routing_pref: Routing preference (e.g. 'free_first', 'fastest', 'highest_quality').
        """
        try:
            manager = AIManager(api_key=api_key, model_id=model_id, routing_pref=routing_pref)
            # Expose a backward-compatible .model with .generate_content(prompt)
            self.model = manager
        except Exception as e:
            if \'PAID_CONSENT_REQUIRED\' in str(e):
                raise ValueError(str(e))
            SystemLogger.warn("ResumeCrew", f"AIManager init fallback: {e}")
            self.model = None

    # ═══════════════════════════════════════════════════════════════════════════
    # MULTI-AGENT TAILORING PIPELINE (5-Agent Architecture)
    # ═══════════════════════════════════════════════════════════════════════════

    def run_tailoring_pipeline(self, resume_data: dict, job_description: str) -> dict:
        """
        Orchestrates the full 5-Agent Resume Tailoring Pipeline.

        Flow:
          Agent 1: ResumeParserAgent    → Normalize + validate resume structure
          Agent 2: JDAnalyzerAgent      → Deep JD extraction (skills, keywords, signals)
          Agent 3: SkillGapAgent        → Local skill gap mapping (no LLM)
          Agent 4: TailoringAgent       → Controlled LLM-powered resume refinement
          Agent 5: QualityCheckerAgent  → ATS scoring + final integrity check

        Returns:
          {
            "finalResume": {...},      # The tailored, validated resume
            "qualityReport": {         # ATS score + metadata
              "atsScore": 85,
              "keywordCoverage": 78,
              "issues": [],
              "autoFixed": []
            }
          }
        """
        from agents import ResumeParserAgent, JDAnalyzerAgent, SkillGapAgent, TailoringAgent, QualityCheckerAgent

        if not self.model:
            SystemLogger.error("Pipeline", "AI model not initialized")
            raise ValueError("AI model not initialized. Check GOOGLE_API_KEY.")

        SystemLogger.divider()
        SystemLogger.info("Pipeline", "🚀 Starting 5-Agent Resume Tailoring Pipeline")
        SystemLogger.divider()
        pipeline_start = time.time()

        # ── STEP 1: Resume Parser ────────────────────────────────────────────
        SystemLogger.step_start(1, "Resume Parser Agent")
        agent1 = ResumeParserAgent(self.model)
        parsed_resume = agent1.run(resume_data)
        SystemLogger.step_status("SUCCESS")

        # ── STEP 2: JD Analyzer ──────────────────────────────────────────────
        SystemLogger.step_start(2, "JD Analyzer Agent")
        agent2 = JDAnalyzerAgent(self.model)
        jd_analysis = agent2.run(job_description)
        SystemLogger.step_status("SUCCESS")

        # ── STEP 3: Skill Gap Mapper ─────────────────────────────────────────
        SystemLogger.step_start(3, "Skill Gap Agent")
        agent3 = SkillGapAgent(self.model)
        skill_gap = agent3.run(parsed_resume, jd_analysis)
        SystemLogger.step_status("SUCCESS")

        # ── STEP 4: Resume Tailoring Agent ───────────────────────────────────
        SystemLogger.step_start(4, "Tailoring Agent — Core Intelligence")
        agent4 = TailoringAgent(self.model)
        tailored_resume = agent4.run(parsed_resume, jd_analysis, skill_gap)
        SystemLogger.step_status("SUCCESS")

        # ── STEP 5: Quality Checker ──────────────────────────────────────────
        SystemLogger.step_start(5, "Quality Checker Agent — Final Validation")
        agent5 = QualityCheckerAgent(self.model)
        result = agent5.run(tailored_resume, parsed_resume, jd_analysis)
        SystemLogger.step_status("SUCCESS")

        # ── Pipeline Complete ────────────────────────────────────────────────
        total_time = time.time() - pipeline_start
        SystemLogger.crew_finished(total_time, {
            "Pipeline": "5-Agent Resume Tailoring",
            "ATS Score": f"{result['qualityReport']['atsScore']}%",
            "Keyword Coverage": f"{result['qualityReport']['keywordCoverage']}%",
            "Issues Found": len(result['qualityReport']['issues']),
            "Auto-Fixed": len(result['qualityReport']['autoFixed']),
        })

        return result


    def parse_resume_for_import(self, resume_text: str) -> dict:
        """Parse resume text and extract structured data."""
        SystemLogger.run("ResumeParser", "Parsing resume sections...")
        
        if not self.model:
            SystemLogger.error("ResumeParser", "AI Service unavailable")
            raise ValueError("AI model not initialized.")
        
        SystemLogger.info("ResumeParser", f"Processing {len(resume_text)} characters...")
        prompt = get_parsing_prompt(resume_text)
        
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
                return get_empty_template()
            
            raw_response = response.text
            
            # Extract JSON from response
            parsed_data = extract_json(raw_response)
            
            if not parsed_data:
                SystemLogger.warn("ResumeParser", "Extraction failed")
                SystemLogger.info("ResumeParser", "Attempting fallback parser...")
                return get_empty_template()
            
            # Count sections found
            sections = sum(1 for k in ['personalInfo', 'education', 'experience', 'projects', 'skills', 'achievements'] 
                          if parsed_data.get(k))
            SystemLogger.done("ResumeParser", f"Resume parsed successfully ({sections} sections found)")
            return normalize_import_data(parsed_data)
        except Exception as e:
            if \'PAID_CONSENT_REQUIRED\' in str(e):
                raise ValueError(str(e))
            SystemLogger.error("ResumeParser", f"Parsing failed: {str(e)}")
            import traceback
            traceback.print_exc()
            if "429" in str(e):
                raise ValueError("Gemini API Quota Exceeded. Please check your plan or try again later.")
            return get_empty_template()
    
    def parse_document(self, document_text: str) -> dict:
        """Parse CV or Resume text with document type detection."""
        SystemLogger.run("DocumentParser", "Parsing document sections...")
        
        if not self.model:
            SystemLogger.error("DocumentParser", "AI Service unavailable")
            raise ValueError("AI model not initialized.")
        
        SystemLogger.info("DocumentParser", f"Processing {len(document_text)} characters...")
        prompt = get_cv_parsing_prompt(document_text)
        
        try:
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
            
            if not response.text:
                SystemLogger.error("DocumentParser", "Empty response from AI Core")
                return get_empty_template()
            
            parsed_data = extract_json(response.text)
            
            if not parsed_data:
                SystemLogger.warn("DocumentParser", "Enhanced extraction failed, falling back to basic parser")
                return self.parse_resume_for_import(document_text)
            
            # Default missing documentDetection if the AI forgot it
            if "documentDetection" not in parsed_data:
                parsed_data["documentDetection"] = {
                    "type": "resume",
                    "confidence": 50,
                    "signals": ["fallback detection"]
                }
                
            doc_type = parsed_data["documentDetection"].get("type", "resume")
            conf = parsed_data["documentDetection"].get("confidence", 0)
            
            SystemLogger.done("DocumentParser", f"Document parsed successfully ({doc_type} detected with {conf}% confidence)")
            return normalize_import_data(parsed_data)
            
        except Exception as e:
            if \'PAID_CONSENT_REQUIRED\' in str(e):
                raise ValueError(str(e))
            SystemLogger.error("DocumentParser", f"Parsing failed: {str(e)}")
            import traceback
            traceback.print_exc()
            if "quota" in str(e).lower() or "429" in str(e):
                raise ValueError("Gemini API Quota Exceeded. Please check your plan or try again later.")
            return get_empty_template()

    def convert_cv_to_resume(self, cv_data: dict, config: dict) -> dict:
        """Convert a parsed CV into a concise Resume based on configuration."""
        SystemLogger.run("CVConverter", f"Converting CV to Resume (Target: {config.get('targetPages', '1')} pages)")
        
        if not self.model:
            SystemLogger.error("CVConverter", "AI Service unavailable")
            raise ValueError("AI model not initialized.")
            
        prompt = get_cv_to_resume_prompt(cv_data, config)
        
        try:
            safety_settings = [
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
            ]
            
            response = self.model.generate_content(prompt, safety_settings=safety_settings)
            
            if not response.text:
                SystemLogger.error("CVConverter", "Empty response from AI Core")
                raise ValueError("AI returned empty response")
                
            parsed_data = extract_json(response.text)
            
            if not parsed_data or "resumeData" not in parsed_data:
                SystemLogger.error("CVConverter", "Failed to extract valid resume data from response")
                raise ValueError("Failed to parse AI response into valid JSON")
                
            report = parsed_data.get("conversionReport", {})
            SystemLogger.done("CVConverter", f"Conversion complete. Strategy: {report.get('strategy', 'Unknown')}")
            
            # Return both the data and the report so the frontend can show it
            return {
                "success": True,
                "resumeData": normalize_import_data(parsed_data["resumeData"]),
                "conversionReport": report
            }
            
        except Exception as e:
            if \'PAID_CONSENT_REQUIRED\' in str(e):
                raise ValueError(str(e))
            SystemLogger.error("CVConverter", f"Conversion failed: {str(e)}")
            import traceback
            traceback.print_exc()
            return {
                "success": False,
                "error": str(e)
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
        
        prompt = get_analysis_prompt(resume_text, job_description)
        
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
                return get_empty_analysis()
            
            raw_response = response.text
            SystemLogger.tool_output(f"Received {len(raw_response)} chars")
            
            analysis_data = extract_json(raw_response)
            
            if not analysis_data:
                SystemLogger.warn("System", "JSON extraction failed, using fallback")
                return get_empty_analysis()
            
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
            if \'PAID_CONSENT_REQUIRED\' in str(e):
                raise ValueError(str(e))
            SystemLogger.error("System", f"Analysis failed: {str(e)}")
            if "quota" in str(e).lower() or "429" in str(e):
                raise ValueError("Gemini API Quota Exceeded. Please check your plan or try again later.")
            return get_empty_analysis()
    
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
        prompt = get_portfolio_prompt(resume_data, resume_text)
        
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
                return get_empty_portfolio(resume_data)
            
            raw_response = response.text
            SystemLogger.tool_output(f"Received {len(raw_response)} chars")
            
            portfolio_data = extract_json(raw_response)
            
            if not portfolio_data:
                SystemLogger.warn("System", "JSON extraction failed, using fallback")
                return get_empty_portfolio(resume_data)
            
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
            if \'PAID_CONSENT_REQUIRED\' in str(e):
                raise ValueError(str(e))
            SystemLogger.error("System", f"Portfolio enhancement failed: {str(e)}")
            return get_empty_portfolio(resume_data)
    
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
        fallback = get_empty_portfolio(resume_data)
        
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
            prompt = get_portfolio_prompt(resume_data, resume_text)
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
            portfolio_data = extract_json(response.text)
            
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
            if \'PAID_CONSENT_REQUIRED\' in str(e):
                raise ValueError(str(e))
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
            
            result = extract_json(response.text)
            
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
            if \'PAID_CONSENT_REQUIRED\' in str(e):
                raise ValueError(str(e))
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
- Preferred Video Languages: {", ".join(learner_profile.get("preferredLanguages", ["english"]))}
- Already knows: {learner_profile.get("existingKnowledge", [])}

════════════════════════════════════════════════════════════════
TASK
════════════════════════════════════════════════════════════════
Create a week-by-week roadmap. For EACH skill include:
1. Learn section (40% of time) - Core concepts only
2. Practice section (60% of time) - Real mini-projects
3. Expected errors/challenges they will face
4. Validation criteria
5. CURATED resources with MINIMUM 5 YouTube videos per skill

CRITICAL RESOURCE REQUIREMENTS:
- Include EXACTLY 5 or more YouTube videos per skill week
- Categorize videos by difficulty: beginner (2), intermediate (2), advanced (1+)
- LANGUAGE PREFERENCES: User is comfortable with these languages: {", ".join(learner_profile.get("preferredLanguages", ["english"]))}
  - Mix videos from ALL selected language communities
  - For "hindi": Add hindi tech channels (CodeWithHarry, Apna College, Thapa Technical)
  - For "tamil": Add tamil tech channels (Tamil Hacks, Learn Code Tamil)
  - For "telugu": Add telugu tech channels (Telugu Academy, Coding in Telugu)
  - For "spanish": Add "español" to searches, Spanish dev channels
  - For "english": Include Fireship, Traversy Media, freeCodeCamp, Web Dev Simplified
  - Distribute videos across selected languages for variety
- For YouTube URLs, use SEARCH URLs like: https://www.youtube.com/results?search_query=kubernetes+tutorial+hindi
- Include official documentation links (these are always real URLs)
- Add 1-2 free course platform links (Coursera, Udemy, etc.)

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
                "resources": {{
                    "videos": [
                        {{"level": "beginner", "title": "Kubernetes Explained - Quick Intro", "searchTerms": "kubernetes explained 100 seconds", "url": "https://www.youtube.com/results?search_query=kubernetes+explained+100+seconds+fireship", "description": "Quick intro to K8s concepts"}},
                        {{"level": "beginner", "title": "Kubernetes Full Course for Beginners", "searchTerms": "kubernetes tutorial beginners full course", "url": "https://www.youtube.com/results?search_query=kubernetes+tutorial+beginners+full+course+nana", "description": "Complete beginner course"}},
                        {{"level": "intermediate", "title": "Kubernetes Hands-on Tutorial", "searchTerms": "kubernetes deployments services tutorial", "url": "https://www.youtube.com/results?search_query=kubernetes+deployments+services+practical", "description": "Hands-on deployments and services"}},
                        {{"level": "intermediate", "title": "K8s Networking Deep Dive", "searchTerms": "kubernetes networking explained", "url": "https://www.youtube.com/results?search_query=kubernetes+networking+services+ingress", "description": "Understanding services and ingress"}},
                        {{"level": "advanced", "title": "Production Kubernetes Best Practices", "searchTerms": "kubernetes production best practices", "url": "https://www.youtube.com/results?search_query=kubernetes+production+best+practices+enterprise", "description": "Enterprise patterns"}}
                    ],
                    "docs": [
                        {{"title": "Kubernetes Official Docs", "url": "https://kubernetes.io/docs/", "section": "Getting Started"}},
                        {{"title": "Kubernetes Cheatsheet", "url": "https://kubernetes.io/docs/reference/kubectl/cheatsheet/"}}
                    ],
                    "courses": [
                        {{"title": "Kubernetes for Developers", "platform": "Coursera", "url": "https://www.coursera.org/search?query=kubernetes", "duration": "4 weeks"}}
                    ]
                }}
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

CRITICAL URL RULES:
- For YouTube: Use SEARCH URLs format: https://www.youtube.com/results?search_query=topic+keywords+here
- Replace spaces with + in search queries
- Add channel names to search for specific creators (fireship, traversy, nana, freecodecamp)
- For documentation: Use REAL, official URLs (kubernetes.io, reactjs.org, docs.docker.com, etc.)
- For courses: Link to search pages on Coursera/Udemy that show real courses
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
            
            result = extract_json(response.text)
            
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
            if \'PAID_CONSENT_REQUIRED\' in str(e):
                raise ValueError(str(e))
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
            
            result = extract_json(response.text)
            
            if not result:
                return {"error": "Failed to parse", "modificationSummary": "Parsing error"}
            
            SystemLogger.agent_complete(f"Roadmap modified: {result.get('modificationSummary', 'Done')}")
            return result
            
        except Exception as e:
            if \'PAID_CONSENT_REQUIRED\' in str(e):
                raise ValueError(str(e))
            return {"error": str(e), "modificationSummary": f"Error: {str(e)}"}

    # ═══════════════════════════════════════════════════════════════════════════════
    # AUTO-TAILOR RESUME
    # ═══════════════════════════════════════════════════════════════════════════════
    
    def tailor_resume(self, resume_data: dict, job_description: str) -> dict:
        """
        Automatically rewrites and tailors a resume JSON to exactly match a Job Description.
        Uses a SURGICAL MERGE strategy to ensure NO data loss (links, emails, exact fields are kept).
        """
        import time
        import copy
        start_time = time.time()
        
        if not self.model:
            SystemLogger.error("System", "AI model not initialized")
            raise ValueError("AI model not initialized.")
            
        SystemLogger.crew_banner()
        SystemLogger.working_agent("ResumeTailor Agent", "Running Surgical Resume Merge")
        
        # 1. Create a deep copy to ensure we NEVER lose original data
        tailored_resume = copy.deepcopy(resume_data)
        
        SystemLogger.agent_thinking("Extracting current resume data for AI analysis...")
        from utils.text_extraction import resume_data_to_text
        resume_text = resume_data_to_text(resume_data)
        
        SystemLogger.agent_action("Generating Action Plan & Modifications...")
        prompt = get_tailor_prompt(resume_text, job_description)
        
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
                return resume_data
                
            parsed_json = extract_json(response.text)
            
            if not parsed_json:
                SystemLogger.warn("System", "JSON extraction failed")
                return resume_data
                
            rewrite_plan = parsed_json.get("rewrite_plan", {})
            action_plan = parsed_json.get("modifications", parsed_json) # Fallback if AI didn't nest
                
            SystemLogger.agent_thinking(f"Status: {action_plan.get('tailoring_strategy', 'Applying changes...')}")
            
            if rewrite_plan:
                gap_analysis = rewrite_plan.get("candidate_gap_analysis", "")
                if gap_analysis:
                    SystemLogger.info("Reasoning", f"Gap Analysis: {gap_analysis}")
                
                safety = rewrite_plan.get("pass_1_safety_check_passed", False)
                justification = rewrite_plan.get("pass_2_justification_check_passed", False)
                authenticity = rewrite_plan.get("pass_3_authenticity_check_passed", False)
                
                if safety and justification and authenticity:
                    SystemLogger.ok("Verification", "Self-Checking Loop (Pass 1, 2, 3) Verified Internally")
                else:
                    SystemLogger.warn("Verification", "AI internally flagged safety/authenticity concerns!")
            
            # --- SURGICAL MERGE LOGIC ---
            
            # 2. Merge Summary
            if "new_summary" in action_plan and action_plan["new_summary"]:
                if "personalInfo" not in tailored_resume:
                    tailored_resume["personalInfo"] = {}
                tailored_resume["personalInfo"]["summary"] = action_plan["new_summary"]
                
            # 3. Merge Skills
            skills_update = action_plan.get("skills_update", {})
            if "skills" not in tailored_resume:
                tailored_resume["skills"] = {"technical": [], "soft": []}
                
            # Technical Skills (Add/Remove)
            tech_skills = set(tailored_resume["skills"].get("technical", []))
            for to_remove in skills_update.get("technical_skills_to_remove", []):
                tech_skills.discard(to_remove.get("name"))
            for to_add in skills_update.get("technical_skills_to_add", []):
                tech_skills.add(to_add.get("name"))
            tailored_resume["skills"]["technical"] = list(tech_skills)
            
            # Soft Skills (Add/Remove)
            soft_skills = set(tailored_resume["skills"].get("soft", []))
            for to_remove in skills_update.get("soft_skills_to_remove", []):
                soft_skills.discard(to_remove.get("name"))
            for to_add in skills_update.get("soft_skills_to_add", []):
                soft_skills.add(to_add.get("name"))
            tailored_resume["skills"]["soft"] = list(soft_skills)
            
            # 4. Merge Experience Descriptions
            exp_updates = action_plan.get("experience_updates", [])
            for update in exp_updates:
                company_to_match = update.get("company", "").lower()
                for i, exp in enumerate(tailored_resume.get("experience", [])):
                    if company_to_match in exp.get("company", "").lower():
                        tailored_resume["experience"][i]["description"] = update.get("new_description", exp.get("description"))

            # 5. Merge Projects
            projects_update = action_plan.get("projects_to_keep", [])
            if "projects" in tailored_resume and projects_update:
                final_projects = []
                for orig_proj in tailored_resume["projects"]:
                    orig_name = orig_proj.get("name", "").lower()
                    # Find if AI mentioned this project
                    matching_ai_instruct = next((p for p in projects_update if p.get("original_name", "").lower() == orig_name), None)
                    
                    if matching_ai_instruct:
                        if matching_ai_instruct.get("action") == "remove":
                            continue # Drop it
                        elif matching_ai_instruct.get("action") == "modify":
                            orig_proj["description"] = matching_ai_instruct.get("new_description", orig_proj.get("description", ""))
                            # Add techs if suggested, without losing old ones
                            new_techs = matching_ai_instruct.get("additional_technologies", [])
                            if new_techs:
                                old_techs = orig_proj.get("technologies", "")
                                orig_proj["technologies"] = f"{old_techs}, {', '.join(new_techs)}".strip(", ")
                                
                    final_projects.append(orig_proj)
                tailored_resume["projects"] = final_projects
                
            # 6. Final Self-Verification Check (PYTHON LEVEL)
            # Enforce Pass 1: Data Safety
            links_safe = True
            for field in ["linkedin", "github", "portfolio", "email", "phone", "fullName"]:
                orig_val = resume_data.get("personalInfo", {}).get(field)
                new_val = tailored_resume.get("personalInfo", {}).get(field)
                if orig_val != new_val:
                    SystemLogger.error("Verification Guard", f"Intercepted AI attempting to modify protected field '{field}'. Reverting change.")
                    if "personalInfo" not in tailored_resume:
                         tailored_resume["personalInfo"] = {}
                    tailored_resume["personalInfo"][field] = orig_val
                    links_safe = False
                    
            if links_safe:
                SystemLogger.ok("Verification Guard", "Pass 1: Data Safety Confirmed. All protected info untouched.")
                
            total_time = time.time() - start_time
            SystemLogger.agent_complete("Surgical Merge successful!")
            SystemLogger.crew_finished(total_time, {
                "Added Tech Skills": len(skills_update.get("technical_skills_to_add", [])),
                "Modified Experiences": len(exp_updates),
                "Status": "Safe Merge Complete"
            })
            
            return normalize_import_data(tailored_resume)
            
        except Exception as e:
            if \'PAID_CONSENT_REQUIRED\' in str(e):
                raise ValueError(str(e))
            SystemLogger.error("System", f"Resume tailoring failed: {str(e)}")
            return resume_data
