"""
Resume Analysis AI Service - FastAPI Server
Provides AI-powered resume analysis using CrewAI agents with Google Gemini.
"""

import os
from typing import Optional
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables
env_path = Path(__file__).parent / '.env'
if env_path.exists():
    load_dotenv(dotenv_path=env_path)

# Check for API key
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")


class HealthResponse(BaseModel):
    status: str
    api_key_set: bool


class ImportResponse(BaseModel):
    success: bool
    message: str
    data: dict


class AnalyzeRequest(BaseModel):
    resume_data: dict
    job_description: Optional[str] = None


from crew.resume_crew import SystemLogger

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize on startup - Professional boot sequence."""
    # Boot header
    SystemLogger.boot_header()
    
    # System initialization logs
    SystemLogger.info("System", "Loading environment configuration")
    SystemLogger.init("System", "Initializing AI agents...")
    
    if GOOGLE_API_KEY:
        # Agent initialization logs per spec
        SystemLogger.ok("ResumeParser", "Resume Parser ready")
        SystemLogger.ok("ATSEngine", "ATS Engine online")
        SystemLogger.ok("SkillAnalyzer", "Skill Gap Analyzer ready")
        SystemLogger.ok("CourseBuilder", "Course Builder active")
        SystemLogger.ok("ResumeEnhancer", "Resume Enhancer ready")
        SystemLogger.ok("PortfolioEnhancer", "Portfolio Enhancer ready")
        
        # Ready footer
        SystemLogger.ready_footer()
    else:
        SystemLogger.warn("System", "GOOGLE_API_KEY not set - AI features disabled")
    
    yield


# Create FastAPI app
app = FastAPI(
    title="Resume Analysis AI Service",
    description="AI-powered resume analysis",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check() -> HealthResponse:
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        api_key_set=bool(GOOGLE_API_KEY)
    )


@app.post("/import-resume")
async def import_resume(file: UploadFile = File(...)) -> ImportResponse:
    """
    Parse an uploaded resume PDF and extract structured data.
    """
    if not GOOGLE_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="AI service not configured. Set GOOGLE_API_KEY."
        )
    
    # Validate file type
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported"
        )
    
    try:
        # Read file content
        file_content = await file.read()
        
        # Extract text from PDF
        from utils.text_extraction import extract_text_from_pdf
        resume_text = extract_text_from_pdf(file_content)
        
        if not resume_text or len(resume_text.strip()) < 50:
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from PDF."
            )
        
        # Parse using AI
        from crew.resume_crew import ResumeCrew
        crew = ResumeCrew()
        parsed_data = crew.parse_resume_for_import(resume_text)
        
        return ImportResponse(
            success=True,
            message="Resume parsed successfully",
            data=parsed_data
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error parsing resume: {str(e)}"
        )


@app.post("/analyze")
async def analyze_resume_from_data(request: AnalyzeRequest):
    """
    Analyze resume data and provide comprehensive feedback.
    """
    # Log incoming request
    SystemLogger.divider()
    SystemLogger.info("System", "Incoming analysis request received")
    
    if not GOOGLE_API_KEY:
        SystemLogger.error("System", "API key not configured")
        raise HTTPException(
            status_code=503,
            detail="AI service not configured. Set GOOGLE_API_KEY."
        )
    
    try:
        from crew.resume_crew import ResumeCrew
        crew = ResumeCrew()
        analysis = crew.analyze_resume(request.resume_data, request.job_description)
        
        return analysis
        
    except Exception as e:
        SystemLogger.error("System", f"Analysis failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing resume: {str(e)}"
        )


@app.post("/tailor-resume")
async def tailor_resume_to_jd(request: AnalyzeRequest):
    """
    Automatically rewrite and tailor a resume to match a specific Job Description.
    Returns the exact same JSON schema but with customized content.
    """
    SystemLogger.divider()
    SystemLogger.info("System", "Incoming Auto-Tailor request received")
    
    if not GOOGLE_API_KEY:
        SystemLogger.error("System", "API key not configured")
        raise HTTPException(
            status_code=503,
            detail="AI service not configured. Set GOOGLE_API_KEY."
        )
        
    if not request.job_description:
        SystemLogger.error("System", "Missing Job Description string")
        raise HTTPException(
            status_code=400,
            detail="A Job Description is required to tailor a resume."
        )
        
    try:
        from crew.resume_crew import ResumeCrew
        crew = ResumeCrew()
        tailored_resume = crew.tailor_resume(request.resume_data, request.job_description)
        
        return tailored_resume
        
    except Exception as e:
        SystemLogger.error("System", f"Auto-Tailor failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error tailoring resume: {str(e)}"
        )


@app.post("/analyze-pdf")
async def analyze_resume_from_pdf(file: UploadFile = File(...), job_description: Optional[str] = None):
    """
    Analyze an uploaded resume PDF and provide comprehensive feedback.
    """
    # Log incoming request
    SystemLogger.divider()
    SystemLogger.info("System", f"Incoming PDF analysis request: {file.filename}")
    
    if not GOOGLE_API_KEY:
        SystemLogger.error("System", "API key not configured")
        raise HTTPException(
            status_code=503,
            detail="AI service not configured. Set GOOGLE_API_KEY."
        )
    
    # Validate file type
    if not file.filename.lower().endswith('.pdf'):
        SystemLogger.warn("System", "Invalid file type uploaded")
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported"
        )
    
    try:
        # Read file content
        file_content = await file.read()
        
        # Extract text from PDF
        from utils.text_extraction import extract_text_from_pdf
        resume_text = extract_text_from_pdf(file_content)
        
        if not resume_text or len(resume_text.strip()) < 50:
            SystemLogger.error("System", "Could not extract text from PDF")
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from PDF."
            )
        
        # First parse to get structured data
        from crew.resume_crew import ResumeCrew
        crew = ResumeCrew()
        parsed_data = crew.parse_resume_for_import(resume_text)
        
        # Then analyze
        analysis = crew.analyze_resume(parsed_data, job_description)
        
        return analysis
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing resume: {str(e)}"
        )


@app.post("/portfolio-enhance")
async def enhance_portfolio(request: AnalyzeRequest):
    """
    Transform resume data into web-optimized portfolio content.
    Returns enhanced content for portfolio generation.
    """
    if not GOOGLE_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="AI service unavailable. Please set GOOGLE_API_KEY."
        )
    
    resume_data = request.resume_data
    if not resume_data:
        raise HTTPException(
            status_code=400,
            detail="No resume data provided"
        )
    
    try:
        from crew.resume_crew import ResumeCrew
        crew = ResumeCrew()
        
        # Transform resume to portfolio content
        portfolio_data = crew.enhance_for_portfolio(resume_data)
        
        return {
            "success": True,
            "data": portfolio_data
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error enhancing portfolio: {str(e)}"
        )


@app.post("/portfolio-enhance-stream")
async def enhance_portfolio_stream(request: AnalyzeRequest):
    """
    Stream portfolio generation section-by-section using Server-Sent Events.
    Returns real-time progress updates as portfolio is generated.
    """
    if not GOOGLE_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="AI service unavailable. Please set GOOGLE_API_KEY."
        )
    
    resume_data = request.resume_data
    if not resume_data:
        raise HTTPException(
            status_code=400,
            detail="No resume data provided"
        )
    
    async def generate():
        """SSE generator that yields portfolio sections progressively."""
        from crew.resume_crew import ResumeCrew
        import json
        
        try:
            crew = ResumeCrew()
            
            # Stream portfolio generation
            for event in crew.enhance_for_portfolio_streaming(resume_data):
                # Format as SSE message
                yield f"data: {json.dumps(event)}\n\n"
                
        except Exception as e:
            # Send error event
            error_event = {
                "error": str(e),
                "progress": 0,
                "status": "Generation failed"
            }
            yield f"data: {json.dumps(error_event)}\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"  # Disable nginx buffering
        }
    )


# ═══════════════════════════════════════════════════════════════════════════════
# SKILL GAP ANALYZER ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════════

class SkillGapRequest(BaseModel):
    resume_data: dict
    job_description: str

class RoadmapRequest(BaseModel):
    gap_analysis: dict
    learner_profile: Optional[dict] = None

class ModifyRoadmapRequest(BaseModel):
    current_roadmap: dict
    modification_request: str


@app.post("/skill-gap/analyze")
async def analyze_skill_gap(request: SkillGapRequest):
    """
    Analyze the skill gap between a resume and job description.
    Returns matched skills, missing skills, weak skills, and recommendations.
    """
    if not GOOGLE_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="AI service unavailable. Please set GOOGLE_API_KEY."
        )
    
    if not request.resume_data:
        raise HTTPException(status_code=400, detail="No resume data provided")
    if not request.job_description:
        raise HTTPException(status_code=400, detail="No job description provided")
    
    try:
        from crew.resume_crew import ResumeCrew
        crew = ResumeCrew()
        
        result = crew.analyze_skill_gap(request.resume_data, request.job_description)
        
        return {
            "success": True,
            "data": result
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing skill gap: {str(e)}"
        )


@app.post("/skill-gap/roadmap")
async def generate_roadmap(request: RoadmapRequest):
    """
    Generate a practice-focused learning roadmap based on skill gap analysis.
    40% learning, 60% practice with curated resources.
    """
    if not GOOGLE_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="AI service unavailable. Please set GOOGLE_API_KEY."
        )
    
    if not request.gap_analysis:
        raise HTTPException(status_code=400, detail="No gap analysis provided")
    
    try:
        from crew.resume_crew import ResumeCrew
        crew = ResumeCrew()
        
        result = crew.generate_roadmap(request.gap_analysis, request.learner_profile)
        
        return {
            "success": True,
            "data": result
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating roadmap: {str(e)}"
        )


@app.post("/skill-gap/roadmap-stream")
async def generate_roadmap_stream(request: RoadmapRequest):
    """
    Stream roadmap generation using Server-Sent Events.
    Returns real-time progress as each week is generated.
    """
    if not GOOGLE_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="AI service unavailable. Please set GOOGLE_API_KEY."
        )
    
    if not request.gap_analysis:
        raise HTTPException(status_code=400, detail="No gap analysis provided")
    
    async def generate():
        from crew.resume_crew import ResumeCrew
        import json
        
        try:
            crew = ResumeCrew()
            
            for event in crew.generate_roadmap_streaming(request.gap_analysis, request.learner_profile):
                yield f"data: {json.dumps(event)}\n\n"
                
        except Exception as e:
            error_event = {
                "error": str(e),
                "progress": 0,
                "status": "Generation failed"
            }
            yield f"data: {json.dumps(error_event)}\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


@app.post("/skill-gap/roadmap/modify")
async def modify_roadmap(request: ModifyRoadmapRequest):
    """
    Use AI to modify an existing roadmap based on natural language request.
    Examples: "Push Kubernetes to week 3", "Make React harder", "I have less time"
    """
    if not GOOGLE_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="AI service unavailable. Please set GOOGLE_API_KEY."
        )
    
    if not request.current_roadmap:
        raise HTTPException(status_code=400, detail="No roadmap provided")
    if not request.modification_request:
        raise HTTPException(status_code=400, detail="No modification request provided")
    
    try:
        from crew.resume_crew import ResumeCrew
        crew = ResumeCrew()
        
        result = crew.modify_roadmap(request.current_roadmap, request.modification_request)
        
        return {
            "success": True,
            "data": result
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error modifying roadmap: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

