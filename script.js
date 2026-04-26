// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Enhanced Smooth Scroll to Section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const offsetTop = section.offsetTop - 80; // Account for fixed navbar
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// Enhanced smooth scroll for all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        
        if (targetSection) {
            const offsetTop = targetSection.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Active Navigation Link on Scroll
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 100) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// Intersection Observer for Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.about-card, .demo-card, .learn-item');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Demo Button Interactions
document.querySelectorAll('.demo-button').forEach(button => {
    button.addEventListener('click', function() {
        const buttonText = this.textContent.trim();
        
        // Create notification
        showNotification(`${buttonText} feature coming soon!`, 'info');
    });
});

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'info' ? 'info-circle' : 'check-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add notification styles if not already present
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(22, 33, 62, 0.95);
                border: 1px solid var(--neon-blue);
                border-radius: 10px;
                padding: 15px 20px;
                color: var(--text-primary);
                z-index: 10000;
                min-width: 300px;
                box-shadow: 0 4px 20px rgba(0, 212, 255, 0.3);
                backdrop-filter: blur(10px);
                animation: slideIn 0.3s ease;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: var(--text-secondary);
                cursor: pointer;
                font-size: 1rem;
                padding: 5px;
                transition: color 0.3s ease;
            }
            
            .notification-close:hover {
                color: var(--neon-blue);
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
}

// Add typing effect to hero title
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing effect on page load
window.addEventListener('load', () => {
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const originalText = heroTitle.innerHTML;
        // Only apply typing effect on desktop
        if (window.innerWidth > 768) {
            setTimeout(() => {
                typeWriter(heroTitle, originalText, 30);
            }, 500);
        }
    }
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    const heroVisual = document.querySelector('.hero-visual');
    
    if (hero && scrolled < window.innerHeight) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
    
    if (heroVisual && scrolled < window.innerHeight) {
        heroVisual.style.transform = `translateY(${scrolled * 0.3}px) scale(${1 - scrolled * 0.0005})`;
    }
});

// Add hover effect to cards
document.querySelectorAll('.about-card, .demo-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(-5px) scale(1)';
    });
});

// Contact button interactions
document.querySelectorAll('.contact-button').forEach(button => {
    button.addEventListener('click', function(e) {
        e.preventDefault();
        const platform = this.textContent.trim();
        showNotification(`Redirecting to ${platform}...`, 'info');
        
        // Simulate redirect after a delay
        setTimeout(() => {
            showNotification(`${platform} link would open in a new tab`, 'info');
        }, 1500);
    });
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Social Engineering Simulator
const scenarioData = {
    'phishing-email': {
        isScam: true,
        explanation: 'This is a phishing email attempting to steal your Amazon account credentials.',
        redFlags: [
            'Fake sender domain (amaz0n-update.com instead of amazon.com)',
            'Urgent language to create panic',
            'Suspicious link with "secure-verify" in domain',
            'Threats of account suspension',
            'Poor grammar and formatting'
        ]
    },
    'sms-scam': {
        isScam: true,
        explanation: 'This is a SMS phishing attempt trying to get your banking information.',
        redFlags: [
            'Unknown sender number',
            'Urgent alert with emoji to grab attention',
            'Shortened URL (bit.ly) hiding real destination',
            'Generic bank reference without specific details',
            'Request for immediate action'
        ]
    },
    'social-media': {
        isScam: true,
        explanation: 'This is a fake Facebook support message designed to steal your account.',
        redFlags: [
            'Facebook rarely contacts users via posts',
            'Fake verification badge',
            'Urgent 24-hour deadline',
            'Suspicious "Appeal Now" button',
            'Unusually high view count for legitimacy'
        ]
    }
};

let currentScenario = 'phishing-email';

// Scenario switching
document.querySelectorAll('.scenario-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        // Remove active class from all buttons and scenarios
        document.querySelectorAll('.scenario-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.scenario-content').forEach(s => s.classList.remove('active'));
        
        // Add active class to clicked button and corresponding scenario
        this.classList.add('active');
        const scenario = this.dataset.scenario;
        document.getElementById(scenario).classList.add('active');
        
        currentScenario = scenario;
        
        // Hide result section when switching scenarios
        document.getElementById('result-section').style.display = 'none';
        
        // Reset answer buttons
        document.querySelectorAll('.answer-btn').forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
        });
    });
});

// Answer handling
document.querySelectorAll('.answer-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const userAnswer = this.dataset.answer;
        const scenario = scenarioData[currentScenario];
        
        // Disable all answer buttons
        document.querySelectorAll('.answer-btn').forEach(b => {
            b.disabled = true;
            b.style.opacity = '0.6';
        });
        
        // Show result
        showResult(userAnswer, scenario);
    });
});

function showResult(userAnswer, scenario) {
    const resultSection = document.getElementById('result-section');
    const resultIcon = document.getElementById('result-icon');
    const resultTitle = document.getElementById('result-title');
    const resultExplanation = document.getElementById('result-explanation');
    const redFlags = document.getElementById('red-flags');
    
    const isCorrect = (userAnswer === 'scam' && scenario.isScam) || 
                    (userAnswer === 'safe' && !scenario.isScam);
    
    // Set icon and title based on answer
    if (isCorrect) {
        resultIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
        resultIcon.style.color = '#00ff00';
        resultTitle.textContent = 'Correct! Well done!';
        resultTitle.style.color = '#00ff00';
    } else {
        resultIcon.innerHTML = '<i class="fas fa-times-circle"></i>';
        resultIcon.style.color = '#ff4444';
        resultTitle.textContent = 'Incorrect. This is actually a scam.';
        resultTitle.style.color = '#ff4444';
    }
    
    // Set explanation
    resultExplanation.innerHTML = `<p><strong>Analysis:</strong> ${scenario.explanation}</p>`;
    
    // Set red flags
    redFlags.innerHTML = `
        <h4>🚨 Red Flags to Watch For:</h4>
        <ul>
            ${scenario.redFlags.map(flag => `<li>${flag}</li>`).join('')}
        </ul>
    `;
    
    // Show result section with animation
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Deepfake Detection Demo
let uploadedFile = null;

// File upload handling
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const analyzeBtn = document.getElementById('analyzeBtn');

uploadArea.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', handleFileSelect);

// Drag and drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

function handleFile(file) {
    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'video/mp4', 'video/mov'];
    const maxSize = 10 * 1024 * 1024; // 10MB (matching backend limit)

    if (!validTypes.includes(file.type)) {
        showNotification('Please upload a valid image (JPG, PNG) or video (MP4, MOV) file', 'error');
        return;
    }

    if (file.size > maxSize) {
        showNotification('File size must be less than 10MB', 'error');
        return;
    }

    uploadedFile = file;
    displayFileInfo(file);
    analyzeBtn.disabled = false;
}

function displayFileInfo(file) {
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const fileType = document.getElementById('fileType');
    const filePreview = document.getElementById('filePreview');

    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    fileType.textContent = file.type.split('/')[0].toUpperCase();

    // Show preview icon
    if (file.type.startsWith('image/')) {
        filePreview.innerHTML = '<i class="fas fa-image"></i>';
    } else if (file.type.startsWith('video/')) {
        filePreview.innerHTML = '<i class="fas fa-video"></i>';
    }

    fileInfo.style.display = 'flex';
    uploadArea.style.display = 'none';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Analyze button
analyzeBtn.addEventListener('click', startAnalysis);

function startAnalysis() {
    if (!uploadedFile) return;

    // Hide upload section, show loading
    document.querySelector('.upload-section').style.display = 'none';
    document.getElementById('loadingSection').style.display = 'block';

    // Start real analysis
    performRealAnalysis();
}

async function performRealAnalysis() {
    const progressFill = document.getElementById('progressFill');
    const progressPercentage = document.getElementById('progressPercentage');
    let progress = 0;

    try {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('file', uploadedFile);

        // Get CSRF token
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || 
                          localStorage.getItem('csrfToken');

        // Start progress simulation
        const progressInterval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress >= 90) progress = 90; // Cap at 90% until complete
            progressFill.style.width = progress + '%';
            progressPercentage.textContent = Math.round(progress) + '%';
        }, 500);

        // Make API call to backend
        const response = await fetch('https://neurox-ai-backend-6gz3.onrender.com/api/deepfake/analyze', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRF-Token': csrfToken
            }
        });

        clearInterval(progressInterval);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // Complete progress
        progressFill.style.width = '100%';
        progressPercentage.textContent = '100%';

        setTimeout(() => {
            showRealResults(result);
        }, 500);

    } catch (error) {
        clearInterval(progressInterval);
        console.error('Analysis failed:', error);
        showNotification('Analysis failed. Please try again.', 'error');
        resetUploadSection();
    }
}

function simulateAnalysis() {
    let progress = 0;
    const progressFill = document.getElementById('progressFill');
    const progressPercentage = document.getElementById('progressPercentage');

    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(showResults, 500);
        }

        progressFill.style.width = progress + '%';
        progressPercentage.textContent = Math.round(progress) + '%';
    }, 300);
}

function showRealResults(result) {
    // Hide loading, show results
    document.getElementById('loadingSection').style.display = 'none';
    document.getElementById('detectionResult').style.display = 'block';

    if (result.success) {
        const data = result.data;
        displayRealResults(data);
    } else {
        showNotification('Analysis failed: ' + result.message, 'error');
        resetUploadSection();
    }
}

function showResults() {
    // Hide loading, show results
    document.getElementById('loadingSection').style.display = 'none';
    document.getElementById('detectionResult').style.display = 'block';

    // Generate random results for demo
    const confidence = Math.floor(Math.random() * 40) + 60; // 60-99%
    const isDeepfake = confidence > 75;
    const riskLevel = confidence > 85 ? 'high' : confidence > 70 ? 'medium' : 'low';

    displayResults(confidence, isDeepfake, riskLevel);
}

function displayRealResults(data) {
    const resultIcon = document.getElementById('resultIcon');
    const resultTitle = document.getElementById('resultTitle');
    const resultSubtitle = document.getElementById('resultSubtitle');
    const confidenceFill = document.getElementById('confidenceFill');
    const confidenceText = document.getElementById('confidenceText');
    const riskLevelText = document.getElementById('riskLevelText');
    const explanationText = document.getElementById('explanationText');

    // Update UI with real data
    const isDeepfake = data.prediction === 'AI Generated';
    const confidence = data.confidence || 0;
    const riskLevel = data.riskLevel || 'Unknown';

    // Set icon and colors based on result
    if (isDeepfake) {
        resultIcon.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
        resultIcon.style.color = '#ef4444';
        resultTitle.textContent = 'Deepfake Detected';
        resultTitle.style.color = '#ef4444';
    } else {
        resultIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
        resultIcon.style.color = '#10b981';
        resultTitle.textContent = 'Authentic Content';
        resultTitle.style.color = '#10b981';
    }

    resultSubtitle.textContent = `Risk Level: ${riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}`;
    confidenceFill.style.width = confidence + '%';
    confidenceText.textContent = confidence + '%';
    riskLevelText.textContent = riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1);
    explanationText.textContent = data.explanation || 'Analysis completed successfully.';
}

function resetUploadSection() {
    // Reset to initial state
    document.getElementById('loadingSection').style.display = 'none';
    document.getElementById('detectionResult').style.display = 'none';
    document.querySelector('.upload-section').style.display = 'block';
    document.getElementById('fileInfo').style.display = 'none';
    document.getElementById('uploadArea').style.display = 'block';
    
    // Reset variables
    uploadedFile = null;
    analyzeBtn.disabled = true;
    
    // Reset file input
    fileInput.value = '';
}

function displayResults(confidence, isDeepfake, riskLevel) {
    const resultIcon = document.getElementById('resultIcon');
    const resultTitle = document.getElementById('resultTitle');
    const resultSubtitle = document.getElementById('resultSubtitle');
    const confidenceFill = document.getElementById('confidenceFill');
    const confidencePercentage = document.getElementById('confidencePercentage');
    const riskLevelEl = document.getElementById('riskLevel');
    const riskDescription = document.getElementById('riskDescription');

    // Set result icon and title
    if (isDeepfake) {
        resultIcon.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
        resultIcon.style.color = '#ff4444';
        resultTitle.textContent = 'Deepfake Detected';
        resultSubtitle.textContent = 'AI manipulation patterns identified';
    } else {
        resultIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
        resultIcon.style.color = '#00ff00';
        resultTitle.textContent = 'Authentic Content';
        resultSubtitle.textContent = 'No manipulation detected';
    }

    // Set confidence
    confidenceFill.style.width = confidence + '%';
    confidencePercentage.textContent = confidence + '% AI Generated';

    // Set risk level
    riskLevelEl.className = `risk-level risk-${riskLevel}`;
    riskLevelEl.textContent = riskLevel.toUpperCase();

    const riskDescriptions = {
        low: 'Low probability of manipulation',
        medium: 'Moderate suspicion of AI alteration',
        high: 'High confidence of deepfake content'
    };
    riskDescription.textContent = riskDescriptions[riskLevel];

    // Set analysis details
    document.getElementById('facialConsistency').textContent = isDeepfake ? 'Inconsistent' : 'Consistent';
    document.getElementById('lightingAnalysis').textContent = isDeepfake ? 'Unnatural' : 'Natural';
    document.getElementById('digitalArtifacts').textContent = isDeepfake ? 'Present' : 'Minimal';
    document.getElementById('backgroundAnalysis').textContent = isDeepfake ? 'Anomalies' : 'Normal';

    // Scroll to results
    document.getElementById('detectionResult').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Action buttons
document.getElementById('analyzeAnother').addEventListener('click', resetUpload);
document.getElementById('downloadReport').addEventListener('click', downloadReport);

function resetUpload() {
    uploadedFile = null;
    fileInput.value = '';
    fileInfo.style.display = 'none';
    uploadArea.style.display = 'block';
    document.getElementById('detectionResult').style.display = 'none';
    document.querySelector('.upload-section').style.display = 'block';
    analyzeBtn.disabled = true;
}

function downloadReport() {
    const reportData = {
        timestamp: new Date().toISOString(),
        confidence: document.getElementById('confidencePercentage').textContent,
        result: document.getElementById('resultTitle').textContent,
        riskLevel: document.getElementById('riskLevel').textContent,
        details: {
            facialConsistency: document.getElementById('facialConsistency').textContent,
            lightingAnalysis: document.getElementById('lightingAnalysis').textContent,
            digitalArtifacts: document.getElementById('digitalArtifacts').textContent,
            backgroundAnalysis: document.getElementById('backgroundAnalysis').textContent
        }
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deepfake-analysis-report.json';
    a.click();
    URL.revokeObjectURL(url);

    showNotification('Report downloaded successfully', 'success');
}

// Contact Form Validation
const contactForm = document.getElementById('contactForm');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const messageInput = document.getElementById('message');
const nameError = document.getElementById('nameError');
const emailError = document.getElementById('emailError');
const messageError = document.getElementById('messageError');
const successMessage = document.getElementById('successMessage');

contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Clear previous errors
    clearErrors();
    
    // Validate form
    let isValid = true;
    
    // Name validation
    if (!validateName()) {
        isValid = false;
    }
    
    // Email validation
    if (!validateEmail()) {
        isValid = false;
    }
    
    // Message validation
    if (!validateMessage()) {
        isValid = false;
    }
    
    if (isValid) {
        // Show success message
        showSuccessMessage();
        
        // Reset form
        contactForm.reset();
        
        // Hide success message after 5 seconds
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 5000);
    }
});

function validateName() {
    const name = nameInput.value.trim();
    
    if (name.length < 2) {
        showError(nameError, 'Name must be at least 2 characters long');
        nameInput.classList.add('error');
        return false;
    }
    
    if (name.length > 50) {
        showError(nameError, 'Name must be less than 50 characters');
        nameInput.classList.add('error');
        return false;
    }
    
    if (!/^[a-zA-Z\s'-]+$/.test(name)) {
        showError(nameError, 'Name can only contain letters, spaces, hyphens, and apostrophes');
        nameInput.classList.add('error');
        return false;
    }
    
    return true;
}

function validateEmail() {
    const email = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
        showError(emailError, 'Email is required');
        emailInput.classList.add('error');
        return false;
    }
    
    if (!emailRegex.test(email)) {
        showError(emailError, 'Please enter a valid email address');
        emailInput.classList.add('error');
        return false;
    }
    
    return true;
}

function validateMessage() {
    const message = messageInput.value.trim();
    
    if (message.length < 10) {
        showError(messageError, 'Message must be at least 10 characters long');
        messageInput.classList.add('error');
        return false;
    }
    
    if (message.length > 500) {
        showError(messageError, 'Message must be less than 500 characters');
        messageInput.classList.add('error');
        return false;
    }
    
    return true;
}

function showError(errorElement, message) {
    errorElement.textContent = message;
    errorElement.classList.add('show');
}

function clearErrors() {
    // Clear error messages
    nameError.textContent = '';
    emailError.textContent = '';
    messageError.textContent = '';
    
    // Remove error classes
    nameInput.classList.remove('error');
    emailInput.classList.remove('error');
    messageInput.classList.remove('error');
    
    // Hide error messages
    nameError.classList.remove('show');
    emailError.classList.remove('show');
    messageError.classList.remove('show');
}

function showSuccessMessage() {
    successMessage.style.display = 'flex';
}

// Clear errors on input
nameInput.addEventListener('input', function() {
    if (nameInput.classList.contains('error')) {
        nameInput.classList.remove('error');
        nameError.classList.remove('show');
        nameError.textContent = '';
    }
});

emailInput.addEventListener('input', function() {
    if (emailInput.classList.contains('error')) {
        emailInput.classList.remove('error');
        emailError.classList.remove('show');
        emailError.textContent = '';
    }
});

messageInput.addEventListener('input', function() {
    if (messageInput.classList.contains('error')) {
        messageInput.classList.remove('error');
        messageError.classList.remove('show');
        messageError.textContent = '';
    }
});

// Console Easter egg
console.log('%c🛡️ ASEP Platform - Deepfake & Social Engineering Awareness', 'color: #00d4ff; font-size: 20px; font-weight: bold;');
console.log('%cBuilt with cybersecurity awareness in mind 🚀', 'color: #b8b8d1; font-size: 14px;');
