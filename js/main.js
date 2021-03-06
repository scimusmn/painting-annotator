$(document).ready(function() {

  var ANNOTATION_TYPE_VIDEO = 'video';
  var ANNOTATION_TYPE_TEXT = 'text';
  var ANNOTATION_TYPE_AUDIO = 'audio';

  // Create annotations manifest
  var annotations = [];
  var videoPlayer = {};

  var appWidth = $('body').css('width');
  var appHeight = $('body').css('height');

  function init() {

    setupFullscreenVideo();
    setupScreenSaver();

    var paintingImg = $('.painting img').first();

    $('.annotations button').each(function() {

      var mediaPath = $(this).attr('media-path');
      var a = { id: $(this).attr('id'),
                btn: this,
                x: parseInt($(this).attr('annotation-x')*0.75, 10),
                y: parseInt($(this).attr('annotation-y')*0.75, 10),
                type: getMediaType(mediaPath),
                path: mediaPath,
      };

      annotations.push(a);

      // Position & style button (offset for button size)
      $(this).css('left', a.x - 20);
      $(this).css('top', a.y - 20);
      $(this).addClass('btn');
      $(this).append('<i class="glyphicon glyphicon-plus"></i>');

      var cutout = $(this).attr('cutout');
      if (cutout === undefined) {
        cutout = {x:-70, y: -70, w: 140, h: 140};
      } else {
        cutout = getProperJSON(cutout);
      }

      a.cutRect = cutout;
      a.cutout = getCutoutFromImage(a.id, paintingImg, a.x + a.cutRect.x, a.y + a.cutRect.y, a.cutRect.w, a.cutRect.h);

    });

    // Create hit regions by building Vernoi diagram
    console.log(appWidth, appHeight);
    var svgElement = '<svg id="veronoi_ui" width="' + appWidth + '" height="' + appHeight + '"></svg>';
    $('.annotations').prepend(svgElement);

    // Allow time for size recalc...
    setTimeout(function() {
      var vornoi = new VoronoiLayer(annotations, $('#veronoi_ui'), onAnnotationSelected, onAnnotationActive, false);
    }, 200);

    cutoutsGoHome();

  }

  var onAnnotationActive = function(annId, annBtn) {

    for (var i = 0; i < annotations.length; i++) {

      var a = annotations[i];

      if (annId === a.id) {

        $(a.btn).addClass('active');

        break;
      }

    }

  };

  var onAnnotationSelected = function(annId, annBtn) {

    console.log('annotationSelected(): ' + annId);

    for (var i = 0; i < annotations.length; i++) {

      var a = annotations[i];

      if (annId === a.id) {

        // Block mouse/touch interaction
        $('.overlay').css('pointer-events', 'auto');
        $(a.btn).removeClass('active');

        // Transition
        TweenMax.set($(a.btn), {
          zIndex:2,
        });
        TweenMax.to($(a.btn), 0.2, {
          opacity:0,
          onComplete:function() {
            TweenMax.set($(a.btn), {
              zIndex:0,
            });
          },
        });

        TweenMax.to($('.overlay'), 0.6, {
          opacity:1,
          ease:Power2.easeOut,
        });

        $(a.cutout).show();
        TweenMax.set($(a.cutout), {
          boxShadow:'0px 0px 8px 2px rgba(0, 0, 0, 0)',
          zIndex:1,
          backgroundColor:'rgba(0,0,0,0.0)',
          padding:0,
        });

        TweenMax.to($(a.cutout), 1.2, {
          delay: 0,
          left:-180,
          top:-161,
          padding:8,
          backgroundColor:'rgba(0,0,0,0.8)',
          boxShadow:'0px 1px 6px 2px rgba(0, 0, 0, 0.35)',
          ease:Power2.easeInOut,
          onComplete:showAnnotationContent,
          onCompleteParams:[a],
        });

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
        console.log('Annotation type:', ann.type, ' has not been built yet.');
        break;
    }

    trackKeenEvent('annotation_selection', { annotation: ann.id, mediaType:ann.type });

  }

  function getCutoutFromImage(id, imgElement, x, y, w, h) {

    id = id + '_cutout';
    var imgSrc = $(imgElement).attr('src');

    var cnvs = '<canvas id="' + id + '" style="position:absolute" width="' + w + '" height="' + h + '"></canvas>';

    $(imgElement).parent().append(cnvs);
    var cnvs = $('#' + id);
    var context = $(cnvs).get(0).getContext('2d');
    var imageObj = new Image();

    imageObj.onload = function() {

      context.drawImage(imageObj, x, y, w, h, 0, 0, w, h);
      TweenMax.set($(cnvs), {left:x, top:y});

    };

    imageObj.src = imgSrc;

    return cnvs;

  }

  function setupFullscreenVideo() {

    // Create video tag
    var options = { controls:false, autoplay: true, loop: false, preload: 'auto' };

    videoPlayer = $('video');

    videoPlayer.on('playing', function() {

      console.log('Video is playing');

      $('.content').show();

      TweenMax.set($('.content'), {
        opacity:0,
      });

      TweenMax.to($('.content'), 0.5, {
        opacity:1,
        ease:Power2.easeIn,
      });

    });

    videoPlayer.on('ended', function() {

      console.log('Video has ended!');

      trackKeenEvent('video_closed', {
        didFinish:true,
        src: videoPlayer.get(0).currentSrc,
        timePlayed: videoPlayer.get(0).currentTime,
        duration: videoPlayer.get(0).duration,
        progress: videoPlayer.get(0).currentTime / videoPlayer.get(0).duration,
      });

      hideFullscreenVideo();

    });

    // Home button
    $('.home-btn').on('click', function() {

      trackKeenEvent('video_closed', {
        didFinish:false,
        src: videoPlayer.get(0).currentSrc,
        timePlayed: videoPlayer.get(0).currentTime,
        duration: videoPlayer.get(0).duration,
        progress: videoPlayer.get(0).currentTime / videoPlayer.get(0).duration,
      });

      hideFullscreenVideo();

    });

  }

  function showFullscreenVideo(vidSrc) {

    videoPlayer.attr('src', vidSrc);
    videoPlayer.load();

    trackKeenEvent('play_video', { video: vidSrc });

  }

  function hideFullscreenVideo() {

    $('.content').fadeOut('fast', function() {
      videoPlayer.get(0).pause();
      $('.content').hide();
    });

    cutoutsGoHome();

  }

  function cutoutsGoHome() {

    TweenMax.to($('.overlay'), 0.8, {
      opacity:0,
      delay:0.7,
    });

    for (var i = 0; i < annotations.length; i++) {

      TweenMax.to($(annotations[i].cutout), 1.5, {
        left:annotations[i].x + annotations[i].cutRect.x,
        top:annotations[i].y + annotations[i].cutRect.y,
        backgroundColor:'rgba(0,0,0,0.0)',
        boxShadow:'0px 0px 8px 2px rgba(0, 0, 0, 0)',
        padding:0,
        ease:Power2.easeInOut,
        onCompleteParams:[annotations[i]],
        onComplete:function(a) {
          TweenMax.set($(a.cutout),  {
            zIndex:0,
          });
          TweenMax.to($(a.btn), 0.5, {
            opacity:1,
          });
          $(a.cutout).hide();

          // Unblock mouse/touch interaction
          $('.overlay').css('pointer-events', 'none');
        },
      });

    };

  }

  function setupScreenSaver() {

    var screensaver = new Screensaver(5 * 60, 'videos/ss.mp4', function() {

      console.log('onSleepCallback');
      trackKeenEvent('screensaver_shown', { });

    });

  }

  function getMediaType(mediaPath) {

    var ext = mediaPath.split('.').pop();
    var type = '';

    if (ext === 'mp4' || ext === 'mov') {
      type = ANNOTATION_TYPE_VIDEO;
    } else if (ext === 'mp3' || ext === 'ogg') {
      type = ANNOTATION_TYPE_AUDIO;
    } else if (ext === 'txt' || ext === 'json' || ext === 'xml' || ext === 'html') {
      type = ANNOTATION_TYPE_TEXT;
    } else {
      console.log('Unrecognized media type for file:', mediaPath);
    }

    return type;

  }

  function getProperJSON(improperJSON) {
    var properJSON = improperJSON.replace(/([a-z][^:]*)(?=\s*:)/g, '"$1"');
    return JSON.parse(properJSON);
  }

  function trackKeenEvent(collectionId, trackingEvent) {

    if (typeof keenClient !== 'undefined') {

      // Add timestamp
      trackingEvent.keen = { timestamp: new Date().toISOString() };

      // Send it to the <collectionId> collection
      keenClient.addEvent(collectionId, trackingEvent, function(err, res) {
        if (err) {
          console.log(err);
        } else {
          console.log(res);
        }
      });

    } else {
      console.log('Keen not initialized. Copy and modify js/keen.template.js -> js/keen.js');
    }

  }

  // TEMP - Tool for logging annotation points
  $('body').click(function(e) {
    console.log(e.pageX + ' , ' + e.pageY);
  });

  init();

});
