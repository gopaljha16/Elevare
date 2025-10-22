// Portfolio template generators with different themes

const generateModernTemplate = (portfolioData) => {
    const { personal, summary, experience, skills, projects, education } = portfolioData;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${personal?.name || 'Portfolio'} - Modern Professional Portfolio</title>
    <meta name="description" content="${summary || 'Professional portfolio showcasing skills and experience'}">
    <meta name="keywords" content="${skills?.technical?.join(', ') || 'professional, portfolio, developer'}">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${personal?.name || 'Portfolio'} - Professional Portfolio">
    <meta property="og:description" content="${summary || 'Professional portfolio showcasing skills and experience'}">
    <meta property="og:type" content="website">
    <meta property="og:image" content="https://via.placeholder.com/1200x630/667eea/ffffff?text=${encodeURIComponent(personal?.name || 'Portfolio')}">
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${personal?.name || 'Portfolio'} - Professional Portfolio">
    <meta name="twitter:description" content="${summary || 'Professional portfolio showcasing skills and experience'}">
    
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    
    <style>
        :root {
            --primary-color: #667eea;
            --secondary-color: #764ba2;
            --accent-color: #f093fb;
            --text-primary: #2d3748;
            --text-secondary: #4a5568;
            --bg-primary: #ffffff;
            --bg-secondary: #f7fafc;
            --border-color: #e2e8f0;
            --shadow: 0 10px 25px rgba(0,0,0,0.1);
            --shadow-hover: 0 20px 40px rgba(0,0,0,0.15);
        }
        
        [data-theme="dark"] {
            --text-primary: #f7fafc;
            --text-secondary: #e2e8f0;
            --bg-primary: #1a202c;
            --bg-secondary: #2d3748;
            --border-color: #4a5568;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: var(--text-primary);
            background: var(--bg-primary);
            overflow-x: hidden;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        /* Header */
        header {
            position: fixed;
            top: 0;
            width: 100%;
            background: rgba(255,255,255,0.95);
            backdrop-filter: blur(10px);
            z-index: 1000;
            padding: 1rem 0;
            transition: all 0.3s ease;
        }
        
        nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo {
            font-size: 1.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .nav-links {
            display: flex;
            list-style: none;
            gap: 2rem;
        }
        
        .nav-links a {
            text-decoration: none;
            color: var(--text-secondary);
            font-weight: 500;
            transition: color 0.3s ease;
            position: relative;
        }
        
        .nav-links a:hover {
            color: var(--primary-color);
        }
        
        .nav-links a::after {
            content: '';
            position: absolute;
            bottom: -5px;
            left: 0;
            width: 0;
            height: 2px;
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            transition: width 0.3s ease;
        }
        
        .nav-links a:hover::after {
            width: 100%;
        }
        
        /* Hero Section */
        .hero {
            min-height: 100vh;
            display: flex;
            align-items: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            position: relative;
            overflow: hidden;
        }
        
        .hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><polygon fill="rgba(255,255,255,0.1)" points="0,1000 1000,0 1000,1000"/></svg>');
            background-size: cover;
        }
        
        .hero-content {
            position: relative;
            z-index: 2;
            text-align: center;
            animation: fadeInUp 1s ease;
        }
        
        .hero h1 {
            font-size: 4rem;
            font-weight: 700;
            margin-bottom: 1rem;
            animation: fadeInUp 1s ease 0.2s both;
        }
        
        .hero .subtitle {
            font-size: 1.5rem;
            margin-bottom: 2rem;
            opacity: 0.9;
            animation: fadeInUp 1s ease 0.4s both;
        }
        
        .hero .description {
            font-size: 1.1rem;
            max-width: 600px;
            margin: 0 auto 3rem;
            opacity: 0.8;
            animation: fadeInUp 1s ease 0.6s both;
        }
        
        .cta-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
            animation: fadeInUp 1s ease 0.8s both;
        }
        
        .btn {
            padding: 12px 30px;
            border: none;
            border-radius: 50px;
            font-weight: 600;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        
        .btn-primary {
            background: rgba(255,255,255,0.2);
            color: white;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.3);
        }
        
        .btn-primary:hover {
            background: rgba(255,255,255,0.3);
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }
        
        .btn-secondary {
            background: transparent;
            color: white;
            border: 2px solid rgba(255,255,255,0.5);
        }
        
        .btn-secondary:hover {
            background: rgba(255,255,255,0.1);
            border-color: white;
        }
        
        /* Sections */
        .section {
            padding: 100px 0;
        }
        
        .section-title {
            text-align: center;
            font-size: 3rem;
            font-weight: 700;
            margin-bottom: 3rem;
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        /* About Section */
        .about {
            background: var(--bg-secondary);
        }
        
        .about-content {
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 4rem;
            align-items: center;
        }
        
        .about-image {
            text-align: center;
        }
        
        .profile-image {
            width: 300px;
            height: 300px;
            border-radius: 50%;
            object-fit: cover;
            border: 5px solid var(--primary-color);
            box-shadow: var(--shadow);
        }
        
        .about-text {
            font-size: 1.1rem;
            line-height: 1.8;
            color: var(--text-secondary);
        }
        
        /* Skills Section */
        .skills-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin-top: 3rem;
        }
        
        .skill-category {
            background: var(--bg-primary);
            padding: 2rem;
            border-radius: 15px;
            box-shadow: var(--shadow);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .skill-category:hover {
            transform: translateY(-5px);
            box-shadow: var(--shadow-hover);
        }
        
        .skill-category h3 {
            font-size: 1.3rem;
            margin-bottom: 1rem;
            color: var(--primary-color);
        }
        
        .skill-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        
        .skill-tag {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 25px;
            font-size: 0.9rem;
            font-weight: 500;
        }
        
        /* Experience Section */
        .experience {
            background: var(--bg-secondary);
        }
        
        .timeline {
            position: relative;
            max-width: 800px;
            margin: 0 auto;
        }
        
        .timeline::before {
            content: '';
            position: absolute;
            left: 50%;
            top: 0;
            bottom: 0;
            width: 2px;
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            transform: translateX(-50%);
        }
        
        .timeline-item {
            position: relative;
            margin-bottom: 3rem;
            width: 50%;
        }
        
        .timeline-item:nth-child(odd) {
            left: 0;
            padding-right: 2rem;
        }
        
        .timeline-item:nth-child(even) {
            left: 50%;
            padding-left: 2rem;
        }
        
        .timeline-content {
            background: var(--bg-primary);
            padding: 2rem;
            border-radius: 15px;
            box-shadow: var(--shadow);
            position: relative;
        }
        
        .timeline-content::before {
            content: '';
            position: absolute;
            top: 20px;
            width: 0;
            height: 0;
            border: 10px solid transparent;
        }
        
        .timeline-item:nth-child(odd) .timeline-content::before {
            right: -20px;
            border-left-color: var(--bg-primary);
        }
        
        .timeline-item:nth-child(even) .timeline-content::before {
            left: -20px;
            border-right-color: var(--bg-primary);
        }
        
        .timeline-date {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 25px;
            font-size: 0.9rem;
            font-weight: 600;
            display: inline-block;
            margin-bottom: 1rem;
        }
        
        /* Projects Section */
        .projects-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 2rem;
            margin-top: 3rem;
        }
        
        .project-card {
            background: var(--bg-primary);
            border-radius: 15px;
            overflow: hidden;
            box-shadow: var(--shadow);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .project-card:hover {
            transform: translateY(-10px);
            box-shadow: var(--shadow-hover);
        }
        
        .project-image {
            height: 200px;
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 3rem;
        }
        
        .project-content {
            padding: 2rem;
        }
        
        .project-title {
            font-size: 1.3rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--text-primary);
        }
        
        .project-description {
            color: var(--text-secondary);
            margin-bottom: 1.5rem;
            line-height: 1.6;
        }
        
        .project-tech {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-bottom: 1.5rem;
        }
        
        .tech-tag {
            background: var(--bg-secondary);
            color: var(--text-secondary);
            padding: 0.3rem 0.8rem;
            border-radius: 15px;
            font-size: 0.8rem;
        }
        
        .project-links {
            display: flex;
            gap: 1rem;
        }
        
        .project-link {
            color: var(--primary-color);
            text-decoration: none;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transition: color 0.3s ease;
        }
        
        .project-link:hover {
            color: var(--secondary-color);
        }
        
        /* Contact Section */
        .contact {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            text-align: center;
        }
        
        .contact-content {
            max-width: 600px;
            margin: 0 auto;
        }
        
        .contact-info {
            display: flex;
            justify-content: center;
            gap: 2rem;
            margin-top: 3rem;
            flex-wrap: wrap;
        }
        
        .contact-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: rgba(255,255,255,0.9);
            text-decoration: none;
            transition: color 0.3s ease;
        }
        
        .contact-item:hover {
            color: white;
        }
        
        /* Footer */
        footer {
            background: var(--text-primary);
            color: white;
            text-align: center;
            padding: 2rem 0;
        }
        
        /* Animations */
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .fade-in-up {
            animation: fadeInUp 0.8s ease;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            .hero h1 { font-size: 2.5rem; }
            .hero .subtitle { font-size: 1.2rem; }
            .section-title { font-size: 2rem; }
            .nav-links { display: none; }
            .about-content { grid-template-columns: 1fr; text-align: center; }
            .timeline::before { left: 20px; }
            .timeline-item { width: 100%; left: 0 !important; padding-left: 3rem !important; padding-right: 0 !important; }
            .timeline-item .timeline-content::before { left: -20px !important; border-right-color: var(--bg-primary) !important; border-left-color: transparent !important; }
            .cta-buttons { flex-direction: column; align-items: center; }
            .contact-info { flex-direction: column; align-items: center; }
        }
        
        /* Dark mode toggle */
        .theme-toggle {
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            color: white;
            border-radius: 50px;
            padding: 10px;
            cursor: pointer;
            z-index: 1001;
            transition: all 0.3s ease;
        }
        
        .theme-toggle:hover {
            background: rgba(255,255,255,0.2);
        }
    </style>
</head>
<body>
    <!-- Theme Toggle -->
    <button class="theme-toggle" onclick="toggleTheme()">
        <i class="fas fa-moon"></i>
    </button>

    <!-- Header -->
    <header>
        <nav class="container">
            <div class="logo">${personal?.name || 'Portfolio'}</div>
            <ul class="nav-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#skills">Skills</a></li>
                <li><a href="#experience">Experience</a></li>
                <li><a href="#projects">Projects</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>

    <!-- Hero Section -->
    <section id="home" class="hero">
        <div class="container">
            <div class="hero-content">
                <h1>${personal?.name || 'Your Name'}</h1>
                <p class="subtitle">${getJobTitle(experience, skills)}</p>
                <p class="description">${summary || 'Passionate professional dedicated to creating innovative solutions and driving excellence in every project.'}</p>
                <div class="cta-buttons">
                    <a href="#projects" class="btn btn-primary">
                        <i class="fas fa-rocket"></i>
                        View My Work
                    </a>
                    <a href="#contact" class="btn btn-secondary">
                        <i class="fas fa-envelope"></i>
                        Get In Touch
                    </a>
                </div>
            </div>
        </div>
    </section>

    <!-- About Section -->
    <section id="about" class="section about">
        <div class="container">
            <h2 class="section-title">About Me</h2>
            <div class="about-content">
                <div class="about-image">
                    <img src="https://via.placeholder.com/300x300/667eea/ffffff?text=${encodeURIComponent((personal?.name || 'Profile').charAt(0))}" alt="Profile" class="profile-image">
                </div>
                <div class="about-text">
                    <p>${summary || 'I am a passionate professional with a strong background in technology and innovation. My journey has been driven by curiosity and a desire to create meaningful solutions that make a difference.'}</p>
                    <br>
                    <p>With expertise in ${skills?.technical?.slice(0, 3)?.join(', ') || 'various technologies'}, I bring a unique blend of technical skills and creative problem-solving to every project.</p>
                    <br>
                    <div class="contact-info" style="justify-content: flex-start; margin-top: 2rem;">
                        ${personal?.email ? `<a href="mailto:${personal.email}" class="contact-item"><i class="fas fa-envelope"></i> ${personal.email}</a>` : ''}
                        ${personal?.phone ? `<a href="tel:${personal.phone}" class="contact-item"><i class="fas fa-phone"></i> ${personal.phone}</a>` : ''}
                        ${personal?.location ? `<span class="contact-item"><i class="fas fa-map-marker-alt"></i> ${personal.location}</span>` : ''}
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Skills Section -->
    <section id="skills" class="section">
        <div class="container">
            <h2 class="section-title">Skills & Expertise</h2>
            <div class="skills-grid">
                ${generateSkillsHTML(skills)}
            </div>
        </div>
    </section>

    <!-- Experience Section -->
    <section id="experience" class="section experience">
        <div class="container">
            <h2 class="section-title">Professional Experience</h2>
            <div class="timeline">
                ${generateExperienceHTML(experience)}
            </div>
        </div>
    </section>

    <!-- Projects Section -->
    <section id="projects" class="section">
        <div class="container">
            <h2 class="section-title">Featured Projects</h2>
            <div class="projects-grid">
                ${generateProjectsHTML(projects)}
            </div>
        </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="section contact">
        <div class="container">
            <div class="contact-content">
                <h2 class="section-title" style="color: white;">Let's Work Together</h2>
                <p style="font-size: 1.2rem; margin-bottom: 2rem;">Ready to bring your next project to life? I'd love to hear from you!</p>
                <div class="contact-info">
                    ${personal?.email ? `<a href="mailto:${personal.email}" class="contact-item"><i class="fas fa-envelope"></i> ${personal.email}</a>` : ''}
                    ${personal?.linkedin ? `<a href="https://${personal.linkedin}" target="_blank" class="contact-item"><i class="fab fa-linkedin"></i> LinkedIn</a>` : ''}
                    ${personal?.github ? `<a href="https://${personal.github}" target="_blank" class="contact-item"><i class="fab fa-github"></i> GitHub</a>` : ''}
                    ${personal?.website ? `<a href="https://${personal.website}" target="_blank" class="contact-item"><i class="fas fa-globe"></i> Website</a>` : ''}
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer>
        <div class="container">
            <p>&copy; ${new Date().getFullYear()} ${personal?.name || 'Portfolio'}. All rights reserved.</p>
        </div>
    </footer>

    <script>
        // Smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Header scroll effect
        window.addEventListener('scroll', () => {
            const header = document.querySelector('header');
            if (window.scrollY > 100) {
                header.style.background = 'rgba(255,255,255,0.98)';
                header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
            } else {
                header.style.background = 'rgba(255,255,255,0.95)';
                header.style.boxShadow = 'none';
            }
        });

        // Theme toggle
        function toggleTheme() {
            const body = document.body;
            const currentTheme = body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            body.setAttribute('data-theme', newTheme);
            
            const icon = document.querySelector('.theme-toggle i');
            icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            
            localStorage.setItem('theme', newTheme);
        }

        // Load saved theme
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.setAttribute('data-theme', savedTheme);
        const icon = document.querySelector('.theme-toggle i');
        icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';

        // Intersection Observer for animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                }
            });
        }, observerOptions);

        // Observe all sections
        document.querySelectorAll('.section').forEach(section => {
            observer.observe(section);
        });
    </script>
</body>
</html>`;
};

// Helper functions
const getJobTitle = (experience, skills) => {
    if (experience && experience.length > 0) {
        return experience[0].title || 'Professional';
    }

    if (skills?.technical?.length > 0) {
        const tech = skills.technical[0].toLowerCase();
        if (tech.includes('react') || tech.includes('frontend')) return 'Frontend Developer';
        if (tech.includes('node') || tech.includes('backend')) return 'Backend Developer';
        if (tech.includes('python')) return 'Python Developer';
        if (tech.includes('javascript')) return 'JavaScript Developer';
    }

    return 'Professional Developer';
};

const generateSkillsHTML = (skills) => {
    if (!skills) return '<div class="skill-category"><h3>Technical Skills</h3><div class="skill-tags"><span class="skill-tag">JavaScript</span><span class="skill-tag">React</span><span class="skill-tag">Node.js</span></div></div>';

    let html = '';

    if (skills.technical && skills.technical.length > 0) {
        html += `
      <div class="skill-category">
        <h3><i class="fas fa-code"></i> Technical Skills</h3>
        <div class="skill-tags">
          ${skills.technical.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
        </div>
      </div>
    `;
    }

    if (skills.soft && skills.soft.length > 0) {
        html += `
      <div class="skill-category">
        <h3><i class="fas fa-users"></i> Soft Skills</h3>
        <div class="skill-tags">
          ${skills.soft.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
        </div>
      </div>
    `;
    }

    if (skills.categories && Object.keys(skills.categories).length > 0) {
        html += `
      <div class="skill-category">
        <h3><i class="fas fa-star"></i> Specializations</h3>
        <div class="skill-tags">
          ${Object.keys(skills.categories).map(category => `<span class="skill-tag">${category}</span>`).join('')}
        </div>
      </div>
    `;
    }

    return html || '<div class="skill-category"><h3>Skills</h3><p>Skills information will be displayed here.</p></div>';
};

const generateExperienceHTML = (experience) => {
    if (!experience || experience.length === 0) {
        return `
      <div class="timeline-item">
        <div class="timeline-content">
          <div class="timeline-date">Present</div>
          <h3>Professional Experience</h3>
          <h4>Your Company</h4>
          <p>Professional experience and achievements will be displayed here.</p>
        </div>
      </div>
    `;
    }

    return experience.map(exp => `
    <div class="timeline-item">
      <div class="timeline-content">
        <div class="timeline-date">${exp.duration || 'Recent'}</div>
        <h3>${exp.title || 'Professional Role'}</h3>
        <h4>${exp.company || 'Company'}</h4>
        <p>${exp.description || exp.achievements?.join('. ') || 'Professional experience and key achievements.'}</p>
        ${exp.location ? `<p><i class="fas fa-map-marker-alt"></i> ${exp.location}</p>` : ''}
      </div>
    </div>
  `).join('');
};

const generateProjectsHTML = (projects) => {
    if (!projects || projects.length === 0) {
        return `
      <div class="project-card">
        <div class="project-image">
          <i class="fas fa-laptop-code"></i>
        </div>
        <div class="project-content">
          <h3 class="project-title">Featured Project</h3>
          <p class="project-description">Project descriptions and details will be displayed here.</p>
          <div class="project-tech">
            <span class="tech-tag">Technology</span>
            <span class="tech-tag">Framework</span>
          </div>
          <div class="project-links">
            <a href="#" class="project-link"><i class="fas fa-external-link-alt"></i> Live Demo</a>
            <a href="#" class="project-link"><i class="fab fa-github"></i> Source Code</a>
          </div>
        </div>
      </div>
    `;
    }

    return projects.map(project => `
    <div class="project-card">
      <div class="project-image">
        <i class="fas fa-laptop-code"></i>
      </div>
      <div class="project-content">
        <h3 class="project-title">${project.name || 'Project'}</h3>
        <p class="project-description">${project.description || 'Project description and key features.'}</p>
        <div class="project-tech">
          ${(project.technologies || ['Technology']).map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
        </div>
        <div class="project-links">
          ${project.link ? `<a href="${project.link}" target="_blank" class="project-link"><i class="fas fa-external-link-alt"></i> Live Demo</a>` : ''}
          ${project.github ? `<a href="${project.github}" target="_blank" class="project-link"><i class="fab fa-github"></i> Source Code</a>` : ''}
        </div>
      </div>
    </div>
  `).join('');
};

module.exports = {
    generateModernTemplate
};