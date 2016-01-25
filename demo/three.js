/*
  An example with ThreeJS. This could be used
  as a modular (i.e. properly versioned) alternative
  to ThreeJS OrbitControls.
 */

var createApp = require('canvas-loop')
var THREE = require('three')

var controls = require('../')({
  distance: 0,
  position: [ 0, 0, 0 ]
})

var canvas = document.querySelector('.canvas')
var renderer = new THREE.WebGLRenderer({ canvas: canvas })

var target = new THREE.Vector3()
var scene = new THREE.Scene()
var camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100)
camera.lookAt(target)

var geo = new THREE.SphereGeometry(1, 32, 32)
var mat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
  map: THREE.ImageUtils.loadTexture('demo/street.jpg')
})
var box = new THREE.Mesh(geo, mat)
scene.add(box)

var app = createApp(canvas)
  .start()
  .on('tick', function () {
    controls.update()
    camera.position.fromArray(controls.position)
    camera.up.fromArray(controls.up)
    camera.lookAt(target.fromArray(controls.direction))
    renderer.render(scene, camera)
  })
  .on('resize', resize)

function resize () {
  var width = app.shape[0]
  var height = app.shape[1]
  camera.aspect = width / height
  renderer.setSize(width, height)
  camera.updateProjectionMatrix()
}

resize()
