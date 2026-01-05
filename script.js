// Configuration
const CONFIG = {
    GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxnjxUVGHAaEXTsdQe2p6TJKt_dHai2SXE_nivkbLD9rVx8MForIIyzu3ODtzDHAvc/exec', // Replace with actual URL
    SCROLL_OFFSET: 80,
    SUCCESS_MESSAGE_DURATION: 5000,
    PHONE_VALIDATION_LENGTH: 10,
    FORM_SUBMIT_TIMEOUT: 3000
};

// Utility Functions
const utils = {
    // Debounce function for performance optimization
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function for scroll events
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Sanitize input to prevent XSS
    sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    },

    // Format phone number
    formatPhoneNumber(phone) {
        return phone.replace(/\D/g, '').slice(0, CONFIG.PHONE_VALIDATION_LENGTH);
    },

    // Validate phone number
    isValidPhone(phone) {
        return /^[0-9]{10}$/.test(phone);
    },

    // Validate email
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    // Show loading state on button
    setButtonLoading(button, isLoading) {
        if (isLoading) {
            button.dataset.originalText = button.textContent;
            button.disabled = true;
            button.innerHTML = 'Submitting... <span class="loading"></span>';
        } else {
            button.disabled = false;
            button.textContent = button.dataset.originalText || 'Submit';
        }
    }
};

// Scroll Animation Observer
class ScrollAnimationObserver {
    constructor() {
        this.options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Optional: unobserve after animation for performance
                    // this.observer.unobserve(entry.target);
                }
            });
        }, this.options);
    }

    observe() {
        document.querySelectorAll('.fade-in').forEach(el => {
            this.observer.observe(el);
        });
    }
}

// Form Handler Class
class FormHandler {
    constructor(formId, successMessageId, formSource) {
        this.form = document.getElementById(formId);
        this.successMessage = document.getElementById(successMessageId);
        this.formSource = formSource;
        
        if (this.form) {
            this.init();
        }
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async handleSubmit(e) {
        e.preventDefault();

        const submitButton = this.form.querySelector('button[type="submit"]');
        
        // Get form data
        const formData = this.getFormData();
        
        // Validate data
        if (!this.validateFormData(formData)) {
            return;
        }

        // Show loading state
        utils.setButtonLoading(submitButton, true);

        try {
            await this.sendData(formData);
            this.showSuccess();
            this.form.reset();
            
            // Track conversion (if analytics available)
            this.trackConversion(formData);
            
        } catch (error) {
            this.handleError(error);
        } finally {
            setTimeout(() => {
                utils.setButtonLoading(submitButton, false);
            }, 1000);
        }
    }

    getFormData() {
        const formElements = this.form.elements;
        return {
            name: utils.sanitizeInput(formElements.name.value.trim()),
            mobile: utils.formatPhoneNumber(formElements.mobile.value),
            email: formElements.email ? utils.sanitizeInput(formElements.email.value.trim()) : '',
            source: this.formSource,
            timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
            page: window.location.href,
            userAgent: navigator.userAgent,
            referrer: document.referrer || 'Direct'
        };
    }

    validateFormData(data) {
        // Validate phone
        if (!utils.isValidPhone(data.mobile)) {
            this.showError('Please enter a valid 10-digit mobile number');
            return false;
        }

        // Validate email if provided
        if (data.email && !utils.isValidEmail(data.email)) {
            this.showError('Please enter a valid email address');
            return false;
        }

        // Validate name
        if (!data.name || data.name.length < 2) {
            this.showError('Please enter a valid name');
            return false;
        }

        return true;
    }

    async sendData(formData) {
        // Check if Google Script URL is configured
        if (CONFIG.GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_SCRIPT_WEB_APP_URL_HERE') {
            console.warn('Google Script URL not configured. Form data:', formData);
            // Simulate successful submission for demo
            await new Promise(resolve => setTimeout(resolve, 1000));
            return;
        }

        const response = await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        console.log('Lead Captured:', formData);
        return response;
    }

    showSuccess() {
        if (this.successMessage) {
            this.successMessage.classList.add('show');
            
            // Auto-hide after duration
            setTimeout(() => {
                this.successMessage.classList.remove('show');
            }, CONFIG.SUCCESS_MESSAGE_DURATION);

            // Announce to screen readers
            this.successMessage.setAttribute('role', 'alert');
        }
    }

    showError(message) {
        alert(message); // Simple alert for now
        // TODO: Implement better error UI
    }

    handleError(error) {
        console.error('Form submission error:', error);
        alert('Something went wrong. Please try again or call us directly at +91 123-456-7890');
    }

    trackConversion(data) {
        // Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submission', {
                'form_source': data.source,
                'event_category': 'engagement',
                'event_label': data.source
            });
        }

        // Facebook Pixel
        if (typeof fbq !== 'undefined') {
            fbq('track', 'Lead', {
                content_name: data.source,
                value: 0,
                currency: 'INR'
            });
        }

        console.log('Conversion tracked:', data.source);
    }
}

// Phone Input Handler
class PhoneInputHandler {
    constructor() {
        this.init();
    }

    init() {
        document.querySelectorAll('input[type="tel"]').forEach(input => {
            // Format on input
            input.addEventListener('input', (e) => this.handleInput(e));
            
            // Validate on blur
            input.addEventListener('blur', (e) => this.handleBlur(e));
            
            // Prevent paste of non-numeric content
            input.addEventListener('paste', (e) => this.handlePaste(e));
        });
    }

    handleInput(e) {
        const input = e.target;
        let value = utils.formatPhoneNumber(input.value);
        input.value = value;

        // Real-time validation feedback
        if (value.length > 0) {
            if (utils.isValidPhone(value)) {
                input.setCustomValidity('');
                input.classList.remove('invalid');
                input.classList.add('valid');
            } else {
                input.classList.remove('valid');
            }
        }
    }

    handleBlur(e) {
        const input = e.target;
        const value = input.value;
        
        if (value.length > 0 && !utils.isValidPhone(value)) {
            input.setCustomValidity('Please enter a valid 10-digit mobile number');
            input.reportValidity();
            input.classList.add('invalid');
        } else {
            input.setCustomValidity('');
            input.classList.remove('invalid');
        }
    }

    handlePaste(e) {
        e.preventDefault();
        const pastedText = (e.clipboardData || window.clipboardData).getData('text');
        const numericText = utils.formatPhoneNumber(pastedText);
        e.target.value = numericText;
        
        // Trigger input event for validation
        e.target.dispatchEvent(new Event('input', { bubbles: true }));
    }
}

// Smooth Scroll Handler
class SmoothScrollHandler {
    constructor() {
        this.init();
    }

    init() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => this.handleClick(e));
        });
    }

    handleClick(e) {
        e.preventDefault();
        const targetId = e.currentTarget.getAttribute('href');
        
        if (targetId === '#') return;
        
        const target = document.querySelector(targetId);
        
        if (target) {
            const offsetTop = target.offsetTop - CONFIG.SCROLL_OFFSET;
            
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });

            // Update URL without jumping
            history.pushState(null, null, targetId);
            
            // Focus target for accessibility
            target.setAttribute('tabindex', '-1');
            target.focus();
        }
    }
}

// Floating Form Behavior
class FloatingFormHandler {
    constructor() {
        this.floatingForm = document.getElementById('floating-form');
        this.lastScroll = 0;
        
        if (this.floatingForm && window.innerWidth <= 1024) {
            this.init();
        }
    }

    init() {
        const handleScroll = utils.throttle(() => {
            const currentScroll = window.pageYOffset;
            
            // Hide form when scrolling down, show when scrolling up
            if (currentScroll > this.lastScroll && currentScroll > 500) {
                this.floatingForm.style.opacity = '0.3';
                this.floatingForm.style.pointerEvents = 'none';
            } else {
                this.floatingForm.style.opacity = '1';
                this.floatingForm.style.pointerEvents = 'auto';
            }
            
            this.lastScroll = currentScroll;
        }, 100);

        window.addEventListener('scroll', handleScroll, { passive: true });
    }
}

// CTA Click Tracker
class CTATracker {
    constructor() {
        this.init();
    }

    init() {
        // Track CTA button clicks
        document.querySelectorAll('.btn-primary, .btn-secondary').forEach(button => {
            button.addEventListener('click', (e) => this.trackCTAClick(e));
        });

        // Track phone number clicks
        document.querySelectorAll('a[href^="tel:"]').forEach(link => {
            link.addEventListener('click', (e) => this.trackPhoneClick(e));
        });
    }

    trackCTAClick(e) {
        const button = e.currentTarget;
        const buttonText = button.textContent.trim();
        const buttonHref = button.getAttribute('href');
        
        const eventData = {
            text: buttonText,
            href: buttonHref,
            timestamp: new Date().toISOString()
        };
        
        console.log('CTA Clicked:', eventData);
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'cta_click', {
                'button_text': buttonText,
                'button_href': buttonHref,
                'event_category': 'engagement'
            });
        }
    }

    trackPhoneClick(e) {
        const link = e.currentTarget;
        const phoneNumber = link.getAttribute('href').replace('tel:', '');
        
        const eventData = {
            number: phoneNumber,
            timestamp: new Date().toISOString()
        };
        
        console.log('Phone Number Clicked:', eventData);
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'phone_click', {
                'phone_number': phoneNumber,
                'event_category': 'engagement'
            });
        }
    }
}

// Navigation Active State Handler
class NavigationHandler {
    constructor() {
        this.init();
    }

    init() {
        const handleScroll = utils.throttle(() => {
            this.updateActiveLink();
        }, 200);

        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    updateActiveLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.pageYOffset + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                document.querySelectorAll('.footer-links a').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
}

// Lazy Image Loader
class LazyImageLoader {
    constructor() {
        if ('IntersectionObserver' in window) {
            this.init();
        }
    }

    init() {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img.lazy').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Form Input Focus Handler
class FormFocusHandler {
    constructor() {
        this.init();
    }

    init() {
        document.querySelectorAll('.form-group input').forEach(input => {
            input.addEventListener('focus', (e) => {
                e.target.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', (e) => {
                if (e.target.value === '') {
                    e.target.parentElement.classList.remove('focused');
                }
            });
        });
    }
}

// Performance Monitor
class PerformanceMonitor {
    constructor() {
        if (window.performance) {
            this.init();
        }
    }

    init() {
        window.addEventListener('load', () => {
            // Use setTimeout to ensure timing is complete
            setTimeout(() => {
                const perfData = window.performance.timing;
                const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                
                console.log(`%cPage Load Time: ${pageLoadTime}ms`, 'color: #28a745; font-weight: bold;');
                
                // Track in analytics if available
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'page_load', {
                        'value': pageLoadTime,
                        'event_category': 'performance'
                    });
                }
            }, 0);
        });
    }
}

// Initialize Everything
class App {
    constructor() {
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
        } else {
            this.initializeComponents();
        }
    }

    initializeComponents() {
        console.log('%cOCUS 24K - Premium Serviced Apartments', 'font-size: 20px; font-weight: bold; color: #c29357;');
        console.log('%cWebsite loaded successfully!', 'font-size: 14px; color: #666;');
        console.log('For inquiries, call: +91 123-456-7890');

        // Initialize scroll animations
        const scrollObserver = new ScrollAnimationObserver();
        scrollObserver.observe();

        // Initialize form handlers
        new FormHandler('contact-form-floating', 'success-floating', 'Floating Form');
        new FormHandler('contact-form-main', 'success-main', 'Main Registration Form');

        // Initialize phone input handler
        new PhoneInputHandler();

        // Initialize smooth scroll
        new SmoothScrollHandler();

        // Initialize floating form behavior
        new FloatingFormHandler();

        // Initialize CTA tracking
        new CTATracker();

        // Initialize navigation handler
        new NavigationHandler();

        // Initialize lazy image loading
        new LazyImageLoader();

        // Initialize form focus handler
        new FormFocusHandler();

        // Initialize performance monitor
        new PerformanceMonitor();

        // Service Worker Registration (optional - for PWA)
        this.registerServiceWorker();
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('SW registered:', registration);
                    })
                    .catch(error => {
                        console.log('SW registration failed:', error);
                    });
            });
        }
    }
}

// Start the application
const app = new App();

// Export for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { App, utils, FormHandler };
}
