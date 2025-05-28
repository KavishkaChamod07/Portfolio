const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = './data';
const DATA_FILES = {
    about: path.join(DATA_DIR, 'about.json'),
    skills: path.join(DATA_DIR, 'skills.json'),
    education: path.join(DATA_DIR, 'education.json'),
    certifications: path.join(DATA_DIR, 'certifications.json'),
    projects: path.join(DATA_DIR, 'projects.json'),
    contact: path.join(DATA_DIR, 'contact.json')
};

async function readDataFile(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
        return null;
    }
}

async function updateHTML() {
    try {
        // Read all data
        const data = {};
        for (const [section, filePath] of Object.entries(DATA_FILES)) {
            data[section] = await readDataFile(filePath);
        }

        // Read the template HTML file
        const templatePath = path.join(__dirname, 'index.html');
        let htmlContent = await fs.readFile(templatePath, 'utf8');

        // Update each section
        if (data.about && data.about.description) {
            htmlContent = htmlContent.replace(
                /<div class="about-text">[\s\S]*?<\/div>/,
                `<div class="about-text">${data.about.description}</div>`
            );
        }

        if (Array.isArray(data.skills)) {
            // Group skills by category
            const skillsByCategory = data.skills.reduce((acc, skill) => {
                if (!acc[skill.category]) {
                    acc[skill.category] = [];
                }
                acc[skill.category].push(skill.name);
                return acc;
            }, {});

            // Update each skill category
            for (const [category, skills] of Object.entries(skillsByCategory)) {
                const skillsHTML = skills.map(skill => `<li>${skill}</li>`).join('\\n');
                const categoryId = category.toLowerCase().replace(/\s+/g, '-');
                htmlContent = htmlContent.replace(
                    new RegExp(`<div class="skill-category"[^>]*data-category="${categoryId}">[\\s\\S]*?<\\/div>`),
                    `<div class="skill-category" data-category="${categoryId}">
                        <h3>${category}</h3>
                        <ul>${skillsHTML}</ul>
                    </div>`
                );
            }
        }

        if (Array.isArray(data.education)) {
            const educationHTML = data.education.map(edu => `
                <div class="timeline-item">
                    <div class="timeline-content">
                        <h3>${edu.degree}</h3>
                        <p class="institution">${edu.institution}</p>
                        <p class="period">${edu.startDate} - ${edu.endDate || 'Present'}</p>
                        <p class="description">${edu.description}</p>
                    </div>
                </div>
            `).join('\\n');
            
            htmlContent = htmlContent.replace(
                /<div class="timeline">[\s\S]*?<\/div>/,
                `<div class="timeline">${educationHTML}</div>`
            );
        }

        if (Array.isArray(data.certifications)) {
            const certificationsHTML = data.certifications.map(cert => `
                <div class="cert-card">
                    <div class="cert-icon">
                        <i class="fas fa-certificate"></i>
                    </div>
                    <div class="cert-content">
                        <h3>${cert.name}</h3>
                        <p class="issuer">${cert.issuer}</p>
                        <p class="date">${cert.date}</p>
                        <p class="description">${cert.description}</p>
                    </div>
                </div>
            `).join('\\n');
            
            htmlContent = htmlContent.replace(
                /<div class="cert-grid">[\s\S]*?<\/div>/,
                `<div class="cert-grid">${certificationsHTML}</div>`
            );
        }

        if (Array.isArray(data.projects)) {
            const projectsHTML = data.projects.map(project => `
                <div class="project-card">
                    <h3>${project.title}</h3>
                    <p>${project.description}</p>
                    <div class="technologies">
                        ${project.technologies.split(',').map(tech => `<span class="tech-tag">${tech.trim()}</span>`).join('')}
                    </div>
                    ${project.link ? `<a href="${project.link}" target="_blank" class="project-link">View Project</a>` : ''}
                </div>
            `).join('\\n');
            
            htmlContent = htmlContent.replace(
                /<div class="project-grid">[\s\S]*?<\/div>/,
                `<div class="project-grid">${projectsHTML}</div>`
            );
        }

        if (data.contact) {
            const contactHTML = `
                <div class="social-links">
                    <a href="${data.contact.linkedin}" target="_blank"><i class="fab fa-linkedin"></i></a>
                    <a href="${data.contact.github}" target="_blank"><i class="fab fa-github"></i></a>
                    <a href="${data.contact.tryhackme}" target="_blank"><i class="fas fa-shield-alt"></i></a>
                </div>
            `;
            
            htmlContent = htmlContent.replace(
                /<div class="social-links">[\s\S]*?<\/div>/,
                contactHTML
            );
        }

        // Write the updated HTML
        await fs.writeFile(templatePath, htmlContent);
        console.log('\x1b[32m%s\x1b[0m', 'Successfully updated HTML content');
        console.log('\x1b[36m%s\x1b[0m', '\nNext steps:');
        console.log('1. Open GitHub Desktop');
        console.log('2. Review the changes');
        console.log('3. Write a commit message (e.g., "Update portfolio content")');
        console.log('4. Click "Commit to main"');
        console.log('5. Click "Push origin"');
        console.log('\nYour changes will be live on GitHub Pages in a few minutes after pushing.');

    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', 'Error updating HTML:', error);
    }
}

// Run the update
updateHTML().then(() => console.log('\x1b[32m%s\x1b[0m', 'Update process complete')); 