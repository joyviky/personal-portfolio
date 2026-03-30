const Skill = require('../models/Skill');

const getSkills = async (req, res) => {
  try {
    const skills = await Skill.find().sort({ order: 1, createdAt: -1 });
    res.json(skills);
  } catch (error) {
    console.error('Error fetching skills:', error.message);
    res.status(500).json({ message: 'Failed to fetch skills from database', error: error.message });
  }
};

const createSkill = async (req, res) => {
  try {
    const { name, category, level, description } = req.body;

    if (!name || !category) {
      return res.status(400).json({ message: 'Name and category are required' });
    }

    const skill = new Skill({
      name,
      category,
      level: level || 'Intermediate',
      description: description || '',
      image: req.file ? (req.file.secure_url || req.file.path) : '',
    });

    const savedSkill = await skill.save();
    console.log('✅ Skill saved to MongoDB Atlas:', savedSkill.name);
    res.status(201).json(savedSkill);
  } catch (error) {
    console.error('❌ Error creating skill:', error.message);
    res.status(500).json({ message: 'Failed to save skill to database', error: error.message });
  }
};

const updateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, level, description } = req.body;

    const skill = await Skill.findById(id);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    if (name) skill.name = name;
    if (category) skill.category = category;
    if (level) skill.level = level;
    if (description !== undefined) skill.description = description;
    if (req.file) skill.image = req.file.secure_url || req.file.path;

    const updatedSkill = await skill.save();
    console.log('✅ Skill updated in MongoDB Atlas:', updatedSkill.name);
    res.json(updatedSkill);
  } catch (error) {
    console.error('❌ Error updating skill:', error.message);
    res.status(500).json({ message: 'Failed to update skill in database', error: error.message });
  }
};

const deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const skill = await Skill.findByIdAndDelete(id);

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    console.log('✅ Skill deleted from MongoDB Atlas:', skill.name);
    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting skill:', error.message);
    res.status(500).json({ message: 'Failed to delete skill from database', error: error.message });
  }
};

module.exports = { getSkills, createSkill, updateSkill, deleteSkill };
