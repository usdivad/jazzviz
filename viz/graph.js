d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

function Graph(div, width, height) {
    console.log("graph");
    //Initial globe setup
    var graph = d3.select(div);
    var margin = 20;
    var graticule = d3.geo.graticule();
    var svg = d3.select(div)
                .append("svg")
                .attr("x", margin)
                .attr("width", width-2*margin)
                .attr("height", height-2*margin)
                .style("display", "block");
    var projection = d3.geo.orthographic()
        .scale(300)
        .translate([width/2, height/2])
        .clipAngle(90);
    var path = d3.geo.path()
        .projection(projection);
    //sphere
    svg.append("path")
        .datum({type: "Sphere"})
        .attr("class", "sphere")
        .attr("d", path);
    //meridian lines
    svg.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", path);
    //the country data
    d3.json("data/world-110m.json", function(error, world) {
        svg.append("path")
            .datum(topojson.feature(world, world.objects.land))
            .attr("class", "land")
            .attr("d", path);

        svg.append("path", ".graticule") //append vs insert?
            .datum(topojson.mesh(world, world.objects.countries, function(a,b) {
                return a!=b;
            }))
            .attr("class", "boundary")
            .attr("d", path);

    });

    //zooming!
    svg.selectAll("path")
        .call(d3.geo.zoom().projection(projection)
            .scaleExtent([projection.scale() * .7, projection.scale() * 10])
            .on("zoom.redraw", function() {
                d3.event.sourceEvent.preventDefault();
                svg.selectAll("path").attr("d", path);
            }));

    /*var dispDateSpan = graph.append("div")
                            .attr("class", "divDateSpan")
                            .attr("x", 0)
                            .attr("y", 0);*/

    /**DATES**/   
    var graphWidth = width-2*margin;
    var graphHeight = height-2*margin;

    // Date slider
    var sliderContainer = svg.append("foreignObject")
        .attr("width", width)
        .attr("height", 40)
        .attr("transform", "translate(0,"+graphHeight+")")
          .append("xhtml:div")
          .attr("style", "user-select:none;-webkit-user-select:none;background:white;");
          //.html("hello");
    var sliderDummy = sliderContainer.append("input")
      .attr("id", "sliderDummy")
      .attr("style", "display:none");
    /*        
    var testSlide = testContainer.append("input")
              .attr("type", "range")
              .attr("width", graphWidth+"px")
              .attr("height", 20);*/


    var slider = d3.select(div).append("input")
    //var slider = sliderContainer.append("input")
      .attr("id", "dateSlider")
      //.attr("class", "unselectable")
      .attr("type", "range")
      .attr("min", "0")
      .attr("max", "1")
      .attr("step", 0.003)
      .attr("value", 1)
      .style("margin-top", "20px")
      .style("width", graphWidth + "px")
      .on("input", function() {
        onRangeInput(this.value);
        document.getElementById("dateSlider").blur();
      })
      .on("change", function() {
        onRangeInput(this.value);
        document.getElementById("dateSlider").blur();
      })
      .on("mousedown", function() {
        console.log("clickya");
        document.getElementById("dateSlider").blur();
      })
      .attr("title", "Slide across dates!");

    //on date change
    function onRangeInput(rangeVal) {
      var maxDateOffset = 0;
      var startDate = "1/1/1917";
      var startYear = 1917;
      var endYear = 1955;
      var day = Math.floor(rangeVal * (365 * (endYear-startYear))); // 0 to (365-maxDateOffset) inclusive
      //console.log("day is " + day);
      var date = new Date(startDate);
      date.setDate(date.getDate() - maxDateOffset);
      var dateText = (date.getMonth()+1) + "/" + date.getDate() + "/" + date.getFullYear();
      //console.log(dateText + " day is " + day);
      date.setDate(date.getDate() - ((365 - maxDateOffset) - day));
      dateText = (date.getMonth()+1) + "/" + date.getDate() + "/" + date.getFullYear();
      console.log(dateText);

      //move the text box for selected date
      d3.select("#dispDateSpan").remove();
       var dispDateSpan = svg.append("text")
          .attr("style", "font-weight:bold; text-align:center; fill:black;")
          .attr("x", graphWidth)
          .attr("y", graphHeight)
          .attr("width", 100)
          .attr("height", 20)
          .attr("id", "dispDateSpan")
          .style("display", null)
          .text("");
      //var dispDateSpan = div.select("dispDateSpan");
      
      dispDateSpan.text(dateText)
                  .attr("x", function() {
                    var x = rangeVal * graphWidth;
                    //var threshold = 10;
                    if (x <= graphWidth/2) {
                      return x+((1-rangeVal)*margin);
                    }
                    else {
                      return x-((1-rangeVal)*margin);
                    }
                  })
                  .attr("y", graphHeight);

       dispDateSpan.moveToFront();
        
      //displayDay(date);
      //slider.style("-webkit-appearance", "none");
      //$("#graph_svg").hide().show();
    }

}