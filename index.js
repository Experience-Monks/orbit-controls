var createTouch = require('touches')
var defined = require('defined')
var clamp = require('clamp')
var wheel = require('mouse-wheel')

var quatFromVec3 = require('quat-from-unit-vec3')
var quatInvert = require('gl-quat/invert')

var glVec3 = {
  add: require('gl-vec3/add'),
  subtract: require('gl-vec3/subtract'),
  transformQuat: require('gl-vec3/transformQuat'),
  copy: require('gl-vec3/copy'),
  normalize: require('gl-vec3/normalize'),
  cross: require('gl-vec3/cross')
}

var Y_UP = [0, 1, 0]
var EPSILON = 1e-10
var tmpVec3 = [0, 0, 0]

module.exports = createOrbitControls
function createOrbitControls (opt) {
  opt = opt || {}

  var inputDelta = [0, 0, 0] // x, y, zoom
  var offset = [0, 0, 0]
  var mouseStart = [0, 0]
  var dragging = false

  var upQuat = [0, 0, 0, 1]
  var upQuatInverse = upQuat.slice()

  var controls = {
    update: update,

    target: opt.target || [0, 0, 0],
    phi: opt.phi || 0,
    theta: opt.theta || 0,
    distance: defined(opt.distance, 1),
    element: opt.element,
    damping: defined(opt.damping, 0.25),
    rotateSpeed: defined(opt.rotateSpeed, 0.5),
    zoomSpeed: defined(opt.zoomSpeed, 0.01),

    phiBounds: opt.phiBounds || [0, Math.PI],
    thetaBounds: opt.thetaBounds || [-Infinity, Infinity],
    distanceBounds: opt.distanceBounds || [1, Infinity]
  }

  var touch = createTouch(window, {
    filtered: true, target: controls.element,
    preventSimulated: false
  })
  setupEvents()

  return controls

  function setupEvents () {
    touch.on('start', function (ev, pos) {
      dragging = true
      mouseStart = pos
    })

    touch.on('end', function () {
      dragging = false
    })

    touch.on('move', function (ev, end) {
      if (!dragging) return
      var dx = end[0] - mouseStart[0]
      var dy = end[1] - mouseStart[1]
      updateMouseMove(dx, dy)
      mouseStart[0] = end[0]
      mouseStart[1] = end[1]
    })

    wheel(function (dx, dy) {
      inputDelta[2] += dy * controls.zoomSpeed
    }, true)
  }

  function updateMouseMove (dx, dy) {
    var element = controls.element || window
    if (element === document ||
        element === window ||
        element === document.body) {
      element = document.documentElement
    }

    var width = element.clientWidth
    var height = element.clientHeight

    var PI2 = Math.PI * 2
    inputDelta[0] -= PI2 * dx / width * controls.rotateSpeed
    inputDelta[1] -= PI2 * dy / height * controls.rotateSpeed
  }

  function update (position, direction, up) {
    var cameraUp = up || Y_UP
    quatFromVec3(upQuat, cameraUp, Y_UP)
    quatInvert(upQuatInverse, upQuat)

    var distance = controls.distance

    glVec3.subtract(offset, position, controls.target)
    glVec3.transformQuat(offset, offset, upQuat)

    var theta = Math.atan2(offset[0], offset[2])
    var phi = Math.atan2(Math.sqrt(offset[0] * offset[0] + offset[2] * offset[2]), offset[1])

    theta += inputDelta[0]
    phi += inputDelta[1]

    theta = clamp(theta, controls.thetaBounds[0], controls.thetaBounds[1])
    phi = clamp(phi, controls.phiBounds[0], controls.phiBounds[1])
    phi = clamp(phi, EPSILON, Math.PI - EPSILON)

    distance += inputDelta[2]
    distance = clamp(distance, controls.distanceBounds[0], controls.distanceBounds[1])

    var radius = Math.abs(distance) <= EPSILON ? EPSILON : distance
    offset[0] = radius * Math.sin(phi) * Math.sin(theta)
    offset[1] = radius * Math.cos(phi)
    offset[2] = radius * Math.sin(phi) * Math.cos(theta)

    controls.phi = phi
    controls.theta = theta
    controls.distance = distance

    glVec3.transformQuat(offset, offset, upQuatInverse)
    glVec3.add(position, controls.target, offset)
    camLookAt(direction, cameraUp, position, controls.target)

    var damp = typeof controls.damping === 'number' ? controls.damping : 1
    for (var i = 0; i < inputDelta.length; i++) {
      inputDelta[i] *= 1 - damp
    }
  }
}

function camLookAt (direction, up, position, target) {
  glVec3.copy(direction, target)

  glVec3.subtract(direction, direction, position)
  glVec3.normalize(direction, direction)

  // right vector
  glVec3.cross(tmpVec3, direction, up)
  glVec3.normalize(tmpVec3, tmpVec3)
}
