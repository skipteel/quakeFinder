// ;(function(w, d3, undefined){
    // "use strict";
    var svg;
    var path;
    var quakes;
    var points;
    var width = 1000,
        height = 500;
    var colorGradient = d3.scale.linear()
        .domain([0,70, 300, 600])
        .range(['#349598', 'rgb(46, 236, 71)', 'rgb(249, 151, 96)', '#ff2600']);
    init();
    // var width, height;
    // function getSize(){
    //     width = w.innerWidth;
    //     height = w.innerHeight;
    //
    //     if(width === 0 || height === 0){
    //         setTimeout(function(){
    //             getSize();
    //         }, 100);
    //     }
    //     else {
    //         init();
    //     }
    // }

    function init(){

        //Setup path for outerspace
        var space = d3.geo.azimuthal()
            .mode("equidistant")
            .translate([width / 2, height / 2]);

        space.scale(space.scale() * 3);

        var spacePath = d3.geo.path()
            .projection(space)
            .pointRadius(1);

        //Setup path for globe
        var projection = d3.geo.azimuthal()
            .mode("orthographic")
            .translate([width / 2, height / 2]);

        var scale0 = projection.scale();

        path = d3.geo.path()
            .projection(projection)
            .pointRadius(2);

        //Setup zoom behavior
        var zoom = d3.behavior.zoom(true)
            .translate(projection.origin())
            .scale(projection.scale())
            .scaleExtent([100, 800])
            .on("zoom", move);

        var circle = d3.geo.greatCircle();

        svg = d3.select("body")
            .append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                    .call(zoom)
                    .on("dblclick.zoom", null);

        //Create a list of random stars and add them to outerspace
        var starList = createStars(300);

        var stars = svg.append("g")
            .selectAll("g")
            .data(starList)
            .enter()
            .append("path")
                .attr("class", "star")
                .attr("d", function(d){
                    spacePath.pointRadius(d.properties.radius);
                    return spacePath(d);
                });


        svg.append("rect")
            .attr("class", "frame")
            .attr("width", width)
            .attr("height", height);

        //Create the base globe
        var backgroundCircle = svg.append("circle")
            .attr('cx', width / 2)
            .attr('cy', height / 2)
            .attr('r', projection.scale())
            .attr('class', 'globe')
            .attr("filter", "url(#glow)")
            .attr("fill", "url(#gradBlue)");

        var g = svg.append("g"),
            features;

        //Add all of the countries to the globe
        d3.json("/js/world-countries.json", function(collection) {
            features = g.selectAll(".feature").data(collection.features);

            features.enter().append("path")
                .attr("class", "feature")
                .attr("d", function(d){ return path(circle.clip(d)); });
        });

        //Redraw all items with new projections
        function redraw(){
            features.attr("d", function(d){
                return path(circle.clip(d));
            });

            stars.attr("d", function(d){
                spacePath.pointRadius(d.properties.radius);
                return spacePath(d);
            });
            svg.selectAll(".point").attr("d", path);
        }


        function move() {
            if(d3.event){
                var scale = d3.event.scale;
                var origin = [d3.event.translate[0] * -1, d3.event.translate[1]];

                projection.scale(scale);
                space.scale(scale * 3);
                backgroundCircle.attr('r', scale);
                path.pointRadius(2 * scale / scale0);

                projection.origin(origin);
                circle.origin(origin);

                //globe and stars spin in the opposite direction because of the projection mode
                var spaceOrigin = [origin[0] * -1, origin[1] * -1];
                space.origin(spaceOrigin);
                redraw();
            }
        }


        function createStars(number){
            var data = [];
            for(var i = 0; i < number; i++){
                data.push({
                    geometry: {
                        type: 'Point',
                        coordinates: randomLonLat()
                    },
                    type: 'Feature',
                    properties: {
                        radius: Math.random() * 1.5
                    }
                });
            }
            return data;
        }

        function randomLonLat(){
            return [Math.random() * 360 - 180, Math.random() * 180 - 90];
        }

        function bindDateButton() {
          $('#dateButton').on('click', function(){
            var startTime = $('#from').val();
            var endTime = $('#to').val();
            var minmag = $('#minmag').val();
            $('#daterange').attr('data-start', startTime);
            $('#daterange').attr('data-end', endTime);
            renderGlobe(startTime, endTime, minmag, svg, path);
            $( "#to" ).datepicker( "option", "maxDate", new Date());
            $( "#from" ).datepicker( "option", "maxDate", new Date());
            var dates = $("input[id$='from'], input[id$='to']");
            dates.attr('value', '');
            dates.each(function(){
                $.datepicker._clearDate(this);
            });
            $('#minmag').val('0');
          });
        }
        var interval;
        var rotate = false;

        function bindRotateToggleButton(){
          $('#rotateToggleButton').on('click', rotateGlobe);
        }
        projection.rotate = function(_) {
          if (!arguments.length) return [ δλ * d3_degrees, δφ * d3_degrees, δγ * d3_degrees ];
          δλ = _[0] % 360 * d3_radians;
          δφ = _[1] % 360 * d3_radians;
          δγ = _.length > 2 ? _[2] % 360 * d3_radians : 0;
          return reset();
        };
        
        function rotateGlobe(){
          if (!rotate){
            rotate = true;
            interval = setInterval(function(){
              var rot = projection.rotate();
              projecrion.rotate([rot[0]+=0.2, rot[1]+=0.01]);
              redraw();
            }, 50);
          } else {
            clearInterval(interval);
            rotate = false;
          }
        }

        bindDateButton();
        bindRotateToggleButton();

        $(function() {
          $( "#from" ).datepicker({
            changeMonth: true,
            dateFormat: "yy-mm-dd",
            maxDate: new Date(),
            changeYear: true,
            yearRange: "1:c",
            onClose: function( selectedDate ) {
              $( "#to" ).datepicker( "option", "minDate", selectedDate);
              var d = new Date(selectedDate);
              var t = d.valueOf() + 2678400000;
              var maxDate = new Date(t);
              $( "#to" ).datepicker( "option", "maxDate", new Date(Math.min.apply(null, [new Date(), maxDate])));
            }
          });

          $( "#to" ).datepicker({
            changeMonth: true,
            changeYear: true,
            dateFormat: "yy-mm-dd",
            onClose: function( selectedDate ) {
              $( "#from" ).datepicker( "option", "maxDate", selectedDate );
            }
          });
        });
    }


    function renderGlobe(startTime, endTime, minmag, svg, path) {

      d3.json("http://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=" + startTime + "&endtime=" + endTime + "&minmagnitude=" + minmag, function(quakesJSON){
        quakes = quakesJSON.features;

        var startTime = $('#daterange').attr('data-start');
        var endTime = $('#daterange').attr('data-end');

        var formatStartDate = startTime.slice(5,7) + '/' + startTime.slice(8,10) + '/' + startTime.slice(0,4);

        var formatEndDate = endTime.slice(5,7) + '/' + endTime.slice(8,10) + '/' + endTime.slice(0,4);

        var quakesNum = quakes.length;

        $('#daterange>h4').text("Number of earthquakes, of magnitude " + minmag + " or larger, between " + formatStartDate + " and " + formatEndDate + ": " + quakesNum);

        var places = [];
        var latitude;
        var longitude;
        var magnitude;
        var area;
        var milliseconds;
        var date;
        var depth;
        for (var i = 0; i < quakes.length; i++) {

          latitude = quakes[i].geometry.coordinates[1];
          longitude = quakes[i].geometry.coordinates[0];
          // console.log(tzwhere.tzOffsetAt(latitude, longitude));
          magnitude = quakes[i].properties.mag;
          area = quakes[i].properties.place;
          milliseconds = quakes[i].properties.time;
          date = new Date(milliseconds).toUTCString();
          depth = quakes[i].geometry.coordinates[2];

          places.push({ "depth": depth, "magnitude": magnitude, "area": area, "type": "Feature", "date": date, "geometry": { "type": "Point", "coordinates": [ longitude, latitude ]} });
        }

            // Create g ONCE
            // svg.selectAll('g').data([0]).enter().append("g").attr("class","points");
            // svg.append('g').attr("class","points");

            points = svg.append("g").attr("class","points");

              points.selectAll(".point").data(places)
              .enter().append("path")
                .attr("class", "point");

              points.selectAll(".point").data(places)
              .on("mouseover", function(place) {
                this.style.fill = "blue";
                $('#quake-info>h4').html("Location: " + place.area + "<br/>Date: " + place.date + "<br/>Magnitude: " + place.magnitude + "<br/>Depth: " + place.depth + ' km');
              })
              .on("mouseout", function(place) {
                $('#quake-info>h4').html("");
                this.style.fill = colorGradient(place.depth);
              })
                .transition()
                .duration(800)
                .attr("d", path.pointRadius(0))
                .style('fill', function(place){
                  return colorGradient(place.depth);
                })
                .style('opacity', '0.7')
                .transition()
                .duration(800)
                .attr("d", path.pointRadius(function(place){
                  return (function(place){
                    return Math.pow(place.magnitude/2.4, 3.5);
                  })(place);
                }))
                .transition()
                .duration(500)
                .attr("d", path.pointRadius(function(place){
                  return (function(place){
                    return Math.pow(place.magnitude/2.8, 3.5);
                  })(place);
                }));
                svg.selectAll('.point').data(places).exit().remove();
        });

      }

    // getSize();

// }(window, d3));
