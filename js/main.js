$(document).ready(function() {
  console.log('readdddy');

  // Create annotations manifest
  var annotations = [];
  $('.annotations button').each(function() {
    var a = { x: parseInt($(this).attr('data-x'), 10),
              y: parseInt($(this).attr('data-y'), 10),
              type: $(this).attr('media-type'),
              path: $(this).attr('media-path'),
            };

    annotations.push(a);

    // Position visual button
    $(this).css('left', a.x);
    $(this).css('top', a.y);

    console.log($(this).css('left'));

  });

  console.log(annotations);

  // Create hit regions by building Vernoi diagram

});
