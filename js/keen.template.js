/**
 * Keen API keys
 *
 * Do not check these into Git. Copy this file to keen.js to activate it
 * when deploying the application.
 */
var keen = {};
keen.projectId = '12345';
keen.writeKey = '123456789';

// For browser javascript
if (typeof Keen !== 'undefined') {
  var keenClient = new Keen(keen);
}
