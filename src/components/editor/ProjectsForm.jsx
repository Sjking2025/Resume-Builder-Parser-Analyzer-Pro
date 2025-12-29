import React, { useState } from 'react'
import useResumeStore from '../../store/useResumeStore'
import { FaCode, FaPlus, FaTrash } from 'react-icons/fa'

const ProjectsForm = () => {
  const { resume, addProject, updateProject, removeProject } = useResumeStore()

  const emptyProject = {
    name: '',
    technologies: '',
    link: '',
    description: '',
  }

  const [newProject, setNewProject] = useState(emptyProject)

  const handleAdd = () => {
    if (newProject.name) {
      addProject(newProject)
      setNewProject(emptyProject)
    }
  }

  const handleUpdate = (index, field, value) => {
    updateProject(index, { [field]: value })
  }

  return (
    <div className="section-card">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <FaCode className="text-primary-600" />
        Projects
      </h3>

      {/* Existing Projects */}
      {resume.projects.map((proj, index) => (
        <div key={index} className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
          <div className="flex justify-between items-start mb-3">
            <h4 className="font-semibold text-gray-900">{proj.name}</h4>
            <button
              onClick={() => removeProject(index)}
              className="text-red-500 hover:text-red-700 transition-colors"
            >
              <FaTrash />
            </button>
          </div>
          
          <div className="space-y-3">
            <input
              type="text"
              value={proj.name}
              onChange={(e) => handleUpdate(index, 'name', e.target.value)}
              placeholder="Project Name"
              className="input-field text-sm"
            />
            
            <input
              type="text"
              value={proj.technologies}
              onChange={(e) => handleUpdate(index, 'technologies', e.target.value)}
              placeholder="Technologies Used (e.g., React, Node.js, MongoDB)"
              className="input-field text-sm"
            />
            
            <input
              type="url"
              value={proj.link}
              onChange={(e) => handleUpdate(index, 'link', e.target.value)}
              placeholder="Project Link (GitHub, Live Demo, etc.)"
              className="input-field text-sm"
            />
            
            <textarea
              value={proj.description}
              onChange={(e) => handleUpdate(index, 'description', e.target.value)}
              placeholder="Project description and key features (one per line)"
              rows="4"
              className="input-field text-sm resize-none"
            />
          </div>
        </div>
      ))}

      {/* Add New Project */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <h4 className="font-semibold text-gray-700 mb-3">Add Project</h4>
        <div className="space-y-3">
          <input
            type="text"
            value={newProject.name}
            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
            placeholder="Project Name *"
            className="input-field text-sm"
          />
          
          <input
            type="text"
            value={newProject.technologies}
            onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })}
            placeholder="Technologies Used"
            className="input-field text-sm"
          />
          
          <input
            type="url"
            value={newProject.link}
            onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
            placeholder="Project Link"
            className="input-field text-sm"
          />
          
          <textarea
            value={newProject.description}
            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            placeholder="Project description and key features"
            rows="4"
            className="input-field text-sm resize-none"
          />
          
          <button
            onClick={handleAdd}
            className="btn-primary flex items-center gap-2"
            disabled={!newProject.name}
          >
            <FaPlus /> Add Project
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProjectsForm
