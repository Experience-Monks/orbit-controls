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

## License

MIT, see [LICENSE.md](http://github.com/Jam3/orbit-controls/blob/master/LICENSE.md) for details.
