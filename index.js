var defined = require('defined')
var clamp = require('clamp')

var inputEvents = require('./lib/input')
var quatFromVec3 = require('quat-from-unit-vec3')
var quatInvert = require('gl-quat/invert')

var glVec3 = {
  length: require('gl-vec3/length'),
  add: require('gl-vec3/add'),
  subtract: require('gl-vec3/subtract'),
  transformQuat: require('gl-vec3/transformQuat'),
  copy: require('gl-vec3/copy'),
  normalize: require('gl-vec3/normalize'),
  cross: require('gl-vec3/cross')
}

var Y_UP = [0, 1, 0]
var EPSILON = Math.pow(2, -23)
var tmpVec3 = [0, 0, 0]

module.exports = createOrbitControls
function createOrbitControls (opt) {
  opt = opt || {}

  var inputDelta = [0, 0, 0] // x, y, zoom
  var offset = [0, 0, 0]

  var upQuat = [0, 0, 0, 1]
  var upQuatInverse = upQuat.slice()
  var _phi = defined(opt.phi, Math.PI / 2)
  var _theta = opt.theta || 0

  var controls = {
    update: update,
    copyInto: copyInto,

    position: opt.position ? opt.position.slice() : [0, 0, 1],
    direction: [0, 0, -1],
    up: opt.up ? opt.up.slice() : [0, 1, 0],

    target: opt.target ? opt.target.slice() : [0, 0, 0],
    distance: defined(opt.distance, 1),
    damping: defined(opt.damping, 0.25),
    rotateSpeed: defined(opt.rotateSpeed, 0.28),
    zoomSpeed: defined(opt.zoomSpeed, 0.0075),
    pinchSpeed: defined(opt.pinchSpeed, 0.0075),

    pinch: opt.pinching !== false,
    zoom: opt.zoom !== false,
    rotate: opt.rotate !== false,

    phiBounds: opt.phiBounds || [0, Math.PI],
    thetaBounds: opt.thetaBounds || [-Infinity, Infinity],
    distanceBounds: opt.distanceBounds || [0, Infinity]
  }

  // Compute distance if not defined in user options
  if (typeof opt.distance !== 'number') {
    glVec3.subtract(tmpVec3, controls.position, controls.target)
    controls.distance = glVec3.length(tmpVec3)
  }

  var input = inputEvents({
    parent: opt.parent || window,
    element: opt.element,
    rotate: opt.rotate !== false ? inputRotate : null,
    zoom: opt.zoom !== false ? inputZoom : null,
    pinch: opt.pinch !== false ? inputPinch : null
  })

  controls.enable = input.enable
  controls.disable = input.disable

  Object.defineProperties(controls, {
    phi: {
      get: function () { return _phi },
      set: function (v) {
        _phi = v
        applyPhiTheta()
      }
    },
    theta: {
      get: function () { return _theta },
      set: function (v) {
        _theta = v
        applyPhiTheta()
      }
    },
    dragging: {
      get: function () { return input.isDragging() }
    },
    pinching: {
      get: function () { return input.isPinching() }
    }
  })

  // Apply an initial phi and theta
  applyPhiTheta()

  return controls

  function inputRotate (dx, dy) {
    var PI2 = Math.PI * 2
    inputDelta[0] -= PI2 * dx * controls.rotateSpeed
    inputDelta[1] -= PI2 * dy * controls.rotateSpeed
  }

  function inputZoom (delta) {
    inputDelta[2] += delta * controls.zoomSpeed
  }

  function inputPinch (delta) {
    inputDelta[2] -= delta * controls.pinchSpeed
  }

  function updateDirection () {
    var cameraUp = controls.up || Y_UP
    quatFromVec3(upQuat, cameraUp, Y_UP)
    quatInvert(upQuatInverse, upQuat)

    var distance = controls.distance

    glVec3.subtract(offset, controls.position, controls.target)
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

    _phi = phi
    _theta = theta
    controls.distance = distance

    glVec3.transformQuat(offset, offset, upQuatInverse)
    glVec3.add(controls.position, controls.target, offset)
    camLookAt(controls.direction, cameraUp, controls.position, controls.target)
  }

  function update () {
    updateDirection()
    var damp = typeof controls.damping === 'number' ? controls.damping : 1
    for (var i = 0; i < inputDelta.length; i++) {
      inputDelta[i] *= 1 - damp
    }
  }

  function copyInto (position, direction, up) {
    if (position) glVec3.copy(position, controls.position)
    if (direction) glVec3.copy(direction, controls.direction)
    if (up) glVec3.copy(up, controls.up)
  }

  function applyPhiTheta () {
    var phi = controls.phi
    var theta = controls.theta
    theta = clamp(theta, controls.thetaBounds[0], controls.thetaBounds[1])
    phi = clamp(phi, controls.phiBounds[0], controls.phiBounds[1])
    phi = clamp(phi, EPSILON, Math.PI - EPSILON)

    var dist = Math.max(EPSILON, controls.distance)
    controls.position[0] = dist * Math.sin(phi) * Math.sin(theta)
    controls.position[1] = dist * Math.cos(phi)
    controls.position[2] = dist * Math.sin(phi) * Math.cos(theta)
    glVec3.add(controls.position, controls.position, controls.target)

    updateDirection()
  }
}

function camLookAt (direction, up, position, target) {
  glVec3.copy(direction, target)
  glVec3.subtract(direction, direction, position)
  glVec3.normalize(direction, direction)
}
