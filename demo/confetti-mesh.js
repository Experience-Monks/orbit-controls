/*

  A function to create a random mesh of "confetti" triangles
  in 3D space.

 */

var random = require('gl-vec3/random')
var add = require('gl-vec3/add')

module.exports = getMesh
function getMesh (count, radius) {
  count = typeof count === 'number' ? count : 10
  radius = typeof radius === 'number' ? radius : 0.5

  var cells = []
  var positions = []

  var origin = [ 0, 0, 0 ]
  var triangleSize = 0.025

  for (var i = 0, face = 0; i < count; i++) {
    var cell = [ face++, face++, face++ ]
    cells.push(cell)
    random(origin, radius)

    for (var x = 0; x < 3; x++) {
      var edge = random([], triangleSize)
      add(edge, edge, origin)
      positions.push(edge)
    }
  }

  return {
    cells: cells,
    positions: positions
  }
}
