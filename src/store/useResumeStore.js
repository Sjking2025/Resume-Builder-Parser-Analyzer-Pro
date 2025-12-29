import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useResumeStore = create(
    persist(
        (set, get) => ({
            // Current resume data
            resume: {
                id: null,
                templateId: 'ats', // 'ats' or 'modern'
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
            },

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
            },

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

            loadResume: (resume) => set({ resume, isDirty: false }),

            clearResume: () =>
                set({
                    resume: {
                        id: null,
                        templateId: 'ats',
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
                        skills: { technical: [], soft: [], languages: [] },
                        projects: [],
                        experience: [],
                        achievements: [],
                    },
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
