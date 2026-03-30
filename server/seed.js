const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Admin = require('./models/Admin');
const Profile = require('./models/Profile');
const Skill = require('./models/Skill');
const Project = require('./models/Project');
const Portfolio = require('./models/Portfolio');

const seedData = async () => {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // ─── 1. SEED ADMIN ───
    console.log('\n📦 Seeding Admin...');
    await Admin.deleteMany({});
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_DEFAULT_PASSWORD || 'Joyboy@123v', 12);
    const admin = await Admin.create({
      email: 'admin@portfolio.com',
      password: hashedPassword,
      name: 'Vignesh',
    });
    console.log(`   ✅ Admin created: ${admin.email} (password: ${process.env.ADMIN_DEFAULT_PASSWORD || 'Joyboy@123v'})`);

    // ─── 2. SEED PROFILE ───
    console.log('\n📦 Seeding Profile...');
    await Profile.deleteMany({});
    const profile = await Profile.create({
      name: 'Vignesh',
      title: 'Full Stack Developer',
      roles: ['Software Engineer', 'Full Stack Developer', 'Creative Coder'],
      bio: 'Crafting digital experiences that merge exceptional design with flawless engineering. I specialize in building scalable MERN stack applications with pixel-perfect user interfaces.',
      avatar: 'https://ui-avatars.com/api/?name=Vignesh&background=4f46e5&color=fff&size=256&font-size=0.4',
      socials: {
        github: 'https://github.com',
        linkedin: 'https://linkedin.com',
        email: 'vignesh@example.com',
      },
      resumeUrl: '#',
      isPublished: true,
    });
    console.log(`   ✅ Profile created: ${profile.name}`);

    // ─── 3. SEED SKILLS ───
    console.log('\n📦 Seeding Skills...');
    await Skill.deleteMany({});
    const skills = [
      { name: 'React.js', category: 'Frontend', level: 'Advanced', order: 1 },
      { name: 'Next.js', category: 'Frontend', level: 'Advanced', order: 2 },
      { name: 'Tailwind CSS', category: 'Frontend', level: 'Advanced', order: 3 },
      { name: 'Node.js', category: 'Backend', level: 'Advanced', order: 4 },
      { name: 'Express', category: 'Backend', level: 'Advanced', order: 5 },
      { name: 'MongoDB', category: 'Database', level: 'Advanced', order: 6 },
      { name: 'PostgreSQL', category: 'Database', level: 'Intermediate', order: 7 },
      { name: 'TypeScript', category: 'Languages', level: 'Intermediate', order: 8 },
    ];
    const createdSkills = await Skill.insertMany(skills);
    console.log(`   ✅ ${createdSkills.length} skills created`);

    // ─── 4. SEED PROJECTS ───
    console.log('\n📦 Seeding Projects...');
    await Project.deleteMany({});
    const projects = [
      {
        title: 'Nova E-Commerce',
        description: 'Next-generation headless e-commerce platform featuring dynamic routing, real-time inventory management, and seamless Stripe integration.',
        shortDescription: 'Headless e-commerce platform',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop',
        liveLink: '#',
        githubLink: '#',
        tags: ['React', 'Node.js', 'MongoDB', 'Tailwind'],
        category: 'Full Stack',
        featured: true,
        status: 'Completed',
        order: 1,
      },
      {
        title: 'Aura AI Chat',
        description: 'Intelligent conversational interface powered by large language models, featuring real-time socket connections and context-aware responses.',
        shortDescription: 'AI chat interface',
        image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2165&auto=format&fit=crop',
        liveLink: '#',
        githubLink: '#',
        tags: ['MERN', 'Socket.io', 'OpenAI'],
        category: 'Full Stack',
        featured: true,
        status: 'Completed',
        order: 2,
      },
    ];
    const createdProjects = await Project.insertMany(projects);
    console.log(`   ✅ ${createdProjects.length} projects created`);

    // ─── 5. SEED PORTFOLIO (legacy blob for backward compat) ───
    console.log('\n📦 Seeding Portfolio blob...');
    await Portfolio.deleteMany({});
    await Portfolio.create({
      data: {
        hero: {
          name: profile.name,
          roles: profile.roles,
          bio: profile.bio,
          avatar: profile.avatar,
        },
        leetcode: {
          solved: 124,
          easy: 55,
          medium: 6,
          hard: 1,
          streak: 24,
          ranking: 'Unranked',
          topPercentage: 'N/A',
          acceptanceRate: 'N/A',
          languages: 'Java',
          leetcodeLink: 'https://leetcode.com/u/Joy_boy485',
        },
        skills: createdSkills.map(s => ({
          id: s._id.toString(),
          name: s.name,
          category: s.category,
        })),
        projects: createdProjects.map(p => ({
          id: p._id.toString(),
          title: p.title,
          description: p.description,
          image: p.image,
          liveLink: p.liveLink,
          githubLink: p.githubLink,
          tags: p.tags,
        })),
        resumeHighlights: [
          'Specialized in scalable MERN stack architectures',
          'Track record of improving web performance metrics by 40%+',
          'Passionate about responsive, pixel-perfect UI/UX design',
          'Strong background in Agile development and CI/CD pipelines',
        ],
        resumeUrl: '#',
        socials: profile.socials,
        theme: {
          primary: '#6366f1',
          secondary: '#0a0a0c',
          accent: '#f59e0b',
        },
      },
    });
    console.log('   ✅ Portfolio blob created');

    console.log('\n🎉 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   ALL DATA SEEDED TO MONGODB ATLAS!');
    console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Admin email:    admin@portfolio.com`);
    console.log(`   Admin password: ${process.env.ADMIN_DEFAULT_PASSWORD || 'Joyboy@123v'}`);
    console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB Atlas');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seedData();
