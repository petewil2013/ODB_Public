/**
 * MINIMAL TEST - Use this to verify deployment works
 * 
 * If this deploys successfully, the issue is in the full script.
 * If this also gives 400, the issue is with your Google account or deployment.
 * 
 * 1. Go to script.google.com → New project
 * 2. Delete all code and paste ONLY this
 * 3. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Authorize when prompted
 * 5. Copy the Web app URL and open it in your browser
 * 
 * You should see "Test OK" - if you get 400, the problem is environmental.
 */

function doGet(e) {
  return ContentService.createTextOutput('Test OK').setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  return ContentService.createTextOutput('Test OK - POST received').setMimeType(ContentService.MimeType.TEXT);
}
