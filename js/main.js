/**
 * Our Daily Bread — Main JavaScript
 * Handles navigation toggle and smooth scroll
 */

document.addEventListener('DOMContentLoaded', function () {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  // Mobile nav toggle
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', navLinks.classList.contains('is-open'));
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('is-open');
      });
    });
  }

  // Contact form — validate reCAPTCHA before submitting to Google Apps Script
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    const action = contactForm.getAttribute('action');
    const hasValidBackend = action && !action.includes('YOUR_GOOGLE_APPS_SCRIPT_URL');
    const siteKey = contactForm.getAttribute('data-recaptcha-sitekey');
    const tokenInput = document.getElementById('g-recaptcha-response');
    const recaptchaError = document.getElementById('recaptchaError');
    const submitBtn = contactForm.querySelector('button[type="submit"]');

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!hasValidBackend) {
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Thank you! (Form not yet configured)';
        submitBtn.disabled = true;
        setTimeout(function () {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          contactForm.reset();
        }, 3000);
        return;
      }

      if (!siteKey || typeof grecaptcha === 'undefined') {
        if (recaptchaError) recaptchaError.textContent = 'reCAPTCHA not loaded. Please refresh and try again.';
        return;
      }

      if (recaptchaError) recaptchaError.textContent = '';
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      grecaptcha.ready(function () {
        grecaptcha.execute(siteKey, { action: 'contact' }).then(function (token) {
          if (tokenInput) tokenInput.value = token;
          // Submit via fetch so we can render the HTML response (avoids raw HTML display)
          var formData = new FormData(contactForm);
          fetch(action, { method: 'POST', body: formData })
            .then(function (r) { return r.text(); })
            .then(function (html) {
              document.open();
              document.write(html);
              document.close();
            })
            .catch(function () {
              if (recaptchaError) recaptchaError.textContent = 'Something went wrong. Please try again.';
              submitBtn.disabled = false;
              submitBtn.textContent = 'Send Message';
            });
        }).catch(function () {
          if (recaptchaError) recaptchaError.textContent = 'Verification failed. Please try again.';
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send Message';
        });
      });
    });
  }
});
