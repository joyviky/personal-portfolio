const Project = require('../models/Project');

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ order: 1, createdAt: -1 });
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error.message);
    res.status(500).json({ message: 'Failed to fetch projects from database', error: error.message });
  }
};

const createProject = async (req, res) => {
  try {
    const { title, description, shortDescription, category, tags, liveLink, githubLink, featured, status } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const project = new Project({
      title,
      description,
      shortDescription: shortDescription || '',
      category: category || '',
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      liveLink: liveLink || '',
      githubLink: githubLink || '',
      image: req.file ? (req.file.secure_url || req.file.path) : '',
      featured: featured === 'true',
      status: status || 'completed',
    });

    const savedProject = await project.save();
    console.log('✅ Project saved to MongoDB Atlas:', savedProject.title);
    res.status(201).json(savedProject);
  } catch (error) {
    console.error('❌ Error creating project:', error.message);
    res.status(500).json({ message: 'Failed to save project to database', error: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, shortDescription, category, tags, liveLink, githubLink, featured, status } = req.body;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (title) project.title = title;
    if (description) project.description = description;
    if (shortDescription !== undefined) project.shortDescription = shortDescription;
    if (category) project.category = category;
    if (tags) project.tags = tags.split(',').map(t => t.trim());
    if (liveLink !== undefined) project.liveLink = liveLink;
    if (githubLink !== undefined) project.githubLink = githubLink;
    if (featured !== undefined) project.featured = featured === 'true';
    if (status) project.status = status;
    if (req.file) project.image = req.file.secure_url || req.file.path;

    const updatedProject = await project.save();
    console.log('✅ Project updated in MongoDB Atlas:', updatedProject.title);
    res.json(updatedProject);
  } catch (error) {
    console.error('❌ Error updating project:', error.message);
    res.status(500).json({ message: 'Failed to update project in database', error: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    console.log('✅ Project deleted from MongoDB Atlas:', project.title);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting project:', error.message);
    res.status(500).json({ message: 'Failed to delete project from database', error: error.message });
  }
};

module.exports = { getProjects, createProject, updateProject, deleteProject };
