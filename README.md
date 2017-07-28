# orbit-controls

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

<img src="http://i.imgur.com/d3vtXo1.png" width="75%" />  

<sup>[(demo)](http://jam3.github.io/orbit-controls/demo/canvas.html) – [(source)](./demo/canvas.js)</sup>

Generic controls for orbiting a target in 3D. Can be used to control a camera, a 3D ray, or anything with `{ position, direction }`.

Features:

- zooms on mouse wheel
- values are smoothed with damping
- intuitive orbiting; roll is locked
- modular and un-opinionated; can be used in any render engine
- zooming with two-touch pinch

Roadmap:

- panning with two fingers / right mouse button

Can be used with any camera abstraction that uses `position` and `direction` to form the view matrix, including ThreeJS, Babylon, stackgl, etc. 

Well-suited alongside [perspective-camera](https://github.com/Jam3/perspective-camera).

> *Note:* This module is still in development.

## Example

```js
var controls = require('orbit-controls')()

function tick () {
  controls.update()
  controls.copyInto(camera.position, camera.direction, camera.up)
}
```

## Demos

- [Canvas](http://jam3.github.io/orbit-controls/demo/canvas.html)
- [WebGL (StreetView)](http://jam3.github.io/orbit-controls/demo/three.html)

## Usage

[![NPM](https://nodei.co/npm/orbit-controls.png)](https://www.npmjs.com/package/orbit-controls)

#### `controls = createControls([opts])`

- `position` the initial position of the camera, default `[0, 0, 1]`
- `up` the initial direction of the camera, default `[0, 1, 0]`
- `target` the center of the orbit, default `[0, 0, 0]`
- `phi` the initial rotation in radians, phi in spherical coordinates, default `Math.PI/2`
- `theta` the initial rotation in radians, theta in spherical coordinates, default `0`
- `distance` the distance from the target, default `1`
- `damping` how fast the controls slow down, between `0` and `1`, default `0.25`
- `rotateSpeed` the speed of the rotation, default `0.28`
- `zoomSpeed` the speed of the zoom, default `0.0075`
- `pinchSpeed` (coming soon) the speed of the pinch, default `0.0075`
- `pinch` (coming soon) enable pinching, default `true`
- `zoom` enable zooming, default `true`
- `rotate` enable rotating, default `true`
- `phiBounds` the bounds of the phi rotation, default `[0, Math.PI]`
- `thetaBounds` the bounds of the theta rotation, default `[-Infinity, Infinity]`
- `distanceBounds` the bounds of the distance, default `[0, Infinity]`
- `parent` the parent element, default `window`
- `element` the element, default `window`

## methods

#### `controls.update()`

Update the internal position, direction, and up vectors that represent the camera.

#### `controls.copyInto(position, direction, up)`

Apply the control's current state to a target camera.

This is purely for convenience; you can also copy the `controls.position` and other members manually.

#### `controls.enable()`

Enables the DOM events and input, attaching new mouse and touch events. If already enabled, this function does nothing.

#### `controls.disable()`

Disables the DOM events and input, detaching all events. If already disabled, this function does nothing.

## properties

#### `position`, `direction`, `up`

Vector arrays `[x, y, z]` that represent the camera controls. These are typically copied into your camera interface with:

```js
var camera = new MyPerspectiveCamera()
controls.copyInto(camera.position, camera.direction, camera.up)
````

#### `target`

The vec3 center of the orbit

#### `phi`, `theta`

The initial rotation in radians, in spherical coordinates. Changing either will re-calculate the direction.

#### `distance`

The distance from the target, default `1`

#### `damping`

How fast the controls slow down, between `0` and `1`, default `0.25`

#### `rotateSpeed`, `zoomSpeed`, `pinchSpeed`

The speed of the controls.

#### `pinch`, `zoom`, `rotate`

Enable pinch, zoom, and rotate

#### `phiBounds`, `thetaBounds`, `distanceBounds`

The bounds of the controls

#### `dragging` (read-only)

Returns true if the user is currently dragging the controls.

#### `pinching` (read-only)

Returns true if the user is currently pinching (zooming on mobile) the controls.

## License

MIT, see [LICENSE.md](http://github.com/Jam3/orbit-controls/blob/master/LICENSE.md) for details.
