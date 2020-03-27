// Defines rotation behavior of mouse drag
var mousePosition, projRotation;

export function mousedown() {
  mousePosition = [d3.event.pageX, d3.event.pageY];
  projRotation = window.proj.rotate();
  d3.event.preventDefault();
}

export function mousemove() {
  if (mousePosition) {
    var newMousePosition = [d3.event.pageX, d3.event.pageY];
    newRotation = [
      projRotation[0] + (newMousePosition[0] - mousePosition[0]) / 2,
      projRotation[1] + (mousePosition[1] - newMousePosition[1]) / 2
    ];
    window.proj.rotate(newRotation);
    window.space.rotate(newRotation);
    refresh();
  }
}

export function mouseup() {
  if (mousePosition) {
    mousemove();
    mousePosition = null;
  }
}
