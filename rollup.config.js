// rollup.config.js
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import browserifyPlugin from 'rollup-plugin-browserify-transform'
import builtinsPlugin from 'rollup-plugin-node-builtins'
import es2020 from 'es2020'

export default [{
  input: 'index.js',
  output: {
    file: 'dist/orbit-controls.js',
    name: 'orbitControls',
    format: 'umd'
  },
  plugins: [
    builtinsPlugin(),
    nodeResolve({
      jsnext: true,
      main: true,
      browser: true
    }),
    commonjs(),
    browserifyPlugin(es2020),
  ]
}];
