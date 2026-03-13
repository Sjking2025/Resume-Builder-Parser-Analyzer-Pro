"""
AI Resume Tailoring Agents
Multi-agent architecture for intelligent, safe resume tailoring.

Pipeline:
  Agent 1: ResumeParserAgent      - Validates and normalizes resume data
  Agent 2: JDAnalyzerAgent        - Deep analysis of Job Description
  Agent 3: SkillGapAgent          - Maps resume skills vs JD requirements
  Agent 4: TailoringAgent         - Controlled, non-destructive resume rewriting
  Agent 5: QualityCheckerAgent    - Final ATS + integrity validation
"""

from .agent1_resume_parser import ResumeParserAgent
from .agent2_jd_analyzer import JDAnalyzerAgent
from .agent3_skill_gap import SkillGapAgent
from .agent4_tailoring import TailoringAgent
from .agent5_quality_checker import QualityCheckerAgent

__all__ = [
    "ResumeParserAgent",
    "JDAnalyzerAgent",
    "SkillGapAgent",
    "TailoringAgent",
    "QualityCheckerAgent",
]
