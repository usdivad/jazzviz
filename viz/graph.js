function Graph(div, width, height) {
    console.log("graph");
    //Initial globe setup
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
        .translate([width/2, height/2 + margin])
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
    svg.selectAll(".sphere")
        .call(d3.geo.zoom().projection(projection)
            .scaleExtent([projection.scale() * .7, projection.scale() * 10])
            .on("zoom.redraw", function() {
                d3.event.sourceEvent.preventDefault();
                svg.selectAll("path").attr("d", path);
            }));
}