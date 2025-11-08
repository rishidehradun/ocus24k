// ========================================
// FLOATING PARTICLES ANIMATION
// ========================================
const particlesContainer = document.getElementById('particles');
for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 15 + 's';
    particle.style.animationDuration = (10 + Math.random() * 10) + 's';
    particlesContainer.appendChild(particle);
}

// ========================================
// HEADER SCROLL EFFECT
// ========================================
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// ========================================
// CAROUSEL FUNCTIONALITY
// ========================================
let currentSlide = 0;
const slides = document.querySelectorAll('.carousel-slide');
const dots = document.querySelectorAll('.carousel-dot');

function showSlide(n) {
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    currentSlide = (n + slides.length) % slides.length;
    
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
}

function nextSlide() {
    showSlide(currentSlide + 1);
}

setInterval(nextSlide, 6000);

dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        showSlide(index);
    });
});

// ========================================
// SMOOTH SCROLL NAVIGATION
// ========================================
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// ========================================
// SCROLL ANIMATIONS
// ========================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, index * 100);
        }
    });
}, observerOptions);

const animatedElements = document.querySelectorAll(
    '.section-title, .section-subtitle, .feature-card, .amenity-item, .location-item'
);

animatedElements.forEach(element => {
    observer.observe(element);
});

// ========================================
// FORM SUBMISSION
// ========================================
document.getElementById('contactForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitButton = document.querySelector('.submit-btn');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    const originalButtonText = submitButton.textContent;
    
    successMessage.style.display = 'none';
    errorMessage.style.display = 'none';
    
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    
    // Validation
    if (name.length < 2) {
        errorMessage.textContent = 'Please enter a valid name (at least 2 characters)';
        errorMessage.style.display = 'block';
        nameInput.focus();
        return;
    }
    
    if (phone.length < 10) {
        errorMessage.textContent = 'Please enter a valid phone number (at least 10 digits)';
        errorMessage.style.display = 'block';
        phoneInput.focus();
        return;
    }
    
    submitButton.textContent = 'SUBMITTING...';
    submitButton.disabled = true;
    
    try {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('phone', phone);
        formData.append('timestamp', new Date().toLocaleString());
        
        // REPLACE THIS WITH YOUR GOOGLE APPS SCRIPT URL
        const scriptURL = 'https://script.google.com/macros/s/AKfycbw8y31qgPI4--XcRhKKJ5U5041Pk24Z2nwn5URoepAFb6ZCdb8Qn_XSvfpYVzNgnIs/exec';
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        await fetch(scriptURL, {
            method: 'POST',
            body: formData,
            mode: 'no-cors',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        successMessage.style.display = 'block';
        this.reset();
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
        
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 6000);
        
    } catch (error) {
        console.error('Form submission error:', error);
        
        if (error.name === 'AbortError') {
            errorMessage.textContent = 'Request timed out. Please check your connection and try again.';
        } else {
            errorMessage.textContent = 'There was an error submitting the form. Please try again or contact us directly.';
        }
        
        errorMessage.style.display = 'block';
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
    }

});
