/**
 * Panis Vivus — Contact Form Handler
 * 
 * SETUP: See G-Suite Setup Instructions doc
 * 
 * IMPORTANT: Use the /exec URL when deploying, NOT /dev
 * Correct: https://script.google.com/macros/s/SCRIPT_ID/exec
 *
 * Responses are JSON for the website (fetch + safe UI). HTML helpers remain for doGet and legacy clients.
 */

var MAX_NAME_LEN = 200;
var MAX_EMAIL_LEN = 254;
var MAX_MESSAGE_LEN = 8000;

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Strip control chars and newlines — avoids header injection in email subject. */
function sanitizeOneLine(s) {
  return String(s || '').replace(/[\r\n\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ').trim();
}

function isValidEmail(email) {
  if (!email || email.length > MAX_EMAIL_LEN) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    // Parse form data - e.parameter works for form POST; fallback to postData
    var params = e.parameter || {};
    if (Object.keys(params).length === 0 && e.postData) {
      params = parseFormData(e.postData.contents);
    }
    
    var recaptchaToken = params['g-recaptcha-response'] || '';
    var name = (params.name || '').trim();
    var email = (params.email || '').trim();
    var message = (params.message || '').trim();
    
    // Verify reCAPTCHA
    var secret = PropertiesService.getScriptProperties().getProperty('RECAPTCHA_SECRET');
    if (!secret) {
      return jsonResponse({ ok: false, title: 'Configuration Error', message: 'reCAPTCHA secret not configured. Add RECAPTCHA_SECRET in Script Properties.' });
    }
    
    if (!verifyRecaptcha(secret, recaptchaToken)) {
      return jsonResponse({ ok: false, title: 'Verification Failed', message: 'Please complete the reCAPTCHA and try again.' });
    }
    
    if (!name || !email || !message) {
      return jsonResponse({ ok: false, title: 'Missing Fields', message: 'Please fill in all required fields.' });
    }

    if (!isValidEmail(email)) {
      return jsonResponse({ ok: false, title: 'Invalid Email', message: 'Please enter a valid email address.' });
    }

    if (name.length > MAX_NAME_LEN || email.length > MAX_EMAIL_LEN || message.length > MAX_MESSAGE_LEN) {
      return jsonResponse({ ok: false, title: 'Input Too Long', message: 'Please shorten your message and try again.' });
    }
    
    // Append to Google Sheet (bound script: uses the spreadsheet this script is attached to)
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheets()[0];  // First tab
    sheet.appendRow([new Date(), name, email, message]);
    
    // Send email (subject is sanitized — never trust form input in headers)
    var safeName = sanitizeOneLine(name);
    var emailBody = 'New contact form submission from Panis Vivus website:\n\nName: ' + name + '\nEmail: ' + email + '\n\nMessage:\n' + message;
    var mailOpts = {};
    if (isValidEmail(email)) {
      mailOpts.replyTo = email;
    }
    GmailApp.sendEmail('support@odbread.com', 'Panis Vivus - New Contact: ' + safeName, emailBody, mailOpts);
    
    return jsonResponse({
      ok: true,
      title: 'Thank you for reaching out',
      message: 'Your message has been submitted. We\'ll be in touch soon. In the meantime, we hope you enjoy our sourdough!'
    });
    
  } catch (err) {
    Logger.log(err.toString());
    return jsonResponse({ ok: false, title: 'Error', message: 'Something went wrong. Please try again or email us at support@odbread.com' });
  }
}

// Handle GET (e.g. someone visits the URL directly)
function doGet(e) {
  return createHtmlResponse('Panis Vivus', 'This form handler is for the contact form. Visit odbread.com to get in touch.');
}

function parseFormData(contents) {
  var params = {};
  if (!contents) return params;
  var pairs = contents.split('&');
  for (var i = 0; i < pairs.length; i++) {
    var idx = pairs[i].indexOf('=');
    if (idx > 0) {
      var key = decodeURIComponent(pairs[i].substring(0, idx).replace(/\+/g, ' '));
      var val = decodeURIComponent((pairs[i].substring(idx + 1) || '').replace(/\+/g, ' '));
      params[key] = val;
    }
  }
  return params;
}

function verifyRecaptcha(secret, token) {
  if (!token) return false;
  try {
    var payload = 'secret=' + encodeURIComponent(secret) + '&response=' + encodeURIComponent(token);
    var response = UrlFetchApp.fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'post',
      muteHttpExceptions: true,
      contentType: 'application/x-www-form-urlencoded',
      payload: payload
    });
    var result = JSON.parse(response.getContentText());
    // v2: success only. v3: success + score (0.0-1.0). 0.5 reduces spam; lower if legitimate users fail
    if (!result.success) return false;
    if (result.score !== undefined && result.score < 0.5) return false;
    return true;
  } catch (e) {
    return false;
  }
}

function createHtmlResponse(title, message) {
  var t = escapeHtml(title);
  var m = escapeHtml(message);
  var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + t + '</title><style>body{font-family:Georgia,serif;background:#F9F5EC;color:#4A3B2E;margin:0;padding:2rem;min-height:100vh;display:flex;align-items:center;justify-content:center}.box{max-width:28rem;text-align:center}h1{font-size:1.5rem;margin-bottom:1rem}p{line-height:1.6;margin-bottom:1.5rem}a{color:#A7322B}</style></head><body><div class="box"><h1>' + t + '</h1><p>' + m + '</p><p><a href="https://odbread.com">Return to Panis Vivus</a></p></div></body></html>';
  return ContentService.createTextOutput(html).setMimeType(ContentService.MimeType.HTML);
}
