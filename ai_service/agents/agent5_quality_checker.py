"""
AGENT 5 — Resume Quality Checker Agent
========================================
Purpose:
    The final safety agent. Performs a comprehensive quality check on the
    tailored resume before it is returned to the user.

Responsibilities:
    - Detect any data loss (fields missing vs original)
    - Verify all external links still match originals
    - Validate ATS keyword coverage
    - Compute an ATS compatibility score
    - Flag and auto-correct any detected issues

Output:
    {
        atsScore: 85,
        keywordCoverage: 78,
        issues: [],
        autoFixed: [],
        finalResume: { ...cleaned resume... }
    }
"""

import copy
from crew.resume_crew import SystemLogger


class QualityCheckerAgent:
    """
    Agent 5: Resume Quality Checker
    Final validation gate — ensures integrity, ATS coverage, and data safety.
    Pure local logic — no LLM call needed.
    """

    AGENT_NAME = "Agent5:QualityChecker"
    PROTECTED_FIELDS = ["fullName", "email", "phone", "linkedin", "github", "portfolio", "location"]

    def __init__(self, model=None):
        self.model = model

    def run(self, tailored_resume: dict, original_resume: dict, jd_analysis: dict) -> dict:
        """
        Validate the tailored resume. Auto-fix issues. Return final result with quality report.
        """
        SystemLogger.working_agent("ATSEngine", "Running final quality check — ATS scoring + integrity validation")

        issues = []
        auto_fixed = []
        final = copy.deepcopy(tailored_resume)

        # ── CHECK 1: Data Loss Detection ───────────────────────────────────────
        SystemLogger.agent_action("Checking for data loss vs original resume")
        final, data_issues, data_fixes = self._check_data_loss(final, original_resume)
        issues.extend(data_issues)
        auto_fixed.extend(data_fixes)

        # ── CHECK 2: External Link Integrity ──────────────────────────────────
        SystemLogger.agent_action("Verifying all external URLs are intact")
        final, link_issues, link_fixes = self._check_link_integrity(final, original_resume)
        issues.extend(link_issues)
        auto_fixed.extend(link_fixes)

        # ── CHECK 3: ATS Keyword Coverage ─────────────────────────────────────
        SystemLogger.agent_action("Computing ATS keyword coverage score")
        ats_score, keyword_coverage, kw_details = self._compute_ats_score(final, jd_analysis)

        # ── CHECK 4: Structural Integrity ─────────────────────────────────────
        SystemLogger.agent_action("Verifying resume structure is complete")
        final, struct_issues = self._check_structure(final)
        issues.extend(struct_issues)

        # ── Clean up internal metadata before returning ────────────────────────
        final.pop("_meta", None)
        final.pop("_tailoring_log", None)

        quality_report = {
            "atsScore": ats_score,
            "keywordCoverage": keyword_coverage,
            "keywordDetails": kw_details,
            "issues": issues,
            "autoFixed": auto_fixed,
            "isClean": len(issues) == 0,
        }

        if issues:
            SystemLogger.warn(
                self.AGENT_NAME,
                f"Quality check found {len(issues)} issue(s), {len(auto_fixed)} auto-fixed"
            )
        else:
            SystemLogger.ok("QualityChecker", f"All checks passed ✓ — ATS Score: {ats_score}%")

        SystemLogger.agent_complete(
            f"Final Resume ready — ATS Score: {ats_score}% | Keyword Coverage: {keyword_coverage}% | Issues: {len(issues)}"
        )

        return {
            "qualityReport": quality_report,
            "finalResume": final
        }

    def _check_data_loss(self, tailored: dict, original: dict) -> tuple:
        """Detect and restore any missing sections."""
        issues = []
        fixes = []
        sections = ["personalInfo", "education", "certifications", "achievements"]
        for section in sections:
            orig_val = original.get(section)
            tail_val = tailored.get(section)
            if orig_val and not tail_val:
                tailored[section] = copy.deepcopy(orig_val)
                msg = f"Restored missing section: '{section}'"
                issues.append(msg)
                fixes.append(msg)
                SystemLogger.warn("DataLossGuard", msg)
        return tailored, issues, fixes

    def _check_link_integrity(self, tailored: dict, original: dict) -> tuple:
        """Verify protected URLs are intact. Auto-revert if changed."""
        issues = []
        fixes = []
        for field in self.PROTECTED_FIELDS:
            orig_val = original.get("personalInfo", {}).get(field)
            tail_val = tailored.get("personalInfo", {}).get(field)
            if orig_val and orig_val != tail_val:
                tailored["personalInfo"][field] = orig_val
                msg = f"Reverted modified protected field: '{field}'"
                issues.append(msg)
                fixes.append(msg)
                SystemLogger.error("LinkIntegrityGuard", f"BLOCKED: AI changed protected field '{field}'. Auto-reverted.")
        return tailored, issues, fixes

    def _compute_ats_score(self, tailored: dict, jd_analysis: dict) -> tuple:
        """
        Compute an ATS keyword coverage score by counting how many JD keywords
        appear in the tailored resume text.
        """
        # Flatten resume to a big text blob for scanning
        resume_text = self._flatten_resume_text(tailored).lower()

        ats_keywords = jd_analysis.get("atsKeywords", [])
        required_skills = jd_analysis.get("requiredSkills", [])
        all_target_keywords = list(set(ats_keywords + required_skills))

        matched_keywords = []
        missing_keywords = []

        for kw in all_target_keywords:
            if kw.lower() in resume_text:
                matched_keywords.append(kw)
            else:
                missing_keywords.append(kw)

        total = len(all_target_keywords) or 1
        coverage_pct = int((len(matched_keywords) / total) * 100)

        # ATS score: weighted keyword coverage + structural bonus
        ats_score = min(100, coverage_pct + 5)  # small bonus for passing all checks

        return ats_score, coverage_pct, {
            "matched": matched_keywords,
            "missing": missing_keywords,
            "total": total
        }

    def _check_structure(self, tailored: dict) -> tuple:
        """Verify expected resume keys exist."""
        issues = []
        required_keys = ["personalInfo", "skills", "projects", "education"]
        for key in required_keys:
            if key not in tailored:
                tailored[key] = {} if key == "personalInfo" else []
                issues.append(f"Missing section '{key}' — initialized as empty")
        return tailored, issues

    def _flatten_resume_text(self, resume: dict) -> str:
        """Flatten the full resume dict into a single string for keyword scanning."""
        parts = []
        info = resume.get("personalInfo", {})
        parts.append(info.get("summary", ""))
        parts.append(resume.get("profileSummary", ""))
        skills = resume.get("skills", {})
        parts.extend(skills.get("technical", []))
        parts.extend(skills.get("soft", []))
        for proj in resume.get("projects", []):
            parts.append(proj.get("description", ""))
            techs = proj.get("technologies", "")
            if isinstance(techs, str):
                parts.append(techs)
            elif isinstance(techs, list):
                parts.extend(techs)
        for exp in resume.get("experience", []):
            parts.append(exp.get("description", ""))
            parts.append(exp.get("position", ""))
        for cert in resume.get("certifications", []):
            parts.append(cert.get("name", "") if isinstance(cert, dict) else str(cert))
        for ach in resume.get("achievements", []):
            parts.append(str(ach))
        return " ".join(str(p) for p in parts if p)
