/**
 * Transform resume data from the resume store into portfolio format
 * This is a client-side fallback that works without the AI API
 */
export const transformResumeToPortfolio = (resume) => {
    if (!resume) return null

    const { personalInfo = {}, education = [], skills = {}, projects = [], experience = [], achievements = [] } = resume

    // Generate a professional headline based on experience
    const generateHeadline = () => {
        if (experience.length > 0) {
            const latestJob = experience[0]
            return latestJob.title || 'Professional'
        }
        if (education.length > 0) {
            const latestEdu = education[0]
            return `${latestEdu.degree} Graduate` || 'Student'
        }
        return 'Professional'
    }

    // Extract key technical skills as highlights
    const getHighlights = () => {
        const highlights = []
        if (skills.technical?.length > 0) {
            highlights.push(...skills.technical.slice(0, 3))
        }
        if (experience.length > 0) {
            highlights.push(`${experience.length}+ Years Experience`)
        }
        if (projects.length > 0) {
            highlights.push(`${projects.length} Projects`)
        }
        return highlights.slice(0, 5)
    }

    // Transform technical skills with estimated levels
    const transformTechnicalSkills = () => {
        if (!skills.technical || skills.technical.length === 0) return []
        return skills.technical.slice(0, 10).map((skill, index) => ({
            name: skill,
            level: Math.max(60, 95 - (index * 5)) // Top skills get higher levels
        }))
    }

    // Transform projects with enhanced data
    const transformProjects = () => {
        if (!projects || projects.length === 0) return []
        return projects.slice(0, 6).map((project, index) => ({
            name: project.name || 'Project',
            tagline: project.tagline || '',
            description: project.description || '',
            impact: project.impact || '',
            tech: project.technologies
                ? (typeof project.technologies === 'string'
                    ? project.technologies.split(',').map(t => t.trim()).filter(Boolean)
                    : project.technologies)
                : [],
            github: (project.link && project.link.toLowerCase().includes('github')) ? project.link : '',
            demo: (project.link && !project.link.toLowerCase().includes('github')) ? project.link : '',
            featured: index === 0 // First project is featured
        }))
    }

    // Transform experience with period formatting
    const transformExperience = () => {
        if (!experience || experience.length === 0) return []
        return experience.map(exp => ({
            title: exp.title || '',
            company: exp.company || '',
            period: `${exp.startDate || ''} - ${exp.current ? 'Present' : (exp.endDate || 'Present')}`,
            description: exp.description || '',
            highlights: exp.highlights || []
        }))
    }

    // Transform education
    const transformEducation = () => {
        if (!education || education.length === 0) return []
        return education.map(edu => ({
            degree: edu.degree || '',
            institution: edu.institution || '',
            year: edu.graduationDate || '',
            highlights: edu.achievements ? [edu.achievements] : []
        }))
    }

    // Suggest theme based on content
    const suggestTheme = () => {
        const techSkills = skills.technical || []
        const techKeywords = ['javascript', 'python', 'react', 'node', 'java', 'c++', 'golang', 'rust', 'typescript', 'developer', 'engineer', 'programming']
        const isTechnical = techSkills.some(skill =>
            techKeywords.some(kw => skill.toLowerCase().includes(kw))
        ) || (experience.length > 0 && experience.some(exp =>
            techKeywords.some(kw => (exp.title || '').toLowerCase().includes(kw))
        ))
        return isTechnical ? 'technical' : 'minimal'
    }

    return {
        hero: {
            name: personalInfo.fullName || 'Your Name',
            headline: generateHeadline(),
            tagline: personalInfo.summary?.slice(0, 150) || '',
            ctaText: 'Get In Touch'
        },
        about: {
            title: 'About Me',
            content: personalInfo.summary || 'Welcome to my portfolio.',
            highlights: getHighlights()
        },
        skills: {
            technical: transformTechnicalSkills(),
            soft: skills.soft || [],
            tools: skills.languages || []
        },
        projects: transformProjects(),
        experience: transformExperience(),
        education: transformEducation(),
        contact: {
            email: personalInfo.email || '',
            linkedin: personalInfo.linkedin || '',
            github: personalInfo.github || '',
            location: personalInfo.location || ''
        },
        meta: {
            title: `${personalInfo.fullName || 'Portfolio'} - Portfolio`,
            description: personalInfo.summary?.slice(0, 160) || 'Professional portfolio',
            keywords: skills.technical?.slice(0, 5) || [],
            suggestedTheme: suggestTheme(),
            colorScheme: suggestTheme() === 'technical' ? 'dark' : 'light'
        }
    }
}

export default transformResumeToPortfolio
