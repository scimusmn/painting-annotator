/* ========================================================================================
   VoronoiLayer utilizes the Voronoi diagram (http://en.wikipedia.org/wiki/Voronoi_diagram)
   to create an SVG layer of polygonal hit areas, maximizing hit area space.
   Currently using Voronoi process from library: https://github.com/gorhill/Javascript-Voronoi
   ===================================================================================== */

var VoronoiLayer = function(sites, svgElement, cellSelectionCallback) {

  // Array of center-points with ids, like so:[ {"id":"Site_A","x":160,"y":564}, {"id":"Site_B","x":442,"y":336}, {...}, {...} ];
  this.sites = sites;

  // Empty <svg> element to populate
  console.log(svgElement);
  this.svgElement = svgElement;

  console.log($(this.svgElement).attr('width'));

  // Called when a cell is clicked.
  this.cellSelectionCallback = cellSelectionCallback || function() {};

  this.init = function() {

    this.createVoronoiDiagram();

    this.createSVG();

    var _this = this;
    $(this.svgElement).find('polygon').on('click', function(evt) {

      var cellId = $(this).attr('id');
      _this.cellSelectionCallback(cellId);

    });

  };

  this.createVoronoiDiagram = function() {

    this.voronoi = new Voronoi();

    // Bounding box
    var right = $(this.svgElement).attr('width').replace(/[^-\d\.]/g, '');
    var bottom = $(this.svgElement).attr('height').replace(/[^-\d\.]/g, '');
    this.bbox = {xl:0, xr:right, yt:0, yb:bottom};

    console.log(this.bbox);

    // Generate Voronoi diagram
    this.diagram = this.voronoi.compute(this.sites, this.bbox);

  };

  this.createSVG = function() {

    // Init vars outside of iteration
    var cells = this.diagram.cells;
    var index = cells.length;
    var cell;
    var halfEdges;
    var drawPoint;
    var pointsStr;
    var newShape;

    console.log(cells);

    // Draw Cells
    while (index--) {
      cell = cells[index];
      halfEdges = cell.halfedges;

      // First point
      drawPoint = halfEdges[0].getStartpoint();
      pointsStr = drawPoint.x + ',' + drawPoint.y + ' ';

      for (var i = 0; i < halfEdges.length; i++) {

        drawPoint = halfEdges[i].getEndpoint();
        pointsStr += ' ' + drawPoint.x + ',' + drawPoint.y;

      };

      var fillColor = 'rgba(0,33,255,0.3)'; // Change from 'none' to hex for debugging.

      // Add Polygon representing cell
      newShape = '<polygon id="' + cell.site.id + '" points="' + pointsStr + '" pointer-events="visible" stroke="red" fill="' + fillColor + '"/>';
      $(this.svgElement).append($(newShape));

      // Add Circle representing site point
      newShape = '<circle cx="' + (cell.site.x - 2) + '" cy="' + (cell.site.y - 2) + '" r="2" pointer-events="none" fill="' + fillColor + '"/>';
      $(this.svgElement).append($(newShape));
    }

    // Refresh svg html
    $(this.svgElement).html($(this.svgElement).html());

  };

  this.init();

};

