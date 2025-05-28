const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('.')); // Serve static files from current directory

// Data file paths
const DATA_DIR = './data';
const DATA_FILES = {
    about: path.join(DATA_DIR, 'about.json'),
    skills: path.join(DATA_DIR, 'skills.json'),
    education: path.join(DATA_DIR, 'education.json'),
    certifications: path.join(DATA_DIR, 'certifications.json'),
    projects: path.join(DATA_DIR, 'projects.json'),
    contact: path.join(DATA_DIR, 'contact.json')
};

// Ensure data directory exists
async function initializeDataFiles() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        
        // Initialize empty data files if they don't exist
        for (const [section, filePath] of Object.entries(DATA_FILES)) {
            try {
                await fs.access(filePath);
            } catch {
                const initialData = section === 'about' || section === 'contact' 
                    ? {} 
                    : [];
                await fs.writeFile(filePath, JSON.stringify(initialData, null, 2));
            }
        }
    } catch (error) {
        console.error('Error initializing data files:', error);
    }
}

// Helper function to read data file
async function readDataFile(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
        return null;
    }
}

// Helper function to write data file
async function writeDataFile(filePath, data) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing file ${filePath}:`, error);
        return false;
    }
}

// Update portfolio section
app.post('/api/update-portfolio', async (req, res) => {
    const { section, data } = req.body;
    const filePath = DATA_FILES[section];

    if (!filePath) {
        return res.status(400).json({ error: 'Invalid section' });
    }

    try {
        let currentData = await readDataFile(filePath);
        if (currentData === null) {
            return res.status(500).json({ error: 'Error reading data file' });
        }

        // Handle different section types
        if (section === 'about' || section === 'contact') {
            currentData = data;
        } else {
            // For arrays (skills, education, certifications, projects)
            data.id = Date.now(); // Add unique ID
            currentData.push(data);
        }

        const success = await writeDataFile(filePath, currentData);
        if (!success) {
            return res.status(500).json({ error: 'Error writing data file' });
        }

        // Run the deployment script
        const deploy = spawn('node', ['deploy.js']);
        
        deploy.stdout.on('data', (data) => {
            console.log(`Deploy output: ${data}`);
        });

        deploy.stderr.on('data', (data) => {
            console.error(`Deploy error: ${data}`);
        });

        deploy.on('close', (code) => {
            if (code !== 0) {
                console.error(`Deploy process exited with code ${code}`);
                return res.status(500).json({ error: 'Deployment failed' });
            }
            res.json({ success: true });
        });

    } catch (error) {
        console.error('Error updating portfolio:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get items for a section
app.get('/api/get-:section', async (req, res) => {
    const { section } = req.params;
    const filePath = DATA_FILES[section];

    if (!filePath) {
        return res.status(400).json({ error: 'Invalid section' });
    }

    try {
        const data = await readDataFile(filePath);
        if (data === null) {
            return res.status(500).json({ error: 'Error reading data file' });
        }
        res.json(data);
    } catch (error) {
        console.error('Error getting items:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete an item
app.delete('/api/delete-:section-item/:id', async (req, res) => {
    const { section, id } = req.params;
    const filePath = DATA_FILES[section];

    if (!filePath) {
        return res.status(400).json({ error: 'Invalid section' });
    }

    try {
        let data = await readDataFile(filePath);
        if (data === null) {
            return res.status(500).json({ error: 'Error reading data file' });
        }

        if (!Array.isArray(data)) {
            return res.status(400).json({ error: 'Section does not support item deletion' });
        }

        data = data.filter(item => item.id !== parseInt(id));
        const success = await writeDataFile(filePath, data);
        
        if (!success) {
            return res.status(500).json({ error: 'Error writing data file' });
        }

        // Run the deployment script
        const deploy = spawn('node', ['deploy.js']);
        
        deploy.stdout.on('data', (data) => {
            console.log(`Deploy output: ${data}`);
        });

        deploy.stderr.on('data', (data) => {
            console.error(`Deploy error: ${data}`);
        });

        deploy.on('close', (code) => {
            if (code !== 0) {
                console.error(`Deploy process exited with code ${code}`);
                return res.status(500).json({ error: 'Deployment failed' });
            }
            res.json({ success: true });
        });

    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Function to update the main HTML file
async function updateMainHTML() {
    try {
        // Read all data
        const data = {};
        for (const [section, filePath] of Object.entries(DATA_FILES)) {
            data[section] = await readDataFile(filePath);
        }

        // Read the template HTML file
        const templatePath = path.join(__dirname, 'index.html');
        let htmlContent = await fs.readFile(templatePath, 'utf8');

        // Update About section
        if (data.about && data.about.description) {
            htmlContent = htmlContent.replace(
                /<div class="about-text">[\s\S]*?<\/div>/,
                `<div class="about-text">${data.about.description}</div>`
            );
        }

        // Update Skills section
        if (Array.isArray(data.skills)) {
            const skillsHTML = data.skills.map(skill => `<li>${skill.name}</li>`).join('\\n');
            // Update skills in their respective categories
            // You'll need to implement the logic to handle different skill categories
        }

        // Update Education section
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

        // Update Certifications section
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
            
            // Update certifications section in HTML
        }

        // Update Projects section
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
            
            // Update projects section in HTML
        }

        // Update Contact section
        if (data.contact) {
            const contactHTML = `
                <div class="social-links">
                    <a href="${data.contact.linkedin}" target="_blank"><i class="fab fa-linkedin"></i></a>
                    <a href="${data.contact.github}" target="_blank"><i class="fab fa-github"></i></a>
                    <a href="${data.contact.tryhackme}" target="_blank"><i class="fas fa-shield-alt"></i></a>
                </div>
            `;
            
            // Update contact section in HTML
        }

        // Write the updated HTML
        await fs.writeFile(templatePath, htmlContent);
    } catch (error) {
        console.error('Error updating HTML:', error);
    }
}

// Initialize data files and start server
initializeDataFiles().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
        console.log(`Admin panel available at http://localhost:${PORT}/admin.html`);
    });
}); 