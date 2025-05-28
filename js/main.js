// Theme Switcher
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

themeToggle.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    if (currentTheme === 'light') {
        body.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        body.setAttribute('data-theme', 'light');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
});

// Mobile Menu Toggle
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    menuToggle.innerHTML = navLinks.classList.contains('active') 
        ? '<i class="fas fa-times"></i>' 
        : '<i class="fas fa-bars"></i>';
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        // Close mobile menu if open
        if (navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });
});

// TODO: Update this projects array with your own projects
// For each project, you should:
// 1. Add a descriptive title
// 2. Write a clear description of what the project does
// 3. List the technologies used
// 4. Add a representative image (replace placeholder URLs)
// 5. Add links to your GitHub repository and live demo if available
const projects = [
    {
        title: 'IoT Device Vulnerability Scanner',
        description: 'A Python-based tool designed to identify potential security vulnerabilities in IoT devices connected to a network. This tool helps improve network security by detecting weak points in IoT infrastructure.',
        technologies: ['Python', 'Network Security', 'IoT', 'Security Analysis'],
        image: 'https://via.placeholder.com/300x200',
        github: 'https://github.com/KavishkaChamod07/IoT-Device-Vulnerability-Scanner',
        demo: '#'
    },
    {
        title: 'Gym Management System',
        description: 'A comprehensive C# application for managing gym operations, member tracking, and scheduling. Features include member management, workout tracking, and administrative controls.',
        technologies: ['C#', '.NET', 'Database Management', 'UI/UX'],
        image: 'https://via.placeholder.com/300x200',
        github: 'https://github.com/KavishkaChamod07/Gym-Management-System',
        demo: '#'
    },
    {
        title: 'Online Vaccination Portal',
        description: 'A PHP-based web application for managing vaccination appointments and records. Helps streamline the vaccination process and maintain digital health records.',
        technologies: ['PHP', 'Web Development', 'Database', 'Healthcare'],
        image: 'https://via.placeholder.com/300x200',
        github: 'https://github.com/KavishkaChamod07/online_vaccination_portal',
        demo: '#'
    },
    {
        title: 'OpenSSL Contribution',
        description: 'Contributed to the OpenSSL project, the widely-used TLS/SSL and crypto library. This demonstrates expertise in cryptography and security protocols.',
        technologies: ['C', 'Cryptography', 'Security Protocols', 'Open Source'],
        image: 'https://via.placeholder.com/300x200',
        github: 'https://github.com/KavishkaChamod07/openssl',
        demo: '#'
    }
];

// Populate Projects
const projectGrid = document.querySelector('.project-grid');

function createProjectCard(project) {
    return `
        <div class="project-card">
            <img src="${project.image}" alt="${project.title}">
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            <div class="technologies">
                ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
            </div>
            <div class="project-links">
                <a href="${project.github}" class="btn secondary" target="_blank">
                    <i class="fab fa-github"></i> Code
                </a>
                <a href="${project.demo}" class="btn primary" target="_blank">
                    <i class="fas fa-external-link-alt"></i> Demo
                </a>
            </div>
        </div>
    `;
}

projects.forEach(project => {
    projectGrid.innerHTML += createProjectCard(project);
});

// Form Submission
const contactForm = document.getElementById('contact-form');

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);
    
    // Here you would typically send the data to a server
    // For now, we'll just log it and show a success message
    console.log('Form submitted:', data);
    
    // Show success message
    alert('Thank you for your message! I will get back to you soon.');
    contactForm.reset();
});

// Intersection Observer for Animations
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate__animated', 'animate__fadeInUp');
        }
    });
}, observerOptions);

// Observe all sections
document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// Matrix Rain Animation (optional effect for the hero section)
class MatrixRain {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
        this.fontSize = 14;
        this.columns = 0;
        this.drops = [];

        this.initialize();
    }

    initialize() {
        const heroGraphics = document.querySelector('.hero-graphics');
        heroGraphics.appendChild(this.canvas);

        window.addEventListener('resize', () => this.resize());
        this.resize();
        this.animate();
    }

    resize() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.columns = Math.floor(this.canvas.width / this.fontSize);
        this.drops = Array(this.columns).fill(1);
    }

    animate() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#0F0';
        this.ctx.font = `${this.fontSize}px monospace`;

        for (let i = 0; i < this.drops.length; i++) {
            const text = this.characters[Math.floor(Math.random() * this.characters.length)];
            this.ctx.fillText(text, i * this.fontSize, this.drops[i] * this.fontSize);
            
            if (this.drops[i] * this.fontSize > this.canvas.height && Math.random() > 0.975) {
                this.drops[i] = 0;
            }
            this.drops[i]++;
        }
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize Matrix Rain effect
// new MatrixRain(); 