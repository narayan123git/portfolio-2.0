const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  resumeUrl: {
    type: String,
    default: ''
  },
  githubUrl: {
    type: String,
    default: 'https://github.com/narayan123git'
  },
  linkedinUrl: {
    type: String,
    default: 'https://linkedin.com/in/narayan-paul'
  },
  heroText: {
    type: String,
    default: 'Welcome to my Portfolio'
  },
  homeParagraph: {
    type: String,
    default: 'I care about consistency, strong fundamentals, and practical implementation. Whether it is DSA, backend design, or deep learning, I try to understand things deeply instead of rushing through them.'
  },
  homeSections: {
    type: [{
      title: { type: String, default: '' },
      eyebrow: { type: String, default: '' },
      body: { type: String, default: '' },
      accent: { type: String, default: 'orange' },
    }],
    default: [
      {
        title: 'My Journey So Far',
        eyebrow: '~/from_curiosity_to_building',
        body: 'I did not get into computer science because it was trendy. I got into it because I genuinely enjoyed solving problems.\n\nEarly on, I was naturally drawn to mathematics and logical thinking. That curiosity translated into consistent academics - around 96% in Class 10, strong performance in Class 12, and then JEE Main.\n\nAt NIT Durgapur (CSE), my focus shifted from just scoring to truly understanding and building. Maintaining a CGPA around 9.4 matters to me, but what matters more is how I used my time outside the classroom.',
        accent: 'orange',
      },
      {
        title: 'How I Learn',
        eyebrow: '~/how_i_learn',
        body: 'I have always seen myself as a builder. During my early phase, I explored web development and built a full-stack MERN project where I handled backend logic, real-time features, and system design decisions.\n\nI have solved 250+ DSA problems, not for numbers, but to train clear thinking under constraints and to stay patient when solutions do not come quickly.\n\nRecently, I have been exploring Machine Learning and Deep Learning through structured learning and hands-on experimentation, especially in computer vision and meaningful applications like healthcare.\n\nOutside coding, I enjoy chess and creative downtime. Both help me reset and improve how I think about complex problems.',
        accent: 'blue',
      },
      {
        title: 'Growth Mindset',
        eyebrow: '~/steady_progress',
        body: 'Overall, I see myself as someone still evolving - not chasing shortcuts, but focusing on steady, meaningful growth. I am not only interested in learning technologies; I am interested in using them to build systems that are efficient, reliable, and impactful.',
        accent: 'slate',
      },
    ],
  },
  primaryColor: {
    type: String,
    default: '#3b82f6' // Default tailwind blue
  },
  isHiring: {
    type: Boolean,
    default: true
  },
  currentStatus: {
    type: String,
    default: 'Actively looking for roles'
  },
  profileImageUrl: {
    type: String,
    default: ''
  },
  homeVideoUrl: {
    type: String,
    default: ''
  },
  showHomeVideo: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// We only ever need one document in this collection
module.exports = mongoose.model('Setting', settingSchema);