$(document).ready(function() {

  // Create annotations manifest
  var annotations = [];

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
  console.log(svgElement);
  $('.annotations').prepend(svgElement);

  // Allow time for size recalc...
  setTimeout(function() {
    var vornoi = new VoronoiLayer(annotations, $('#veronoi_ui'), onAnnotationSelected);
  }, 250);

  var onAnnotationSelected = function(annId, annBtn) {

    console.log('annotationSelected(): ' + annId);

    // TODO - Set up media and transition to overlay screen

  };

});
