$(document).ready(function() {

  var ANNOTATION_TYPE_VIDEO = 'video';
  var ANNOTATION_TYPE_TEXT = 'text';
  var ANNOTATION_TYPE_AUDIO = 'audio';

  // Create annotations manifest
  var annotations = [];

  var videoPlayer = {};

  setupFullscreenVideo();

  setupScreenSaver();

  cutoutsGoHome();

  var paintingImg = $('.painting img').first();
  $('.annotations button').each(function() {

    var a = { id: $(this).attr('id'),
              btn: this,
              x: parseInt($(this).attr('data-x'), 10),
              y: parseInt($(this).attr('data-y'), 10),
              type: $(this).attr('media-type'),
              path: $(this).attr('media-path'),
    };

    annotations.push(a);

    // Position & style button (offset for button size)
    $(this).css('left', a.x - 20);
    $(this).css('top', a.y - 20);
    $(this).addClass('btn');
    $(this).append('<i class="glyphicon glyphicon-plus"></i>');

    // Associate clipping w annotation
    var cutoutWidth = 100 + Math.random() * 200;
    var cutoutHeight = 100 + Math.random() * 200;
    var cutRect = {x:-(cutoutWidth / 2), y: -(cutoutHeight / 2), w: cutoutWidth, h: cutoutHeight};

    if (a.id === 'b_lincoln') {
      cutRect = {x:-90, y: 10, w: 150, h: 440};
    } else if (a.id === 'k_churches') {
      cutRect = {x:-75, y: -0, w: 150, h: 125};
    }

    a.cutRect = cutRect;
    a.cutout = getCutoutFromImage(a.id, paintingImg, a.x + a.cutRect.x, a.y + a.cutRect.y, a.cutRect.w, a.cutRect.h);

  });

  // Create hit regions by building Vernoi diagram
  var svgElement = '<svg id="veronoi_ui" width="1920" height="1080"></svg>';
  $('.annotations').prepend(svgElement);

  // Allow time for size recalc...
  setTimeout(function() {
    var vornoi = new VoronoiLayer(annotations, $('#veronoi_ui'), onAnnotationSelected, false);
  }, 250);

  var onAnnotationSelected = function(annId, annBtn) {

    console.log('annotationSelected(): ' + annId);

    // TODO - Set up media and transition to overlay screen
    for (var i = 0; i < annotations.length; i++) {

      var a = annotations[i];

      if (annId === a.id) {

        // Transition
        TweenMax.to($(a.btn), 0.15, {
          opacity:0,
        });

        setTimeout(function() {
          TweenMax.to($('.overlay'), 1, {
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

          TweenMax.to($(a.cutout), 1.75, {
            delay: 0.5,
            left:20,
            top:20,
            padding:10,
            backgroundColor:'rgba(0,0,0,0.5)',
            boxShadow:'0px 3px 8px 2px rgba(0, 0, 0, 0.3)',
            ease:Power2.easeInOut,
            onComplete:showAnnotationContent,
            onCompleteParams:[a],
          });

        }, 150);

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

      hideFullscreenVideo();

    });

    // Home button
    $('.home-btn').on('click', function() {

      hideFullscreenVideo();

    });

  }

  function showFullscreenVideo(vidSrc) {

    videoPlayer.attr('src', vidSrc);
    videoPlayer.load();

  }

  function hideFullscreenVideo() {

    $('.content').fadeOut('fast', function() {
      videoPlayer.get(0).pause();
      $('.content').hide();

      cutoutsGoHome();

    });

  }

  function cutoutsGoHome() {
    for (var i = 0; i < annotations.length; i++) {

      TweenMax.to($(annotations[i].cutout), 1.5, {
        delay: 0.0,
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
        },
      });

    };

    TweenMax.to($('.overlay'), 0.75, {
      opacity:0,
      delay:0.25,
    });

  }

  function setupScreenSaver() {

    var screensaver = new Screensaver(5 * 60, 'videos/Screensaver.mp4', function() {

      console.log('onSleepCallback');

    });

  }

  // TEMP - Tool for logging annotation points
  $('body').click(function(e) {
    console.log(e.pageX + ' , ' + e.pageY);
  });

});
