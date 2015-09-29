var mouseWheel = require('mouse-wheel')
var createPinch = require('touch-pinch')

function input (source, target, rotate, zoom, pinch) {
  source.addEventListener('mousemove', onMouseMove)
  source.addEventListener('mousedown', onMouseDown)
  
}