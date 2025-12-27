// ============================================
// Navigation
// ============================================

const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

// Navbar scroll effect
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// Mobile menu toggle
if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        
        // Animate hamburger icon
        const bars = navToggle.querySelectorAll('.bar');
        navToggle.classList.toggle('active');
    });
}

// Close mobile menu when clicking on links (except dropdown toggles)
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        // If it's a dropdown toggle, don't close the menu
        if (link.parentElement.classList.contains('dropdown-parent')) {
            // Mobile Dropdown Toggle Logic
            if (window.innerWidth <= 768) {
                e.preventDefault();
                const parent = link.parentElement;
                const menu = parent.querySelector('.dropdown-menu');
                const icon = parent.querySelector('.dropdown-icon');
                
                if (menu) menu.classList.toggle('show');
                if (icon) icon.classList.toggle('show');
            }
            return;
        }

        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown-parent')) {
        document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
            menu.classList.remove('show');
        });
        document.querySelectorAll('.dropdown-icon.show').forEach(icon => {
            icon.classList.remove('show');
        });
    }
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ============================================
// Intersection Observer for Animations
// ============================================

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

// Observe all animated elements
const animatedElements = document.querySelectorAll('.service-card, .project-card, .contact-info, .contact-form');
animatedElements.forEach(el => observer.observe(el));

// ============================================
// Staggered Animation for Service Cards
// ============================================

const serviceCards = document.querySelectorAll('.service-card');
serviceCards.forEach((card, index) => {
    card.style.transitionDelay = `${index * 100}ms`;
});

// ============================================
// Staggered Animation for Project Cards
// ============================================

const projectCards = document.querySelectorAll('.project-card');
projectCards.forEach((card, index) => {
    card.style.transitionDelay = `${index * 100}ms`;
});

// ============================================
// Toaster Notification System
// ============================================

function showToaster(type, title, message, duration = 5000) {
    const container = document.getElementById('toaster-container');
    if (!container) return;
    
    const toaster = document.createElement('div');
    toaster.className = `toaster ${type}`;
    
    // Success icon
    const successIcon = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 6L9 17l-5-5"/>
        </svg>
    `;
    
    // Error icon
    const errorIcon = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
    `;
    
    const icon = type === 'success' ? successIcon : errorIcon;
    
    toaster.innerHTML = `
        <div class="toaster-icon">
            ${icon}
        </div>
        <div class="toaster-content">
            <div class="toaster-title">${title}</div>
            <div class="toaster-message">${message}</div>
        </div>
        <button class="toaster-close" aria-label="Close notification">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        </button>
    `;
    
    container.appendChild(toaster);
    
    // Trigger animation
    setTimeout(() => {
        toaster.classList.add('show');
    }, 10);
    
    // Close button handler
    const closeBtn = toaster.querySelector('.toaster-close');
    const closeToaster = () => {
        toaster.classList.remove('show');
        setTimeout(() => {
            if (toaster.parentNode) {
                toaster.parentNode.removeChild(toaster);
            }
        }, 300);
    };
    
    closeBtn.addEventListener('click', closeToaster);
    
    // Auto-close after duration
    if (duration > 0) {
        setTimeout(closeToaster, duration);
    }
    
    return toaster;
}

// ============================================
// Form Handling
// ============================================

const contactForm = document.querySelector('.contact-form');

if (contactForm) {
    const formGroups = contactForm.querySelectorAll('.form-group');
    const formInputs = contactForm.querySelectorAll('input, select, textarea');
    
    // Remove error class on input
    formInputs.forEach(input => {
        input.addEventListener('input', () => {
            const formGroup = input.closest('.form-group');
            if (formGroup) {
                formGroup.classList.remove('error');
            }
        });
        
        input.addEventListener('blur', () => {
            validateField(input);
        });
    });
    
    // Validate individual field
    function validateField(field) {
        const formGroup = field.closest('.form-group');
        if (!formGroup) return true;
        
        let isValid = true;
        
        // Check if field is required and empty
        if (field.hasAttribute('required')) {
            if (field.type === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                isValid = field.value.trim() !== '' && emailRegex.test(field.value);
            } else if (field.tagName === 'SELECT') {
                isValid = field.value !== '';
            } else {
                isValid = field.value.trim() !== '';
            }
        }
        
        if (!isValid) {
            formGroup.classList.add('error');
            return false;
        } else {
            formGroup.classList.remove('error');
            return true;
        }
    }
    
    // Validate all fields
    function validateForm() {
        let isValid = true;
        formInputs.forEach(input => {
            if (!validateField(input)) {
                isValid = false;
            }
        });
        return isValid;
    }
    
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate all fields
        if (!validateForm()) {
            showToaster('error', 'Validation Error', 'Please fill in all required fields correctly.');
            
            // Scroll to first error
            const firstError = contactForm.querySelector('.form-group.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                const input = firstError.querySelector('input, select, textarea');
                if (input) {
                    input.focus();
                }
            }
            return;
        }
        
        // Get form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);
        
        // Map service values to readable names
        const serviceNames = {
            'saas': 'Micro SaaS',
            'design': 'UX/UI Design',
            'development': 'Web Development',
            'general': 'General Inquiry'
        };
        
        // Add smooth loading animation
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        // Update button state
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;
        
        try {
            // Prepare form data for FormSubmit
            const formAction = contactForm.getAttribute('action');
            const submitData = new FormData();
            
            // Add all form fields
            submitData.append('name', data.name);
            submitData.append('email', data.email);
            submitData.append('service', data.service);
            submitData.append('message', data.message);
            
            // Add FormSubmit specific fields
            submitData.append('_subject', `New Contact Form Submission - ${serviceNames[data.service] || 'General Inquiry'}`);
            submitData.append('_captcha', 'false');
            submitData.append('_template', 'table');
            
            // Submit to FormSubmit
            const response = await fetch(formAction, {
                method: 'POST',
                body: submitData
            });
            
            if (response.ok) {
                // Show success toaster
                showToaster('success', 'Message Sent!', 'Thank you for contacting us. We\'ll get back to you soon.');
                
                // Reset form
                contactForm.reset();
                
                // Remove all error classes
                formGroups.forEach(group => group.classList.remove('error'));
                
                // Reset button
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            console.error('Email sending failed:', error);
            
            // Show error toaster
            showToaster('error', 'Send Failed', 'Unable to send your message. Please try again later.');
            
            // Reset button
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    });
}

// ============================================
// Parallax Effect for Hero
// ============================================

const heroContent = document.querySelector('.hero-content');
const orbs = document.querySelectorAll('.gradient-orb');

window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    
    if (heroContent && scrolled < window.innerHeight) {
        // Subtle parallax effect
        heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
        heroContent.style.opacity = 1 - (scrolled / 600);
    }
    
    // Move orbs slightly
    if (orbs.length > 0 && scrolled < window.innerHeight) {
        orbs.forEach((orb, index) => {
            const speed = (index + 1) * 0.3;
            orb.style.transform = `translate(${scrolled * speed * 0.1}px, ${scrolled * speed * 0.1}px)`;
        });
    }
});

// ============================================
// Cursor Trail Effect (Optional Enhancement)
// ============================================

let cursorTrail = [];
const maxTrailLength = 10;

document.addEventListener('mousemove', (e) => {
    // Create a subtle trail effect for interactive elements
    const hoveredElement = document.elementFromPoint(e.clientX, e.clientY);
    
    if (hoveredElement && (hoveredElement.tagName === 'A' || hoveredElement.tagName === 'BUTTON' || hoveredElement.classList.contains('service-card') || hoveredElement.classList.contains('project-card'))) {
        document.body.style.cursor = 'pointer';
    } else {
        document.body.style.cursor = 'default';
    }
});

// ============================================
// Smooth Scroll Indicator Animation
// ============================================

window.addEventListener('scroll', () => {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator && window.pageYOffset > 100) {
        scrollIndicator.style.opacity = '0';
    }
});

// ============================================
// Lazy Loading for Images (if added later)
// ============================================

if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ============================================
// Add Active State to Current Section Link
// ============================================

const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset + 150;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop;
        const sectionId = section.getAttribute('id');
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
});

// ============================================
// Performance Optimization: Debounce Function
// ============================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debounce to scroll events
const optimizedScrollHandler = debounce(() => {
    // Scroll-based animations
}, 10);

window.addEventListener('scroll', optimizedScrollHandler, { passive: true });

// ============================================
// Page Load Animation
// ============================================

window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    // Trigger initial animations
    setTimeout(() => {
        const heroButtons = document.querySelector('.hero-buttons');
        if (heroButtons) {
            heroButtons.style.opacity = '1';
        }
    }, 600);
});

// ============================================
// Easter Egg: Konami Code (Optional)
// ============================================

let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode.splice(-konamiSequence.length - 1, konamiCode.length - konamiSequence.length);
    
    if (konamiCode.join(',') === konamiSequence.join(',')) {
        // Add fun animation
        document.body.style.animation = 'rainbow 5s infinite';
        console.log('🎉 Konami Code activated!');
    }
});

// Add rainbow animation
const style = document.createElement('style');
style.textContent = `
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }
`;
document.head.appendChild(style);

// ============================================
// Logo click → Go to Home
// ============================================

const logoClickableElements = document.querySelectorAll('.nav-logo, .footer-logo, .logo-text');

logoClickableElements.forEach(el => {
	el.style.cursor = 'pointer';
	el.addEventListener('click', () => {
		const target = document.querySelector('#home');
		if (target) {
			const headerOffset = 80;
			const elementPosition = target.getBoundingClientRect().top;
			const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

			window.scrollTo({
				top: offsetPosition,
				behavior: 'smooth'
			});
		} else {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}

		// Close mobile menu if open
		navMenu && navMenu.classList.remove('active');
		navToggle && navToggle.classList.remove('active');
	});
});
