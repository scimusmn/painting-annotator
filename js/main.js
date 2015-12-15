$(document).ready(function() {

  var ANNOTATION_TYPE_VIDEO = 'video';
  var ANNOTATION_TYPE_TEXT = 'text';
  var ANNOTATION_TYPE_AUDIO = 'audio';

  // Create annotations manifest
  var annotations = [];

  setupFullscreenVideo();
  setupScreenSaver();

  $('.annotations button').each(function() {

    var a = { id: $(this).attr('id'),
              x: parseInt($(this).attr('data-x'), 10),
              y: parseInt($(this).attr('data-y'), 10),
              type: $(this).attr('media-type'),
              path: $(this).attr('media-path'),
    };

    annotations.push(a);

    // Position & style button
    $(this).css('left', a.x);
    $(this).css('top', a.y);
    $(this).addClass('btn');
    $(this).append('<i class="glyphicon glyphicon-plus"></i>');

  });

  // Create hit regions by building Vernoi diagram
  var svgElement = '<svg id="veronoi_ui" width="1920" height="1280" ></svg>';
  $('.annotations').prepend(svgElement);

  // Allow time for size recalc...
  setTimeout(function() {
    var vornoi = new VoronoiLayer(annotations, $('#veronoi_ui'), onAnnotationSelected, false);
  }, 250);

  var onAnnotationSelected = function(annId, annBtn) {

    console.log('annotationSelected(): ' + annId);

    // TODO - Set up media and transition to overlay screen
    for (var i = 0; i < annotations.length; i++) {
      if (annId === annotations[i].id) {
        showAnnotationContent(annotations[i]);
        break;
      }
    };

  };

  function showAnnotationContent(ann) {

    switch (ann.type) {
      case ANNOTATION_TYPE_VIDEO:
        showFullscreenVideo(ann.path);
        break;
      default:
        console.log('Whoops! Presentation for annotation type:', ann.type, ' has not been built out yet!');
        break;
    }
  }

  function setupFullscreenVideo() {

    // Create video tag
    var options = { controls:false, autoplay: true, loop: false, preload: 'auto' };

    // Initialize player
    videoPlayer = videojs('fullscreen_video', options, function() {

      this.on('playing', function() {

        console.log('Video playing.');

        $('.content').show();

      });

      this.on('waiting', function() {

      });

      this.on('ended', function() {

        console.log('Video ended.');

        hideFullscreenVideo();

      });

    });

    // Home button
    $('.home-btn').on('click', function() {

      hideFullscreenVideo();

    });

  }

  function showFullscreenVideo(vidSrc) {

    videoPlayer.src([{ type: 'video/mp4', src: vidSrc }]);

  }

  function hideFullscreenVideo() {

    $('.content').fadeOut('fast', function() {
      videoPlayer.pause();
      $('.content').hide();
    });

  }

  function setupScreenSaver() {

    var screensaver = new Screensaver(5 * 60, 'videos/Screensaver.mp4', function() {

      console.log('onSleepCallback');

    });

  }

});
