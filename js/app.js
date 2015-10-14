console.log('scripts loaded');

var width = 1500,
    height = 800;

var svg;
var proj;
var world;
var latitude;
var longitude;
var globe;

// --- Generating gradient for depth legend ---

var gradientData = [
  {
    color: 'red',
    label: '0m-70m',
    label2: 'Shallow',
    xPosition: '0'
  },
  {
    color: 'yellow',
    label: '70m-300m',
    label2: 'Intermediate',
    xPosition: '.25'
  },
  {
    color: 'green',
    label: '300m-700m',
    label2: 'Deep',
    xPosition: '.75'
  },
  {
    color: 'blue',
    label: '',
    xPosition: '1'
  }
];

var w = 300,
    h = 80;

var svg = d3.select("#color-gradient").append("svg")
    .attr("width", w)
    .attr("height", h);

// Defines the dimensions and orientation of the gradient
var gradient = svg.append("defs")
  .append("linearGradient")
    .attr("id", "gradient")
    .attr("x1", "0%")
    .attr("x2", "100%")
    .attr("y1", "0%")
    .attr("y2", "0%");

// Defines the position and color of the gradient
gradient.selectAll("stop")
    .data(gradientData)
    .enter()
    .append("stop")
    .attr('offset', function(d) {
        return d.xPosition;
      })
    .style('stop-color', function(d) {
        return d.color;
      })
    .style('stop-opacity', 0.9);

// Defines the rectangle that the gradient will live in
svg.append("rect")
    .attr("width", w)
    .attr("height", h/2)
    .style("fill", "url(#gradient)");


// Defines the area for the lines and labels
var g = svg.append('g')
      .selectAll('.label')
      .data(gradientData)
      .enter();

// Defines the color, position and length of the lines extending below the gradient
g.append('line')
  .style('stroke', function(d) {
    return d.color;
  })
  .style('stroke-width', 2)
  .attr('x1',function(d){
    return parseFloat(d.xPosition)*100 + '%';
  })
  .attr('x2',function(d){
    return parseFloat(d.xPosition)*100 + '%';
  })
  .attr('y1',function(d){
    return h / 2;
  })
   .attr('y2',function(d){
    return h;
  });

// Defines the position, content, and styling of the text for the labels
g.append('text')
  .text(function(d){
    return d.label;
  })
  .attr('transform',function(d, i){
    if (i === 0){
      return 'translate(' + (parseFloat(d.xPosition)*w + 14) + ',' + ((h) - 22) + ')';
    } else if (i === 1 ) {
      return 'translate(' + (parseFloat(d.xPosition)*w + 45) + ',' + ((h) - 22) + ')';
    } else if (i === 2 ) {
      return 'translate(' + (parseFloat(d.xPosition)*w + 2) + ',' + ((h) - 22) + ')';
    }
  })
  .style('fill', 'white')
  .style('font-size', '0.8em');

g.append('text')
  .text(function(d){
    return d.label2;
  })
  .attr('transform',function(d, i){
    if (i === 0){
      return 'translate(' + (parseFloat(d.xPosition)*w + 13) + ',' + ((h) - 2) + ')';
    } else if (i === 1 ) {
      return 'translate(' + (parseFloat(d.xPosition)*w + 40) + ',' + ((h) - 2) + ')';
    } else if (i === 2 ) {
      return 'translate(' + (parseFloat(d.xPosition)*w + 20) + ',' + ((h) - 2) + ')';
    }
  })
  .style('fill', 'white')
  .style('font-size', '0.8em');

// Defines the gradient that will style the earthquake points
var colorGradient = d3.scale.linear()
    .domain([0,70, 300, 600])
    // .range(['#ff2600', 'rgb(236, 154, 46)', 'rgb(249, 151, 96)', '#faff09']);
    .range(['red', 'yellow', 'green', 'blue']);

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

// Updates all map features
function refresh() {
  svg.selectAll(".point").attr("d", path);
  svg.selectAll(".land").attr("d", path);
  svg.selectAll(".tectonic").attr("d", path);
}

// Defines rotation behavior of mouse drag
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
    window.space.rotate(newRotation);
    refresh();
  }
}

function mouseup() {
  if (mousePosition) {
    mousemove();
    mousePosition = null;
  }
}

// Generates globe
function drawGlobe(svg, world){

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

  svg.append("circle")
    .attr("cx", width / 2).attr("cy", height / 2)
    .attr("r", window.proj.scale())
    .attr("class","noclicks")
    .style("fill", "url(#globe_highlight)");

  var globe_shading = svg.append("defs").append("radialGradient")
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
    .attr("cx", width / 2).attr("cy", height / 2)
    .attr("r", window.proj.scale())
    .attr("class","noclicks")
    .style("fill", "url(#globe_shading)");

  rotateGlobe();

}

// Collects information from search parameters and triggers renderGlobe()
function bindSubmitButton() {
  $('#submitButton').on('click', function(){
    var startTime = $('#from').val();
    var endTime = $('#to').val();
    var slider = document.getElementById('magSlider');
    magVals = $('.slider').slider("option", "values");
    var minmag = magVals[0];
    var maxmag = magVals[1];
    if (startTime === "" || endTime === ""){
      $("#error-message").text("All fields are required");
    } else {
      $('#loading-div').css('display', 'block');
      $("#error-message").text("");
      $('#daterange').attr('data-start', startTime);
      $('#daterange').attr('data-end', endTime);
      renderGlobe(startTime, endTime, minmag, maxmag, svg);
      $( "#to" ).datepicker( "option", "maxDate", new Date());
      $( "#from" ).datepicker( "option", "maxDate", new Date());
      var dates = $("input[id$='from'], input[id$='to']");
      dates.attr('value', '');
      dates.each(function(){
          $.datepicker._clearDate(this);
      });
    }
  });
}

function hideLoadingDiv(){
  $('#loading-div').css('display', 'none');
}

// Defines behavior of time lapse buttons
var lapse;
function bindTimeLapseButton(){
  $('#timelapseButton').on('click', function(){
    $('#timelapseButton').off('click');
    var slider = $('#timelapseSlider');
    lapse = setInterval(function(){

      // increase slider speed when globe is rotating to account for lag
      if(rotate){
          slider.slider("value", (slider.slider("value")+($('#timelapseSlider').slider('option', 'max') - $('#timelapseSlider').slider('option', 'min'))/75));
      } else {
        slider.slider("value", (slider.slider("value")+($('#timelapseSlider').slider('option', 'max') - $('#timelapseSlider').slider('option', 'min'))/135));
      }

      // Restart/Stop time lapse when slider reaches the end
      if (slider.slider("value") === slider.slider("option",
     'max')){
       clearInterval(lapse);
       bindTimeLapseButton();
      //  slider.slider('value', slider.slider('option', 'min'));
      }
    }, 10);
  });
}

function bindStopTimeLapseButton(){
  $('#stoptimelapseButton').on('click', function(){
    clearInterval(lapse);
    bindTimeLapseButton();
  });
}

function bindBeginningTimeLapseButton(){
  $('#beginningTimeLapseButton').on('click', function(){
    var slider = $('#timelapseSlider');
    slider.slider('value', slider.slider('option', 'min'));
    // bindTimeLapseButton();
  });
}

function bindEndTimeLapseButton(){
  $('#endTimeLapseButton').on('click', function(){
    var slider = $('#timelapseSlider');
    slider.slider('value', slider.slider('option', 'max'));
  });
}


// Rewind/fastforward move the slider backwards/forwards by one hour
function bindRewindTimeLapseButton(){
  $('#rewindTimeLapseButton').on('mousedown', function(){
    var slider = $('#timelapseSlider');
    slider.slider('value', slider.slider('value') - 3600000);
  });
}

function bindFastForwardTimeLapseButton(){
  $('#fastForwardTimeLapseButton').on('mousedown', function(){
    var slider = $('#timelapseSlider');
    slider.slider('value', slider.slider('value') + 3600000);
  });
}

// Determines whether a quake should be visible during the timelapse
function drawQuakes(){
  svg.selectAll('.point')
  .style('visibility', function(d){
    return d.milliseconds < $('#timelapseSlider').slider('value') ? "visible" : "hidden";
  });
  // Appends updated date/time below slider
  $('#timelapseDate').html(new Date($('#timelapseSlider').slider('value')).toUTCString().slice(0, 29));
}

// Defines behavior of rotate button
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
      proj.rotate([rot[0]+=0.4, rot[1]+=0.01]);
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

function renderGlobe(startTime, endTime, minmag, maxmag, svg) {

  // Stops globe rotation if rotating
  if (rotate){
    rotateGlobe();
  }

function initializeSlider (quakes){

  var startTime = $('#daterange').attr('data-start');
  var endTime = $('#daterange').attr('data-end');

  // Defines properties of time lapse slider
  $("#timelapseSlider")
    .slider({

        // Min/max properties correspond to the values of the start and end dates in milliseconds
        min: new Date(startTime).valueOf(),
        max: new Date(endTime).valueOf() + 86400000,

        // Defines behaviors when slider is manipulated
        slide: drawQuakes,

        // Defines behaviors when time lapse is initiated
        change: drawQuakes,
        animate: true
    });
  $('#timelapseDate').html(new Date($('#timelapseSlider').slider('value')).toUTCString().slice(0, 29));

  var formatStartDate = startTime.slice(5,7) + '/' + startTime.slice(8,10) + '/' + startTime.slice(0,4);

  var formatEndDate = endTime.slice(5,7) + '/' + endTime.slice(8,10) + '/' + endTime.slice(0,4);

  var quakesNum = quakes.length;

  $('#daterange>h4').html("Number of earthquakes,<br/>between " + minmag + " and " + maxmag + " magnitude,<br/>from " + formatStartDate + " to " + formatEndDate + ":<br/>" + quakesNum + '<br/><br/><span id="credit">Earthquake catalog courtesy of the U.S. Geological Survey</span>');
}

  // Sets up D3 api call using parameters from search inputs
  queue()
  // .defer(d3.json, "/js/world2.json")
  .defer(function(f){
    d3.json("http://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=" + startTime + "&endtime=" + endTime + "&minmagnitude=" + minmag + "&maxmagnitude=" + maxmag)
      // .on('progress', function(){
      //   $('#loading-div').css('display', 'block');
      // })
      .get(function(error, data){
        $('#loading-div').css('display', 'none');
        $('#quakeSummary').css('display', 'block');
        $('#gradient-div').css('display', 'block');
        f(error, data);
      });
    })
  .await(ready);

  function ready(error, quakes) {

    if (error) throw error;

    quakes = quakes.features;

    initializeSlider(quakes);

    // Generates quake data for point generation
    var places = [];
    for (var i = 0; i < quakes.length; i++) {

      latitude = quakes[i].geometry.coordinates[1];
      longitude = quakes[i].geometry.coordinates[0];
      magnitude = quakes[i].properties.mag;
      area = quakes[i].properties.place;
      milliseconds = quakes[i].properties.time;
      date = new Date(milliseconds).toUTCString();
      depth = quakes[i].geometry.coordinates[2];
      url = quakes[i].properties.url;
      id = quakes[i].id;

      places.push({ "id": id, "url": url, "milliseconds": milliseconds, "depth": depth, "magnitude": magnitude, "area": area, "type": "Feature", "date": date, "geometry": { "type": "Point", "coordinates": [ longitude, latitude ]} });
    }

        // Create g ONCE
        // svg.selectAll('g').data([0]).enter().append("g").attr("class","points");
        // svg.append('g').attr("class","points");

    // Appends g element to contain quake points
    svg.selectAll('g').data([0]).enter().append("g").attr("class","points");

    // Appends quake points
    svg.selectAll('g').selectAll(".point").data(places)
    .enter().append("path")
      .attr("class", "point");

    // Defines point behavior and styling
    var pulse;
    svg.selectAll(".point").data(places)
    .on("click", function(place){
      // d3.json('http://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&eventid=' + place.id, function(err, data){
      //   var quakejpg = data.properties.products.shakemap[0].contents['download/intensity.jpg'].url;
      //   window.open(quakejpg, '_blank');
      // });
      window.open(place.url, "_blank");
    })
    .on("mouseover", function(place){

      if(rotate){
        rotateGlobe();
      }
      this.style.fill = 'white';
      var that = this;

      // Applies pulse behavior to quake point
      pulse = setInterval(function(){
        d3.select(that)
          .transition()
          .duration(300)
          .attr("d", path.pointRadius(function(place){
              return Math.pow(place.magnitude/2.4, 3.5);
          }))
          .transition()
          .duration(300)
          .attr("d", path.pointRadius(function(place){
              return Math.pow(place.magnitude/2.8, 3.5);
          }));
      }, 600);

      // Grabs coordinates of quake point center
      var x = path.centroid(place)[0];
      var y = path.centroid(place)[1];

      // appends container for info text box
      var textBox = svg.selectAll('.textContainer').data([0]).enter().append('g')
                       .attr("class", "textContainer");

      // draws shape of info container
      textBox.append('path')
      .attr('class', 'textBoxShape')
      .attr('d', function(d) {
        return ' M ' + x + ' ' + y + ' L ' + (x - 70) + ' ' + (y - 90) + ' L ' + (x - 151) + ' ' + (y - 90) + ' L ' + (x - 151) + ' ' + (y - 215) + ' L ' + (x + 239) + ' ' + (y - 215) + ' L ' + (x + 239) + ' ' + (y - 90) + ' L ' + (x - 50) + ' ' + (y - 90) + ' L ' + x + ' ' + y;
      })
      .attr('fill', 'white')
      .attr('opacity', '0.7');

      // Appends info box text
      textBox.append("foreignObject")
        .attr("class", "externalObject")
        .attr("color", "black")
        .attr("x", (x - 151) + "px")
        .attr("y", (y - 215) + "px")
        .attr("width", 390)
        .attr("height", 80)
        .attr("transform", "translate(10, 10)")
        .append("xhtml:div")
        .html("Location: " + place.area + "<br/>Date: " + place.date + "<br/>Magnitude: " + place.magnitude + "<br/>Depth: " + place.depth + ' km');

      })

      .on("mouseout", function(place){

        // Removes info box elements
        svg.selectAll('.textContainer').data([]).exit().remove();

        // Stops pulse behavior
        clearInterval(pulse);
        this.style.fill = colorGradient(place.depth);
      })
        .transition()
        .duration(800)
        .attr("d", path.pointRadius(0))
        .style('fill', function(place){
          return colorGradient(place.depth);
        })
        .style('opacity', '0.7')
        .style('stroke', 'darkred')

        .transition()
        .duration(800)
        .attr("d", path.pointRadius(function(place){
            return Math.pow(place.magnitude/2.4, 3.5);
        }))
        .transition()
        .duration(500)
        .attr("d", path.pointRadius(function(place){
            return Math.pow(place.magnitude/2.8, 3.5);
        }))
        ;
        svg.selectAll('.point').data(places).exit().remove();

    }

  }



window.onload = function(){

  bindSubmitButton();
  bindRotateToggleButton();
  bindTimeLapseButton();
  bindStopTimeLapseButton();
  bindBeginningTimeLapseButton();
  bindEndTimeLapseButton();
  bindRewindTimeLapseButton();
  bindFastForwardTimeLapseButton();


  // Defines behavior of date picker
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
        var today = new Date().valueOf();
        var tomorrow = today + 86400000;
        var tomorrowDate = new Date(tomorrow);
        $( "#to" ).datepicker( "option", "maxDate", new Date(Math.min.apply(null, [tomorrow, maxDate])));
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

  window.space = d3.geo.azimuthalEquidistant()
      .translate([width / 2, height / 2]);

  space.scale(space.scale() * 3);

  window.spacePath = d3.geo.path()
      .projection(space)
      .pointRadius(1);

  window.proj = d3.geo.orthographic()
      .translate([width / 2, height / 2])
      .clipAngle(90)
      .scale(260);

  // window.sky = d3.geo.orthographic()
  //     .translate([width / 2, height / 2])
  //     .clipAngle(90)
  //     .scale(240);

  window.path = d3.geo.path().projection(window.proj).pointRadius(2);

  // Appends svg container
  svg = d3.select("body").append("svg")
          .attr("width", width)
          .attr("height", height)
          .on("mousedown", mousedown);

  var starList = createStars(300);

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

  // Renders globe with faultlines and recent quakes list
  queue()
  .defer(d3.json, "./data/world2.json")
  .defer(d3.json, './data/tectonics.json')
  .defer(d3.xml, 'http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.atom')
  .await(render);

  function render(error, world, tectonics, xml){
    drawGlobe(svg, world);

    svg.insert("path", ".graticule")
        .datum(topojson.object(tectonics, tectonics.objects.tec))
        .attr("class", "tectonic")
        .attr("d", path);

    var entries = d3.select(xml).selectAll("entry")[0];
    var ul = d3.select("#presentation").append("ul").attr("class","quakeslist");

    var header = ul.append("h4").html(xml.getElementsByTagName("title")[0].textContent + "<br/><span id='updated'>Updated:" + new Date(xml.getElementsByTagName("updated")[0].textContent).toString() + '<br/>Count: ' + entries.length + '</span>');

    var li = ul.selectAll('li')
        .data(entries)
        .enter().append('li')
        .style('list-style-type', 'none')
        .style('font-size', '0.8em')
        .html(function(entry){
          var cData = entry.getElementsByTagName('summary')[0].childNodes[0].nodeValue;
          return '<span id="quakeTitle">' + entry.getElementsByTagName('title')[0].textContent + '</span><br/><br/>Time: ' + cData.match("Time</dt><dd>(.*UTC)")[1] + '<br/>Location: ' + cData.match("Location</dt><dd>(.*)</dd><dt>Depth")[1] + '<br/>Depth: ' + cData.match("Depth</dt><dd>(.*)</dd></dl>")[1];
        });

    // refreshes recent quakes list every five minutes
    setInterval(function(){
      d3.xml('http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.atom', function(error, xml){
        var entries = d3.select(xml).selectAll("entry")[0];
        d3.select("#presentation").select('ul').remove();
        var ul = d3.select("#presentation").append("ul").attr("class","quakeslist");

        var header = ul.append("h4").html(xml.getElementsByTagName("title")[0].textContent + "<br/><span id='updated'>Updated:" + new Date(xml.getElementsByTagName("updated")[0].textContent)).toString() + '</span>';

        var li = ul.selectAll('li')
            .data(entries)
            .enter().append('li')
            .style('list-style-type', 'none')
            .style('font-size', '0.8em')
            .html(function(entry){
              var cData = entry.getElementsByTagName('summary')[0].childNodes[0].nodeValue;
              return '<span id="quakeTitle">' + entry.getElementsByTagName('title')[0].textContent + '</span><br/><br/>Time: ' + cData.match("Time</dt><dd>(.*UTC)")[1] + '<br/>Location: ' + cData.match("Location</dt><dd>(.*)</dd><dt>Depth")[1] + '<br/>Depth: ' + cData.match("Depth</dt><dd>(.*)</dd></dl>")[1];
            });
          console.log('updated');
      });
    }, 300000 );
  }
  
  // Defines behavior of magnitude slider
  $("#magSlider")
    .slider({
        min: 0,
        max: 10,
        step: 0.1,
        range: true,
        values: [2,10]
    })
    .slider("pips", {
      first: 'pip',
      last: 'pip',
        rest: "pips",
        step: 10
    })
    .slider("float");
};
