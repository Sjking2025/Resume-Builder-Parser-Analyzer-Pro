# Resume Builder Platform 🚀

A 100% free, AI-powered resume platform that feels like premium tools (Resume.io, Rezi, Novorésumé) but is student-first, privacy-respecting, and completely open.

## ✨ Features

### Phase 1 (MVP) - Available Now
- ✅ **18 Professional Templates**: ATS-friendly and modern resume templates with live preview
- ✅ **Form-Based Editor**: Structured sections for personal info, experience, education, projects, skills, and achievements
- ✅ **Live Preview**: Real-time preview that updates as you type
- ✅ **Smart Draft Protection**: Never lose your work with auto-save and unsaved changes warnings
- ✅ **PDF Export**: Generate pixel-perfect, ATS-friendly PDFs
- ✅ **100% Free**: No watermarks, no paywalls, no dark UX patterns

### Phase 2 (AI-Powered) - 🆕 Available Now!
- ✅ **Resume Import**: Upload existing resume PDF → AI extracts data → Auto-fills all form fields
- ✅ **AI Resume Analysis**: Comprehensive multi-agent analysis using CrewAI + Google Gemini 2.5 Flash
- ✅ **ATS Scoring**: Get your resume scored with detailed breakdown (keyword match, formatting, skills coverage)
- ✅ **Job Description Matching**: Align your resume to specific job postings with skill gap analysis
- ✅ **Export Mode Toggle**: Switch between Digital/ATS (shows URLs) and Print Copy (shows labels) modes

### Coming Soon
- 🔮 **Personalized Learning Roadmap**: AI-generated skill development paths based on career goals

## 🎯 Core Promise

- ❌ No watermarks
- ❌ No paywalls
- ❌ No dark UX tricks
- ✅ Same power as premium tools
- ✅ Privacy-first (your data stays on your device)
- ✅ Student-focused

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- Python 3.10+ (for AI features)
- npm or yarn
- Google API Key (for AI features - get free at [Google AI Studio](https://aistudio.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sjking2025/resume-builder-pro.git
   cd resume-builder-pro
   ```

2. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../server
   npm install
   ```

4. **Set up Python AI service**
   ```bash
   cd ../ai_service
   python -m venv venv
   .\venv\Scripts\activate  # Windows
   # source venv/bin/activate  # Mac/Linux
   pip install -r requirements.txt
   ```

5. **Set up environment variables**
   ```bash
   # In ai_service folder
   cp .env.example .env
   # Edit .env and add your GOOGLE_API_KEY
   ```

### Running Locally

1. **Start the AI service** (Terminal 1)
   ```bash
   cd ai_service
   .\venv\Scripts\activate
   uvicorn main:app --port 8000
   ```
   AI service will run on `http://localhost:8000`

2. **Start the backend server** (Terminal 2)
   ```bash
   cd server
   npm run dev
   ```
   Server will run on `http://localhost:5000`

3. **Start the frontend** (Terminal 3)
   ```bash
   cd client
   npm run dev
   ```
   App will run on `http://localhost:5173`

4. **Open your browser** and navigate to `http://localhost:5173`

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Router** - Navigation
- **React Icons** - Icon library
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime
- **Express** - Web framework with API proxy
- **Puppeteer** - PDF generation
- **Axios + Form-data** - File upload handling

### AI Service
- **Python FastAPI** - AI service framework
- **CrewAI** - Multi-agent orchestration
- **Google Gemini 2.5 Flash** - LLM for analysis
- **PyPDF2** - PDF text extraction

## 📁 Project Structure

```
Resume Builder Platform/
│
├── client/                           # Frontend React Application
│   ├── public/                      # Static assets
│   │   └── vite.svg                # Vite logo
│   ├── src/
│   │   ├── components/             # React Components
│   │   │   ├── ai/                 # AI Analysis Components
│   │   │   │   ├── ATSScoreCard.jsx           # ATS score display
│   │   │   │   ├── AnalysisProgress.jsx       # Analysis loading states
│   │   │   │   ├── CareerGuidance.jsx         # Career recommendations
│   │   │   │   ├── ImprovementSuggestions.jsx # Content improvement tips
│   │   │   │   ├── JDMatcher.jsx              # Job description matching
│   │   │   │   └── SkillGapAnalysis.jsx       # Skill gap visualization
│   │   │   │
│   │   │   ├── DraftProtection/    # Auto-save System
│   │   │   │   └── DraftProtection.jsx        # Draft auto-save wrapper
│   │   │   │
│   │   │   ├── editor/             # Form Input Components
│   │   │   │   ├── AchievementsForm.jsx       # Achievements/certifications
│   │   │   │   ├── EducationForm.jsx          # Education history
│   │   │   │   ├── ExperienceForm.jsx         # Work experience
│   │   │   │   ├── PersonalInfoForm.jsx       # Contact information
│   │   │   │   ├── ProjectsForm.jsx           # Projects portfolio
│   │   │   │   └── SkillsForm.jsx             # Technical & soft skills
│   │   │   │
│   │   │   ├── import/             # Resume Import
│   │   │   │   └── ResumeImportModal.jsx      # PDF upload & parsing modal
│   │   │   │
│   │   │   ├── preview/            # Live Preview
│   │   │   │   └── LivePreview.jsx            # Real-time resume preview
│   │   │   │
│   │   │   └── templates/          # 18 Resume Templates
│   │   │       ├── ATSTemplate.jsx            # ATS-optimized layout
│   │   │       ├── AcademicTemplate.jsx       # Academic/Research focused
│   │   │       ├── BlueAccentTemplate.jsx     # Blue color scheme
│   │   │       ├── BoldHeaderTemplate.jsx     # Bold header design
│   │   │       ├── ClassicTemplate.jsx        # Traditional serif style
│   │   │       ├── CleanGridTemplate.jsx      # Grid-based layout
│   │   │       ├── CompactTemplate.jsx        # Dense information layout
│   │   │       ├── CorporateTemplate.jsx      # Corporate professional
│   │   │       ├── CreativeTemplate.jsx       # Creative industries
│   │   │       ├── ElegantTemplate.jsx        # Elegant serif design
│   │   │       ├── ExecutiveTemplate.jsx      # Executive level
│   │   │       ├── MinimalTemplate.jsx        # Minimalist design
│   │   │       ├── ModernSplitTemplate.jsx    # Two-tone split layout
│   │   │       ├── ModernTemplate.jsx         # Modern sans-serif
│   │   │       ├── ProfessionalTemplate.jsx   # Professional layout
│   │   │       ├── SidebarTemplate.jsx        # Sidebar navigation
│   │   │       ├── TechnicalTemplate.jsx      # Tech-focused layout
│   │   │       └── TwoColumnTemplate.jsx      # Classic two-column
│   │   │
│   │   ├── config/                 # Configuration
│   │   │   └── api.js              # API endpoints configuration
│   │   │
│   │   ├── pages/                  # Page Components
│   │   │   ├── AIAnalysisPage.jsx  # AI resume analysis page
│   │   │   ├── EditorPage.jsx      # Main resume editor
│   │   │   └── HomePage.jsx        # Landing page
│   │   │
│   │   ├── store/                  # State Management
│   │   │   └── useResumeStore.js   # Zustand store (resume data)
│   │   │
│   │   ├── App.css                 # App-level styles
│   │   ├── App.jsx                 # Root component with routing
│   │   ├── index.css               # Global styles & Tailwind
│   │   └── main.jsx                # React entry point
│   │
│   ├── .gitignore                  # Git ignore rules
│   ├── eslint.config.js            # ESLint configuration
│   ├── index.html                  # HTML entry point
│   ├── package.json                # Dependencies & scripts
│   ├── package-lock.json           # Locked dependency versions
│   ├── postcss.config.js           # PostCSS configuration
│   ├── tailwind.config.js          # Tailwind CSS configuration
│   └── vite.config.js              # Vite build configuration
│
├── server/                          # Backend Node.js Gateway
│   ├── routes/                     # API Routes
│   │   ├── ai.js                   # AI service proxy routes
│   │   └── pdf.js                  # PDF export routes
│   │
│   ├── services/                   # Business Logic
│   │   └── pdfGenerator.js         # Puppeteer PDF generation
│   │
│   ├── .env.example                # Environment variables template
│   ├── .gitignore                  # Git ignore rules
│   ├── index.js                    # Express server entry point
│   ├── package.json                # Dependencies & scripts
│   └── package-lock.json           # Locked dependency versions
│
├── ai_service/                      # Python AI Microservice
│   ├── agents/                     # AI Agent Definitions (deleted - simplified)
│   │
│   ├── crew/                       # Agent Orchestration
│   │   ├── __init__.py             # Package initializer
│   │   └── resume_crew.py          # AI crew logic (Google Gemini)
│   │
│   ├── utils/                      # Utility Functions
│   │   ├── __init__.py             # Package initializer
│   │   └── text_extraction.py     # PDF text extraction (PyPDF2)
│   │
│   ├── .env.example                # Environment template (GOOGLE_API_KEY)
│   ├── .gitignore                  # Git ignore rules
│   ├── main.py                     # FastAPI server entry point
│   └── requirements.txt            # Python dependencies
│
├── screenshots/                     # Template Preview Images
│   └── (18 template screenshots)   # For README documentation
│
├── .git/                           # Git repository data
├── .gitignore                      # Root git ignore rules
├── README.md                       # Project documentation
├── eslint.config.js                # Root ESLint config
├── package.json                    # Root package file
├── package-lock.json               # Root dependency lock
├── postcss.config.js               # PostCSS config
├── tailwind.config.js              # Tailwind config
└── vite.config.js                  # Root Vite config
```

### Key Directories Explained

**Client (Frontend)**
- **components/ai**: AI-powered analysis UI components
- **components/editor**: Form inputs for resume sections
- **components/templates**: 18 professionally designed resume layouts
- **store**: Zustand state management for resume data

**Server (Backend)**
- **routes**: Express API endpoints that proxy to Python AI service
- **services**: PDF generation using Puppeteer

**AI Service (Python)**
- **crew**: Google Gemini-powered resume parsing and analysis
- **utils**: PDF text extraction utilities

## 🎨 Features in Detail

### Draft Protection
- Auto-saves every 3 seconds to localStorage
- Warns before leaving with unsaved changes
- Detects browser back, refresh, and close attempts
- Draft recovery on page reload

### Resume Templates (18 Total)
- **ATS-Friendly**, **Modern**, **Classic**, **Executive**, **Elegant**
- **Creative**, **TwoColumn**, **Minimal**, **Corporate**, **Compact**
- **Sidebar**, **Academic**, **Professional**, **BoldHeader**, **BlueAccent**
- **CleanGrid**, **Technical**, **ModernSplit**

### Export Mode Toggle
- **Digital/ATS Mode**: Shows actual URLs (linkedin.com/in/yourname) - best for AI parsing
- **Print Copy Mode**: Shows labels only (LinkedIn) - cleaner for printed copies

### Resume Import (AI-Powered)
1. Upload your existing resume PDF
2. AI extracts all data (name, contact, experience, education, skills, projects)
3. Auto-fills all form fields in the editor
4. Review and edit as needed

### PDF Export
- Server-side PDF generation using Puppeteer
- ATS-compliant formatting
- Selectable text for parsing
- Professional page layout

## 🔒 Privacy

- **No account required** for basic use
- **LocalStorage only** - your data never leaves your browser
- **No tracking** or analytics
- **Open source** - verify the code yourself

## 🤝 Contributing

This is a student-first project! Contributions are welcome.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the MIT License.

## 🎓 Perfect for Students

This project demonstrates:
- ✅ Full-stack development (React + Node.js)
- ✅ State management (Zustand)
- ✅ PDF generation (Puppeteer)
- ✅ Real-time updates
- ✅ Draft protection patterns
- ✅ Modern UI/UX design
- ✅ RESTful API design
- ✅ Privacy-first architecture

## 🚀 Roadmap

### ✅ Phase 1 - MVP (Complete)
- 18 professional templates
- Form-based editor with live preview
- PDF export

### ✅ Phase 2 - Intelligence (Complete)
- Resume parsing from PDF
- Job description matching algorithm  
- ATS scoring system
- Keyword analysis

### ✅ Phase 3 - AI Features (Complete)
- Multi-agent analysis with CrewAI
- Content improvement suggestions
- JD matching agent
- Skill gap analyzer
- Resume import with AI parsing

### 🔮 Phase 4 - Coming Soon
- Personalized learning roadmap engine
- Progress tracking for skill development
- Integration with online learning platforms

## 💖 Built With Love

Built by students, for students. We understand the struggle of creating the perfect resume.

---

**Star ⭐ this repo if it helped you land your dream job!**
