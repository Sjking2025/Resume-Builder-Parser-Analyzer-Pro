"""
Resume Analysis AI Service - FastAPI Server
Provides AI-powered resume analysis using CrewAI agents with Google Gemini.
"""

import os
from typing import Optional
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException, UploadFile, File
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

