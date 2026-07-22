import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// All CV-extended section keys (beyond the original 6 resume sections)
export const CV_SECTION_KEYS = [
    'publications',
    'research',
    'certifications',
    'awards',
    'patents',
    'conferences',
    'workshops',
    'internships',
    'leadership',
    'volunteer',
    'interests',
    'references',
]

// Human-readable labels for CV sections
export const CV_SECTION_LABELS = {
    publications: 'Publications',
    research: 'Research',
    certifications: 'Certifications',
    awards: 'Awards',
    patents: 'Patents',
    conferences: 'Conferences',
    workshops: 'Workshops',
    internships: 'Internships',
    leadership: 'Leadership',
    volunteer: 'Volunteer Work',
    interests: 'Interests',
    references: 'References',
}

// Default empty state for the resume/document object
const getDefaultResume = () => ({
    id: null,
    templateId: 'ats', // 'ats' or 'modern'
    documentType: 'resume', // 'resume' | 'cv'
    documentMeta: {
        detectedType: null,
        confidence: null,
        pageCount: null,
        originalFileName: null,
    },
    personalInfo: {
        fullName: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        github: '',
        portfolio: '',
        summary: '',
    },
    education: [],
    skills: {
        technical: [],
        soft: [],
        languages: [],
    },
    projects: [],
    experience: [],
    achievements: [],
    // CV-extended sections (empty by default, backward compatible)
    publications: [],
    research: [],
    certifications: [],
    awards: [],
    patents: [],
    conferences: [],
    workshops: [],
    internships: [],
    leadership: [],
    volunteer: [],
    interests: [],
    references: [],
    // Catch-all for unknown/custom sections
    customSections: [],
    // Optional passport photo
    photo: {
        enabled: false,
        originalImage: null,
        croppedImage: null,
        crop: { x: 0, y: 0 },
        zoom: 1,
        shape: 'circle',
        aspectRatio: 1, // 1 for circle/square, 3/4 for portrait
    },
})

const useResumeStore = create(
    persist(
        (set, get) => ({
            // Current resume data
            resume: getDefaultResume(),

            // Section order for drag-and-drop
            sectionOrder: [
                'personalInfo',
                'summary',
                'experience',
                'education',
                'projects',
                'skills',
                'achievements',
            ],

            // Draft tracking
            isDirty: false,
            lastSaved: null,
            autoSaveEnabled: true,

            // Format settings
            formatting: {
                fontSize: 'medium', // 'small', 'medium', 'large'
                lineSpacing: 'normal', // 'compact', 'normal', 'relaxed'
                margins: 'normal', // 'narrow', 'normal', 'wide'
                colorScheme: 'blue', // for modern template
                exportMode: 'digital', // 'digital' (shows URLs) or 'print' (shows labels)
                skillsLayout: 'tags', // 'tags', 'bullets', 'comma'
            },

            // ═══════════════════════════════════════════════════════════════════
            // EXISTING RESUME ACTIONS (unchanged, backward compatible)
            // ═══════════════════════════════════════════════════════════════════

            // Actions
            setTemplate: (templateId) => set({ resume: { ...get().resume, templateId }, isDirty: true }),

            updatePersonalInfo: (data) =>
                set({
                    resume: { ...get().resume, personalInfo: { ...get().resume.personalInfo, ...data } },
                    isDirty: true,
                }),

            addEducation: (education) =>
                set({
                    resume: { ...get().resume, education: [...get().resume.education, education] },
                    isDirty: true,
                }),

            updateEducation: (index, data) =>
                set({
                    resume: {
                        ...get().resume,
                        education: get().resume.education.map((edu, i) => (i === index ? { ...edu, ...data } : edu)),
                    },
                    isDirty: true,
                }),

            removeEducation: (index) =>
                set({
                    resume: {
                        ...get().resume,
                        education: get().resume.education.filter((_, i) => i !== index),
                    },
                    isDirty: true,
                }),

            updateSkills: (category, skills) =>
                set({
                    resume: { ...get().resume, skills: { ...get().resume.skills, [category]: skills } },
                    isDirty: true,
                }),

            addProject: (project) =>
                set({
                    resume: { ...get().resume, projects: [...get().resume.projects, project] },
                    isDirty: true,
                }),

            updateProject: (index, data) =>
                set({
                    resume: {
                        ...get().resume,
                        projects: get().resume.projects.map((proj, i) => (i === index ? { ...proj, ...data } : proj)),
                    },
                    isDirty: true,
                }),

            removeProject: (index) =>
                set({
                    resume: {
                        ...get().resume,
                        projects: get().resume.projects.filter((_, i) => i !== index),
                    },
                    isDirty: true,
                }),

            addExperience: (experience) =>
                set({
                    resume: { ...get().resume, experience: [...get().resume.experience, experience] },
                    isDirty: true,
                }),

            updateExperience: (index, data) =>
                set({
                    resume: {
                        ...get().resume,
                        experience: get().resume.experience.map((exp, i) => (i === index ? { ...exp, ...data } : exp)),
                    },
                    isDirty: true,
                }),

            removeExperience: (index) =>
                set({
                    resume: {
                        ...get().resume,
                        experience: get().resume.experience.filter((_, i) => i !== index),
                    },
                    isDirty: true,
                }),

            addAchievement: (achievement) =>
                set({
                    resume: { ...get().resume, achievements: [...get().resume.achievements, achievement] },
                    isDirty: true,
                }),

            updateAchievement: (index, data) =>
                set({
                    resume: {
                        ...get().resume,
                        achievements: get().resume.achievements.map((ach, i) => (i === index ? { ...ach, ...data } : ach)),
                    },
                    isDirty: true,
                }),

            removeAchievement: (index) =>
                set({
                    resume: {
                        ...get().resume,
                        achievements: get().resume.achievements.filter((_, i) => i !== index),
                    },
                    isDirty: true,
                }),

            updateSectionOrder: (newOrder) => set({ sectionOrder: newOrder, isDirty: true }),

            updateFormatting: (formatting) =>
                set({ formatting: { ...get().formatting, ...formatting }, isDirty: true }),

            markClean: () => set({ isDirty: false, lastSaved: new Date().toISOString() }),

            // ═══════════════════════════════════════════════════════════════════
            // NEW CV-SUPPORT ACTIONS
            // ═══════════════════════════════════════════════════════════════════

            // Set document type: 'resume' or 'cv'
            setDocumentType: (type) =>
                set({
                    resume: { ...get().resume, documentType: type },
                    isDirty: true,
                }),

            // Update document metadata (detection results, page count, etc.)
            updateDocumentMeta: (meta) =>
                set({
                    resume: {
                        ...get().resume,
                        documentMeta: { ...get().resume.documentMeta, ...meta },
                    },
                }),

            // Generic section CRUD — works for any array section key
            // (publications, research, certifications, awards, patents,
            //  conferences, workshops, internships, leadership, volunteer,
            //  interests, references)
            addSectionItem: (sectionKey, item) => {
                const current = get().resume[sectionKey]
                if (!Array.isArray(current)) return
                set({
                    resume: { ...get().resume, [sectionKey]: [...current, item] },
                    isDirty: true,
                })
            },

            updateSectionItem: (sectionKey, index, data) => {
                const current = get().resume[sectionKey]
                if (!Array.isArray(current)) return
                set({
                    resume: {
                        ...get().resume,
                        [sectionKey]: current.map((item, i) => (i === index ? { ...item, ...data } : item)),
                    },
                    isDirty: true,
                })
            },

            removeSectionItem: (sectionKey, index) => {
                const current = get().resume[sectionKey]
                if (!Array.isArray(current)) return
                set({
                    resume: {
                        ...get().resume,
                        [sectionKey]: current.filter((_, i) => i !== index),
                    },
                    isDirty: true,
                })
            },

            // Custom sections — catch-all for unknown section types
            addCustomSection: (title) =>
                set({
                    resume: {
                        ...get().resume,
                        customSections: [
                            ...get().resume.customSections,
                            { id: Date.now().toString(), title, items: [] },
                        ],
                    },
                    isDirty: true,
                }),

            updateCustomSection: (index, data) =>
                set({
                    resume: {
                        ...get().resume,
                        customSections: get().resume.customSections.map((sec, i) =>
                            i === index ? { ...sec, ...data } : sec
                        ),
                    },
                    isDirty: true,
                }),

            removeCustomSection: (index) =>
                set({
                    resume: {
                        ...get().resume,
                        customSections: get().resume.customSections.filter((_, i) => i !== index),
                    },
                    isDirty: true,
                }),

            addCustomSectionItem: (sectionIndex, item) => {
                const sections = [...get().resume.customSections]
                if (!sections[sectionIndex]) return
                sections[sectionIndex] = {
                    ...sections[sectionIndex],
                    items: [...sections[sectionIndex].items, item],
                }
                set({
                    resume: { ...get().resume, customSections: sections },
                    isDirty: true,
                })
            },

            updateCustomSectionItem: (sectionIndex, itemIndex, data) => {
                const sections = [...get().resume.customSections]
                if (!sections[sectionIndex]) return
                sections[sectionIndex] = {
                    ...sections[sectionIndex],
                    items: sections[sectionIndex].items.map((item, i) =>
                        i === itemIndex ? { ...item, ...data } : item
                    ),
                }
                set({
                    resume: { ...get().resume, customSections: sections },
                    isDirty: true,
                })
            },

            removeCustomSectionItem: (sectionIndex, itemIndex) => {
                const sections = [...get().resume.customSections]
                if (!sections[sectionIndex]) return
                sections[sectionIndex] = {
                    ...sections[sectionIndex],
                    items: sections[sectionIndex].items.filter((_, i) => i !== itemIndex),
                }
                set({
                    resume: { ...get().resume, customSections: sections },
                    isDirty: true,
                })
            },

            // ═══════════════════════════════════════════════════════════════════
            // PHOTO SUPPORT ACTIONS
            // ═══════════════════════════════════════════════════════════════════

            togglePhoto: (enabled) =>
                set({
                    resume: {
                        ...get().resume,
                        photo: { ...get().resume.photo, enabled },
                    },
                    isDirty: true,
                }),

            updatePhoto: (data) =>
                set({
                    resume: {
                        ...get().resume,
                        photo: { ...get().resume.photo, ...data },
                    },
                    isDirty: true,
                }),

            // ═══════════════════════════════════════════════════════════════════
            // LOAD & CLEAR (extended for CV support)
            // ═══════════════════════════════════════════════════════════════════

            // Load a new resume/CV, but preserve the current templateId, formatting, and sectionOrder
            loadResume: (incomingResume) => {
                const currentState = get()
                set({ 
                    resume: {
                        ...incomingResume,
                        // Preserve display settings - never let tailoring reset the user's template choice
                        templateId: incomingResume.templateId || currentState.resume.templateId,
                        // Document type awareness
                        documentType: incomingResume.documentType || 'resume',
                        documentMeta: incomingResume.documentMeta || currentState.resume.documentMeta,
                        // Ensure nested arrays and objects are always at least empty defaults
                        personalInfo: incomingResume.personalInfo || {},
                        education: incomingResume.education || [],
                        experience: incomingResume.experience || [],
                        projects: incomingResume.projects || [],
                        skills: incomingResume.skills || { technical: [], soft: [], languages: [] },
                        achievements: incomingResume.achievements || [],
                        // CV-extended sections (safe defaults for backward compat)
                        publications: incomingResume.publications || [],
                        research: incomingResume.research || [],
                        certifications: incomingResume.certifications || [],
                        awards: incomingResume.awards || [],
                        patents: incomingResume.patents || [],
                        conferences: incomingResume.conferences || [],
                        workshops: incomingResume.workshops || [],
                        internships: incomingResume.internships || [],
                        leadership: incomingResume.leadership || [],
                        volunteer: incomingResume.volunteer || [],
                        interests: incomingResume.interests || [],
                        references: incomingResume.references || [],
                        customSections: incomingResume.customSections || [],
                        // Photo support
                        photo: incomingResume.photo || currentState.resume.photo || getDefaultResume().photo,
                    },
                    isDirty: false 
                })
            },

            clearResume: () =>
                set({
                    resume: getDefaultResume(),
                    isDirty: false,
                    lastSaved: null,
                }),
        }),
        {
            name: 'resume-storage',
            partialize: (state) => ({
                resume: state.resume,
                sectionOrder: state.sectionOrder,
                formatting: state.formatting,
                lastSaved: state.lastSaved,
            }),
        }
    )
)

export default useResumeStore
