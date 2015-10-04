console.log('scripts loaded');

var svg;
var proj;
var world;
var latitude;
var longitude;
var globe;

var width = 1500,
    height = 800;

var colorGradient = d3.scale.linear()
    .domain([0,70, 300, 600])
    .range(['#ff2600', 'rgb(236, 154, 46)', 'rgb(249, 151, 96)', '#faff09']);


// var zoom = d3.behavior.zoom(true)
//           .translate()
//           .scale()
//           .scaleExtent()
//           .on('zoom', zoomed);
//
// svg.call(zoom);
//
// var slast = 1;
//
// function zoomed() {
//     if (slast != d3.event.scale) {
//         svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
//         slast = d3.event.scale;
//     }
// }

function refresh() {
  svg.selectAll(".point").attr("d", path);
  svg.selectAll(".land").attr("d", path);
}

var mousePosition, projRotation;

function mousedown() {
  mousePosition = [d3.event.pageX, d3.event.pageY];
  projRotation = window.proj.rotate();
  d3.event.preventDefault();
}
function mousemove() {
  if (mousePosition) {
    var newMousePosition = [d3.event.pageX, d3.event.pageY];
    newRotation = [projRotation[0] + (newMousePosition[0] - mousePosition[0])/2, projRotation[1] + (mousePosition[1] - newMousePosition[1])/2];
    window.proj.rotate(newRotation);
    sky.rotate(newRotation);
    refresh();
  }
}
function mouseup() {
  if (mousePosition) {
    mousemove();
    mousePosition = null;
  }
}

function drawGlobe(svg, world){

var ocean_fill = svg.append("defs").append("radialGradient")
     .attr("id", "ocean_fill")
     .attr("cx", "75%")
     .attr("cy", "25%");
   ocean_fill.append("stop").attr("offset", "5%").attr("stop-color", "#fff");
   ocean_fill.append("stop").attr("offset", "100%").attr("stop-color", "#ababab");

var globe_highlight = svg.append("defs").append("radialGradient")
     .attr("id", "globe_highlight")
     .attr("cx", "75%")
     .attr("cy", "25%");
   globe_highlight.append("stop")
     .attr("offset", "5%").attr("stop-color", "#ffd")
     .attr("stop-opacity","0.6");
   globe_highlight.append("stop")
     .attr("offset", "100%").attr("stop-color", "#ba9")
     .attr("stop-opacity","0.2");

var globe_shading =       svg.append("defs").append("radialGradient")
     .attr("id", "globe_shading")
     .attr("cx", "55%")
     .attr("cy", "45%");
   globe_shading.append("stop")
     .attr("offset","30%").attr("stop-color", "#fff")
     .attr("stop-opacity","0");
   globe_shading.append("stop")
     .attr("offset","100%").attr("stop-color", "#505962")
     .attr("stop-opacity","0.3");

     svg.append("circle")
     .attr('cx', width / 2)
     .attr('cy', height / 2)
     .attr('r', window.proj.scale())
     .attr('class', 'globe')
     .attr("filter", "url(#glow)")
     .attr("fill", "url(#gradBlue)");

  svg.append("path")
    .datum(topojson.object(world, world.objects.land))
    .attr("class", "land noclicks")
    .attr("d", path);

    svg.append("circle")
      .attr("cx", width / 2).attr("cy", height / 2)
      .attr("r", window.proj.scale())
      .attr("class","noclicks")
      .style("fill", "url(#globe_highlight)");

    svg.append("circle")
      .attr("cx", width / 2).attr("cy", height / 2)
      .attr("r", window.proj.scale())
      .attr("class","noclicks")
      .style("fill", "url(#globe_shading)");

      rotateGlobe();

    }

function bindDateButton() {
  $('#dateButton').on('click', function(){
    var startTime = $('#from').val();
    var endTime = $('#to').val();
    var minmag = $('#minmag').val();
    $('#daterange').attr('data-start', startTime);
    $('#daterange').attr('data-end', endTime);
    renderGlobe(startTime, endTime, minmag, svg);
    $( "#to" ).datepicker( "option", "maxDate", new Date());
    $( "#from" ).datepicker( "option", "maxDate", new Date());
    var dates = $("input[id$='from'], input[id$='to']");
    dates.attr('value', '');
    dates.each(function(){
        $.datepicker._clearDate(this);
    });
    $('#minmag').val('2');
  });
}

var interval;
var rotate = false;

function bindRotateToggleButton(){
  $('#rotateToggleButton').on('click', rotateGlobe);
}

function rotateGlobe(){
  if (!rotate){
    rotate = true;
    interval = setInterval(function(){
      var rot = proj.rotate();
      proj.rotate([rot[0]+=0.2, rot[1]+=0.01]);
      refresh();
    }, 50);
  } else {
    clearInterval(interval);
    rotate = false;
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

function renderGlobe(startTime, endTime, minmag, svg) {

  if (rotate){
    rotateGlobe();
  }

  queue()
  // .defer(d3.json, "/js/world2.json")
  .defer(d3.json, "http://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=" + startTime + "&endtime=" + endTime + "&minmagnitude=" + minmag)
  .await(ready);

  function ready(error, quakes) {

    if (error) throw error;

    quakes = quakes.features;

    var startTime = $('#daterange').attr('data-start');
    var endTime = $('#daterange').attr('data-end');

    var formatStartDate = startTime.slice(5,7) + '/' + startTime.slice(8,10) + '/' + startTime.slice(0,4);

    var formatEndDate = endTime.slice(5,7) + '/' + endTime.slice(8,10) + '/' + endTime.slice(0,4);

    var quakesNum = quakes.length;

    $('#daterange>h4').text("Number of earthquakes, of magnitude " + minmag + " or larger, between " + formatStartDate + " and " + formatEndDate + ": " + quakesNum);
    //
    // if (!window.globeDrawn){
    //   drawGlobe(svg, world);
    //   window.globeDrawn = true;
    // }

    var places = [];
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

        svg.selectAll('g').data([0,1]).enter().append("g").attr("class","points");

          svg.selectAll('g').selectAll(".point").data(places)
          .enter().append("path")
            .attr("class", "point");
          var pulse;
          svg.selectAll(".point").data(places)
          .on("mouseover", function(place){
            this.style.fill = 'white';
            var that = this;

            // Applying pulse behavior to quake point
            pulse = setInterval(function(){
              d3.select(that)
                .transition()
                .duration(250)
                .attr("d", path.pointRadius(function(place){
                    return Math.pow(place.magnitude/2.4, 3.5);
                }))
                .transition()
                .duration(250)
                .attr("d", path.pointRadius(function(place){
                    return Math.pow(place.magnitude/2.8, 3.5);
                }));
            }, 500);

            // Appending triangle pointer for info box
            $(".externalObject").remove();
            svg.append('path')
            .attr('class', 'textBoxTriangle')
            .attr('d', function() {
              return ' M ' + (d3.event.pageX - 10) + ' ' + (d3.event.pageY - 30) + ' L ' + (d3.event.pageX - 70) + ' ' + (d3.event.pageY - 90) + ' L ' + (d3.event.pageX - 50) + ' ' + (d3.event.pageY - 90) + ' L ' + (d3.event.pageX - 10) + ' ' + (d3.event.pageY - 30) ;
            })
            .attr('fill', 'white')
            .attr('opacity', '0.7');

            // Appending info box container
            var textBox = svg.append('g')
                             .attr("class", "textContainer");

            // Appending info box
            newRect = textBox.append("rect")
            .attr("x", (d3.event.pageX - 100) + "px")
            .attr("y", (d3.event.pageY - 200) + "px")
            .attr("width", 350)
            .attr("height", 110)
            .attr("fill", "white")
            .attr('opacity', '0.7')
            .attr("class", "textBox");

            // Appending info box text
            textBox.append("foreignObject")
              .attr("class", "externalObject")
              .attr("color", "black")
              .attr("x", (d3.event.pageX - 100) + "px")
              .attr("y", (d3.event.pageY - 200) + "px")
              .attr("width", 300)
              .attr("height", 80)
              .attr("transform", "translate(10, 10)")
              .append("xhtml:div")
              .html("Location: " + place.area + "<br/>Date: " + place.date + "<br/>Magnitude: " + place.magnitude + "<br/>Depth: " + place.depth + ' km');

          })
          .on("mouseout", function(place){

            // Removing info box elements
            $(".externalObject").remove();
            $(".textContainer").remove();
            $(".textBox").remove();
            $(".textBoxTriangle").remove();

            // Stopping pulse behavior
            clearInterval(pulse);
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
                return Math.pow(place.magnitude/2.4, 3.5);
            }))
            .transition()
            .duration(500)
            .attr("d", path.pointRadius(function(place){
                return Math.pow(place.magnitude/2.8, 3.5);
            }));
            svg.selectAll('.point').data(places).exit().remove();
    }

    // if (!rotate){
    //   setTimeout(function(){
    //   rotateGlobe();
    //   },2000);
    // }

  }

window.onload = function(){

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

  d3.select(window)
      .on("mousemove", mousemove)
      .on("mouseup", mouseup);

  var space = d3.geo.azimuthalEquidistant()
      .translate([width / 2, height / 2]);

  space.scale(space.scale() * 3);

  var spacePath = d3.geo.path()
      .projection(space)
      .pointRadius(1);

  window.proj = d3.geo.orthographic()
      .translate([width / 2, height / 2])
      .clipAngle(90)
      .scale(300);

  window.sky = d3.geo.orthographic()
      .translate([width / 2, height / 2])
      .clipAngle(90)
      .scale(300);

  window.path = d3.geo.path().projection(window.proj).pointRadius(2);

  svg = d3.select("body").append("svg")
          .attr("width", width)
          .attr("height", height)
          .on("mousedown", mousedown);

  var starList = createStars(300);
  //
  var stars = svg
      .selectAll("g")
      .data(starList)
      .enter()
      .append("path")
          .attr("class", "star")
          .attr("d", function(d){
              spacePath.pointRadius(d.properties.radius);
              return spacePath(d);
          });


  d3.json("/js/world2.json", function(world){
    drawGlobe(svg, world);
  });

};
