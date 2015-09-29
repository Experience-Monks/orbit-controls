/*
  An example drawing 3D shapes by combining small
  modules and the Canvas2D API.
 */

var drawTriangles = require('draw-triangles-2d')
var createApp = require('canvas-loop')

var colors = [
  'hsl(80, 50%, 50%)',
  'hsl(180, 50%, 50%)'
]

// get a Canvas2D context
var canvas = document.querySelector('.canvas')
var ctx = require('2d-context')({ alpha: false, canvas: canvas })

// get a 3D mesh (any simplicial complex will work)
var mesh = require('primitive-torus')({
  minorSegments: 5,
  majorSegments: 6
})

// a convenience utility for basic 3D camera math
var camera = require('perspective-camera')({
  fov: 50 * Math.PI / 180,
  position: [0, 2, 0],
  near: 0.00001,
  far: 100,
})

// set up our input controls
var controls = require('../')({
  element: canvas,
  // phiBounds: [0.001, Infinity],
  thetaBounds: [-1.5, 1.5],
  distanceBounds: [2, 100],
  distance: 6,
  rotationSpeed: 1,
  pinchSpeed: 0.025
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
  drawMesh(ctx, camera, mesh)
  ctx.restore()
})

function drawMesh (ctx, camera, mesh) {
  // project the 3D points into 2D screen-space
  var positions = mesh.positions.map(function (point) {
    var pos = camera.project(point)
    pos[1] = app.shape[1] - pos[1] // use inverted Y like OpenGL
    return pos
  })

  var mid = Math.floor(mesh.cells.length / 2)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.lineWidth = 1.5

  ctx.beginPath()
  ctx.strokeStyle = colors[0]
  drawTriangles(ctx, positions, mesh.cells, 0, mid)
  ctx.stroke()

  ctx.beginPath()
  ctx.strokeStyle = colors[1]
  drawTriangles(ctx, positions, mesh.cells, mid)
  ctx.stroke()
}

function preventScroll () {
  canvas.addEventListener('touchstart', function (ev) {
    ev.preventDefault()
  })
}