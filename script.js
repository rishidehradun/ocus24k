// Scroll Animation Observer
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all elements with fade-in class
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
    setupModalTriggers();
});

// Google Sheets Web App URL - REPLACE THIS WITH YOUR WEB APP URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw45hVWiUYBHPHDXmfRMSNYDfQta1RfVHEBk2HuG-YUwm8UWutYwEeioujB3GdhAVAAXA/exec';

/**
 * Setup Modal Triggers for "Schedule Private Viewing" buttons
 */
function setupModalTriggers() {
    const floatingForm = document.getElementById('floating-form');
    const modalBackdrop = document.getElementById('modal-backdrop');
    const modalClose = document.getElementById('modal-close');
    
    // Find all "Schedule Private Viewing" buttons
    const viewingButtons = document.querySelectorAll('.btn-secondary');
    
    viewingButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            openModal();
        });
    });
    
    // Close modal handlers
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', closeModal);
    }
    
    // Close on ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

function openModal() {
    const floatingForm = document.getElementById('floating-form');
    const modalBackdrop = document.getElementById('modal-backdrop');
    
    if (floatingForm && modalBackdrop) {
        floatingForm.classList.add('modal-center');
        modalBackdrop.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
}

function closeModal() {
    const floatingForm = document.getElementById('floating-form');
    const modalBackdrop = document.getElementById('modal-backdrop');
    
    if (floatingForm && modalBackdrop) {
        floatingForm.classList.remove('modal-center');
        modalBackdrop.classList.remove('active');
        document.body.style.overflow = ''; // Re-enable scrolling
    }
}

// Form Submission Handler - Floating Form
document.getElementById('contact-form-floating').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const submitButton = this.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';
    
    const formData = {
        name: document.getElementById('name-floating').value,
        mobile: document.getElementById('mobile-floating').value,
        email: '',
        source: 'Floating Form',
        timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        page: window.location.href
    };
    
    // Log to console for debugging
    console.log('Form Data (Floating):', formData);
    
    // Send data to Google Sheets
    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(() => {
        console.log('Data sent successfully');
        
        // Show success message
        const successMessage = document.getElementById('success-floating');
        successMessage.classList.add('show');
        
        // Reset form
        this.reset();
        
        // Close modal after success
        setTimeout(() => {
            successMessage.classList.remove('show');
            closeModal();
        }, 3000);
        
        // Re-enable button
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('Something went wrong. Please try again or call us directly.');
        
        // Re-enable button
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    });
});

// Form Submission Handler - Main Form (if you add it back to HTML)
if (document.getElementById('contact-form-main')) {
    document.getElementById('contact-form-main').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const submitButton = this.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
        
        const formData = {
            name: document.getElementById('name-main').value,
            mobile: document.getElementById('mobile-main').value,
            email: document.getElementById('email-main').value || 'Not provided',
            source: 'Main Registration Form',
            timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
            page: window.location.href
        };
        
        console.log('Form Data (Main):', formData);
        
        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(() => {
            console.log('Data sent successfully');
            
            const successMessage = document.getElementById('success-main');
            successMessage.classList.add('show');
            
            this.reset();
            
            setTimeout(() => {
                successMessage.classList.remove('show');
            }, 5000);
            
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Something went wrong. Please try again or call us directly.');
            
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        });
    });
}

// Smooth Scroll for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        // Don't prevent default for tel: links
        if (href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// Phone Number Formatting and Validation
document.querySelectorAll('input[type="tel"]').forEach(input => {
    input.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 10) {
            value = value.slice(0, 10);
        }
        e.target.value = value;
    });
    
    input.addEventListener('blur', function(e) {
        const value = e.target.value;
        if (value.length > 0 && value.length !== 10) {
            e.target.setCustomValidity('Please enter a valid 10-digit mobile number');
            e.target.reportValidity();
        } else {
            e.target.setCustomValidity('');
        }
    });
});

// Floating Form Behavior on Mobile (only when not in modal mode)
let lastScroll = 0;
const floatingForm = document.getElementById('floating-form');

if (window.innerWidth <= 1024 && floatingForm) {
    window.addEventListener('scroll', () => {
        // Only apply scroll behavior if not in modal mode
        if (!floatingForm.classList.contains('modal-center')) {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > lastScroll && currentScroll > 500) {
                floatingForm.style.opacity = '0.3';
                floatingForm.style.pointerEvents = 'none';
            } else {
                floatingForm.style.opacity = '1';
                floatingForm.style.pointerEvents = 'auto';
            }
            
            lastScroll = currentScroll;
        }
    });
}

// Track CTA Button Clicks
document.querySelectorAll('.btn-primary, .btn-secondary').forEach(button => {
    button.addEventListener('click', function() {
        const buttonText = this.textContent.trim();
        const buttonHref = this.getAttribute('href');
        
        console.log('CTA Clicked:', {
            text: buttonText,
            href: buttonHref,
            timestamp: new Date().toISOString()
        });
    });
});

// Track Phone Number Clicks
document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.addEventListener('click', function() {
        const phoneNumber = this.getAttribute('href').replace('tel:', '');
        
        console.log('Phone Number Clicked:', {
            number: phoneNumber,
            timestamp: new Date().toISOString()
        });
    });
});

// Lazy Load Images (if you add images later)
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img.lazy').forEach(img => imageObserver.observe(img));
}

// Handle form input focus states
document.querySelectorAll('.form-group input').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
        if (this.value === '') {
            this.parentElement.classList.remove('focused');
        }
    });
});

// Console welcome message
console.log('%cOCUS 24K - Premium Serviced Apartments', 'font-size: 20px; font-weight: bold; color: #c29357;');
console.log('%cWebsite loaded successfully!', 'font-size: 14px; color: #666;');
console.log('For inquiries, call: +91 750-5323-084');

// Performance monitoring
window.addEventListener('load', () => {
    if (window.performance) {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log(`Page Load Time: ${pageLoadTime}ms`);
    }
});