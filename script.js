(function() {
  'use strict';

  if (typeof window.__app === 'undefined') {
    window.__app = {};
  }

  const app = window.__app;

  const debounce = (func, wait) => {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  };

  const throttle = (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  class BurgerMenu {
    constructor() {
      this.nav = document.querySelector('.c-nav#main-nav') || document.querySelector('nav');
      this.toggle = document.querySelector('.c-nav__toggle') || document.querySelector('.navbar-toggler');
      this.navList = document.querySelector('.c-nav__list') || document.querySelector('.navbar-collapse');
      this.navLinks = document.querySelectorAll('.c-nav__link') || document.querySelectorAll('.nav-link');
      this.body = document.body;
      this.isOpen = false;
      
      if (this.nav && this.toggle && this.navList) {
        this.init();
      }
    }

    init() {
      this.toggle.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleMenu();
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.closeMenu();
          this.toggle.focus();
        }
      });

      document.addEventListener('click', (e) => {
        if (this.isOpen && !this.nav.contains(e.target) && e.target !== this.toggle) {
          this.closeMenu();
        }
      });

      this.navLinks.forEach(link => {
        link.addEventListener('click', () => {
          if (this.isOpen) {
            this.closeMenu();
          }
        });
      });

      window.addEventListener('resize', debounce(() => {
        if (window.innerWidth >= 1024 && this.isOpen) {
          this.closeMenu();
        }
      }, 150));
    }

    toggleMenu() {
      this.isOpen ? this.closeMenu() : this.openMenu();
    }

    openMenu() {
      this.isOpen = true;
      this.nav.classList.add('is-open');
      this.navList.classList.add('show');
      this.toggle.setAttribute('aria-expanded', 'true');
      this.body.classList.add('u-no-scroll');
      this.navList.style.maxHeight = `calc(100vh - var(--header-h))`;
    }

    closeMenu() {
      this.isOpen = false;
      this.nav.classList.remove('is-open');
      this.navList.classList.remove('show');
      this.toggle.setAttribute('aria-expanded', 'false');
      this.body.classList.remove('u-no-scroll');
      this.navList.style.maxHeight = '';
    }
  }

  class FormValidator {
    constructor(formSelector) {
      this.forms = document.querySelectorAll(formSelector);
      this.validationRules = {
        name: {
          pattern: /^[a-zA-ZÀ-ÿs-']{2,50}$/,
          message: 'Naam moet 2-50 tekens bevatten (alleen letters)'
        },
        email: {
          pattern: /^[^s@]+@[^s@]+.[^s@]+$/,
          message: 'Voer een geldig e-mailadres in'
        },
        phone: {
          pattern: /^[ds+-()]{10,20}$/,
          message: 'Voer een geldig telefoonnummer in (10-20 cijfers)'
        },
        message: {
          minLength: 10,
          message: 'Bericht moet minimaal 10 tekens bevatten'
        }
      };
      
      if (this.forms.length > 0) {
        this.init();
      }
    }

    init() {
      this.forms.forEach(form => {
        form.addEventListener('submit', (e) => this.handleSubmit(e, form));
        
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
          input.addEventListener('blur', () => this.validateField(input));
          input.addEventListener('input', () => {
            if (input.classList.contains('has-error')) {
              this.validateField(input);
            }
          });
        });
      });
    }

    validateField(field) {
      const fieldName = field.name || field.id;
      const value = field.value.trim();
      const errorElement = field.parentElement.querySelector('.c-form__error') || 
                          field.parentElement.querySelector('.invalid-feedback');
      
      let isValid = true;
      let errorMessage = '';

      if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'Dit veld is verplicht';
      } else if (value) {
        if (fieldName === 'name' && this.validationRules.name) {
          if (!this.validationRules.name.pattern.test(value)) {
            isValid = false;
            errorMessage = this.validationRules.name.message;
          }
        } else if (fieldName === 'email' && this.validationRules.email) {
          if (!this.validationRules.email.pattern.test(value)) {
            isValid = false;
            errorMessage = this.validationRules.email.message;
          }
        } else if (fieldName === 'phone' && this.validationRules.phone) {
          if (!this.validationRules.phone.pattern.test(value)) {
            isValid = false;
            errorMessage = this.validationRules.phone.message;
          }
        } else if (fieldName === 'message' && this.validationRules.message) {
          if (value.length < this.validationRules.message.minLength) {
            isValid = false;
            errorMessage = this.validationRules.message.message;
          }
        }
      }

      if (field.type === 'checkbox' && field.hasAttribute('required') && !field.checked) {
        isValid = false;
        errorMessage = 'U moet akkoord gaan met de voorwaarden';
      }

      if (isValid) {
        field.classList.remove('has-error', 'is-invalid');
        field.classList.add('is-valid');
        if (errorElement) {
          errorElement.textContent = '';
          errorElement.classList.remove('is-visible', 'd-block');
        }
      } else {
        field.classList.add('has-error', 'is-invalid');
        field.classList.remove('is-valid');
        if (errorElement) {
          errorElement.textContent = errorMessage;
          errorElement.classList.add('is-visible', 'd-block');
        }
      }

      return isValid;
    }

    handleSubmit(e, form) {
      e.preventDefault();
      e.stopPropagation();

      const inputs = form.querySelectorAll('input, textarea, select');
      let isFormValid = true;

      inputs.forEach(input => {
        if (!this.validateField(input)) {
          isFormValid = false;
        }
      });

      if (!isFormValid) {
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Verzenden...';

        setTimeout(() => {
          window.location.href = 'thank_you.html';
        }, 1000);
      }
    }
  }

  class ScrollAnimations {
    constructor() {
      this.elements = document.querySelectorAll('[data-aos], .c-card, .c-job-card, .c-mention, img, .c-section__title, .c-section__description');
      this.observer = null;
      this.init();
    }

    init() {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('aos-animate');
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });

      this.elements.forEach(el => {
        if (!el.hasAttribute('data-avoid-layout')) {
          el.style.opacity = '0';
          el.style.transform = 'translateY(20px)';
          el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
          this.observer.observe(el);
        }
      });
    }
  }

  class RippleEffect {
    constructor() {
      this.buttons = document.querySelectorAll('.c-btn, .c-button, .btn, .nav-link');
      this.init();
    }

    init() {
      this.buttons.forEach(button => {
        button.addEventListener('click', (e) => {
          const ripple = document.createElement('span');
          const rect = button.getBoundingClientRect();
          const size = Math.max(rect.width, rect.height);
          const x = e.clientX - rect.left - size / 2;
          const y = e.clientY - rect.top - size / 2;

          ripple.style.width = ripple.style.height = `${size}px`;
          ripple.style.left = `${x}px`;
          ripple.style.top = `${y}px`;
          ripple.classList.add('ripple');

          button.style.position = 'relative';
          button.style.overflow = 'hidden';
          button.appendChild(ripple);

          setTimeout(() => ripple.remove(), 600);
        });
      });
    }
  }

  class SmoothScroll {
    constructor() {
      this.links = document.querySelectorAll('a[href^="#"]');
      this.init();
    }

    init() {
      this.links.forEach(link => {
        link.addEventListener('click', (e) => {
          const href = link.getAttribute('href');
          if (href === '#' || href === '#!') return;

          const targetId = href.substring(1);
          const targetElement = document.getElementById(targetId);

          if (targetElement) {
            e.preventDefault();
            const headerHeight = document.querySelector('.l-header')?.offsetHeight || 80;
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = targetPosition - headerHeight;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });

            if (window.history && window.history.pushState) {
              window.history.pushState(null, '', href);
            }
          }
        });
      });
    }
  }

  class ScrollSpy {
    constructor() {
      this.sections = document.querySelectorAll('section[id]');
      this.navLinks = document.querySelectorAll('.nav-link[href^="#"]');
      this.init();
    }

    init() {
      if (this.sections.length === 0) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            this.setActiveLink(id);
          }
        });
      }, {
        threshold: 0.3,
        rootMargin: '-100px 0px -66% 0px'
      });

      this.sections.forEach(section => observer.observe(section));
    }

    setActiveLink(id) {
      this.navLinks.forEach(link => {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
        
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        }
      });
    }
  }

  class CountUpAnimation {
    constructor() {
      this.counters = document.querySelectorAll('[data-count]');
      this.init();
    }

    init() {
      if (this.counters.length === 0) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
            this.animateCounter(entry.target);
            entry.target.classList.add('counted');
          }
        });
      }, { threshold: 0.5 });

      this.counters.forEach(counter => observer.observe(counter));
    }

    animateCounter(element) {
      const target = parseInt(element.getAttribute('data-count'));
      const duration = 2000;
      const step = target / (duration / 16);
      let current = 0;

      const animate = () => {
        current += step;
        if (current < target) {
          element.textContent = Math.floor(current);
          requestAnimationFrame(animate);
        } else {
          element.textContent = target;
        }
      };

      animate();
    }
  }

  class ImageAnimations {
    constructor() {
      this.images = document.querySelectorAll('img');
      this.init();
    }

    init() {
      this.images.forEach(img => {
        if (!img.hasAttribute('loading') && !img.classList.contains('c-logo__img')) {
          img.setAttribute('loading', 'lazy');
        }

        if (!img.classList.contains('img-fluid')) {
          img.classList.add('img-fluid');
        }

        img.addEventListener('error', (e) => {
          if (e.target.hasAttribute('data-error-handled')) return;
          e.target.setAttribute('data-error-handled', 'true');
          const width = e.target.getAttribute('width') || 400;
          const height = e.target.getAttribute('height') || 300;
          e.target.src = this.createPlaceholder(width, height);
        });
      });
    }

    createPlaceholder(width, height) {
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect fill="#ddd" width="${width}" height="${height}"/><text fill="#999" font-family="sans-serif" font-size="18" x="50%" y="50%" text-anchor="middle" dy=".3em">Afbeelding niet beschikbaar</text></svg>`
      )}`;
    }
  }

  class HeaderScrollEffect {
    constructor() {
      this.header = document.querySelector('.l-header');
      this.init();
    }

    init() {
      if (!this.header) return;

      const handleScroll = throttle(() => {
        if (window.scrollY > 50) {
          this.header.classList.add('is-scrolled');
        } else {
          this.header.classList.remove('is-scrolled');
        }
      }, 100);

      window.addEventListener('scroll', handleScroll);
    }
  }

  class SliderController {
    constructor() {
      this.sliders = document.querySelectorAll('.c-slider');
      this.init();
    }

    init() {
      this.sliders.forEach(slider => {
        const track = slider.querySelector('.c-slider__track');
        const prevBtn = slider.querySelector('.c-slider__btn--prev');
        const nextBtn = slider.querySelector('.c-slider__btn--next');

        if (!track || !prevBtn || !nextBtn) return;

        prevBtn.addEventListener('click', () => {
          track.scrollBy({ left: -track.offsetWidth, behavior: 'smooth' });
        });

        nextBtn.addEventListener('click', () => {
          track.scrollBy({ left: track.offsetWidth, behavior: 'smooth' });
        });
      });
    }
  }

  class ActiveMenuHighlight {
    constructor() {
      this.currentPath = window.location.pathname;
      this.navLinks = document.querySelectorAll('.c-nav__link, .nav-link');
      this.init();
    }

    init() {
      this.navLinks.forEach(link => {
        link.removeAttribute('aria-current');
        link.classList.remove('active');

        const linkPath = link.getAttribute('href');
        if (!linkPath) return;

        const normalizedLinkPath = linkPath.replace(//index.html$/, '/');
        const normalizedCurrentPath = this.currentPath.replace(//index.html$/, '/') || '/';

        if (normalizedLinkPath === normalizedCurrentPath ||
            (normalizedCurrentPath === '/' && (linkPath === '/' || linkPath === '/index.html'))) {
          link.setAttribute('aria-current', 'page');
          link.classList.add('active');
        }
      });
    }
  }

  app.init = () => {
    if (app.initialized) return;
    app.initialized = true;

    new BurgerMenu();
    new FormValidator('form');
    new ScrollAnimations();
    new RippleEffect();
    new SmoothScroll();
    new ScrollSpy();
    new CountUpAnimation();
    new ImageAnimations();
    new HeaderScrollEffect();
    new SliderController();
    new ActiveMenuHighlight();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', app.init);
  } else {
    app.init();
  }

})();
# CSS Additions (add to style.css)

.ripple {
  position: absolute;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.6);
  transform: scale(0);
  animation: ripple-animation 0.6s ease-out;
  pointer-events: none;
}

@keyframes ripple-animation {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

.c-nav.is-open .navbar-collapse {
  max-height: calc(100vh - var(--header-h));
  height: calc(100vh - var(--header-h));
}

.aos-animate {
  opacity: 1 !important;
  transform: translateY(0) !important;
}

.c-btn, .c-button, .btn {
  position: relative;
  overflow: hidden;
}

.c-card:hover, .card:hover {
  transform: translateY(-4px) scale(1.01);
}

img {
  transition: transform 0.6s ease-out, opacity 0.6s ease-out;
}

.l-header {
  transition: box-shadow 0.3s ease-in-out, background-color 0.3s ease-in-out;
}

.l-header.is-scrolled {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.nav-link {
  position: relative;
  transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background-color: var(--color-secondary);
  transition: width 0.3s ease-in-out, left 0.3s ease-in-out;
}

.nav-link.active::after,
.nav-link:hover::after {
  width: 80%;
  left: 10%;
}

.c-slider__track {
  scroll-behavior: smooth;
}

.c-slider__item {
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
}

@media (max-width: 1023px) {
  .navbar-collapse.show {
    animation: slideDown 0.3s ease-out;
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: calc(100vh - var(--header-h));
  }
}
