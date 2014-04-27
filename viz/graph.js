d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

function Graph(div, width, height) {
    console.log("graph");

    /**GLOBE**/
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
        console.log(world);
        /*svg.append("path")
            .datum(topojson.feature(world, world.objects.land))
            .attr("class", "land")
            .attr("d", path);

        svg.append("path", ".graticule") //append vs insert?
            .datum(topojson.mesh(world, world.objects.countries, function(a,b) {
                return a!=b;
            }))
            .attr("class", "boundary")
            .attr("d", path);

*/

    //country stuff (Fromworldmap)
    var countries = topojson.feature(world, world.objects.countries).features;
    
    //console.log(topojson.feature(world, world.objects.countries));

    countryElements = svg.selectAll(".country")
      .data(countries)
      .enter()
      .append("path")
      .attr("class", "country")
      .attr("d", path)
      .attr("fill", "#aaa")
      .attr("opacity", 0.7)
      .on("mouseover", function() {
        d3.select(this).attr("opacity", 0.9);
      })
      .on("mouseout", function() {
        d3.select(this).attr("opacity", 0.7);
      });
    
    graph.append("path")
      .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
      .attr("fill", "none")
      .attr("stroke", "#fff")
      .attr("stroke-width", "1px")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("pointer-events", "none")
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


    /**DATA**/
    //Data load
    var dates = {};
    //var locations = {};
    var ids = getCountryMap();
    console.log(ids);
    var idMap = getIdMap();
    var locations = [];
    var noIsos = [];
    d3.json("data/dates.json", function(error, datesObj) {
        var datesArr = datesObj["dates"];
        console.log(datesArr);
        for (var i=0; i<datesArr.length; i++) {
            var date = datesArr[i];
            if (date.hasOwnProperty("date") && date.hasOwnProperty("sessions")) {
                var dateStr = date["date"];
                var sessions = date["sessions"];
                if (sessions.length > 0) {
                    dates[dateStr] = date["sessions"];
                }
            }
        }
        console.log(dates);
        console.log(locations);
        //findMusician("Duke Ellington");

    });


    function countLocation(locationStr) {

    }

    function findMusician(musician) {
        var count = 0;
        for (date in dates) {
            var sessions = dates[date];
            for (var i=0; i<sessions.length; i++) {
                var session = sessions[i];
                var musicians = session["musicians"];
                if (typeof musicians != "undefined" && musicians != null) {
                    for (var j=0; j<musicians.length; j++) {
                        //console.log(musicians);
                        var m = musicians[j];
                        m = m["name"];
                        if (typeof m != "undefined" && m != null && m.toUpperCase() === musician.toUpperCase()) {
                            console.log("Found on " + date + " in " + session["location_str"]);
                            count++;
                        }
                    }
                }
            }
        }
        console.log("total count is " + count);
        return count;
    }

    /**DATES**/   
    var graphWidth = (width-2*margin) * 0.9;
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
      var monthNames = [ "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December" ];
      var maxDateOffset = 0;
      var startDate = "1/1/1918";
      var startYear = 1918;
      var endYear = 1955;
      var day = Math.floor(rangeVal * (365 * (endYear-startYear))); // 0 to (365-maxDateOffset) inclusive
      //console.log("day is " + day);
      var date = new Date(startDate);
      date.setDate(date.getDate() - maxDateOffset);
      var dateText = (date.getMonth()+1) + "/" + date.getDate() + "/" + date.getFullYear();
      //console.log(dateText + " day is " + day);
      date.setDate(date.getDate() - ((365 - maxDateOffset) - day));
      //dateText = (date.getMonth()+1) + "/" + date.getDate() + "/" + date.getFullYear();
      dateText = monthNames[date.getMonth()] + " " + date.getFullYear();
      var yearText = date.getFullYear();
      var monthText = ""+ (date.getMonth()+1);
      if (monthText.length < 2) {
        monthText = "0"+monthText;
      }
      var dayText = "" + (date.getDate());
      if (dayText.length < 2) {
        dayText = "0"+dayText;
      } 
      var dateText_hyphenated = yearText + "-" + monthText + "-" + dayText;
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
                    var x = rangeVal * graphWidth - 25;
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


       drawColors(dateText_hyphenated);



        
      //displayDay(date);
      //slider.style("-webkit-appearance", "none");
      //$("#graph_svg").hide().show();
    }


    function drawColors(dt) {
        var colorScale = d3.scale.linear()
                            .domain([0, 50])
                            .interpolate(d3.interpolateRgb)
                            .range(["#ff5a00", "#47ff00"]);
                            //.range(["white", "steelblue"]);
        var theDate = dates[dt];
        var ymArr = dt.split("-");
        ymArr.pop();
        var ym = ymArr.join("-");
        console.log(ym)

        var locationsInRange = [];
        for (date in dates) {
            //console.log(date + " " + ym);
            if (date.match(ym)) {
                var session = dates[date][0];
                locationsInRange.push(session["location_str"]);
            } 
        }
        //var count = count(ym);


        //Counting geographies and mapping by isocode
        var isoCounts = {};
        for (var i=0; i<locationsInRange.length; i++) {
            var loc = locationsInRange[i];
            for (name in ids) {
                if (loc.match(name)) {
                    if (!isoCounts.hasOwnProperty(ids[name])) {
                        isoCounts[ids[name]] = 1;
                    }
                    else {
                        isoCounts[ids[name]]++;
                    }
                }
            }
        }


        //Fill in countries and their corresponding study functionalities
      d3.selectAll(".country")
          .attr("fill", function(d) {
          if (idMap[d.id]) {
            //console.log(idMap[d.id]);
            var countryCount = isoCounts[idMap[d.id].iso_code];
            if (countryCount > 0) {
                console.log(countryCount);
                //return "steelblue";
                return colorScale(countryCount);
            }
            // //console.log(dataArr);
            // if ((typeof dataArr != 'undefined') && dataArr[0]) {
            // console.log("iso code " + idMap[d.id].iso_code);
            // console.log(dataArr);
            //   return getColorFromClass(dataArr[0].study_class);
            // } else {
            //   return "#aaa";
            // }
          } else {
            return "gray";
          }
      })
      .on("mouseover", function() {
        var coordinates = [0,0];
        coordinates = d3.mouse(this);
        var x = coordinates[0];
        var y= coordinates[1];
        d3.select(this).attr("opacity", 0.9);
        graph.append("rect")
            .attr("class", "tooltip")
            .attr("width", 100)
            .attr("height", 10)
            .attr("x", x)
            .attr("y", y)
            .attr("style", "fill:steelblue");
      })
      .on("mouseout", function() {
        d3.select(this).attr("opacity", 0.7);
        graph.selectAll(".tooltip").remove();
      });
        console.log(isoCounts);

        console.log(locationsInRange.length + " locations in " + dt);
        console.log(locationsInRange);
    }

    function count(yearMonth) {

    }

    function getCountryMap() {
        var countries = [{"name":"Afghanistan","alpha-2":"AF","alpha-3":"AFG","country-code":"004","iso_3166-2":"ISO 3166-2:AF","region-code":"142","sub-region-code":"034"},{"name":"Åland Islands","alpha-2":"AX","alpha-3":"ALA","country-code":"248","iso_3166-2":"ISO 3166-2:AX","region-code":"150","sub-region-code":"154"},{"name":"Albania","alpha-2":"AL","alpha-3":"ALB","country-code":"008","iso_3166-2":"ISO 3166-2:AL","region-code":"150","sub-region-code":"039"},{"name":"Algeria","alpha-2":"DZ","alpha-3":"DZA","country-code":"012","iso_3166-2":"ISO 3166-2:DZ","region-code":"002","sub-region-code":"015"},{"name":"American Samoa","alpha-2":"AS","alpha-3":"ASM","country-code":"016","iso_3166-2":"ISO 3166-2:AS","region-code":"009","sub-region-code":"061"},{"name":"Andorra","alpha-2":"AD","alpha-3":"AND","country-code":"020","iso_3166-2":"ISO 3166-2:AD","region-code":"150","sub-region-code":"039"},{"name":"Angola","alpha-2":"AO","alpha-3":"AGO","country-code":"024","iso_3166-2":"ISO 3166-2:AO","region-code":"002","sub-region-code":"017"},{"name":"Anguilla","alpha-2":"AI","alpha-3":"AIA","country-code":"660","iso_3166-2":"ISO 3166-2:AI","region-code":"019","sub-region-code":"029"},{"name":"Antarctica","alpha-2":"AQ","alpha-3":"ATA","country-code":"010","iso_3166-2":"ISO 3166-2:AQ"},{"name":"Antigua and Barbuda","alpha-2":"AG","alpha-3":"ATG","country-code":"028","iso_3166-2":"ISO 3166-2:AG","region-code":"019","sub-region-code":"029"},{"name":"Argentina","alpha-2":"AR","alpha-3":"ARG","country-code":"032","iso_3166-2":"ISO 3166-2:AR","region-code":"019","sub-region-code":"005"},{"name":"Armenia","alpha-2":"AM","alpha-3":"ARM","country-code":"051","iso_3166-2":"ISO 3166-2:AM","region-code":"142","sub-region-code":"145"},{"name":"Aruba","alpha-2":"AW","alpha-3":"ABW","country-code":"533","iso_3166-2":"ISO 3166-2:AW","region-code":"019","sub-region-code":"029"},{"name":"Australia","alpha-2":"AU","alpha-3":"AUS","country-code":"036","iso_3166-2":"ISO 3166-2:AU","region-code":"009","sub-region-code":"053"},{"name":"Austria","alpha-2":"AT","alpha-3":"AUT","country-code":"040","iso_3166-2":"ISO 3166-2:AT","region-code":"150","sub-region-code":"155"},{"name":"Azerbaijan","alpha-2":"AZ","alpha-3":"AZE","country-code":"031","iso_3166-2":"ISO 3166-2:AZ","region-code":"142","sub-region-code":"145"},{"name":"Bahamas","alpha-2":"BS","alpha-3":"BHS","country-code":"044","iso_3166-2":"ISO 3166-2:BS","region-code":"019","sub-region-code":"029"},{"name":"Bahrain","alpha-2":"BH","alpha-3":"BHR","country-code":"048","iso_3166-2":"ISO 3166-2:BH","region-code":"142","sub-region-code":"145"},{"name":"Bangladesh","alpha-2":"BD","alpha-3":"BGD","country-code":"050","iso_3166-2":"ISO 3166-2:BD","region-code":"142","sub-region-code":"034"},{"name":"Barbados","alpha-2":"BB","alpha-3":"BRB","country-code":"052","iso_3166-2":"ISO 3166-2:BB","region-code":"019","sub-region-code":"029"},{"name":"Belarus","alpha-2":"BY","alpha-3":"BLR","country-code":"112","iso_3166-2":"ISO 3166-2:BY","region-code":"150","sub-region-code":"151"},{"name":"Belgium","alpha-2":"BE","alpha-3":"BEL","country-code":"056","iso_3166-2":"ISO 3166-2:BE","region-code":"150","sub-region-code":"155"},{"name":"Belize","alpha-2":"BZ","alpha-3":"BLZ","country-code":"084","iso_3166-2":"ISO 3166-2:BZ","region-code":"019","sub-region-code":"013"},{"name":"Benin","alpha-2":"BJ","alpha-3":"BEN","country-code":"204","iso_3166-2":"ISO 3166-2:BJ","region-code":"002","sub-region-code":"011"},{"name":"Bermuda","alpha-2":"BM","alpha-3":"BMU","country-code":"060","iso_3166-2":"ISO 3166-2:BM","region-code":"019","sub-region-code":"021"},{"name":"Bhutan","alpha-2":"BT","alpha-3":"BTN","country-code":"064","iso_3166-2":"ISO 3166-2:BT","region-code":"142","sub-region-code":"034"},{"name":"Bolivia, Plurinational State of","alpha-2":"BO","alpha-3":"BOL","country-code":"068","iso_3166-2":"ISO 3166-2:BO","region-code":"019","sub-region-code":"005"},{"name":"Bonaire, Sint Eustatius and Saba","alpha-2":"BQ","alpha-3":"BES","country-code":"535","iso_3166-2":"ISO 3166-2:BQ","region-code":"019","sub-region-code":"029"},{"name":"Bosnia and Herzegovina","alpha-2":"BA","alpha-3":"BIH","country-code":"070","iso_3166-2":"ISO 3166-2:BA","region-code":"150","sub-region-code":"039"},{"name":"Botswana","alpha-2":"BW","alpha-3":"BWA","country-code":"072","iso_3166-2":"ISO 3166-2:BW","region-code":"002","sub-region-code":"018"},{"name":"Bouvet Island","alpha-2":"BV","alpha-3":"BVT","country-code":"074","iso_3166-2":"ISO 3166-2:BV"},{"name":"Brazil","alpha-2":"BR","alpha-3":"BRA","country-code":"076","iso_3166-2":"ISO 3166-2:BR","region-code":"019","sub-region-code":"005"},{"name":"British Indian Ocean Territory","alpha-2":"IO","alpha-3":"IOT","country-code":"086","iso_3166-2":"ISO 3166-2:IO"},{"name":"Brunei Darussalam","alpha-2":"BN","alpha-3":"BRN","country-code":"096","iso_3166-2":"ISO 3166-2:BN","region-code":"142","sub-region-code":"035"},{"name":"Bulgaria","alpha-2":"BG","alpha-3":"BGR","country-code":"100","iso_3166-2":"ISO 3166-2:BG","region-code":"150","sub-region-code":"151"},{"name":"Burkina Faso","alpha-2":"BF","alpha-3":"BFA","country-code":"854","iso_3166-2":"ISO 3166-2:BF","region-code":"002","sub-region-code":"011"},{"name":"Burundi","alpha-2":"BI","alpha-3":"BDI","country-code":"108","iso_3166-2":"ISO 3166-2:BI","region-code":"002","sub-region-code":"014"},{"name":"Cambodia","alpha-2":"KH","alpha-3":"KHM","country-code":"116","iso_3166-2":"ISO 3166-2:KH","region-code":"142","sub-region-code":"035"},{"name":"Cameroon","alpha-2":"CM","alpha-3":"CMR","country-code":"120","iso_3166-2":"ISO 3166-2:CM","region-code":"002","sub-region-code":"017"},{"name":"Canada","alpha-2":"CA","alpha-3":"CAN","country-code":"124","iso_3166-2":"ISO 3166-2:CA","region-code":"019","sub-region-code":"021"},{"name":"Cape Verde","alpha-2":"CV","alpha-3":"CPV","country-code":"132","iso_3166-2":"ISO 3166-2:CV","region-code":"002","sub-region-code":"011"},{"name":"Cayman Islands","alpha-2":"KY","alpha-3":"CYM","country-code":"136","iso_3166-2":"ISO 3166-2:KY","region-code":"019","sub-region-code":"029"},{"name":"Central African Republic","alpha-2":"CF","alpha-3":"CAF","country-code":"140","iso_3166-2":"ISO 3166-2:CF","region-code":"002","sub-region-code":"017"},{"name":"Chad","alpha-2":"TD","alpha-3":"TCD","country-code":"148","iso_3166-2":"ISO 3166-2:TD","region-code":"002","sub-region-code":"017"},{"name":"Chile","alpha-2":"CL","alpha-3":"CHL","country-code":"152","iso_3166-2":"ISO 3166-2:CL","region-code":"019","sub-region-code":"005"},{"name":"China","alpha-2":"CN","alpha-3":"CHN","country-code":"156","iso_3166-2":"ISO 3166-2:CN","region-code":"142","sub-region-code":"030"},{"name":"Christmas Island","alpha-2":"CX","alpha-3":"CXR","country-code":"162","iso_3166-2":"ISO 3166-2:CX"},{"name":"Cocos (Keeling) Islands","alpha-2":"CC","alpha-3":"CCK","country-code":"166","iso_3166-2":"ISO 3166-2:CC"},{"name":"Colombia","alpha-2":"CO","alpha-3":"COL","country-code":"170","iso_3166-2":"ISO 3166-2:CO","region-code":"019","sub-region-code":"005"},{"name":"Comoros","alpha-2":"KM","alpha-3":"COM","country-code":"174","iso_3166-2":"ISO 3166-2:KM","region-code":"002","sub-region-code":"014"},{"name":"Congo","alpha-2":"CG","alpha-3":"COG","country-code":"178","iso_3166-2":"ISO 3166-2:CG","region-code":"002","sub-region-code":"017"},{"name":"Congo, the Democratic Republic of the","alpha-2":"CD","alpha-3":"COD","country-code":"180","iso_3166-2":"ISO 3166-2:CD","region-code":"002","sub-region-code":"017"},{"name":"Cook Islands","alpha-2":"CK","alpha-3":"COK","country-code":"184","iso_3166-2":"ISO 3166-2:CK","region-code":"009","sub-region-code":"061"},{"name":"Costa Rica","alpha-2":"CR","alpha-3":"CRI","country-code":"188","iso_3166-2":"ISO 3166-2:CR","region-code":"019","sub-region-code":"013"},{"name":"Côte d'Ivoire","alpha-2":"CI","alpha-3":"CIV","country-code":"384","iso_3166-2":"ISO 3166-2:CI","region-code":"002","sub-region-code":"011"},{"name":"Croatia","alpha-2":"HR","alpha-3":"HRV","country-code":"191","iso_3166-2":"ISO 3166-2:HR","region-code":"150","sub-region-code":"039"},{"name":"Cuba","alpha-2":"CU","alpha-3":"CUB","country-code":"192","iso_3166-2":"ISO 3166-2:CU","region-code":"019","sub-region-code":"029"},{"name":"Curaçao","alpha-2":"CW","alpha-3":"CUW","country-code":"531","iso_3166-2":"ISO 3166-2:CW","region-code":"019","sub-region-code":"029"},{"name":"Cyprus","alpha-2":"CY","alpha-3":"CYP","country-code":"196","iso_3166-2":"ISO 3166-2:CY","region-code":"142","sub-region-code":"145"},{"name":"Czech Republic","alpha-2":"CZ","alpha-3":"CZE","country-code":"203","iso_3166-2":"ISO 3166-2:CZ","region-code":"150","sub-region-code":"151"},{"name":"Denmark","alpha-2":"DK","alpha-3":"DNK","country-code":"208","iso_3166-2":"ISO 3166-2:DK","region-code":"150","sub-region-code":"154"},{"name":"Djibouti","alpha-2":"DJ","alpha-3":"DJI","country-code":"262","iso_3166-2":"ISO 3166-2:DJ","region-code":"002","sub-region-code":"014"},{"name":"Dominica","alpha-2":"DM","alpha-3":"DMA","country-code":"212","iso_3166-2":"ISO 3166-2:DM","region-code":"019","sub-region-code":"029"},{"name":"Dominican Republic","alpha-2":"DO","alpha-3":"DOM","country-code":"214","iso_3166-2":"ISO 3166-2:DO","region-code":"019","sub-region-code":"029"},{"name":"Ecuador","alpha-2":"EC","alpha-3":"ECU","country-code":"218","iso_3166-2":"ISO 3166-2:EC","region-code":"019","sub-region-code":"005"},{"name":"Egypt","alpha-2":"EG","alpha-3":"EGY","country-code":"818","iso_3166-2":"ISO 3166-2:EG","region-code":"002","sub-region-code":"015"},{"name":"El Salvador","alpha-2":"SV","alpha-3":"SLV","country-code":"222","iso_3166-2":"ISO 3166-2:SV","region-code":"019","sub-region-code":"013"},{"name":"Equatorial Guinea","alpha-2":"GQ","alpha-3":"GNQ","country-code":"226","iso_3166-2":"ISO 3166-2:GQ","region-code":"002","sub-region-code":"017"},{"name":"Eritrea","alpha-2":"ER","alpha-3":"ERI","country-code":"232","iso_3166-2":"ISO 3166-2:ER","region-code":"002","sub-region-code":"014"},{"name":"Estonia","alpha-2":"EE","alpha-3":"EST","country-code":"233","iso_3166-2":"ISO 3166-2:EE","region-code":"150","sub-region-code":"154"},{"name":"Ethiopia","alpha-2":"ET","alpha-3":"ETH","country-code":"231","iso_3166-2":"ISO 3166-2:ET","region-code":"002","sub-region-code":"014"},{"name":"Falkland Islands (Malvinas)","alpha-2":"FK","alpha-3":"FLK","country-code":"238","iso_3166-2":"ISO 3166-2:FK","region-code":"019","sub-region-code":"005"},{"name":"Faroe Islands","alpha-2":"FO","alpha-3":"FRO","country-code":"234","iso_3166-2":"ISO 3166-2:FO","region-code":"150","sub-region-code":"154"},{"name":"Fiji","alpha-2":"FJ","alpha-3":"FJI","country-code":"242","iso_3166-2":"ISO 3166-2:FJ","region-code":"009","sub-region-code":"054"},{"name":"Finland","alpha-2":"FI","alpha-3":"FIN","country-code":"246","iso_3166-2":"ISO 3166-2:FI","region-code":"150","sub-region-code":"154"},{"name":"France","alpha-2":"FR","alpha-3":"FRA","country-code":"250","iso_3166-2":"ISO 3166-2:FR","region-code":"150","sub-region-code":"155"},{"name":"French Guiana","alpha-2":"GF","alpha-3":"GUF","country-code":"254","iso_3166-2":"ISO 3166-2:GF","region-code":"019","sub-region-code":"005"},{"name":"French Polynesia","alpha-2":"PF","alpha-3":"PYF","country-code":"258","iso_3166-2":"ISO 3166-2:PF","region-code":"009","sub-region-code":"061"},{"name":"French Southern Territories","alpha-2":"TF","alpha-3":"ATF","country-code":"260","iso_3166-2":"ISO 3166-2:TF"},{"name":"Gabon","alpha-2":"GA","alpha-3":"GAB","country-code":"266","iso_3166-2":"ISO 3166-2:GA","region-code":"002","sub-region-code":"017"},{"name":"Gambia","alpha-2":"GM","alpha-3":"GMB","country-code":"270","iso_3166-2":"ISO 3166-2:GM","region-code":"002","sub-region-code":"011"},{"name":"Georgia","alpha-2":"GE","alpha-3":"GEO","country-code":"268","iso_3166-2":"ISO 3166-2:GE","region-code":"142","sub-region-code":"145"},{"name":"Germany","alpha-2":"DE","alpha-3":"DEU","country-code":"276","iso_3166-2":"ISO 3166-2:DE","region-code":"150","sub-region-code":"155"},{"name":"Ghana","alpha-2":"GH","alpha-3":"GHA","country-code":"288","iso_3166-2":"ISO 3166-2:GH","region-code":"002","sub-region-code":"011"},{"name":"Gibraltar","alpha-2":"GI","alpha-3":"GIB","country-code":"292","iso_3166-2":"ISO 3166-2:GI","region-code":"150","sub-region-code":"039"},{"name":"Greece","alpha-2":"GR","alpha-3":"GRC","country-code":"300","iso_3166-2":"ISO 3166-2:GR","region-code":"150","sub-region-code":"039"},{"name":"Greenland","alpha-2":"GL","alpha-3":"GRL","country-code":"304","iso_3166-2":"ISO 3166-2:GL","region-code":"019","sub-region-code":"021"},{"name":"Grenada","alpha-2":"GD","alpha-3":"GRD","country-code":"308","iso_3166-2":"ISO 3166-2:GD","region-code":"019","sub-region-code":"029"},{"name":"Guadeloupe","alpha-2":"GP","alpha-3":"GLP","country-code":"312","iso_3166-2":"ISO 3166-2:GP","region-code":"019","sub-region-code":"029"},{"name":"Guam","alpha-2":"GU","alpha-3":"GUM","country-code":"316","iso_3166-2":"ISO 3166-2:GU","region-code":"009","sub-region-code":"057"},{"name":"Guatemala","alpha-2":"GT","alpha-3":"GTM","country-code":"320","iso_3166-2":"ISO 3166-2:GT","region-code":"019","sub-region-code":"013"},{"name":"Guernsey","alpha-2":"GG","alpha-3":"GGY","country-code":"831","iso_3166-2":"ISO 3166-2:GG","region-code":"150","sub-region-code":"154"},{"name":"Guinea","alpha-2":"GN","alpha-3":"GIN","country-code":"324","iso_3166-2":"ISO 3166-2:GN","region-code":"002","sub-region-code":"011"},{"name":"Guinea-Bissau","alpha-2":"GW","alpha-3":"GNB","country-code":"624","iso_3166-2":"ISO 3166-2:GW","region-code":"002","sub-region-code":"011"},{"name":"Guyana","alpha-2":"GY","alpha-3":"GUY","country-code":"328","iso_3166-2":"ISO 3166-2:GY","region-code":"019","sub-region-code":"005"},{"name":"Haiti","alpha-2":"HT","alpha-3":"HTI","country-code":"332","iso_3166-2":"ISO 3166-2:HT","region-code":"019","sub-region-code":"029"},{"name":"Heard Island and McDonald Islands","alpha-2":"HM","alpha-3":"HMD","country-code":"334","iso_3166-2":"ISO 3166-2:HM"},{"name":"Holy See (Vatican City State)","alpha-2":"VA","alpha-3":"VAT","country-code":"336","iso_3166-2":"ISO 3166-2:VA","region-code":"150","sub-region-code":"039"},{"name":"Honduras","alpha-2":"HN","alpha-3":"HND","country-code":"340","iso_3166-2":"ISO 3166-2:HN","region-code":"019","sub-region-code":"013"},{"name":"Hong Kong","alpha-2":"HK","alpha-3":"HKG","country-code":"344","iso_3166-2":"ISO 3166-2:HK","region-code":"142","sub-region-code":"030"},{"name":"Hungary","alpha-2":"HU","alpha-3":"HUN","country-code":"348","iso_3166-2":"ISO 3166-2:HU","region-code":"150","sub-region-code":"151"},{"name":"Iceland","alpha-2":"IS","alpha-3":"ISL","country-code":"352","iso_3166-2":"ISO 3166-2:IS","region-code":"150","sub-region-code":"154"},{"name":"India","alpha-2":"IN","alpha-3":"IND","country-code":"356","iso_3166-2":"ISO 3166-2:IN","region-code":"142","sub-region-code":"034"},{"name":"Indonesia","alpha-2":"ID","alpha-3":"IDN","country-code":"360","iso_3166-2":"ISO 3166-2:ID","region-code":"142","sub-region-code":"035"},{"name":"Iran, Islamic Republic of","alpha-2":"IR","alpha-3":"IRN","country-code":"364","iso_3166-2":"ISO 3166-2:IR","region-code":"142","sub-region-code":"034"},{"name":"Iraq","alpha-2":"IQ","alpha-3":"IRQ","country-code":"368","iso_3166-2":"ISO 3166-2:IQ","region-code":"142","sub-region-code":"145"},{"name":"Ireland","alpha-2":"IE","alpha-3":"IRL","country-code":"372","iso_3166-2":"ISO 3166-2:IE","region-code":"150","sub-region-code":"154"},{"name":"Isle of Man","alpha-2":"IM","alpha-3":"IMN","country-code":"833","iso_3166-2":"ISO 3166-2:IM","region-code":"150","sub-region-code":"154"},{"name":"Israel","alpha-2":"IL","alpha-3":"ISR","country-code":"376","iso_3166-2":"ISO 3166-2:IL","region-code":"142","sub-region-code":"145"},{"name":"Italy","alpha-2":"IT","alpha-3":"ITA","country-code":"380","iso_3166-2":"ISO 3166-2:IT","region-code":"150","sub-region-code":"039"},{"name":"Jamaica","alpha-2":"JM","alpha-3":"JAM","country-code":"388","iso_3166-2":"ISO 3166-2:JM","region-code":"019","sub-region-code":"029"},{"name":"Japan","alpha-2":"JP","alpha-3":"JPN","country-code":"392","iso_3166-2":"ISO 3166-2:JP","region-code":"142","sub-region-code":"030"},{"name":"Jersey","alpha-2":"JE","alpha-3":"JEY","country-code":"832","iso_3166-2":"ISO 3166-2:JE","region-code":"150","sub-region-code":"154"},{"name":"Jordan","alpha-2":"JO","alpha-3":"JOR","country-code":"400","iso_3166-2":"ISO 3166-2:JO","region-code":"142","sub-region-code":"145"},{"name":"Kazakhstan","alpha-2":"KZ","alpha-3":"KAZ","country-code":"398","iso_3166-2":"ISO 3166-2:KZ","region-code":"142","sub-region-code":"143"},{"name":"Kenya","alpha-2":"KE","alpha-3":"KEN","country-code":"404","iso_3166-2":"ISO 3166-2:KE","region-code":"002","sub-region-code":"014"},{"name":"Kiribati","alpha-2":"KI","alpha-3":"KIR","country-code":"296","iso_3166-2":"ISO 3166-2:KI","region-code":"009","sub-region-code":"057"},{"name":"Korea, Democratic People's Republic of","alpha-2":"KP","alpha-3":"PRK","country-code":"408","iso_3166-2":"ISO 3166-2:KP","region-code":"142","sub-region-code":"030"},{"name":"Korea, Republic of","alpha-2":"KR","alpha-3":"KOR","country-code":"410","iso_3166-2":"ISO 3166-2:KR","region-code":"142","sub-region-code":"030"},{"name":"Kuwait","alpha-2":"KW","alpha-3":"KWT","country-code":"414","iso_3166-2":"ISO 3166-2:KW","region-code":"142","sub-region-code":"145"},{"name":"Kyrgyzstan","alpha-2":"KG","alpha-3":"KGZ","country-code":"417","iso_3166-2":"ISO 3166-2:KG","region-code":"142","sub-region-code":"143"},{"name":"Lao People's Democratic Republic","alpha-2":"LA","alpha-3":"LAO","country-code":"418","iso_3166-2":"ISO 3166-2:LA","region-code":"142","sub-region-code":"035"},{"name":"Latvia","alpha-2":"LV","alpha-3":"LVA","country-code":"428","iso_3166-2":"ISO 3166-2:LV","region-code":"150","sub-region-code":"154"},{"name":"Lebanon","alpha-2":"LB","alpha-3":"LBN","country-code":"422","iso_3166-2":"ISO 3166-2:LB","region-code":"142","sub-region-code":"145"},{"name":"Lesotho","alpha-2":"LS","alpha-3":"LSO","country-code":"426","iso_3166-2":"ISO 3166-2:LS","region-code":"002","sub-region-code":"018"},{"name":"Liberia","alpha-2":"LR","alpha-3":"LBR","country-code":"430","iso_3166-2":"ISO 3166-2:LR","region-code":"002","sub-region-code":"011"},{"name":"Libya","alpha-2":"LY","alpha-3":"LBY","country-code":"434","iso_3166-2":"ISO 3166-2:LY","region-code":"002","sub-region-code":"015"},{"name":"Liechtenstein","alpha-2":"LI","alpha-3":"LIE","country-code":"438","iso_3166-2":"ISO 3166-2:LI","region-code":"150","sub-region-code":"155"},{"name":"Lithuania","alpha-2":"LT","alpha-3":"LTU","country-code":"440","iso_3166-2":"ISO 3166-2:LT","region-code":"150","sub-region-code":"154"},{"name":"Luxembourg","alpha-2":"LU","alpha-3":"LUX","country-code":"442","iso_3166-2":"ISO 3166-2:LU","region-code":"150","sub-region-code":"155"},{"name":"Macao","alpha-2":"MO","alpha-3":"MAC","country-code":"446","iso_3166-2":"ISO 3166-2:MO","region-code":"142","sub-region-code":"030"},{"name":"Macedonia, the former Yugoslav Republic of","alpha-2":"MK","alpha-3":"MKD","country-code":"807","iso_3166-2":"ISO 3166-2:MK","region-code":"150","sub-region-code":"039"},{"name":"Madagascar","alpha-2":"MG","alpha-3":"MDG","country-code":"450","iso_3166-2":"ISO 3166-2:MG","region-code":"002","sub-region-code":"014"},{"name":"Malawi","alpha-2":"MW","alpha-3":"MWI","country-code":"454","iso_3166-2":"ISO 3166-2:MW","region-code":"002","sub-region-code":"014"},{"name":"Malaysia","alpha-2":"MY","alpha-3":"MYS","country-code":"458","iso_3166-2":"ISO 3166-2:MY","region-code":"142","sub-region-code":"035"},{"name":"Maldives","alpha-2":"MV","alpha-3":"MDV","country-code":"462","iso_3166-2":"ISO 3166-2:MV","region-code":"142","sub-region-code":"034"},{"name":"Mali","alpha-2":"ML","alpha-3":"MLI","country-code":"466","iso_3166-2":"ISO 3166-2:ML","region-code":"002","sub-region-code":"011"},{"name":"Malta","alpha-2":"MT","alpha-3":"MLT","country-code":"470","iso_3166-2":"ISO 3166-2:MT","region-code":"150","sub-region-code":"039"},{"name":"Marshall Islands","alpha-2":"MH","alpha-3":"MHL","country-code":"584","iso_3166-2":"ISO 3166-2:MH","region-code":"009","sub-region-code":"057"},{"name":"Martinique","alpha-2":"MQ","alpha-3":"MTQ","country-code":"474","iso_3166-2":"ISO 3166-2:MQ","region-code":"019","sub-region-code":"029"},{"name":"Mauritania","alpha-2":"MR","alpha-3":"MRT","country-code":"478","iso_3166-2":"ISO 3166-2:MR","region-code":"002","sub-region-code":"011"},{"name":"Mauritius","alpha-2":"MU","alpha-3":"MUS","country-code":"480","iso_3166-2":"ISO 3166-2:MU","region-code":"002","sub-region-code":"014"},{"name":"Mayotte","alpha-2":"YT","alpha-3":"MYT","country-code":"175","iso_3166-2":"ISO 3166-2:YT","region-code":"002","sub-region-code":"014"},{"name":"Mexico","alpha-2":"MX","alpha-3":"MEX","country-code":"484","iso_3166-2":"ISO 3166-2:MX","region-code":"019","sub-region-code":"013"},{"name":"Micronesia, Federated States of","alpha-2":"FM","alpha-3":"FSM","country-code":"583","iso_3166-2":"ISO 3166-2:FM","region-code":"009","sub-region-code":"057"},{"name":"Moldova, Republic of","alpha-2":"MD","alpha-3":"MDA","country-code":"498","iso_3166-2":"ISO 3166-2:MD","region-code":"150","sub-region-code":"151"},{"name":"Monaco","alpha-2":"MC","alpha-3":"MCO","country-code":"492","iso_3166-2":"ISO 3166-2:MC","region-code":"150","sub-region-code":"155"},{"name":"Mongolia","alpha-2":"MN","alpha-3":"MNG","country-code":"496","iso_3166-2":"ISO 3166-2:MN","region-code":"142","sub-region-code":"030"},{"name":"Montenegro","alpha-2":"ME","alpha-3":"MNE","country-code":"499","iso_3166-2":"ISO 3166-2:ME","region-code":"150","sub-region-code":"039"},{"name":"Montserrat","alpha-2":"MS","alpha-3":"MSR","country-code":"500","iso_3166-2":"ISO 3166-2:MS","region-code":"019","sub-region-code":"029"},{"name":"Morocco","alpha-2":"MA","alpha-3":"MAR","country-code":"504","iso_3166-2":"ISO 3166-2:MA","region-code":"002","sub-region-code":"015"},{"name":"Mozambique","alpha-2":"MZ","alpha-3":"MOZ","country-code":"508","iso_3166-2":"ISO 3166-2:MZ","region-code":"002","sub-region-code":"014"},{"name":"Myanmar","alpha-2":"MM","alpha-3":"MMR","country-code":"104","iso_3166-2":"ISO 3166-2:MM","region-code":"142","sub-region-code":"035"},{"name":"Namibia","alpha-2":"NA","alpha-3":"NAM","country-code":"516","iso_3166-2":"ISO 3166-2:NA","region-code":"002","sub-region-code":"018"},{"name":"Nauru","alpha-2":"NR","alpha-3":"NRU","country-code":"520","iso_3166-2":"ISO 3166-2:NR","region-code":"009","sub-region-code":"057"},{"name":"Nepal","alpha-2":"NP","alpha-3":"NPL","country-code":"524","iso_3166-2":"ISO 3166-2:NP","region-code":"142","sub-region-code":"034"},{"name":"Netherlands","alpha-2":"NL","alpha-3":"NLD","country-code":"528","iso_3166-2":"ISO 3166-2:NL","region-code":"150","sub-region-code":"155"},{"name":"New Caledonia","alpha-2":"NC","alpha-3":"NCL","country-code":"540","iso_3166-2":"ISO 3166-2:NC","region-code":"009","sub-region-code":"054"},{"name":"New Zealand","alpha-2":"NZ","alpha-3":"NZL","country-code":"554","iso_3166-2":"ISO 3166-2:NZ","region-code":"009","sub-region-code":"053"},{"name":"Nicaragua","alpha-2":"NI","alpha-3":"NIC","country-code":"558","iso_3166-2":"ISO 3166-2:NI","region-code":"019","sub-region-code":"013"},{"name":"Niger","alpha-2":"NE","alpha-3":"NER","country-code":"562","iso_3166-2":"ISO 3166-2:NE","region-code":"002","sub-region-code":"011"},{"name":"Nigeria","alpha-2":"NG","alpha-3":"NGA","country-code":"566","iso_3166-2":"ISO 3166-2:NG","region-code":"002","sub-region-code":"011"},{"name":"Niue","alpha-2":"NU","alpha-3":"NIU","country-code":"570","iso_3166-2":"ISO 3166-2:NU","region-code":"009","sub-region-code":"061"},{"name":"Norfolk Island","alpha-2":"NF","alpha-3":"NFK","country-code":"574","iso_3166-2":"ISO 3166-2:NF","region-code":"009","sub-region-code":"053"},{"name":"Northern Mariana Islands","alpha-2":"MP","alpha-3":"MNP","country-code":"580","iso_3166-2":"ISO 3166-2:MP","region-code":"009","sub-region-code":"057"},{"name":"Norway","alpha-2":"NO","alpha-3":"NOR","country-code":"578","iso_3166-2":"ISO 3166-2:NO","region-code":"150","sub-region-code":"154"},{"name":"Oman","alpha-2":"OM","alpha-3":"OMN","country-code":"512","iso_3166-2":"ISO 3166-2:OM","region-code":"142","sub-region-code":"145"},{"name":"Pakistan","alpha-2":"PK","alpha-3":"PAK","country-code":"586","iso_3166-2":"ISO 3166-2:PK","region-code":"142","sub-region-code":"034"},{"name":"Palau","alpha-2":"PW","alpha-3":"PLW","country-code":"585","iso_3166-2":"ISO 3166-2:PW","region-code":"009","sub-region-code":"057"},{"name":"Palestine, State of","alpha-2":"PS","alpha-3":"PSE","country-code":"275","iso_3166-2":"ISO 3166-2:PS","region-code":"142","sub-region-code":"145"},{"name":"Panama","alpha-2":"PA","alpha-3":"PAN","country-code":"591","iso_3166-2":"ISO 3166-2:PA","region-code":"019","sub-region-code":"013"},{"name":"Papua New Guinea","alpha-2":"PG","alpha-3":"PNG","country-code":"598","iso_3166-2":"ISO 3166-2:PG","region-code":"009","sub-region-code":"054"},{"name":"Paraguay","alpha-2":"PY","alpha-3":"PRY","country-code":"600","iso_3166-2":"ISO 3166-2:PY","region-code":"019","sub-region-code":"005"},{"name":"Peru","alpha-2":"PE","alpha-3":"PER","country-code":"604","iso_3166-2":"ISO 3166-2:PE","region-code":"019","sub-region-code":"005"},{"name":"Philippines","alpha-2":"PH","alpha-3":"PHL","country-code":"608","iso_3166-2":"ISO 3166-2:PH","region-code":"142","sub-region-code":"035"},{"name":"Pitcairn","alpha-2":"PN","alpha-3":"PCN","country-code":"612","iso_3166-2":"ISO 3166-2:PN","region-code":"009","sub-region-code":"061"},{"name":"Poland","alpha-2":"PL","alpha-3":"POL","country-code":"616","iso_3166-2":"ISO 3166-2:PL","region-code":"150","sub-region-code":"151"},{"name":"Portugal","alpha-2":"PT","alpha-3":"PRT","country-code":"620","iso_3166-2":"ISO 3166-2:PT","region-code":"150","sub-region-code":"039"},{"name":"Puerto Rico","alpha-2":"PR","alpha-3":"PRI","country-code":"630","iso_3166-2":"ISO 3166-2:PR","region-code":"019","sub-region-code":"029"},{"name":"Qatar","alpha-2":"QA","alpha-3":"QAT","country-code":"634","iso_3166-2":"ISO 3166-2:QA","region-code":"142","sub-region-code":"145"},{"name":"Réunion","alpha-2":"RE","alpha-3":"REU","country-code":"638","iso_3166-2":"ISO 3166-2:RE","region-code":"002","sub-region-code":"014"},{"name":"Romania","alpha-2":"RO","alpha-3":"ROU","country-code":"642","iso_3166-2":"ISO 3166-2:RO","region-code":"150","sub-region-code":"151"},{"name":"Russian Federation","alpha-2":"RU","alpha-3":"RUS","country-code":"643","iso_3166-2":"ISO 3166-2:RU","region-code":"150","sub-region-code":"151"},{"name":"Rwanda","alpha-2":"RW","alpha-3":"RWA","country-code":"646","iso_3166-2":"ISO 3166-2:RW","region-code":"002","sub-region-code":"014"},{"name":"Saint Barthélemy","alpha-2":"BL","alpha-3":"BLM","country-code":"652","iso_3166-2":"ISO 3166-2:BL","region-code":"019","sub-region-code":"029"},{"name":"Saint Helena, Ascension and Tristan da Cunha","alpha-2":"SH","alpha-3":"SHN","country-code":"654","iso_3166-2":"ISO 3166-2:SH","region-code":"002","sub-region-code":"011"},{"name":"Saint Kitts and Nevis","alpha-2":"KN","alpha-3":"KNA","country-code":"659","iso_3166-2":"ISO 3166-2:KN","region-code":"019","sub-region-code":"029"},{"name":"Saint Lucia","alpha-2":"LC","alpha-3":"LCA","country-code":"662","iso_3166-2":"ISO 3166-2:LC","region-code":"019","sub-region-code":"029"},{"name":"Saint Martin (French part)","alpha-2":"MF","alpha-3":"MAF","country-code":"663","iso_3166-2":"ISO 3166-2:MF","region-code":"019","sub-region-code":"029"},{"name":"Saint Pierre and Miquelon","alpha-2":"PM","alpha-3":"SPM","country-code":"666","iso_3166-2":"ISO 3166-2:PM","region-code":"019","sub-region-code":"021"},{"name":"Saint Vincent and the Grenadines","alpha-2":"VC","alpha-3":"VCT","country-code":"670","iso_3166-2":"ISO 3166-2:VC","region-code":"019","sub-region-code":"029"},{"name":"Samoa","alpha-2":"WS","alpha-3":"WSM","country-code":"882","iso_3166-2":"ISO 3166-2:WS","region-code":"009","sub-region-code":"061"},{"name":"San Marino","alpha-2":"SM","alpha-3":"SMR","country-code":"674","iso_3166-2":"ISO 3166-2:SM","region-code":"150","sub-region-code":"039"},{"name":"Sao Tome and Principe","alpha-2":"ST","alpha-3":"STP","country-code":"678","iso_3166-2":"ISO 3166-2:ST","region-code":"002","sub-region-code":"017"},{"name":"Saudi Arabia","alpha-2":"SA","alpha-3":"SAU","country-code":"682","iso_3166-2":"ISO 3166-2:SA","region-code":"142","sub-region-code":"145"},{"name":"Senegal","alpha-2":"SN","alpha-3":"SEN","country-code":"686","iso_3166-2":"ISO 3166-2:SN","region-code":"002","sub-region-code":"011"},{"name":"Serbia","alpha-2":"RS","alpha-3":"SRB","country-code":"688","iso_3166-2":"ISO 3166-2:RS","region-code":"150","sub-region-code":"039"},{"name":"Seychelles","alpha-2":"SC","alpha-3":"SYC","country-code":"690","iso_3166-2":"ISO 3166-2:SC","region-code":"002","sub-region-code":"014"},{"name":"Sierra Leone","alpha-2":"SL","alpha-3":"SLE","country-code":"694","iso_3166-2":"ISO 3166-2:SL","region-code":"002","sub-region-code":"011"},{"name":"Singapore","alpha-2":"SG","alpha-3":"SGP","country-code":"702","iso_3166-2":"ISO 3166-2:SG","region-code":"142","sub-region-code":"035"},{"name":"Sint Maarten (Dutch part)","alpha-2":"SX","alpha-3":"SXM","country-code":"534","iso_3166-2":"ISO 3166-2:SX","region-code":"019","sub-region-code":"029"},{"name":"Slovakia","alpha-2":"SK","alpha-3":"SVK","country-code":"703","iso_3166-2":"ISO 3166-2:SK","region-code":"150","sub-region-code":"151"},{"name":"Slovenia","alpha-2":"SI","alpha-3":"SVN","country-code":"705","iso_3166-2":"ISO 3166-2:SI","region-code":"150","sub-region-code":"039"},{"name":"Solomon Islands","alpha-2":"SB","alpha-3":"SLB","country-code":"090","iso_3166-2":"ISO 3166-2:SB","region-code":"009","sub-region-code":"054"},{"name":"Somalia","alpha-2":"SO","alpha-3":"SOM","country-code":"706","iso_3166-2":"ISO 3166-2:SO","region-code":"002","sub-region-code":"014"},{"name":"South Africa","alpha-2":"ZA","alpha-3":"ZAF","country-code":"710","iso_3166-2":"ISO 3166-2:ZA","region-code":"002","sub-region-code":"018"},{"name":"South Georgia and the South Sandwich Islands","alpha-2":"GS","alpha-3":"SGS","country-code":"239","iso_3166-2":"ISO 3166-2:GS"},{"name":"South Sudan","alpha-2":"SS","alpha-3":"SSD","country-code":"728","iso_3166-2":"ISO 3166-2:SS","region-code":"002","sub-region-code":"014"},{"name":"Spain","alpha-2":"ES","alpha-3":"ESP","country-code":"724","iso_3166-2":"ISO 3166-2:ES","region-code":"150","sub-region-code":"039"},{"name":"Sri Lanka","alpha-2":"LK","alpha-3":"LKA","country-code":"144","iso_3166-2":"ISO 3166-2:LK","region-code":"142","sub-region-code":"034"},{"name":"Sudan","alpha-2":"SD","alpha-3":"SDN","country-code":"729","iso_3166-2":"ISO 3166-2:SD","region-code":"002","sub-region-code":"015"},{"name":"Suriname","alpha-2":"SR","alpha-3":"SUR","country-code":"740","iso_3166-2":"ISO 3166-2:SR","region-code":"019","sub-region-code":"005"},{"name":"Svalbard and Jan Mayen","alpha-2":"SJ","alpha-3":"SJM","country-code":"744","iso_3166-2":"ISO 3166-2:SJ","region-code":"150","sub-region-code":"154"},{"name":"Swaziland","alpha-2":"SZ","alpha-3":"SWZ","country-code":"748","iso_3166-2":"ISO 3166-2:SZ","region-code":"002","sub-region-code":"018"},{"name":"Sweden","alpha-2":"SE","alpha-3":"SWE","country-code":"752","iso_3166-2":"ISO 3166-2:SE","region-code":"150","sub-region-code":"154"},{"name":"Switzerland","alpha-2":"CH","alpha-3":"CHE","country-code":"756","iso_3166-2":"ISO 3166-2:CH","region-code":"150","sub-region-code":"155"},{"name":"Syrian Arab Republic","alpha-2":"SY","alpha-3":"SYR","country-code":"760","iso_3166-2":"ISO 3166-2:SY","region-code":"142","sub-region-code":"145"},{"name":"Taiwan, Province of China","alpha-2":"TW","alpha-3":"TWN","country-code":"158","iso_3166-2":"ISO 3166-2:TW","region-code":"142","sub-region-code":"030"},{"name":"Tajikistan","alpha-2":"TJ","alpha-3":"TJK","country-code":"762","iso_3166-2":"ISO 3166-2:TJ","region-code":"142","sub-region-code":"143"},{"name":"Tanzania, United Republic of","alpha-2":"TZ","alpha-3":"TZA","country-code":"834","iso_3166-2":"ISO 3166-2:TZ","region-code":"002","sub-region-code":"014"},{"name":"Thailand","alpha-2":"TH","alpha-3":"THA","country-code":"764","iso_3166-2":"ISO 3166-2:TH","region-code":"142","sub-region-code":"035"},{"name":"Timor-Leste","alpha-2":"TL","alpha-3":"TLS","country-code":"626","iso_3166-2":"ISO 3166-2:TL","region-code":"142","sub-region-code":"035"},{"name":"Togo","alpha-2":"TG","alpha-3":"TGO","country-code":"768","iso_3166-2":"ISO 3166-2:TG","region-code":"002","sub-region-code":"011"},{"name":"Tokelau","alpha-2":"TK","alpha-3":"TKL","country-code":"772","iso_3166-2":"ISO 3166-2:TK","region-code":"009","sub-region-code":"061"},{"name":"Tonga","alpha-2":"TO","alpha-3":"TON","country-code":"776","iso_3166-2":"ISO 3166-2:TO","region-code":"009","sub-region-code":"061"},{"name":"Trinidad and Tobago","alpha-2":"TT","alpha-3":"TTO","country-code":"780","iso_3166-2":"ISO 3166-2:TT","region-code":"019","sub-region-code":"029"},{"name":"Tunisia","alpha-2":"TN","alpha-3":"TUN","country-code":"788","iso_3166-2":"ISO 3166-2:TN","region-code":"002","sub-region-code":"015"},{"name":"Turkey","alpha-2":"TR","alpha-3":"TUR","country-code":"792","iso_3166-2":"ISO 3166-2:TR","region-code":"142","sub-region-code":"145"},{"name":"Turkmenistan","alpha-2":"TM","alpha-3":"TKM","country-code":"795","iso_3166-2":"ISO 3166-2:TM","region-code":"142","sub-region-code":"143"},{"name":"Turks and Caicos Islands","alpha-2":"TC","alpha-3":"TCA","country-code":"796","iso_3166-2":"ISO 3166-2:TC","region-code":"019","sub-region-code":"029"},{"name":"Tuvalu","alpha-2":"TV","alpha-3":"TUV","country-code":"798","iso_3166-2":"ISO 3166-2:TV","region-code":"009","sub-region-code":"061"},{"name":"Uganda","alpha-2":"UG","alpha-3":"UGA","country-code":"800","iso_3166-2":"ISO 3166-2:UG","region-code":"002","sub-region-code":"014"},{"name":"Ukraine","alpha-2":"UA","alpha-3":"UKR","country-code":"804","iso_3166-2":"ISO 3166-2:UA","region-code":"150","sub-region-code":"151"},{"name":"United Arab Emirates","alpha-2":"AE","alpha-3":"ARE","country-code":"784","iso_3166-2":"ISO 3166-2:AE","region-code":"142","sub-region-code":"145"},{"name":"United Kingdom","alpha-2":"GB","alpha-3":"GBR","country-code":"826","iso_3166-2":"ISO 3166-2:GB","region-code":"150","sub-region-code":"154"},{"name":"United States","alpha-2":"US","alpha-3":"USA","country-code":"840","iso_3166-2":"ISO 3166-2:US","region-code":"019","sub-region-code":"021"},{"name":"United States Minor Outlying Islands","alpha-2":"UM","alpha-3":"UMI","country-code":"581","iso_3166-2":"ISO 3166-2:UM"},{"name":"Uruguay","alpha-2":"UY","alpha-3":"URY","country-code":"858","iso_3166-2":"ISO 3166-2:UY","region-code":"019","sub-region-code":"005"},{"name":"Uzbekistan","alpha-2":"UZ","alpha-3":"UZB","country-code":"860","iso_3166-2":"ISO 3166-2:UZ","region-code":"142","sub-region-code":"143"},{"name":"Vanuatu","alpha-2":"VU","alpha-3":"VUT","country-code":"548","iso_3166-2":"ISO 3166-2:VU","region-code":"009","sub-region-code":"054"},{"name":"Venezuela, Bolivarian Republic of","alpha-2":"VE","alpha-3":"VEN","country-code":"862","iso_3166-2":"ISO 3166-2:VE","region-code":"019","sub-region-code":"005"},{"name":"Viet Nam","alpha-2":"VN","alpha-3":"VNM","country-code":"704","iso_3166-2":"ISO 3166-2:VN","region-code":"142","sub-region-code":"035"},{"name":"Virgin Islands, British","alpha-2":"VG","alpha-3":"VGB","country-code":"092","iso_3166-2":"ISO 3166-2:VG","region-code":"019","sub-region-code":"029"},{"name":"Virgin Islands, U.S.","alpha-2":"VI","alpha-3":"VIR","country-code":"850","iso_3166-2":"ISO 3166-2:VI","region-code":"019","sub-region-code":"029"},{"name":"Wallis and Futuna","alpha-2":"WF","alpha-3":"WLF","country-code":"876","iso_3166-2":"ISO 3166-2:WF","region-code":"009","sub-region-code":"061"},{"name":"Western Sahara","alpha-2":"EH","alpha-3":"ESH","country-code":"732","iso_3166-2":"ISO 3166-2:EH","region-code":"002","sub-region-code":"015"},{"name":"Yemen","alpha-2":"YE","alpha-3":"YEM","country-code":"887","iso_3166-2":"ISO 3166-2:YE","region-code":"142","sub-region-code":"145"},{"name":"Zambia","alpha-2":"ZM","alpha-3":"ZMB","country-code":"894","iso_3166-2":"ISO 3166-2:ZM","region-code":"002","sub-region-code":"014"},{"name":"Zimbabwe","alpha-2":"ZW","alpha-3":"ZWE","country-code":"716","iso_3166-2":"ISO 3166-2:ZW","region-code":"002","sub-region-code":"014"}];
        var isos = {};
        for (var i=0; i<countries.length; i++) {
            var country = countries[i];
            if (country.hasOwnProperty("name") && country.hasOwnProperty("alpha-2")) {
                if (!isos.hasOwnProperty(country["name"])) {
                    isos[country["name"]] = country["alpha-2"];
                }
            }
        }
        //var us_cities = ["New York", "New York City", "Boston", "Chicago", "Hollywood", "Philadelphia", ]
        var us_cities = ["New York,New York",
                        "Los Angeles,California",
                        "Chicago,Illinois",
                        "Houston,Texas",
                        "Phoenix,Arizona",
                        "Philadelphia,Pennsylvania",
                        "San Antonio,Texas",
                        "San Diego,California",
                        "Dallas,Texas",
                        "San Jose,California",
                        "Detroit,Michigan",
                        "San Francisco,California",
                        "Jacksonville,Florida",
                        "Indianapolis,Indiana",
                        "Austin,Texas",
                        "Columbus,Ohio",
                        "Fort Worth,Texas",
                        "Charlotte,North Carolina",
                        "Memphis,Tennessee",
                        "Boston,Massachusetts",
                        "Baltimore,Maryland",
                        "El Paso,Texas",
                        "Seattle,Washington",
                        "Denver,Colorado",
                        "Nashville-Davidson,Tennessee",
                        "Milwaukee,Wisconsin",
                        "Washington,District of Columbia",
                        "Las Vegas,Nevada",
                        "Louisville/Jefferson County,Kentucky",
                        "Portland,Oregon",
                        "Oklahoma City,Oklahoma",
                        "Tucson,Arizona",
                        "Atlanta,Georgia",
                        "Albuquerque,New Mexico",
                        "Kansas City,Missouri",
                        "Fresno,California",
                        "Mesa,Arizona",
                        "Sacramento,California",
                        "Long Beach,California",
                        "Omaha,Nebraska",
                        "Virginia Beach,Virginia",
                        "Miami,Florida",
                        "Cleveland,Ohio",
                        "Oakland,California",
                        "Raleigh,North Carolina",
                        "Colorado Springs,Colorado",
                        "Tulsa,Oklahoma",
                        "Minneapolis,Minnesota",
                        "Arlington,Texas",
                        "Honolulu,Hawaii",
                        "Wichita,Kansas",
                        "St. Louis,Missouri",
                        "New Orleans,Louisiana",
                        "Tampa,Florida",
                        "Santa Ana,California",
                        "Anaheim,California",
                        "Cincinnati,Ohio",
                        "Bakersfield,California",
                        "Aurora,Colorado",
                        "Toledo,Ohio",
                        "Pittsburgh,Pennsylvania",
                        "Riverside,California",
                        "Lexington-Fayette,Kentucky",
                        "Stockton,California",
                        "Corpus Christi,Texas",
                        "Anchorage,Alaska",
                        "St. Paul,Minnesota",
                        "Newark,New Jersey",
                        "Plano,Texas",
                        "Buffalo,New York",
                        "Henderson,Nevada",
                        "Fort Wayne,Indiana",
                        "Greensboro,North Carolina",
                        "Lincoln,Nebraska",
                        "Glendale,Arizona",
                        "Chandler,Arizona",
                        "St. Petersburg,Florida",
                        "Jersey City,New Jersey",
                        "Scottsdale,Arizona",
                        "Orlando,Florida",
                        "Madison,Wisconsin",
                        "Norfolk,Virginia",
                        "Birmingham,Alabama",
                        "Winston-Salem,North Carolina",
                        "Durham,North Carolina",
                        "Laredo,Texas",
                        "Lubbock,Texas",
                        "Baton Rouge,Louisiana",
                        "North Las Vegas,Nevada",
                        "Chula Vista,California",
                        "Chesapeake,Virginia",
                        "Gilbert,Arizona",
                        "Garland,Texas",
                        "Reno,Nevada",
                        "Hialeah,Florida",
                        "Arlington,Virginia",
                        "Irvine,California",
                        "Rochester,New York",
                        "Akron,Ohio",
                        "Boise City,Idaho",
                        "Irving,Texas",
                        "Fremont,California",
                        "Richmond,Virginia",
                        "Spokane,Washington",
                        "Modesto,California",
                        "Montgomery,Alabama",
                        "Yonkers,New York",
                        "Des Moines,Iowa",
                        "Tacoma,Washington",
                        "Shreveport,Louisiana",
                        "San Bernardino,California",
                        "Fayetteville,North Carolina",
                        "Glendale,California",
                        "Augusta-Richmond County,Georgia",
                        "Grand Rapids,Michigan",
                        "Huntington Beach,California",
                        "Mobile,Alabama",
                        "Newport News,Virginia",
                        "Little Rock,Arkansas",
                        "Moreno Valley,California",
                        "Columbus,Georgia",
                        "Amarillo,Texas",
                        "Fontana,California",
                        "Oxnard,California",
                        "Knoxville,Tennessee",
                        "Fort Lauderdale,Florida",
                        "Salt Lake City,Utah",
                        "Worcester,Massachusetts",
                        "Huntsville,Alabama",
                        "Tempe,Arizona",
                        "Brownsville,Texas",
                        "Jackson,Mississippi",
                        "Overland Park,Kansas",
                        "Aurora,Illinois",
                        "Oceanside,California",
                        "Tallahassee,Florida",
                        "Providence,Rhode Island",
                        "Rancho Cucamonga,California",
                        "Ontario,California",
                        "Chattanooga,Tennessee",
                        "Santa Clarita,California",
                        "Garden Grove,California",
                        "Vancouver,Washington",
                        "Grand Prairie,Texas",
                        "Peoria,Arizona",
                        "Sioux Falls,South Dakota",
                        "Springfield,Missouri",
                        "Santa Rosa,California",
                        "Rockford,Illinois",
                        "Springfield,Massachusetts",
                        "Salem,Oregon",
                        "Port St. Lucie,Florida",
                        "Cape Coral,Florida",
                        "Dayton,Ohio",
                        "Eugene,Oregon",
                        "Pomona,California",
                        "Corona,California",
                        "Alexandria,Virginia",
                        "Joliet,Illinois",
                        "Pembroke Pines,Florida",
                        "Paterson,New Jersey",
                        "Pasadena,Texas",
                        "Lancaster,California",
                        "Hayward,California",
                        "Salinas,California",
                        "Hampton,Virginia",
                        "Palmdale,California",
                        "Pasadena,California",
                        "Naperville,Illinois",
                        "Kansas City,Kansas",
                        "Hollywood,Florida",
                        "Lakewood,Colorado",
                        "Torrance,California",
                        "Escondido,California",
                        "Fort Collins,Colorado",
                        "Syracuse,New York",
                        "Bridgeport,Connecticut",
                        "Orange,California",
                        "Cary,North Carolina",
                        "Elk Grove,California",
                        "Savannah,Georgia",
                        "Sunnyvale,California",
                        "Warren,Michigan",
                        "Mesquite,Texas",
                        "Fullerton,California",
                        "McAllen,Texas",
                        "Columbia,South Carolina",
                        "Carrollton,Texas",
                        "Cedar Rapids,Iowa",
                        "McKinney,Texas",
                        "Sterling Heights,Michigan",
                        "Bellevue,Washington",
                        "Coral Springs,Florida",
                        "Waco,Texas",
                        "Elizabeth,New Jersey",
                        "West Valley City,Utah",
                        "Clarksville,Tennessee",
                        "Topeka,Kansas",
                        "Hartford,Connecticut",
                        "Thousand Oaks,California",
                        "New Haven,Connecticut",
                        "Denton,Texas",
                        "Concord,California",
                        "Visalia,California",
                        "Olathe,Kansas",
                        "El Monte,California",
                        "Independence,Missouri",
                        "Stamford,Connecticut",
                        "Simi Valley,California",
                        "Provo,Utah",
                        "Killeen,Texas",
                        "Springfield,Illinois",
                        "Thornton,Colorado",
                        "Abilene,Texas",
                        "Gainesville,Florida",
                        "Evansville,Indiana",
                        "Roseville,California",
                        "Charleston,South Carolina",
                        "Peoria,Illinois",
                        "Athens-Clarke County,Georgia",
                        "Lafayette,Louisiana",
                        "Vallejo,California",
                        "Lansing,Michigan",
                        "Ann Arbor,Michigan",
                        "Inglewood,California",
                        "Santa Clara,California",
                        "Flint,Michigan",
                        "Victorville,California",
                        "Costa Mesa,California",
                        "Beaumont,Texas",
                        "Miami Gardens,Florida",
                        "Manchester,New Hampshire",
                        "Westminster,Colorado",
                        "Miramar,Florida",
                        "Norman,Oklahoma",
                        "Cambridge,Massachusetts",
                        "Midland,Texas",
                        "Arvada,Colorado",
                        "Allentown,Pennsylvania",
                        "Elgin,Illinois",
                        "Waterbury,Connecticut",
                        "Downey,California",
                        "Clearwater,Florida",
                        "Billings,Montana",
                        "West Covina,California",
                        "Round Rock,Texas",
                        "Murfreesboro,Tennessee",
                        "Lewisville,Texas",
                        "West Jordan,Utah",
                        "Pueblo,Colorado",
                        "San Buenaventura (Ventura),California",
                        "Lowell,Massachusetts",
                        "South Bend,Indiana",
                        "Fairfield,California",
                        "Erie,Pennsylvania",
                        "Rochester,Minnesota",
                        "High Point,North Carolina",
                        "Richardson,Texas",
                        "Richmond,California",
                        "Burbank,California",
                        "Berkeley,California",
                        "Pompano Beach,Florida",
                        "Norwalk,California",
                        "Frisco,Texas",
                        "Columbia,Missouri",
                        "Gresham,Oregon",
                        "Daly City,California",
                        "Green Bay,Wisconsin",
                        "Wilmington,North Carolina",
                        "Davenport,Iowa",
                        "Wichita Falls,Texas",
                        "Antioch,California",
                        "Palm Bay,Florida",
                        "Odessa,Texas",
                        "Centennial,Colorado",
                        "Boulder,Colorado",
                        "West Palm Beach,Florida",
                        "Everett,Washington",
                        "Portsmouth,Virginia",
                        "Temecula,California",
                        "Tyler,Texas",
                        "Rialto,California",
                        "Carlsbad,California",
                        "Kenosha,Wisconsin",
                        "Murrieta,California",
                        "North Charleston,South Carolina",
                        "Sandy,Utah",
                        "South Gate,California",
                        "Gary,Indiana",
                        "Fargo,North Dakota",
                        "Hillsboro,Oregon",
                        "Orem,Utah",
                        "Surprise,Arizona",
                        "Broken Arrow,Oklahoma",
                        "Mission Viejo,California",
                        "Roanoke,Virginia",
                        "El Cajon,California",
                        "Compton,California",
                        "Albany,New York",
                        "Lakeland,Florida",
                        "Brockton,Massachusetts",
                        "Las Cruces,New Mexico",
                        "Beaverton,Oregon",
                        "Clovis,California",
                        "Tuscaloosa,Alabama",
                        "San Mateo,California",
                        "Greeley,Colorado",
                        "Macon,Georgia",
                        "Vista,California",
                        "Carson,California",
                        "San Angelo,Texas",
                        "Lawrence,Kansas",
                        "Vacaville,California",
                        "Davie,Florida",
                        "Lawton,Oklahoma",
                        "Yuma,Arizona",
                        "New Bedford,Massachusetts",
                        "Quincy,Massachusetts",
                        "Fall River,Massachusetts",
                        "Waukegan,Illinois",
                        "Redding,California",
                        "Sunrise,Florida",
                        "Westminster,California",
                        "Sparks,Nevada",
                        "Livonia,Michigan",
                        "Longmont,Colorado",
                        "Miami Beach,Florida",
                        "Roswell,Georgia",
                        "Santa Monica,California",
                        "Nashua,New Hampshire",
                        "Lynn,Massachusetts",
                        "Spokane Valley,Washington",
                        "Santa Maria,California",
                        "College Station,Texas",
                        "Lee's Summit,Missouri",
                        "Boca Raton,Florida",
                        "Santa Barbara,California",
                        "Pearland,Texas",
                        "Hesperia,California",
                        "Yakima,Washington",
                        "Federal Way,Washington",
                        "Sandy Springs,Georgia",
                        "Fort Smith,Arkansas",
                        "Kent,Washington",
                        "Avondale,Arizona",
                        "Alhambra,California",
                        "Indio,California",
                        "Plantation,Florida",
                        "Chico,California",
                        "Warwick,Rhode Island",
                        "Citrus Heights,California",
                        "Newton,Massachusetts",
                        "Dearborn,Michigan",
                        "Duluth,Minnesota",
                        "Allen,Texas",
                        "Hawthorne,California",
                        "Norwalk,Connecticut",
                        "Suffolk,Virginia",
                        "Deltona,Florida",
                        "Ogden,Utah",
                        "Trenton,New Jersey",
                        "Bloomington,Minnesota",
                        "Sioux City,Iowa",
                        "Chino,California",
                        "Rio Rancho,New Mexico",
                        "Racine,Wisconsin",
                        "Whittier,California",
                        "Greenville,North Carolina",
                        "Sugar Land,Texas",
                        "Newport Beach,California",
                        "Nampa,Idaho",
                        "Edmond,Oklahoma",
                        "Livermore,California",
                        "Reading,Pennsylvania",
                        "San Marcos,California",
                        "Troy,Michigan",
                        "Jacksonville,North Carolina",
                        "Champaign,Illinois",
                        "Cranston,Rhode Island",
                        "Cicero,Illinois",
                        "Bellingham,Washington",
                        "Buena Park,California",
                        "Danbury,Connecticut",
                        "Tracy,California",
                        "O'Fallon,Missouri",
                        "Camden,New Jersey",
                        "Farmington Hills,Michigan",
                        "San Leandro,California",
                        "Canton,Ohio",
                        "Clifton,New Jersey",
                        "Lakewood,California",
                        "Longview,Texas",
                        "Evanston,Illinois",
                        "Melbourne,Florida",
                        "Bend,Oregon",
                        "Westland,Michigan",
                        "Parma,Ohio",
                        "Fayetteville,Arkansas",
                        "Baldwin Park,California",
                        "Asheville,North Carolina",
                        "Hammond,Indiana",
                        "Somerville,Massachusetts",
                        "Merced,California",
                        "St. Joseph,Missouri",
                        "Decatur,Illinois",
                        "Lake Forest,California",
                        "Albany,Georgia",
                        "Southfield,Michigan",
                        "Napa,California",
                        "Deerfield Beach,Florida",
                        "Missouri City,Texas",
                        "Bryan,Texas",
                        "Redwood City,California",
                        "New Rochelle,New York",
                        "Bloomington,Illinois",
                        "Santa Fe,New Mexico",
                        "Lynchburg,Virginia",
                        "Chino Hills,California",
                        "Medford,Oregon",
                        "Largo,Florida",
                        "Palm Coast,Florida",
                        "Arlington Heights,Illinois",
                        "Bethlehem,Pennsylvania",
                        "Wilmington,Delaware",
                        "Hoover,Alabama",
                        "Upland,California",
                        "Gastonia,North Carolina",
                        "Bellflower,California",
                        "Union City,California",
                        "Plymouth,Minnesota",
                        "Kalamazoo,Michigan",
                        "St. George,Utah",
                        "Tustin,California",
                        "Youngstown,Ohio",
                        "Edinburg,Texas",
                        "Mountain View,California",
                        "Brooklyn Park,Minnesota",
                        "Pawtucket,Rhode Island",
                        "Scranton,Pennsylvania",
                        "Bloomington,Indiana",
                        "Hemet,California",
                        "League City,Texas",
                        "Lake Charles,Louisiana",
                        "Schaumburg,Illinois",
                        "Alameda,California",
                        "Fishers,Indiana",
                        "Appleton,Wisconsin",
                        "Bolingbrook,Illinois",
                        "Baytown,Texas",
                        "Gulfport,Mississippi",
                        "Wyoming,Michigan",
                        "Lawrence,Massachusetts",
                        "New Britain,Connecticut",
                        "Lorain,Ohio",
                        "Flower Mound,Texas",
                        "Apple Valley,California",
                        "Redlands,California",
                        "Lynwood,California",
                        "Boynton Beach,Florida",
                        "Carmel,Indiana",
                        "Rock Hill,South Carolina",
                        "Rochester Hills,Michigan",
                        "Iowa City,Iowa",
                        "Mission,Texas",
                        "Missoula,Montana",
                        "Mount Vernon,New York",
                        "Turlock,California",
                        "Meridian,Idaho",
                        "Springdale,Arkansas",
                        "Waukesha,Wisconsin",
                        "Milpitas,California",
                        "Kenner,Louisiana",
                        "Kennewick,Washington",
                        "Folsom,California",
                        "Muncie,Indiana",
                        "Pleasanton,California",
                        "Dothan,Alabama",
                        "Lauderhill,Florida",
                        "Concord,North Carolina",
                        "St. Cloud,Minnesota",
                        "Rapid City,South Dakota",
                        "Passaic,New Jersey",
                        "Marietta,Georgia",
                        "Waterloo,Iowa",
                        "Layton,Utah",
                        "Redondo Beach,California",
                        "Palatine,Illinois",
                        "Skokie,Illinois",
                        "Mount Pleasant,South Carolina",
                        "Eau Claire,Wisconsin",
                        "Pontiac,Michigan",
                        "Pharr,Texas",
                        "Loveland,Colorado",
                        "Jonesboro,Arkansas",
                        "Yorba Linda,California",
                        "North Richland Hills,Texas",
                        "Lafayette,Indiana",
                        "St. Charles,Missouri",
                        "Manteca,California",
                        "Harlingen,Texas",
                        "East Orange,New Jersey",
                        "Pittsburg,California",
                        "Delray Beach,Florida",
                        "Laguna Niguel,California",
                        "Fort Myers,Florida",
                        "Cedar Park,Texas",
                        "Oshkosh,Wisconsin",
                        "Eagan,Minnesota",
                        "Walnut Creek,California",
                        "Camarillo,California",
                        "Weston,Florida",
                        "Daytona Beach,Florida",
                        "Jackson,Tennessee",
                        "Goodyear,Arizona",
                        "Maple Grove,Minnesota",
                        "Auburn,Washington",
                        "Janesville,Wisconsin",
                        "Bossier City,Louisiana",
                        "Victoria,Texas",
                        "Johnson City,Tennessee",
                        "Portland,Maine",
                        "Davis,California",
                        "Rancho Cordova,California",
                        "Pico Rivera,California",
                        "South San Francisco,California",
                        "Hamilton,Ohio",
                        "Kissimmee,Florida",
                        "Eden Prairie,Minnesota",
                        "Coon Rapids,Minnesota",
                        "Rockville,Maryland",
                        "Springfield,Ohio",
                        "Warner Robins,Georgia",
                        "Renton,Washington",
                        "Union City,New Jersey",
                        "Johns Creek,Georgia",
                        "Greenville,South Carolina",
                        "Shawnee,Kansas",
                        "Montebello,California",
                        "San Clemente,California",
                        "Encinitas,California",
                        "Yuba City,California",
                        "Haverhill,Massachusetts",
                        "Monterey Park,California",
                        "Schenectady,New York",
                        "Lodi,California",
                        "Bismarck,North Dakota",
                        "Bristol,Connecticut",
                        "Huntington Park,California",
                        "Franklin,Tennessee",
                        "Flagstaff,Arizona",
                        "Waltham,Massachusetts",
                        "West Allis,Wisconsin",
                        "Council Bluffs,Iowa",
                        "St. Clair Shores,Michigan",
                        "Palo Alto,California",
                        "North Little Rock,Arkansas",
                        "Temple,Texas",
                        "Gaithersburg,Maryland",
                        "Terre Haute,Indiana",
                        "Homestead,Florida",
                        "Tamarac,Florida",
                        "Frederick,Maryland",
                        "Rocky Mount,North Carolina",
                        "Conway,Arkansas",
                        "La Habra,California",
                        "Great Falls,Montana",
                        "Taylor,Michigan",
                        "Vineland,New Jersey",
                        "Meriden,Connecticut",
                        "Tinley Park,Illinois",
                        "Burnsville,Minnesota",
                        "Taylorsville,Utah",
                        "Rogers,Arkansas",
                        "Pasco,Washington",
                        "Grand Junction,Colorado",
                        "Conroe,Texas",
                        "Gardena,California",
                        "Bayonne,New Jersey",
                        "Utica,New York",
                        "North Miami,Florida",
                        "Auburn,Alabama",
                        "Lakewood,Washington",
                        "Tulare,California",
                        "Cheyenne,Wyoming",
                        "White Plains,New York",
                        "Woodbury,Minnesota",
                        "Springfield,Oregon",
                        "Dubuque,Iowa",
                        "Midwest City,Oklahoma",
                        "Anderson,Indiana",
                        "Royal Oak,Michigan",
                        "Diamond Bar,California",
                        "West Des Moines,Iowa",
                        "Des Plaines,Illinois",
                        "Santa Cruz,California",
                        "Rowlett,Texas",
                        "Port Arthur,Texas",
                        "Madera,California",
                        "Ames,Iowa",
                        "Bowling Green,Kentucky",
                        "Decatur,Alabama",
                        "St. Peters,Missouri",
                        "Blaine,Minnesota",
                        "Arcadia,California",
                        "Perris,California",
                        "Galveston,Texas",
                        "Malden,Massachusetts",
                        "National City,California",
                        "Lakeville,Minnesota",
                        "Broomfield,Colorado",
                        "Chicopee,Massachusetts",
                        "San Rafael,California",
                        "New Braunfels,Texas",
                        "Fountain Valley,California",
                        "Blue Springs,Missouri",
                        "Taunton,Massachusetts",
                        "Owensboro,Kentucky",
                        "Lake Havasu City,Arizona",
                        "Medford,Massachusetts",
                        "Ocala,Florida",
                        "La Mesa,California",
                        "Lancaster,Pennsylvania",
                        "Santee,California",
                        "Idaho Falls,Idaho",
                        "Woodland,California",
                        "Saginaw,Michigan",
                        "Orland Park,Illinois",
                        "Petaluma,California",
                        "Carson City,Nevada",
                        "Pocatello,Idaho",
                        "Paramount,California",
                        "Elyria,Ohio",
                        "Casper,Wyoming",
                        "South Jordan,Utah",
                        "Wellington,Florida",
                        "Milford,Connecticut",
                        "Novi,Michigan",
                        "Wheaton,Illinois",
                        "Port Orange,Florida",
                        "Margate,Florida",
                        "Cupertino,California",
                        "Rosemead,California",
                        "North Port,Florida",
                        "Bradenton,Florida",
                        "Hempstead,New York",
                        "Moore,Oklahoma",
                        "Pensacola,Florida",
                        "Hoffman Estates,Illinois",
                        "Hattiesburg,Mississippi",
                        "Rocklin,California",
                        "Chapel Hill,North Carolina",
                        "Kettering,Ohio",
                        "Novato,California",
                        "Bowie,Maryland",
                        "Euless,Texas",
                        "San Marcos,Texas",
                        "Oak Park,Illinois",
                        "Elkhart,Indiana",
                        "Mount Prospect,Illinois",
                        "West Haven,Connecticut",
                        "Oak Lawn,Illinois",
                        "Manhattan,Kansas",
                        "Delano,California",
                        "Normal,Illinois",
                        "Shoreline,Washington",
                        "Cathedral City,California",
                        "Redmond,Washington",
                        "Valdosta,Georgia",
                        "Porterville,California",
                        "Sarasota,Florida",
                        "Mentor,Ohio",
                        "Palm Desert,California",
                        "Battle Creek,Michigan",
                        "Buckeye,Arizona",
                        "Peabody,Massachusetts",
                        "Revere,Massachusetts",
                        "Monroe,Louisiana",
                        "Middletown,Ohio",
                        "New Brunswick,New Jersey",
                        "Burlington,North Carolina",
                        "Alpharetta,Georgia",
                        "Corvallis,Oregon",
                        "Niagara Falls,New York",
                        "La Crosse,Wisconsin",
                        "Grand Forks,North Dakota",
                        "Cerritos,California",
                        "Lake Elsinore,California",
                        "Grapevine,Texas",
                        "Cuyahoga Falls,Ohio",
                        "Watsonville,California",
                        "Bellevue,Nebraska",
                        "Highland,California",
                        "Sanford,Florida",
                        "Georgetown,Texas",
                        "Dearborn Heights,Michigan",
                        "Minnetonka,Minnesota",
                        "Smyrna,Georgia",
                        "Jupiter,Florida",
                        "Florissant,Missouri",
                        "Coconut Creek,Florida",
                        "Colton,California",
                        "Pine Bluff,Arkansas",
                        "Charleston,West Virginia",
                        "Lakewood,Ohio",
                        "Joplin,Missouri",
                        "Gilroy,California",
                        "Apple Valley,Minnesota",
                        "Mishawaka,Indiana",
                        "Hanford,California",
                        "Yucaipa,California",
                        "Placentia,California",
                        "Poway,California",
                        "Bedford,Texas",
                        "Palm Beach Gardens,Florida",
                        "La Mirada,California",
                        "Glendora,California",
                        "Brentwood,California",
                        "Berwyn,Illinois",
                        "San Ramon,California",
                        "Logan,Utah",
                        "Rancho Santa Margarita,California",
                        "Mansfield,Ohio",
                        "Tigard,Oregon",
                        "Downers Grove,Illinois",
                        "Huntington,West Virginia",
                        "Lehi,Utah",
                        "Alexandria,Louisiana",
                        "Wilson,North Carolina",
                        "Perth Amboy,New Jersey",
                        "East Providence,Rhode Island",
                        "Kirkland,Washington",
                        "Albany,Oregon",
                        "Middletown,Connecticut",
                        "Hendersonville,Tennessee",
                        "Greenwood,Indiana",
                        "DeSoto,Texas",
                        "Palm Springs,California",
                        "Lenexa,Kansas",
                        "Bartlett,Tennessee",
                        "Enid,Oklahoma",
                        "West Sacramento,California",
                        "Sheboygan,Wisconsin",
                        "Kentwood,Michigan",
                        "Troy,New York",
                        "Richland,Washington",
                        "Harrisburg,Pennsylvania",
                        "Newark,Ohio",
                        "Mansfield,Texas",
                        "Cypress,California",
                        "Pinellas Park,Florida",
                        "Euclid,Ohio",
                        "Grand Island,Nebraska",
                        "Covina,California",
                        "Roseville,Michigan",
                        "Azusa,California",
                        "Edina,Minnesota",
                        "Murray,Utah",
                        "West New York,New Jersey",
                        "Roswell,New Mexico",
                        "Portage,Michigan",
                        "Plainfield,New Jersey",
                        "Elmhurst,Illinois",
                        "Altoona,Pennsylvania",
                        "Barnstable Town,Massachusetts",
                        "Glenview,Illinois",
                        "Salina,Kansas",
                        "Stillwater,Oklahoma",
                        "Olympia,Washington",
                        "Chesterfield,Missouri",
                        "Biloxi,Mississippi",
                        "DeKalb,Illinois",
                        "Castle Rock,Colorado",
                        "Menifee,California",
                        "East Lansing,Michigan",
                        "St. Louis Park,Minnesota",
                        "Cleveland Heights,Ohio",
                        "Kokomo,Indiana",
                        "Southaven,Mississippi",
                        "Wauwatosa,Wisconsin",
                        "Cedar Hill,Texas",
                        "Summerville,South Carolina",
                        "Harrisonburg,Virginia",
                        "Huntersville,North Carolina",
                        "Kingsport,Tennessee",
                        "Parker,Colorado",
                        "The Colony,Texas",
                        "La Quinta,California",
                        "Maricopa,Arizona",
                        "Bell Gardens,California",
                        "Dublin,California",
                        "Titusville,Florida",
                        "Bountiful,Utah",
                        "Lincoln,California",
                        "Coral Gables,Florida",
                        "Binghamton,New York",
                        "Danville,Virginia",
                        "Methuen,Massachusetts",
                        "Lawrence,Indiana",
                        "San Luis Obispo,California",
                        "Commerce City,Colorado",
                        "Oro Valley,Arizona",
                        "Texas City,Texas",
                        "Freeport,New York",
                        "Casa Grande,Arizona",
                        "Coeur d'Alene,Idaho",
                        "Attleboro,Massachusetts",
                        "East Point,Georgia",
                        "Farmington,New Mexico",
                        "Kannapolis,North Carolina",
                        "Warren,Ohio",
                        "Woonsocket,Rhode Island",
                        "Caldwell,Idaho",
                        "Draper,Utah",
                        "Sierra Vista,Arizona",
                        "Covington,Kentucky",
                        "Moline,Illinois",
                        "Noblesville,Indiana",
                        "Blacksburg,Virginia",
                        "Bonita Springs,Florida",
                        "Buffalo Grove,Illinois",
                        "Hackensack,New Jersey",
                        "Lombard,Illinois",
                        "Bartlett,Illinois",
                        "Prescott,Arizona",
                        "Twin Falls,Idaho",
                        "Pflugerville,Texas",
                        "Ceres,California",
                        "Ankeny,Iowa",
                        "North Lauderdale,Florida",
                        "Fort Pierce,Florida",
                        "Oakland Park,Florida",
                        "Fairfield,Ohio",
                        "Concord,New Hampshire",
                        "Pittsfield,Massachusetts",
                        "Strongsville,Ohio",
                        "Fond du Lac,Wisconsin",
                        "Sammamish,Washington",
                        "Leominster,Massachusetts",
                        "Sayreville,New Jersey",
                        "Charlottesville,Virginia",
                        "Newark,California",
                        "Crystal Lake,Illinois",
                        "Fitchburg,Massachusetts",
                        "Westfield,Massachusetts",
                        "Lacey,Washington",
                        "Beavercreek,Ohio",
                        "Aliso Viejo,California",
                        "Danville,California",
                        "Hickory,North Carolina",
                        "San Bruno,California",
                        "Salem,Massachusetts",
                        "Jefferson City,Missouri",
                        "Belleville,Illinois",
                        "North Miami Beach,Florida",
                        "El Centro,California",
                        "Germantown,Tennessee",
                        "Lompoc,California",
                        "Littleton,Colorado",
                        "Hoboken,New Jersey",
                        "Wilkes-Barre,Pennsylvania",
                        "Rancho Palos Verdes,California",
                        "Leesburg,Virginia",
                        "Rohnert Park,California",
                        "Haltom City,Texas",
                        "Midland,Michigan",
                        "Hutchinson,Kansas",
                        "Edmonds,Washington",
                        "Bullhead City,Arizona",
                        "La Puente,California",
                        "Riverton,Utah",
                        "York,Pennsylvania",
                        "Holyoke,Massachusetts",
                        "Spartanburg,South Carolina",
                        "Columbus,Indiana",
                        "Shelton,Connecticut",
                        "San Gabriel,California",
                        "Cleveland,Tennessee",
                        "Coachella,California",
                        "Quincy,Illinois",
                        "Keller,Texas",
                        "Carol Stream,Illinois",
                        "Hagerstown,Maryland",
                        "Muskogee,Oklahoma",
                        "Urbana,Illinois",
                        "Altamonte Springs,Florida",
                        "State College,Pennsylvania",
                        "Madison,Alabama",
                        "Smyrna,Tennessee",
                        "Wylie,Texas",
                        "Meridian,Mississippi",
                        "Hot Springs,Arkansas",
                        "Coppell,Texas",
                        "Collierville,Tennessee",
                        "Atlantic City,New Jersey",
                        "Beverly,Massachusetts",
                        "Linden,New Jersey",
                        "Dublin,Ohio",
                        "Bozeman,Montana",
                        "New Berlin,Wisconsin",
                        "Muskegon,Michigan",
                        "Brookfield,Wisconsin",
                        "Goose Creek,South Carolina",
                        "Hurst,Texas",
                        "Woburn,Massachusetts",
                        "Hallandale Beach,Florida",
                        "Campbell,California",
                        "Calexico,California",
                        "Apopka,Florida",
                        "Cedar Falls,Iowa",
                        "Urbandale,Iowa",
                        "Burlington,Vermont",
                        "Morgan Hill,California",
                        "Marlborough,Massachusetts",
                        "Prescott Valley,Arizona",
                        "Brea,California",
                        "Wausau,Wisconsin",
                        "Culver City,California",
                        "Sumter,South Carolina",
                        "Sherman,Texas",
                        "Goldsboro,North Carolina",
                        "Everett,Massachusetts",
                        "Temple City,California",
                        "Florence,Alabama",
                        "Huntsville,Texas",
                        "Rock Island,Illinois",
                        "Carpentersville,Illinois",
                        "Romeoville,Illinois",
                        "Pacifica,California",
                        "San Jacinto,California",
                        "Stanton,California",
                        "Ormond Beach,Florida",
                        "Puyallup,Washington",
                        "Lima,Ohio",
                        "Cape Girardeau,Missouri",
                        "Lake Oswego,Oregon",
                        "Monrovia,California",
                        "New Albany,Indiana",
                        "Chelsea,Massachusetts",
                        "Portage,Indiana",
                        "Lancaster,Ohio",
                        "Brentwood,Tennessee",
                        "Texarkana,Texas",
                        "Chester,Pennsylvania",
                        "Franklin,Wisconsin",
                        "Streamwood,Illinois",
                        "Huber Heights,Ohio",
                        "Addison,Illinois",
                        "Westerville,Ohio",
                        "Riviera Beach,Florida",
                        "Annapolis,Maryland",
                        "Bentonville,Arkansas",
                        "Park Ridge,Illinois",
                        "Moorhead,Minnesota",
                        "Rockwall,Texas",
                        "Maplewood,Minnesota",
                        "Gadsden,Alabama",
                        "Hanover Park,Illinois",
                        "Moorpark,California",
                        "Del Rio,Texas",
                        "Plainfield,Illinois",
                        "Findlay,Ohio",
                        "Panama City,Florida",
                        "Norwich,Connecticut",
                        "Calumet City,Illinois",
                        "Richmond,Indiana",
                        "Manhattan Beach,California",
                        "Beloit,Wisconsin",
                        "Dover,Delaware",
                        "Bell,California",
                        "Kearny,New Jersey",
                        "Manassas,Virginia",
                        "Mankato,Minnesota",
                        "Longview,Washington",
                        "Duncanville,Texas",
                        "Greenfield,Wisconsin",
                        "Tupelo,Mississippi",
                        "Valley Stream,New York",
                        "Montclair,California",
                        "Fort Lee,New Jersey",
                        "University City,Missouri",
                        "Roy,Utah",
                        "Minot,North Dakota",
                        "Lancaster,Texas",
                        "Burleson,Texas",
                        "Keizer,Oregon",
                        "Bartlesville,Oklahoma",
                        "Rome,Georgia",
                        "Lake Worth,Florida",
                        "Alamogordo,New Mexico",
                        "Dunedin,Florida",
                        "Wheeling,Illinois",
                        "West Hollywood,California",
                        "Long Beach,New York",
                        "Dana Point,California",
                        "Marion,Ohio",
                        "Gainesville,Georgia",
                        "Martinez,California",
                        "Claremont,California",
                        "Torrington,Connecticut",
                        "Cottonwood Heights,Utah"].join(",").split(",");
        for (var i=0; i<us_cities.length; i++) {
            var city = us_cities[i];
            if (!isos.hasOwnProperty(city)) {
                isos[city] = "US";
            }
        }


        //observed cities
        isos["Istanbul"] = "BE";
        isos["Moscow"] = "BE";
        isos["London"] = "UK";
        isos["Saint Petersburg"] = "RU";
        isos["Athens"] = "GR";
        isos["Berlin"] = "DE";
        isos["Madrid"] = "ES";
        isos["Milan"] = "IT";
        isos["Stockholm"] = "SE";
        isos["Hilversum"] = "NL";
        isos["Sydney"] = "AU";
        isos["Basel"] = "CH";
        isos["Paris"] = "FR";
        isos["Antwerp"] = "BE";




        //console.log(us_cities);
        return isos;
    }


    /*
 *  To map the countries to arbitrary geoJson ids
 */
function getIdMap() {
  var ids = new Object();
  ids["-2"] = {name:"Kosovo", iso_code:"KO"};
  ids["4"] = {name:"Afghanistan", iso_code:"AF"};
  ids["8"] = {name:"Albania", iso_code:"AL"};
  ids["10"] = {name:"Antarctica", iso_code:"AQ"};
  ids["12"] = {name:"Algeria", iso_code:"DZ"};
  ids["16"] = {name:"American Samoa", iso_code:"AS"};
  ids["20"] = {name:"Andorra", iso_code:"AD"};
  ids["24"] = {name:"Angola", iso_code:"AO"};
  ids["28"] = {name:"Antigua and Barbuda", iso_code:"AG"};
  ids["31"] = {name:"Azerbaijan", iso_code:"AZ"};
  ids["32"] = {name:"Argentina", iso_code:"AR"};
  ids["36"] = {name:"Australia", iso_code:"AU"};
  ids["40"] = {name:"Austria", iso_code:"AT"};
  ids["44"] = {name:"Bahamas", iso_code:"BS"};
  ids["48"] = {name:"Bahrain", iso_code:"BH"};
  ids["50"] = {name:"Bangladesh", iso_code:"BD"};
  ids["51"] = {name:"Armenia", iso_code:"AM"};
  ids["52"] = {name:"Barbados", iso_code:"BB"};
  ids["56"] = {name:"Belgium", iso_code:"BE"};
  ids["60"] = {name:"Bermuda", iso_code:"BM"};
  ids["64"] = {name:"Bhutan", iso_code:"BT"};
  ids["68"] = {name:"Bolivia, Plurinational State of", iso_code:"BO"};
  ids["70"] = {name:"Bosnia and Herzegovina", iso_code:"BA"};
  ids["72"] = {name:"Botswana", iso_code:"BW"};
  ids["74"] = {name:"Bouvet Island", iso_code:"BV"};
  ids["76"] = {name:"Brazil", iso_code:"BR"};
  ids["84"] = {name:"Belize", iso_code:"BZ"};
  ids["86"] = {name:"British Indian Ocean Territory", iso_code:"IO"};
  ids["90"] = {name:"Solomon Islands", iso_code:"SB"};
  ids["92"] = {name:"Virgin Islands, British", iso_code:"VG"};
  ids["96"] = {name:"Brunei Darussalam", iso_code:"BN"};
  ids["100"] = {name:"Bulgaria", iso_code:"BG"};
  ids["104"] = {name:"Myanmar", iso_code:"MM"};
  ids["108"] = {name:"Burundi", iso_code:"BI"};
  ids["112"] = {name:"Belarus", iso_code:"BY"};
  ids["116"] = {name:"Cambodia", iso_code:"KH"};
  ids["120"] = {name:"Cameroon", iso_code:"CM"};
  ids["124"] = {name:"Canada", iso_code:"CA"};
  ids["132"] = {name:"Cape Verde", iso_code:"CV"};
  ids["136"] = {name:"Cayman Islands", iso_code:"KY"};
  ids["140"] = {name:"Central African Republic", iso_code:"CF"};
  ids["144"] = {name:"Sri Lanka", iso_code:"LK"};
  ids["148"] = {name:"Chad", iso_code:"TD"};
  ids["152"] = {name:"Chile", iso_code:"CL"};
  ids["156"] = {name:"China", iso_code:"CN"};
  ids["158"] = {name:"Taiwan, Province of China", iso_code:"TW"};
  ids["162"] = {name:"Christmas Island", iso_code:"CX"};
  ids["166"] = {name:"Cocos (Keeling) Islands", iso_code:"CC"};
  ids["170"] = {name:"Colombia", iso_code:"CO"};
  ids["174"] = {name:"Comoros", iso_code:"KM"};
  ids["175"] = {name:"Mayotte", iso_code:"YT"};
  ids["178"] = {name:"Congo", iso_code:"CG"};
  ids["180"] = {name:"Congo, the Democratic Republic of the", iso_code:"CD"};
  ids["184"] = {name:"Cook Islands", iso_code:"CK"};
  ids["188"] = {name:"Costa Rica", iso_code:"CR"};
  ids["191"] = {name:"Croatia", iso_code:"HR"};
  ids["192"] = {name:"Cuba", iso_code:"CU"};
  ids["196"] = {name:"Cyprus", iso_code:"CY"};
  ids["203"] = {name:"Czech Republic", iso_code:"CZ"};
  ids["204"] = {name:"Benin", iso_code:"BJ"};
  ids["208"] = {name:"Denmark", iso_code:"DK"};
  ids["212"] = {name:"Dominica", iso_code:"DM"};
  ids["214"] = {name:"Dominican Republic", iso_code:"DO"};
  ids["218"] = {name:"Ecuador", iso_code:"EC"};
  ids["222"] = {name:"El Salvador", iso_code:"SV"};
  ids["226"] = {name:"Equatorial Guinea", iso_code:"GQ"};
  ids["231"] = {name:"Ethiopia", iso_code:"ET"};
  ids["232"] = {name:"Eritrea", iso_code:"ER"};
  ids["233"] = {name:"Estonia", iso_code:"EE"};
  ids["234"] = {name:"Faroe Islands", iso_code:"FO"};
  ids["238"] = {name:"Falkland Islands (Malvinas)", iso_code:"FK"};
  ids["239"] = {name:"South Georgia and the South Sandwich Islands", iso_code:"GS"};
  ids["242"] = {name:"Fiji", iso_code:"FJ"};
  ids["246"] = {name:"Finland", iso_code:"FI"};
  ids["248"] = {name:"ï¿½LAND ISLANDS", iso_code:"AX"};
  ids["250"] = {name:"France", iso_code:"FR"};
  ids["254"] = {name:"French Guiana", iso_code:"GF"};
  ids["258"] = {name:"French Polynesia", iso_code:"PF"};
  ids["260"] = {name:"French Southern Territories", iso_code:"TF"};
  ids["262"] = {name:"Djibouti", iso_code:"DJ"};
  ids["266"] = {name:"Gabon", iso_code:"GA"};
  ids["268"] = {name:"Georgia", iso_code:"GE"};
  ids["270"] = {name:"Gambia", iso_code:"GM"};
  ids["275"] = {name:"Palestinian Territory, Occupied", iso_code:"PS"};
  ids["276"] = {name:"Germany", iso_code:"DE"};
  ids["288"] = {name:"Ghana", iso_code:"GH"};
  ids["292"] = {name:"Gibraltar", iso_code:"GI"};
  ids["296"] = {name:"Kiribati", iso_code:"KI"};
  ids["300"] = {name:"Greece", iso_code:"GR"};
  ids["304"] = {name:"Greenland", iso_code:"GL"};
  ids["308"] = {name:"Grenada", iso_code:"GD"};
  ids["312"] = {name:"Guadeloupe", iso_code:"GP"};
  ids["316"] = {name:"Guam", iso_code:"GU"};
  ids["320"] = {name:"Guatemala", iso_code:"GT"};
  ids["324"] = {name:"Guinea", iso_code:"GN"};
  ids["328"] = {name:"Guyana", iso_code:"GY"};
  ids["332"] = {name:"Haiti", iso_code:"HT"};
  ids["334"] = {name:"Heard Island and McDonald Islands", iso_code:"HM"};
  ids["336"] = {name:"Holy See (Vatican City State)", iso_code:"VA"};
  ids["340"] = {name:"Honduras", iso_code:"HN"};
  ids["344"] = {name:"Hong Kong", iso_code:"HK"};
  ids["348"] = {name:"Hungary", iso_code:"HU"};
  ids["352"] = {name:"Iceland", iso_code:"IS"};
  ids["356"] = {name:"India", iso_code:"IN"};
  ids["360"] = {name:"Indonesia", iso_code:"ID"};
  ids["364"] = {name:"Iran, Islamic Republic of", iso_code:"IR"};
  ids["368"] = {name:"Iraq", iso_code:"IQ"};
  ids["372"] = {name:"Ireland", iso_code:"IE"};
  ids["376"] = {name:"Israel", iso_code:"IL"};
  ids["380"] = {name:"Italy", iso_code:"IT"};
  ids["384"] = {name:"Cï¿½TE D'IVOIRE", iso_code:"CI"};
  ids["388"] = {name:"Jamaica", iso_code:"JM"};
  ids["392"] = {name:"Japan", iso_code:"JP"};
  ids["398"] = {name:"Kazakhstan", iso_code:"KZ"};
  ids["400"] = {name:"Jordan", iso_code:"JO"};
  ids["404"] = {name:"Kenya", iso_code:"KE"};
  ids["408"] = {name:"Korea, Democratic People's Republic of", iso_code:"KP"};
  ids["410"] = {name:"Korea, Republic of", iso_code:"KR"};
  ids["414"] = {name:"Kuwait", iso_code:"KW"};
  ids["417"] = {name:"Kyrgyzstan", iso_code:"KG"};
  ids["418"] = {name:"Lao People's Democratic Republic", iso_code:"LA"};
  ids["422"] = {name:"Lebanon", iso_code:"LB"};
  ids["426"] = {name:"Lesotho", iso_code:"LS"};
  ids["428"] = {name:"Latvia", iso_code:"LV"};
  ids["430"] = {name:"Liberia", iso_code:"LR"};
  ids["434"] = {name:"Libya", iso_code:"LY"};
  ids["438"] = {name:"Liechtenstein", iso_code:"LI"};
  ids["440"] = {name:"Lithuania", iso_code:"LT"};
  ids["442"] = {name:"Luxembourg", iso_code:"LU"};
  ids["446"] = {name:"Macao", iso_code:"MO"};
  ids["450"] = {name:"Madagascar", iso_code:"MG"};
  ids["454"] = {name:"Malawi", iso_code:"MW"};
  ids["458"] = {name:"Malaysia", iso_code:"MY"};
  ids["462"] = {name:"Maldives", iso_code:"MV"};
  ids["466"] = {name:"Mali", iso_code:"ML"};
  ids["470"] = {name:"Malta", iso_code:"MT"};
  ids["474"] = {name:"Martinique", iso_code:"MQ"};
  ids["478"] = {name:"Mauritania", iso_code:"MR"};
  ids["480"] = {name:"Mauritius", iso_code:"MU"};
  ids["484"] = {name:"Mexico", iso_code:"MX"};
  ids["492"] = {name:"Monaco", iso_code:"MC"};
  ids["496"] = {name:"Mongolia", iso_code:"MN"};
  ids["498"] = {name:"Moldova, Republic of", iso_code:"MD"};
  ids["499"] = {name:"Montenegro", iso_code:"ME"};
  ids["500"] = {name:"Montserrat", iso_code:"MS"};
  ids["504"] = {name:"Morocco", iso_code:"MA"};
  ids["508"] = {name:"Mozambique", iso_code:"MZ"};
  ids["512"] = {name:"Oman", iso_code:"OM"};
  ids["516"] = {name:"Namibia", iso_code:"NA"};
  ids["520"] = {name:"Nauru", iso_code:"NR"};
  ids["524"] = {name:"Nepal", iso_code:"NP"};
  ids["528"] = {name:"Netherlands", iso_code:"NL"};
  ids["531"] = {name:"CURAï¿½AO", iso_code:"CW"};
  ids["533"] = {name:"Aruba", iso_code:"AW"};
  ids["534"] = {name:"Sint Maarten (Dutch part)", iso_code:"SX"};
  ids["535"] = {name:"Bonaire, Sint Eustatius and Saba", iso_code:"BQ"};
  ids["540"] = {name:"New Caledonia", iso_code:"NC"};
  ids["548"] = {name:"Vanuatu", iso_code:"VU"};
  ids["554"] = {name:"New Zealand", iso_code:"NZ"};
  ids["558"] = {name:"Nicaragua", iso_code:"NI"};
  ids["562"] = {name:"Niger", iso_code:"NE"};
  ids["566"] = {name:"Nigeria", iso_code:"NG"};
  ids["570"] = {name:"Niue", iso_code:"NU"};
  ids["574"] = {name:"Norfolk Island", iso_code:"NF"};
  ids["578"] = {name:"Norway", iso_code:"NO"};
  ids["580"] = {name:"Northern Mariana Islands", iso_code:"MP"};
  ids["581"] = {name:"United States Minor Outlying Islands", iso_code:"UM"};
  ids["583"] = {name:"Micronesia, Federated States of", iso_code:"FM"};
  ids["584"] = {name:"Marshall Islands", iso_code:"MH"};
  ids["585"] = {name:"Palau", iso_code:"PW"};
  ids["586"] = {name:"Pakistan", iso_code:"PK"};
  ids["591"] = {name:"Panama", iso_code:"PA"};
  ids["598"] = {name:"Papua New Guinea", iso_code:"PG"};
  ids["600"] = {name:"Paraguay", iso_code:"PY"};
  ids["604"] = {name:"Peru", iso_code:"PE"};
  ids["608"] = {name:"Philippines", iso_code:"PH"};
  ids["612"] = {name:"Pitcairn", iso_code:"PN"};
  ids["616"] = {name:"Poland", iso_code:"PL"};
  ids["620"] = {name:"Portugal", iso_code:"PT"};
  ids["624"] = {name:"Guinea-Bissau", iso_code:"GW"};
  ids["626"] = {name:"Timor-Leste", iso_code:"TL"};
  ids["630"] = {name:"Puerto Rico", iso_code:"PR"};
  ids["634"] = {name:"Qatar", iso_code:"QA"};
  ids["638"] = {name:"Rï¿½UNION", iso_code:"RE"};
  ids["642"] = {name:"Romania", iso_code:"RO"};
  ids["643"] = {name:"Russian Federation", iso_code:"RU"};
  ids["646"] = {name:"Rwanda", iso_code:"RW"};
  ids["652"] = {name:"SAINT BARTHï¿½LEMY", iso_code:"BL"};
  ids["654"] = {name:"Saint Helena, Ascension and Tristan da Cunha", iso_code:"SH"};
  ids["659"] = {name:"Saint Kitts and Nevis", iso_code:"KN"};
  ids["660"] = {name:"Anguilla", iso_code:"AI"};
  ids["662"] = {name:"Saint Lucia", iso_code:"LC"};
  ids["663"] = {name:"Saint Martin (French part)", iso_code:"MF"};
  ids["666"] = {name:"Saint Pierre and Miquelon", iso_code:"PM"};
  ids["670"] = {name:"Saint Vincent and the Grenadines", iso_code:"VC"};
  ids["674"] = {name:"San Marino", iso_code:"SM"};
  ids["678"] = {name:"Sao Tome and Principe", iso_code:"ST"};
  ids["682"] = {name:"Saudi Arabia", iso_code:"SA"};
  ids["686"] = {name:"Senegal", iso_code:"SN"};
  ids["688"] = {name:"Serbia", iso_code:"RS"};
  ids["690"] = {name:"Seychelles", iso_code:"SC"};
  ids["694"] = {name:"Sierra Leone", iso_code:"SL"};
  ids["702"] = {name:"Singapore", iso_code:"SG"};
  ids["703"] = {name:"Slovakia", iso_code:"SK"};
  ids["704"] = {name:"Viet Nam", iso_code:"VN"};
  ids["705"] = {name:"Slovenia", iso_code:"SI"};
  ids["706"] = {name:"Somalia", iso_code:"SO"};
  ids["710"] = {name:"South Africa", iso_code:"ZA"};
  ids["716"] = {name:"Zimbabwe", iso_code:"ZW"};
  ids["724"] = {name:"Spain", iso_code:"ES"};
  ids["728"] = {name:"South Sudan", iso_code:"SS"};
  ids["729"] = {name:"Sudan", iso_code:"SD"};
  ids["732"] = {name:"Western Sahara", iso_code:"EH"};
  ids["740"] = {name:"Suriname", iso_code:"SR"};
  ids["744"] = {name:"Svalbard and Jan Mayen", iso_code:"SJ"};
  ids["748"] = {name:"Swaziland", iso_code:"SZ"};
  ids["752"] = {name:"Sweden", iso_code:"SE"};
  ids["756"] = {name:"Switzerland", iso_code:"CH"};
  ids["760"] = {name:"Syrian Arab Republic", iso_code:"SY"};
  ids["762"] = {name:"Tajikistan", iso_code:"TJ"};
  ids["764"] = {name:"Thailand", iso_code:"TH"};
  ids["768"] = {name:"Togo", iso_code:"TG"};
  ids["772"] = {name:"Tokelau", iso_code:"TK"};
  ids["776"] = {name:"Tonga", iso_code:"TO"};
  ids["780"] = {name:"Trinidad and Tobago", iso_code:"TT"};
  ids["784"] = {name:"United Arab Emirates", iso_code:"AE"};
  ids["788"] = {name:"Tunisia", iso_code:"TN"};
  ids["792"] = {name:"Turkey", iso_code:"TR"};
  ids["795"] = {name:"Turkmenistan", iso_code:"TM"};
  ids["796"] = {name:"Turks and Caicos Islands", iso_code:"TC"};
  ids["798"] = {name:"Tuvalu", iso_code:"TV"};
  ids["800"] = {name:"Uganda", iso_code:"UG"};
  ids["804"] = {name:"Ukraine", iso_code:"UA"};
  ids["807"] = {name:"Macedonia, the former Yugoslav Republic of", iso_code:"MK"};
  ids["818"] = {name:"Egypt", iso_code:"EG"};
  ids["826"] = {name:"United Kingdom", iso_code:"GB"};
  ids["831"] = {name:"Guernsey", iso_code:"GG"};
  ids["832"] = {name:"Jersey", iso_code:"JE"};
  ids["833"] = {name:"Isle of Man", iso_code:"IM"};
  ids["834"] = {name:"Tanzania, United Republic of", iso_code:"TZ"};
  ids["840"] = {name:"United States", iso_code:"US"};
  ids["850"] = {name:"Virgin Islands, U.S.", iso_code:"VI"};
  ids["854"] = {name:"Burkina Faso", iso_code:"BF"};
  ids["858"] = {name:"Uruguay", iso_code:"UY"};
  ids["860"] = {name:"Uzbekistan", iso_code:"UZ"};
  ids["862"] = {name:"Venezuela, Bolivarian Republic of", iso_code:"VE"};
  ids["876"] = {name:"Wallis and Futuna", iso_code:"WF"};
  ids["882"] = {name:"Samoa", iso_code:"WS"};
  ids["887"] = {name:"Yemen", iso_code:"YE"};
  ids["894"] = {name:"Zambia", iso_code:"ZM"};
  
  return ids;
}

}