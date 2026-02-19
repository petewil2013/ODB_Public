/**
 * Our Daily Bread — Contact Form Handler (STANDALONE VERSION)
 * 
 * Use this if you get Error 400 when opening Apps Script from the Sheet.
 * Create the project at script.google.com instead.
 * 
 * SETUP:
 * 1. Go to script.google.com → New project
 * 2. Paste this code
 * 3. Project Settings → Script Properties → Add:
 *    - RECAPTCHA_SECRET = your reCAPTCHA secret key
 *    - SPREADSHEET_ID = your Sheet ID (from the URL: docs.google.com/spreadsheets/d/THIS_PART/edit)
 * 4. Create a Google Sheet, add headers in row 1: Timestamp | Name | Email | Message
 * 5. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Copy the /exec URL into index.html
 */

function doPost(e) {
  try {
    var params = e.parameter || {};
    if (Object.keys(params).length === 0 && e.postData) {
      params = parseFormData(e.postData.contents);
    }
    
    var recaptchaToken = params['g-recaptcha-response'] || '';
    var name = (params.name || '').trim();
    var email = (params.email || '').trim();
    var message = (params.message || '').trim();
    
    var secret = PropertiesService.getScriptProperties().getProperty('RECAPTCHA_SECRET');
    if (!secret) {
      return createHtmlResponse('Configuration Error', 'Add RECAPTCHA_SECRET in Script Properties.');
    }
    
    if (!verifyRecaptcha(secret, recaptchaToken)) {
      return createHtmlResponse('Verification Failed', 'Please complete the reCAPTCHA and try again.');
    }
    
    if (!name || !email || !message) {
      return createHtmlResponse('Missing Fields', 'Please fill in all required fields.');
    }
    
    var sheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
    if (!sheetId) {
      return createHtmlResponse('Configuration Error', 'Add SPREADSHEET_ID in Script Properties.');
    }
    
    var sheet = SpreadsheetApp.openById(sheetId).getSheets()[0];  // First tab
    sheet.appendRow([new Date(), name, email, message]);
    
    var emailBody = 'New contact form submission from Our Daily Bread website:\n\nName: ' + name + '\nEmail: ' + email + '\n\nMessage:\n' + message;
    GmailApp.sendEmail('Peter.ODBread@gmail.com', 'Our Daily Bread - New Contact: ' + name, emailBody, { replyTo: email });
    
    return createHtmlResponse('Thank You!', 'Your message has been sent. We\'ll be in touch soon.');
    
  } catch (err) {
    Logger.log(err.toString());
    return createHtmlResponse('Error', 'Something went wrong. Please try again or email us at Peter.ODBread@gmail.com');
  }
}

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
    if (!result.success) return false;
    // v3: score 0.0-1.0. Use 0.3 for localhost/testing; 0.5 is typical for production
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
