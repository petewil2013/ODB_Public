/**
 * Panis Vivus — Main JavaScript
 * Handles navigation toggle and smooth scroll
 */

(function () {
  'use strict';

  var APPS_SCRIPT_ORIGIN = 'https://script.google.com';

  var CONTACT_SUCCESS_TITLE = 'Thank you for reaching out';
  var CONTACT_SUCCESS_MESSAGE =
    'Your message has been submitted. We\'ll be in touch soon. In the meantime, we hope you enjoy our sourdough!';

  function isAllowedFormAction(action) {
    if (!action || typeof action !== 'string') return false;
    try {
      var u = new URL(action, window.location.href);
      if (u.origin !== APPS_SCRIPT_ORIGIN) return false;
      if (!/^\/macros\/s\/[^/]+\/exec$/.test(u.pathname)) return false;
      return true;
    } catch (e) {
      return false;
    }
  }

  function showContactOutcome(title, message, isError) {
    var form = document.getElementById('contactForm');
    var outcome = document.getElementById('contactFormOutcome');
    if (!form || !outcome) return;
    form.setAttribute('hidden', '');
    outcome.removeAttribute('hidden');
    outcome.className = 'contact-form-outcome' + (isError ? ' contact-form-outcome--error' : '');
    outcome.setAttribute('role', 'status');
    outcome.setAttribute('aria-live', 'polite');
    outcome.textContent = '';
    var h = document.createElement('h3');
    h.textContent = title;
    var p = document.createElement('p');
    p.textContent = message;
    outcome.appendChild(h);
    outcome.appendChild(p);
    if (isError) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-secondary';
      btn.textContent = 'Try again';
      btn.addEventListener('click', function () {
        outcome.setAttribute('hidden', '');
        outcome.textContent = '';
        form.removeAttribute('hidden');
      });
      outcome.appendChild(btn);
    }
  }

  /**
   * Parse Apps Script HTML success/error pages without executing scripts (avoids DOM XSS).
   */
  /** Apps Script often returns JSON with a non-JSON Content-Type; parse when body looks like JSON. */
  function tryParseJsonBody(raw) {
    var trimmed = (raw || '').trim();
    if (!trimmed || trimmed.charAt(0) !== '{') return null;
    try {
      var data = JSON.parse(trimmed);
      if (data && typeof data.ok === 'boolean') return data;
    } catch (e) {
      return null;
    }
    return null;
  }

  function parseLegacyHtmlResponse(html) {
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var h1 = doc.querySelector('h1');
    var box = doc.querySelector('.box');
    var title = (h1 && h1.textContent) ? h1.textContent.trim() : 'Thank you';
    var message = '';
    if (box) {
      var ps = box.querySelectorAll('p');
      var parts = [];
      for (var i = 0; i < ps.length; i++) {
        var t = ps[i].textContent.trim();
        if (t) parts.push(t);
      }
      message = parts.join('\n\n');
    }
    if (!message) message = 'Your request was processed.';
    var lower = title.toLowerCase();
    var isErr = lower.indexOf('error') !== -1 || lower.indexOf('failed') !== -1 || lower.indexOf('missing') !== -1;
    return { title: title, message: message, isError: isErr };
  }

  document.addEventListener('DOMContentLoaded', function () {
  var siteHeader = document.querySelector('.site-header');

  function syncSiteHeaderOffset() {
    if (!siteHeader) return;
    var h = siteHeader.offsetHeight;
    document.documentElement.style.setProperty('--site-header-offset', h + 8 + 'px');
  }

  if (siteHeader) {
    syncSiteHeaderOffset();
    requestAnimationFrame(function () {
      requestAnimationFrame(syncSiteHeaderOffset);
    });
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(syncSiteHeaderOffset).observe(siteHeader);
    } else {
      window.addEventListener('resize', syncSiteHeaderOffset);
    }
    window.addEventListener('load', syncSiteHeaderOffset);
  }

  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  // Analytics: track Order CTA clicks (works with GA4 when uncommented)
  ['orderCtaBtn', 'orderStorefrontBtn', 'presaleWaitlistBtn'].forEach(function (id) {
    var btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', function () {
        if (typeof gtag === 'function') {
          var eventName = id === 'presaleWaitlistBtn' ? 'click_presale_waitlist' : 'click_order_cta';
          gtag('event', eventName, { event_category: 'conversion', event_label: id });
        }
      });
    }
  });

  // Mobile nav toggle
  if (navToggle && navLinks) {
    var desktopNavMq = window.matchMedia('(min-width: 641px)');

    function closeMobileNav() {
      navLinks.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }

    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', navLinks.classList.contains('is-open'));
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        closeMobileNav();
      });
    });

    function onNavBreakpointChange() {
      if (desktopNavMq.matches) {
        closeMobileNav();
      }
    }

    if (typeof desktopNavMq.addEventListener === 'function') {
      desktopNavMq.addEventListener('change', onNavBreakpointChange);
    } else if (typeof desktopNavMq.addListener === 'function') {
      desktopNavMq.addListener(onNavBreakpointChange);
    }
  }

  // Contact form — reCAPTCHA + POST to Google Apps Script (never write untrusted HTML to document)
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    var action = contactForm.getAttribute('action');
    var hasValidBackend = action && !action.includes('YOUR_GOOGLE_APPS_SCRIPT_URL') && isAllowedFormAction(action);
    var siteKey = contactForm.getAttribute('data-recaptcha-sitekey');
    var tokenInput = document.getElementById('g-recaptcha-response');
    var recaptchaError = document.getElementById('recaptchaError');
    var submitBtn = contactForm.querySelector('button[type="submit"]');

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!hasValidBackend) {
        var originalText = submitBtn.textContent;
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
          var formData = new FormData(contactForm);
          fetch(action, {
            method: 'POST',
            body: formData,
            credentials: 'omit',
            redirect: 'follow'
          })
            .then(function (r) {
              var okHttp = r.ok;
              return r.text().then(function (raw) {
                var asJson = tryParseJsonBody(raw);
                if (asJson) {
                  return { json: asJson, okHttp: okHttp };
                }
                return { text: raw, okHttp: okHttp };
              });
            })
            .then(function (payload) {
              submitBtn.disabled = false;
              submitBtn.textContent = 'Send Message';
              if (payload.json) {
                var data = payload.json;
                if (data.ok) {
                  if (typeof gtag === 'function') {
                    gtag('event', 'form_submit_success', { event_category: 'conversion', event_label: 'contact_form' });
                  }
                  showContactOutcome(CONTACT_SUCCESS_TITLE, CONTACT_SUCCESS_MESSAGE, false);
                } else {
                  showContactOutcome(data.title || 'Something went wrong', data.message || 'Please try again.', true);
                }
                return;
              }
              if (payload.okHttp === false) {
                showContactOutcome('Error', 'The server could not process your message. Please try again or email support@odbread.com.', true);
                return;
              }
              var parsed = parseLegacyHtmlResponse(payload.text || '');
              if (parsed.isError) {
                showContactOutcome(parsed.title, parsed.message, true);
              } else {
                if (typeof gtag === 'function') {
                  gtag('event', 'form_submit_success', { event_category: 'conversion', event_label: 'contact_form' });
                }
                showContactOutcome(CONTACT_SUCCESS_TITLE, CONTACT_SUCCESS_MESSAGE, false);
              }
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
})();
