/*
  An example with ThreeJS. This could be used
  as a modular (i.e. properly versioned) alternative
  to ThreeJS OrbitControls.
 */

var createApp = require('canvas-loop')
var THREE = require('three')

var controls = require('../')({
  distance: 5,
  // thetaBounds: [-0.5, 0.5],
})

var canvas = document.querySelector('.canvas')
var renderer = new THREE.WebGLRenderer({ canvas: canvas })

var target = new THREE.Vector3()
var scene = new THREE.Scene()
var camera = new THREE.PerspectiveCamera(50, 1, 0.01, 100)
camera.position.set(0, 1, 0)
camera.lookAt(target)

var geo = new THREE.TorusGeometry(1, 0.2)
var mat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  // map: THREE.ImageUtils.loadTexture('img/textire.jpg')
})
var box = new THREE.Mesh(geo, mat)
scene.add(box)

var app = createApp(canvas)
  .start()
  .on('tick', function () {
    var position = camera.position.toArray()
    var direction = target.toArray()
    controls.update(position, direction)
    camera.position.fromArray(position)
    camera.lookAt(target.fromArray(direction))

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
