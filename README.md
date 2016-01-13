# orbit-controls

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

#### experimental / in development

Generic controls for orbiting a target in 3D. Can be used to control a camera, a 3D ray, or anything with `{ position, direction }`.

Features:

- zooms on mouse wheel
- values are smoothed with damping
- intuitive orbiting; roll is locked
- modular and un-opinionated; can be used in any render engine

Roadmap:

- zoom on two-touch pinch

Can be used with any camera abstraction that uses `position` and `direction` to form the view matrix, including ThreeJS, Babylon, stackgl, etc. 

Well-suited alongside [perspective-camera](https://github.com/Jam3/perspective-camera).

## Example

```js
var controls = require('orbit-controls')()

function tick () {
  controls.update(camera.position, camera.direction, camera.up)
}
```

## Usage

[![NPM](https://nodei.co/npm/orbit-controls.png)](https://www.npmjs.com/package/orbit-controls)

#### `controls = createControls([opts])`

- `target` the center of the orbit, default `[0, 0, 0]`
- `phi` the initial rotation in radians, phi in spherical coordinates, default `0`
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
- `distanceBounds` the bounds of the distance, default `[1, Infinity]`
- `parent` the parent element, default `window`
- `element` the element, default `window`

## methods

#### `controls.update(position, direction, up)`

Use the controls to update a camera's position vector, direction vector, and up vector.

## properties

#### `target`

The vec3 center of the orbit

#### `phi`, `theta`

The initial rotation in radians, in spherical coordinates

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

## License

MIT, see [LICENSE.md](http://github.com/Jam3/orbit-controls/blob/master/LICENSE.md) for details.
