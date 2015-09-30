/*
  An example drawing 3D shapes by combining small
  modules and the Canvas2D API.
 */

var drawTriangles = require('draw-triangles-2d')
var createApp = require('canvas-loop')
var createTorus = require('primitive-torus')
var createConfetti = require('./confetti-mesh')
var clamp = require('clamp')

var colors = [
  'hsl(80, 50%, 50%)',
  'hsl(380, 50%, 50%)',
  'hsl(180, 50%, 50%)',
]

// get a Canvas2D context
var canvas = document.querySelector('.canvas')
var ctx = canvas.getContext('2d', { alpha: false })

// disable right-click
canvas.oncontextmenu = function () {
  return false
}

// set up our 3D scene (a list of 3D meshes)
var meshes = [
  createTorus({
    majorRadius: 0.3,
    minorRadius: 0.05,
    majorSegments: 4,
    minorSegments: 3
  }),
  createConfetti(25, 0.5),
  createConfetti(15, 0.75)
]

// a convenience utility for basic 3D camera math
var camera = require('perspective-camera')({
  fov: 50 * Math.PI / 180,
  position: [0, 0, 1],
  near: 0.00001,
  far: 100,
})

// set up our input controls
var controls = require('../')({
  element: canvas,
  distanceBounds: [1.5, 100],
  distance: 2
})

preventScroll()

// create a full-screen render loop for our canvas
var app = createApp(canvas, {
  scale: window.devicePixelRatio
}).start()

app.on('tick', function () {
  var width = app.shape[0]
  var height = app.shape[1]

  // update controls and easings
  controls.update(camera.position, camera.direction, camera.up)

  // update camera viewport and matrices
  var viewport = [0, 0, width, height]
  camera.viewport = viewport
  camera.update()
  
  // draw our mesh
  ctx.save()
  ctx.scale(app.scale, app.scale)

  ctx.fillStyle = '#1B1B23'
  ctx.fillRect(0, 0, width, height)
  
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.lineWidth = clamp(1.5 / controls.distance, 0.25, 2)

  meshes.forEach(function (mesh, i) {
    ctx.strokeStyle = colors[i % colors.length]
    // console.log(mesh)
    drawMesh(ctx, camera, mesh)    
  })
  ctx.restore()
})

function drawMesh (ctx, camera, mesh) {
  // project the 3D points into 2D screen-space
  var positions = mesh.positions.map(function (point) {
    var pos = camera.project(point)
    pos[1] = app.shape[1] - pos[1] // use inverted Y like OpenGL
    return pos
  })

  ctx.beginPath()
  drawTriangles(ctx, positions, mesh.cells)
  ctx.stroke()
}

function preventScroll () {
  canvas.addEventListener('touchstart', function (ev) {
    ev.preventDefault()
  })
}