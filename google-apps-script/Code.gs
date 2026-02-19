/**
 * Our Daily Bread — Contact Form Handler
 * 
 * SETUP: See G-Suite Setup Instructions doc
 * 
 * IMPORTANT: Use the /exec URL when deploying, NOT /dev
 * Correct: https://script.google.com/macros/s/SCRIPT_ID/exec
 */

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
      return createHtmlResponse('Configuration Error', 'reCAPTCHA secret not configured. Add RECAPTCHA_SECRET in Script Properties.');
    }
    
    if (!verifyRecaptcha(secret, recaptchaToken)) {
      return createHtmlResponse('Verification Failed', 'Please complete the reCAPTCHA and try again.');
    }
    
    if (!name || !email || !message) {
      return createHtmlResponse('Missing Fields', 'Please fill in all required fields.');
    }
    
    // Append to Google Sheet (bound script: uses the spreadsheet this script is attached to)
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheets()[0];  // First tab
    sheet.appendRow([new Date(), name, email, message]);
    
    // Send email
    var emailBody = 'New contact form submission from Our Daily Bread website:\n\nName: ' + name + '\nEmail: ' + email + '\n\nMessage:\n' + message;
    GmailApp.sendEmail('Peter.ODBread@gmail.com', 'Our Daily Bread - New Contact: ' + name, emailBody, { replyTo: email });
    
    return createHtmlResponse('Thank You!', 'Your message has been sent. We\'ll be in touch soon.');
    
  } catch (err) {
    Logger.log(err.toString());
    return createHtmlResponse('Error', 'Something went wrong. Please try again or email us at Peter.ODBread@gmail.com');
  }
}

// Handle GET (e.g. someone visits the URL directly)
function doGet(e) {
  return createHtmlResponse('Our Daily Bread', 'This form handler is for the contact form. Visit odbread.com to get in touch.');
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
    // v2: success only. v3: success + score (0.0-1.0). Use 0.3 for localhost/testing; 0.5 for production
    if (!result.success) return false;
    if (result.score !== undefined && result.score < 0.3) return false;
    return true;
  } catch (e) {
    return false;
  }
}

function createHtmlResponse(title, message) {
  var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + title + '</title><style>body{font-family:Georgia,serif;background:#F9F5EC;color:#4A3B2E;margin:0;padding:2rem;min-height:100vh;display:flex;align-items:center;justify-content:center}.box{max-width:28rem;text-align:center}h1{font-size:1.5rem;margin-bottom:1rem}p{line-height:1.6;margin-bottom:1.5rem}a{color:#A7322B}</style></head><body><div class="box"><h1>' + title + '</h1><p>' + message + '</p><p><a href="https://odbread.com">Return to Our Daily Bread</a></p></div></body></html>';
  return ContentService.createTextOutput(html).setMimeType(ContentService.MimeType.HTML);
}
