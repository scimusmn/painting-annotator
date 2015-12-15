/**
* Screensaver
*/

function Screensaver(timeoutSeconds, videoSrc, onSleepCallback, onAwakeCallback) {

  // How long is timeout.
  this.timeoutSeconds = timeoutSeconds || 60;

  // Callback functions to reset external
  this.onSleepCallback = onSleepCallback || function() {};

  this.onAwakeCallback = onAwakeCallback || function() {};

  // Start the clock
  this.idleTime = 0;
  this.active = false;

  var _this = this;

  // Increment the idle time counter every minute.
  this.idleInterval = setInterval(function() {

    _this.timerIncrement();

  }, 1000);

  // Zero the idle timer on any movement.
  $('body').on('touchstart keypress mousemove mousedown', function() {

    _this.anyAction();

  });

  // Setup video screensaver
  this.createVideo(videoSrc);

  // Default to hidden screensaver
  this.awake();

}

/**
* Setup fullscreen looping video to be shown during sleep.
*/
Screensaver.prototype.createVideo = function(videoSrc) {

  // Create video tag
  var videoTag = '<video id="screensaver_video" style="position:fixed; top:0px; left:0px; z-index:999;" autoplay loop src="' + videoSrc + '"/></video>';
  var videoOptions = { controls: false, autoplay: false, loop: 'true', preload: 'auto' };

  // Append to html
  $('body').append(videoTag);

  // Initialize player
  this.videoPlayer = $('#screensaver_video').get(0);

};

/**
* Start the screensaver after X seconds of inactivity.
*/
Screensaver.prototype.timerIncrement = function() {

  // Increment counter
  this.idleTime = this.idleTime + 1;

  // If it's been X seconds of inactivity, save the screen
  if (this.idleTime > this.timeoutSeconds && this.active == false) {

    this.sleep();

  }

};

/**
* Zero the idle timer on any movement.
*/
Screensaver.prototype.anyAction = function() {

  this.idleTime = 0;

  if (this.active == true) {

    this.awake();

  }

};

/**
* Display the screensaver
*/
Screensaver.prototype.sleep = function() {

  this.active = true;
  this.onSleepCallback();

  // Show the video
  $('#screensaver_video').fadeIn('slow');
  this.videoPlayer.play();

};

/**
* Remove the screensaver
*/
Screensaver.prototype.awake = function() {

  this.active = false;
  this.onAwakeCallback();

  // Hide the video
  var _this = this;
  $('#screensaver_video').fadeOut('slow', function() {
    _this.videoPlayer.pause();
  });

};
