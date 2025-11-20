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
    setupModalHandlers();
    setupFormHandlers();
});

// Google Sheets Web App URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw45hVWiUYBHPHDXmfRMSNYDfQta1RfVHEBk2HuG-YUwm8UWutYwEeioujB3GdhAVAAXA/exec';

/**
 * Setup Modal Handlers
 */
function setupModalHandlers() {
    const scheduleBtn = document.getElementById('schedule-viewing-btn');
    const modalBackdrop = document.getElementById('modal-backdrop');
    const modalClose = document.getElementById('modal-close');
    const viewingModal = document.getElementById('viewing-modal');
    
    // Open modal when Schedule Private Viewing button is clicked
    if (scheduleBtn) {
        scheduleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openModal();
        });
    }
    
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
    const viewingModal = document.getElementById('viewing-modal');
    const modalBackdrop = document.getElementById('modal-backdrop');
    
    if (viewingModal && modalBackdrop) {
        viewingModal.classList.add('active');
        modalBackdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    const viewingModal = document.getElementById('viewing-modal');
    const modalBackdrop = document.getElementById('modal-backdrop');
    
    if (viewingModal && modalBackdrop) {
        viewingModal.classList.remove('active');
        modalBackdrop.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/**
 * Setup Form Handlers
 */
function setupFormHandlers() {
    // Viewing Modal Form
    const viewingModalForm = document.getElementById('viewing-modal-form');
    if (viewingModalForm) {
        viewingModalForm.addEventListener('submit', handleViewingModalSubmit);
    }
    
    // Brochure Form
    const brochureForm = document.getElementById('brochure-form');
    if (brochureForm) {
        brochureForm.addEventListener('submit', handleBrochureSubmit);
    }
    
    // Viewing Section Form (if exists)
    const viewingForm = document.getElementById('viewing-form');
    if (viewingForm) {
        viewingForm.addEventListener('submit', handleViewingSubmit);
    }
    
    // Phone number validation
    document.querySelectorAll('input[type="tel"]').forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 10) {
                value = value.slice(0, 10);
            }
            e.target.value = value;
        });
    });
    
    // Set minimum date for viewing date picker
    const dateInput = document.getElementById('viewing-date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }
}

/**
 * Handle Viewing Modal Form Submission
 */
function handleViewingModalSubmit(e) {
    e.preventDefault();
    
    const submitButton = this.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Processing...';
    
    const formData = {
        name: document.getElementById('viewing-modal-name').value,
        mobile: document.getElementById('viewing-modal-mobile').value,
        email: '',
        source: 'Schedule Viewing Modal',
        timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        page: window.location.href
    };
    
    console.log('Viewing Modal Form Data:', formData);
    
    // Send to Google Sheets
    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(() => {
        console.log('Viewing modal data sent successfully');
        
        // Show success message
        const successMessage = document.getElementById('viewing-modal-success');
        successMessage.classList.add('show');
        
        // Reset form
        this.reset();
        
        // Close modal after 3 seconds
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
        alert('Something went wrong. Please call us at +91 750-5323-084');
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    });
}

/**
 * Handle Brochure Form Submission
 */
function handleBrochureSubmit(e) {
    e.preventDefault();
    
    const submitButton = this.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Processing...';
    
    const formData = {
        name: document.getElementById('brochure-name').value,
        mobile: document.getElementById('brochure-mobile').value,
        email: document.getElementById('brochure-email').value || 'Not provided',
        source: 'Brochure Download Form',
        timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        page: window.location.href
    };
    
    console.log('Brochure Form Data:', formData);
    
    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(() => {
        console.log('Brochure data sent successfully');
        
        const successMessage = document.getElementById('brochure-success');
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
        alert('Something went wrong. Please call us at +91 750-5323-084');
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    });
}

/**
 * Handle Viewing Form Submission
 */
function handleViewingSubmit(e) {
    e.preventDefault();
    
    const submitButton = this.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Scheduling...';
    
    const formData = {
        name: document.getElementById('viewing-name').value,
        mobile: document.getElementById('viewing-mobile').value,
        email: document.getElementById('viewing-email').value || 'Not provided',
        date: document.getElementById('viewing-date').value,
        time: document.getElementById('viewing-time').value,
        source: 'Schedule Viewing Form',
        timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        page: window.location.href
    };
    
    console.log('Viewing Form Data:', formData);
    
    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(() => {
        console.log('Viewing data sent successfully');
        
        const successMessage = document.getElementById('viewing-success');
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
        alert('Something went wrong. Please call us at +91 750-5323-084');
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    });
}

// Smooth Scroll for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        if (href.startsWith('#') && href !== '#') {
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