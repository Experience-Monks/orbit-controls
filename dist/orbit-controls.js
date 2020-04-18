(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.orbitControls = factory());
}(this, (function () { 'use strict';

    var defined = function () {
        for (var i = 0; i < arguments.length; i++) {
            if (arguments[i] !== undefined) return arguments[i];
        }
    };

    var clamp_1 = clamp;

    function clamp(value, min, max) {
      return min < max ? value < min ? min : value > max ? max : value : value < max ? max : value > min ? min : value;
    }

    var parseUnit = function parseUnit(str, out) {
        if (!out) out = [0, ''];

        str = String(str);
        var num = parseFloat(str, 10);
        out[0] = num;
        out[1] = str.match(/[\d.\-\+]*\s*(.*)/)[1] || '';
        return out;
    };

    var topx = toPX;

    var PIXELS_PER_INCH = 96;

    function getPropertyInPX(element, prop) {
      var parts = parseUnit(getComputedStyle(element).getPropertyValue(prop));
      return parts[0] * toPX(parts[1], element);
    }

    //This brutal hack is needed
    function getSizeBrutal(unit, element) {
      var testDIV = document.createElement('div');
      testDIV.style['font-size'] = '128' + unit;
      element.appendChild(testDIV);
      var size = getPropertyInPX(testDIV, 'font-size') / 128;
      element.removeChild(testDIV);
      return size;
    }

    function toPX(str, element) {
      element = element || document.body;
      str = (str || 'px').trim().toLowerCase();
      if (element === window || element === document) {
        element = document.body;
      }
      switch (str) {
        case '%':
          //Ambiguous, not sure if we should use width or height
          return element.clientHeight / 100.0;
        case 'ch':
        case 'ex':
          return getSizeBrutal(str, element);
        case 'em':
          return getPropertyInPX(element, 'font-size');
        case 'rem':
          return getPropertyInPX(document.body, 'font-size');
        case 'vw':
          return window.innerWidth / 100;
        case 'vh':
          return window.innerHeight / 100;
        case 'vmin':
          return Math.min(window.innerWidth, window.innerHeight) / 100;
        case 'vmax':
          return Math.max(window.innerWidth, window.innerHeight) / 100;
        case 'in':
          return PIXELS_PER_INCH;
        case 'cm':
          return PIXELS_PER_INCH / 2.54;
        case 'mm':
          return PIXELS_PER_INCH / 25.4;
        case 'pt':
          return PIXELS_PER_INCH / 72;
        case 'pc':
          return PIXELS_PER_INCH / 6;
      }
      return 1;
    }

    var wheel = mouseWheelListen;

    function mouseWheelListen(element, callback, noScroll) {
      if (typeof element === 'function') {
        noScroll = !!callback;
        callback = element;
        element = window;
      }
      var lineHeight = topx('ex', element);
      var listener = function (ev) {
        if (noScroll) {
          ev.preventDefault();
        }
        var dx = ev.deltaX || 0;
        var dy = ev.deltaY || 0;
        var dz = ev.deltaZ || 0;
        var mode = ev.deltaMode;
        var scale = 1;
        switch (mode) {
          case 1:
            scale = lineHeight;
            break;
          case 2:
            scale = window.innerHeight;
            break;
        }
        dx *= scale;
        dy *= scale;
        dz *= scale;
        if (dx || dy || dz) {
          return callback(dx, dy, dz, ev);
        }
      };
      element.addEventListener('wheel', listener);
      return listener;
    }

    var rootPosition = { left: 0, top: 0 };

    var mouseEventOffset_1 = mouseEventOffset;
    function mouseEventOffset(ev, target, out) {
      target = target || ev.currentTarget || ev.srcElement;
      if (!Array.isArray(out)) {
        out = [0, 0];
      }
      var cx = ev.clientX || 0;
      var cy = ev.clientY || 0;
      var rect = getBoundingClientOffset(target);
      out[0] = cx - rect.left;
      out[1] = cy - rect.top;
      return out;
    }

    function getBoundingClientOffset(element) {
      if (element === window || element === document || element === document.body) {
        return rootPosition;
      } else {
        return element.getBoundingClientRect();
      }
    }

    var distance_1 = distance;

    /**
     * Calculates the euclidian distance between two vec2's
     *
     * @param {vec2} a the first operand
     * @param {vec2} b the second operand
     * @returns {Number} distance between a and b
     */
    function distance(a, b) {
        var x = b[0] - a[0],
            y = b[1] - a[1];
        return Math.sqrt(x * x + y * y);
    }

    var domain;

    // This constructor is used to store event handlers. Instantiating this is
    // faster than explicitly calling `Object.create(null)` to get a "clean" empty
    // object (tested with v8 v4.9).
    function EventHandlers() {}
    EventHandlers.prototype = Object.create(null);

    function EventEmitter() {
      EventEmitter.init.call(this);
    }

    // nodejs oddity
    // require('events') === require('events').EventEmitter
    EventEmitter.EventEmitter = EventEmitter;

    EventEmitter.usingDomains = false;

    EventEmitter.prototype.domain = undefined;
    EventEmitter.prototype._events = undefined;
    EventEmitter.prototype._maxListeners = undefined;

    // By default EventEmitters will print a warning if more than 10 listeners are
    // added to it. This is a useful default which helps finding memory leaks.
    EventEmitter.defaultMaxListeners = 10;

    EventEmitter.init = function () {
      this.domain = null;
      if (EventEmitter.usingDomains) {
        // if there is an active domain, then attach to it.
        if (domain.active ) ;
      }

      if (!this._events || this._events === Object.getPrototypeOf(this)._events) {
        this._events = new EventHandlers();
        this._eventsCount = 0;
      }

      this._maxListeners = this._maxListeners || undefined;
    };

    // Obviously not all Emitters should be limited to 10. This function allows
    // that to be increased. Set to zero for unlimited.
    EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
      if (typeof n !== 'number' || n < 0 || isNaN(n)) throw new TypeError('"n" argument must be a positive number');
      this._maxListeners = n;
      return this;
    };

    function $getMaxListeners(that) {
      if (that._maxListeners === undefined) return EventEmitter.defaultMaxListeners;
      return that._maxListeners;
    }

    EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
      return $getMaxListeners(this);
    };

    // These standalone emit* functions are used to optimize calling of event
    // handlers for fast cases because emit() itself often has a variable number of
    // arguments and can be deoptimized because of that. These functions always have
    // the same number of arguments and thus do not get deoptimized, so the code
    // inside them can execute faster.
    function emitNone(handler, isFn, self) {
      if (isFn) handler.call(self);else {
        var len = handler.length;
        var listeners = arrayClone(handler, len);
        for (var i = 0; i < len; ++i) {
          listeners[i].call(self);
        }
      }
    }
    function emitOne(handler, isFn, self, arg1) {
      if (isFn) handler.call(self, arg1);else {
        var len = handler.length;
        var listeners = arrayClone(handler, len);
        for (var i = 0; i < len; ++i) {
          listeners[i].call(self, arg1);
        }
      }
    }
    function emitTwo(handler, isFn, self, arg1, arg2) {
      if (isFn) handler.call(self, arg1, arg2);else {
        var len = handler.length;
        var listeners = arrayClone(handler, len);
        for (var i = 0; i < len; ++i) {
          listeners[i].call(self, arg1, arg2);
        }
      }
    }
    function emitThree(handler, isFn, self, arg1, arg2, arg3) {
      if (isFn) handler.call(self, arg1, arg2, arg3);else {
        var len = handler.length;
        var listeners = arrayClone(handler, len);
        for (var i = 0; i < len; ++i) {
          listeners[i].call(self, arg1, arg2, arg3);
        }
      }
    }

    function emitMany(handler, isFn, self, args) {
      if (isFn) handler.apply(self, args);else {
        var len = handler.length;
        var listeners = arrayClone(handler, len);
        for (var i = 0; i < len; ++i) {
          listeners[i].apply(self, args);
        }
      }
    }

    EventEmitter.prototype.emit = function emit(type) {
      var er, handler, len, args, i, events, domain;
      var doError = type === 'error';

      events = this._events;
      if (events) doError = doError && events.error == null;else if (!doError) return false;

      domain = this.domain;

      // If there is no 'error' event listener then throw.
      if (doError) {
        er = arguments[1];
        if (domain) {
          if (!er) er = new Error('Uncaught, unspecified "error" event');
          er.domainEmitter = this;
          er.domain = domain;
          er.domainThrown = false;
          domain.emit('error', er);
        } else if (er instanceof Error) {
          throw er; // Unhandled 'error' event
        } else {
          // At least give some kind of context to the user
          var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
          err.context = er;
          throw err;
        }
        return false;
      }

      handler = events[type];

      if (!handler) return false;

      var isFn = typeof handler === 'function';
      len = arguments.length;
      switch (len) {
        // fast cases
        case 1:
          emitNone(handler, isFn, this);
          break;
        case 2:
          emitOne(handler, isFn, this, arguments[1]);
          break;
        case 3:
          emitTwo(handler, isFn, this, arguments[1], arguments[2]);
          break;
        case 4:
          emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
          break;
        // slower
        default:
          args = new Array(len - 1);
          for (i = 1; i < len; i++) {
            args[i - 1] = arguments[i];
          }emitMany(handler, isFn, this, args);
      }

      return true;
    };

    function _addListener(target, type, listener, prepend) {
      var m;
      var events;
      var existing;

      if (typeof listener !== 'function') throw new TypeError('"listener" argument must be a function');

      events = target._events;
      if (!events) {
        events = target._events = new EventHandlers();
        target._eventsCount = 0;
      } else {
        // To avoid recursion in the case that type === "newListener"! Before
        // adding it to the listeners, first emit "newListener".
        if (events.newListener) {
          target.emit('newListener', type, listener.listener ? listener.listener : listener);

          // Re-assign `events` because a newListener handler could have caused the
          // this._events to be assigned to a new object
          events = target._events;
        }
        existing = events[type];
      }

      if (!existing) {
        // Optimize the case of one listener. Don't need the extra array object.
        existing = events[type] = listener;
        ++target._eventsCount;
      } else {
        if (typeof existing === 'function') {
          // Adding the second element, need to change to array.
          existing = events[type] = prepend ? [listener, existing] : [existing, listener];
        } else {
          // If we've already got an array, just append.
          if (prepend) {
            existing.unshift(listener);
          } else {
            existing.push(listener);
          }
        }

        // Check for listener leak
        if (!existing.warned) {
          m = $getMaxListeners(target);
          if (m && m > 0 && existing.length > m) {
            existing.warned = true;
            var w = new Error('Possible EventEmitter memory leak detected. ' + existing.length + ' ' + type + ' listeners added. ' + 'Use emitter.setMaxListeners() to increase limit');
            w.name = 'MaxListenersExceededWarning';
            w.emitter = target;
            w.type = type;
            w.count = existing.length;
            emitWarning(w);
          }
        }
      }

      return target;
    }
    function emitWarning(e) {
      typeof console.warn === 'function' ? console.warn(e) : console.log(e);
    }
    EventEmitter.prototype.addListener = function addListener(type, listener) {
      return _addListener(this, type, listener, false);
    };

    EventEmitter.prototype.on = EventEmitter.prototype.addListener;

    EventEmitter.prototype.prependListener = function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

    function _onceWrap(target, type, listener) {
      var fired = false;
      function g() {
        target.removeListener(type, g);
        if (!fired) {
          fired = true;
          listener.apply(target, arguments);
        }
      }
      g.listener = listener;
      return g;
    }

    EventEmitter.prototype.once = function once(type, listener) {
      if (typeof listener !== 'function') throw new TypeError('"listener" argument must be a function');
      this.on(type, _onceWrap(this, type, listener));
      return this;
    };

    EventEmitter.prototype.prependOnceListener = function prependOnceListener(type, listener) {
      if (typeof listener !== 'function') throw new TypeError('"listener" argument must be a function');
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

    // emits a 'removeListener' event iff the listener was removed
    EventEmitter.prototype.removeListener = function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      if (typeof listener !== 'function') throw new TypeError('"listener" argument must be a function');

      events = this._events;
      if (!events) return this;

      list = events[type];
      if (!list) return this;

      if (list === listener || list.listener && list.listener === listener) {
        if (--this._eventsCount === 0) this._events = new EventHandlers();else {
          delete events[type];
          if (events.removeListener) this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length; i-- > 0;) {
          if (list[i] === listener || list[i].listener && list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0) return this;

        if (list.length === 1) {
          list[0] = undefined;
          if (--this._eventsCount === 0) {
            this._events = new EventHandlers();
            return this;
          } else {
            delete events[type];
          }
        } else {
          spliceOne(list, position);
        }

        if (events.removeListener) this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

    EventEmitter.prototype.removeAllListeners = function removeAllListeners(type) {
      var listeners, events;

      events = this._events;
      if (!events) return this;

      // not listening for removeListener, no need to emit
      if (!events.removeListener) {
        if (arguments.length === 0) {
          this._events = new EventHandlers();
          this._eventsCount = 0;
        } else if (events[type]) {
          if (--this._eventsCount === 0) this._events = new EventHandlers();else delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        for (var i = 0, key; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = new EventHandlers();
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners) {
        // LIFO order
        do {
          this.removeListener(type, listeners[listeners.length - 1]);
        } while (listeners[0]);
      }

      return this;
    };

    EventEmitter.prototype.listeners = function listeners(type) {
      var evlistener;
      var ret;
      var events = this._events;

      if (!events) ret = [];else {
        evlistener = events[type];
        if (!evlistener) ret = [];else if (typeof evlistener === 'function') ret = [evlistener.listener || evlistener];else ret = unwrapListeners(evlistener);
      }

      return ret;
    };

    EventEmitter.listenerCount = function (emitter, type) {
      if (typeof emitter.listenerCount === 'function') {
        return emitter.listenerCount(type);
      } else {
        return listenerCount.call(emitter, type);
      }
    };

    EventEmitter.prototype.listenerCount = listenerCount;
    function listenerCount(type) {
      var events = this._events;

      if (events) {
        var evlistener = events[type];

        if (typeof evlistener === 'function') {
          return 1;
        } else if (evlistener) {
          return evlistener.length;
        }
      }

      return 0;
    }

    EventEmitter.prototype.eventNames = function eventNames() {
      return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
    };

    // About 1.5x faster than the two-arg version of Array#splice().
    function spliceOne(list, index) {
      for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1) {
        list[i] = list[k];
      }list.pop();
    }

    function arrayClone(arr, i) {
      var copy = new Array(i);
      while (i--) {
        copy[i] = arr[i];
      }return copy;
    }

    function unwrapListeners(arr) {
      var ret = new Array(arr.length);
      for (var i = 0; i < ret.length; ++i) {
        ret[i] = arr[i].listener || arr[i];
      }
      return ret;
    }

    var dprop = defaultProperty;

    function defaultProperty(get, set) {
      return {
        configurable: true,
        enumerable: true,
        get: get,
        set: set
      };
    }

    var EventEmitter$1 = EventEmitter.EventEmitter;

    var touchPinch_1 = touchPinch;
    function touchPinch(target) {
      target = target || window;

      var emitter = new EventEmitter$1();
      var fingers = [null, null];
      var activeCount = 0;

      var lastDistance = 0;
      var ended = false;
      var enabled = false;

      // some read-only values
      Object.defineProperties(emitter, {
        pinching: dprop(function () {
          return activeCount === 2;
        }),

        fingers: dprop(function () {
          return fingers;
        })
      });

      enable();
      emitter.enable = enable;
      emitter.disable = disable;
      emitter.indexOfTouch = indexOfTouch;
      return emitter;

      function indexOfTouch(touch) {
        var id = touch.identifier;
        for (var i = 0; i < fingers.length; i++) {
          if (fingers[i] && fingers[i].touch && fingers[i].touch.identifier === id) {
            return i;
          }
        }
        return -1;
      }

      function enable() {
        if (enabled) return;
        enabled = true;
        target.addEventListener('touchstart', onTouchStart, false);
        target.addEventListener('touchmove', onTouchMove, false);
        target.addEventListener('touchend', onTouchRemoved, false);
        target.addEventListener('touchcancel', onTouchRemoved, false);
      }

      function disable() {
        if (!enabled) return;
        enabled = false;
        activeCount = 0;
        fingers[0] = null;
        fingers[1] = null;
        lastDistance = 0;
        ended = false;
        target.removeEventListener('touchstart', onTouchStart, false);
        target.removeEventListener('touchmove', onTouchMove, false);
        target.removeEventListener('touchend', onTouchRemoved, false);
        target.removeEventListener('touchcancel', onTouchRemoved, false);
      }

      function onTouchStart(ev) {
        for (var i = 0; i < ev.changedTouches.length; i++) {
          var newTouch = ev.changedTouches[i];
          var id = newTouch.identifier;
          var idx = indexOfTouch(id);

          if (idx === -1 && activeCount < 2) {
            var first = activeCount === 0;

            // newest and previous finger (previous may be undefined)
            var newIndex = fingers[0] ? 1 : 0;
            var oldIndex = fingers[0] ? 0 : 1;
            var newFinger = new Finger();

            // add to stack
            fingers[newIndex] = newFinger;
            activeCount++;

            // update touch event & position
            newFinger.touch = newTouch;
            mouseEventOffset_1(newTouch, target, newFinger.position);

            var oldTouch = fingers[oldIndex] ? fingers[oldIndex].touch : undefined;
            emitter.emit('place', newTouch, oldTouch);

            if (!first) {
              var initialDistance = computeDistance();
              ended = false;
              emitter.emit('start', initialDistance);
              lastDistance = initialDistance;
            }
          }
        }
      }

      function onTouchMove(ev) {
        var changed = false;
        for (var i = 0; i < ev.changedTouches.length; i++) {
          var movedTouch = ev.changedTouches[i];
          var idx = indexOfTouch(movedTouch);
          if (idx !== -1) {
            changed = true;
            fingers[idx].touch = movedTouch; // avoid caching touches
            mouseEventOffset_1(movedTouch, target, fingers[idx].position);
          }
        }

        if (activeCount === 2 && changed) {
          var currentDistance = computeDistance();
          emitter.emit('change', currentDistance, lastDistance);
          lastDistance = currentDistance;
        }
      }

      function onTouchRemoved(ev) {
        for (var i = 0; i < ev.changedTouches.length; i++) {
          var removed = ev.changedTouches[i];
          var idx = indexOfTouch(removed);

          if (idx !== -1) {
            fingers[idx] = null;
            activeCount--;
            var otherIdx = idx === 0 ? 1 : 0;
            var otherTouch = fingers[otherIdx] ? fingers[otherIdx].touch : undefined;
            emitter.emit('lift', removed, otherTouch);
          }
        }

        if (!ended && activeCount !== 2) {
          ended = true;
          emitter.emit('end');
        }
      }

      function computeDistance() {
        if (activeCount < 2) return 0;
        return distance_1(fingers[0].position, fingers[1].position);
      }
    }

    function Finger() {
      this.position = [0, 0];
      this.touch = null;
    }

    var input = inputEvents;
    function inputEvents(opt) {
      var element = opt.element || window;
      var parent = opt.parent || element;
      var mouseStart = [0, 0];
      var dragging = false;
      var tmp = [0, 0];
      var tmp2 = [0, 0];
      var pinch;

      var zoomFn = opt.zoom;
      var rotateFn = opt.rotate;
      var pinchFn = opt.pinch;
      var mouseWheelListener;
      var enabled = false;
      enable();

      return {
        isDragging: function () {
          return dragging;
        },
        isPinching: isPinching,
        enable: enable,
        disable: disable
      };

      function enable() {
        if (enabled) return;
        enabled = true;
        if (zoomFn) {
          mouseWheelListener = wheel(element, function (dx, dy) {
            zoomFn(dy);
          }, true);
        }

        if (rotateFn) {
          element.addEventListener('mousedown', onInputDown, false);

          // for dragging to work outside canvas bounds,
          // mouse move/up events have to be added to parent, i.e. window
          parent.addEventListener('mousemove', onInputMove, false);
          parent.addEventListener('mouseup', onInputUp, false);
        }

        if (rotateFn || pinchFn) {
          pinch = touchPinch_1(element);

          // don't allow simulated mouse events
          element.addEventListener('touchstart', preventDefault, false);

          if (rotateFn) {
            element.addEventListener('touchmove', onTouchMove, false);
            pinch.on('place', onPinchPlace);
            pinch.on('lift', onPinchLift);
          }
          if (pinchFn) {
            pinch.on('change', onPinchChange);
          }
        }
      }

      function disable() {
        if (!enabled) return;
        enabled = false;
        if (mouseWheelListener) {
          element.removeEventListener('wheel', mouseWheelListener);
        }
        if (pinch) {
          pinch.disable();
          element.removeEventListener('touchstart', preventDefault, false);
          if (rotateFn) {
            element.removeEventListener('touchmove', onTouchMove, false);
          }
        }
        if (rotateFn) {
          parent.removeEventListener('mousedown', onInputDown, false);
          parent.removeEventListener('mousemove', onInputMove, false);
          parent.removeEventListener('mouseup', onInputUp, false);
        }
      }

      function preventDefault(ev) {
        ev.preventDefault();
      }

      function onTouchMove(ev) {
        if (!dragging || isPinching()) return;

        // find currently active finger
        for (var i = 0; i < ev.changedTouches.length; i++) {
          var changed = ev.changedTouches[i];
          var idx = pinch.indexOfTouch(changed);
          // if pinch is disabled but rotate enabled,
          // only allow first finger to affect rotation
          var allow = pinchFn ? idx !== -1 : idx === 0;
          if (allow) {
            onInputMove(changed);
            break;
          }
        }
      }

      function onPinchPlace(newFinger, lastFinger) {
        dragging = !isPinching();
        if (dragging) {
          var firstFinger = lastFinger || newFinger;
          onInputDown(firstFinger);
        }
      }

      function onPinchLift(lifted, remaining) {
        // if either finger is down, consider it dragging
        var sum = pinch.fingers.reduce(function (sum, item) {
          return sum + (item ? 1 : 0);
        }, 0);
        dragging = pinchFn && sum >= 1;

        if (dragging && remaining) {
          mouseEventOffset_1(remaining, element, mouseStart);
        }
      }

      function isPinching() {
        return pinch.pinching && pinchFn;
      }

      function onPinchChange(current, prev) {
        pinchFn(current - prev);
      }

      function onInputDown(ev) {
        mouseEventOffset_1(ev, element, mouseStart);
        if (insideBounds(mouseStart)) {
          dragging = true;
        }
      }

      function onInputUp() {
        dragging = false;
      }

      function onInputMove(ev) {
        var end = mouseEventOffset_1(ev, element, tmp);
        if (pinch && isPinching()) {
          mouseStart = end;
          return;
        }
        if (!dragging) return;
        var rect = getClientSize(tmp2);
        var dx = (end[0] - mouseStart[0]) / rect[0];
        var dy = (end[1] - mouseStart[1]) / rect[1];
        rotateFn(dx, dy);
        mouseStart[0] = end[0];
        mouseStart[1] = end[1];
      }

      function insideBounds(pos) {
        if (element === window || element === document || element === document.body) {
          return true;
        } else {
          var rect = element.getBoundingClientRect();
          return pos[0] >= 0 && pos[1] >= 0 && pos[0] < rect.width && pos[1] < rect.height;
        }
      }

      function getClientSize(out) {
        var source = element;
        if (source === window || source === document || source === document.body) {
          source = document.documentElement;
        }
        out[0] = source.clientWidth;
        out[1] = source.clientHeight;
        return out;
      }
    }

    var dot_1 = dot;

    /**
     * Calculates the dot product of two vec3's
     *
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @returns {Number} dot product of a and b
     */
    function dot(a, b) {
      return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    }

    var set_1 = set;

    /**
     * Set the components of a vec3 to the given values
     *
     * @param {vec3} out the receiving vector
     * @param {Number} x X component
     * @param {Number} y Y component
     * @param {Number} z Z component
     * @returns {vec3} out
     */
    function set(out, x, y, z) {
      out[0] = x;
      out[1] = y;
      out[2] = z;
      return out;
    }

    var normalize_1 = normalize;

    /**
     * Normalize a vec4
     *
     * @param {vec4} out the receiving vector
     * @param {vec4} a vector to normalize
     * @returns {vec4} out
     */
    function normalize(out, a) {
      var x = a[0],
          y = a[1],
          z = a[2],
          w = a[3];
      var len = x * x + y * y + z * z + w * w;
      if (len > 0) {
        len = 1 / Math.sqrt(len);
        out[0] = x * len;
        out[1] = y * len;
        out[2] = z * len;
        out[3] = w * len;
      }
      return out;
    }

    /**
     * Normalize a quat
     *
     * @param {quat} out the receiving quaternion
     * @param {quat} a quaternion to normalize
     * @returns {quat} out
     * @function
     */
    var normalize$1 = normalize_1;

    var cross_1 = cross;

    /**
     * Computes the cross product of two vec3's
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @returns {vec3} out
     */
    function cross(out, a, b) {
        var ax = a[0],
            ay = a[1],
            az = a[2],
            bx = b[0],
            by = b[1],
            bz = b[2];

        out[0] = ay * bz - az * by;
        out[1] = az * bx - ax * bz;
        out[2] = ax * by - ay * bx;
        return out;
    }

    // Original implementation:
    // http://lolengine.net/blog/2014/02/24/quaternion-from-two-vectors-final


    var tmp = [0, 0, 0];
    var EPS = 1e-6;

    var quatFromUnitVec3_1 = quatFromUnitVec3;
    function quatFromUnitVec3(out, a, b) {
      // assumes a and b are normalized
      var r = dot_1(a, b) + 1;
      if (r < EPS) {
        /* If u and v are exactly opposite, rotate 180 degrees
         * around an arbitrary orthogonal axis. Axis normalisation
         * can happen later, when we normalise the quaternion. */
        r = 0;
        if (Math.abs(a[0]) > Math.abs(a[2])) {
          set_1(tmp, -a[1], a[0], 0);
        } else {
          set_1(tmp, 0, -a[2], a[1]);
        }
      } else {
        /* Otherwise, build quaternion the standard way. */
        cross_1(tmp, a, b);
      }

      out[0] = tmp[0];
      out[1] = tmp[1];
      out[2] = tmp[2];
      out[3] = r;
      normalize$1(out, out);
      return out;
    }

    var invert_1 = invert;

    /**
     * Calculates the inverse of a quat
     *
     * @param {quat} out the receiving quaternion
     * @param {quat} a quat to calculate inverse of
     * @returns {quat} out
     */
    function invert(out, a) {
      var a0 = a[0],
          a1 = a[1],
          a2 = a[2],
          a3 = a[3],
          dot = a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3,
          invDot = dot ? 1.0 / dot : 0;

      // TODO: Would be faster to return [0,0,0,0] immediately if dot == 0

      out[0] = -a0 * invDot;
      out[1] = -a1 * invDot;
      out[2] = -a2 * invDot;
      out[3] = a3 * invDot;
      return out;
    }

    var length_1 = length;

    /**
     * Calculates the length of a vec3
     *
     * @param {vec3} a vector to calculate length of
     * @returns {Number} length of a
     */
    function length(a) {
        var x = a[0],
            y = a[1],
            z = a[2];
        return Math.sqrt(x * x + y * y + z * z);
    }

    var add_1 = add;

    /**
     * Adds two vec3's
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @returns {vec3} out
     */
    function add(out, a, b) {
      out[0] = a[0] + b[0];
      out[1] = a[1] + b[1];
      out[2] = a[2] + b[2];
      return out;
    }

    var subtract_1 = subtract;

    /**
     * Subtracts vector b from vector a
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the first operand
     * @param {vec3} b the second operand
     * @returns {vec3} out
     */
    function subtract(out, a, b) {
      out[0] = a[0] - b[0];
      out[1] = a[1] - b[1];
      out[2] = a[2] - b[2];
      return out;
    }

    var transformQuat_1 = transformQuat;

    /**
     * Transforms the vec3 with a quat
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the vector to transform
     * @param {quat} q quaternion to transform with
     * @returns {vec3} out
     */
    function transformQuat(out, a, q) {
        // benchmarks: http://jsperf.com/quaternion-transform-vec3-implementations

        var x = a[0],
            y = a[1],
            z = a[2],
            qx = q[0],
            qy = q[1],
            qz = q[2],
            qw = q[3],


        // calculate quat * vec
        ix = qw * x + qy * z - qz * y,
            iy = qw * y + qz * x - qx * z,
            iz = qw * z + qx * y - qy * x,
            iw = -qx * x - qy * y - qz * z;

        // calculate result * inverse quat
        out[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
        out[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
        out[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
        return out;
    }

    var copy_1 = copy;

    /**
     * Copy the values from one vec3 to another
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a the source vector
     * @returns {vec3} out
     */
    function copy(out, a) {
      out[0] = a[0];
      out[1] = a[1];
      out[2] = a[2];
      return out;
    }

    var normalize_1$1 = normalize$2;

    /**
     * Normalize a vec3
     *
     * @param {vec3} out the receiving vector
     * @param {vec3} a vector to normalize
     * @returns {vec3} out
     */
    function normalize$2(out, a) {
        var x = a[0],
            y = a[1],
            z = a[2];
        var len = x * x + y * y + z * z;
        if (len > 0) {
            //TODO: evaluate use of glm_invsqrt here?
            len = 1 / Math.sqrt(len);
            out[0] = a[0] * len;
            out[1] = a[1] * len;
            out[2] = a[2] * len;
        }
        return out;
    }

    var glVec3 = {
      length: length_1,
      add: add_1,
      subtract: subtract_1,
      transformQuat: transformQuat_1,
      copy: copy_1,
      normalize: normalize_1$1,
      cross: cross_1
    };

    var Y_UP = [0, 1, 0];
    var EPSILON = Math.pow(2, -23);
    var tmpVec3 = [0, 0, 0];

    var orbitControls = createOrbitControls;
    function createOrbitControls(opt) {
      opt = opt || {};

      var inputDelta = [0, 0, 0]; // x, y, zoom
      var offset = [0, 0, 0];

      var upQuat = [0, 0, 0, 1];
      var upQuatInverse = upQuat.slice();
      var _phi = defined(opt.phi, Math.PI / 2);
      var _theta = opt.theta || 0;

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

        // Compute distance if not defined in user options
      };if (typeof opt.distance !== 'number') {
        glVec3.subtract(tmpVec3, controls.position, controls.target);
        controls.distance = glVec3.length(tmpVec3);
      }

      var input$1 = input({
        parent: opt.parent || window,
        element: opt.element,
        rotate: opt.rotate !== false ? inputRotate : null,
        zoom: opt.zoom !== false ? inputZoom : null,
        pinch: opt.pinch !== false ? inputPinch : null
      });

      controls.enable = input$1.enable;
      controls.disable = input$1.disable;

      Object.defineProperties(controls, {
        phi: {
          get: function () {
            return _phi;
          },
          set: function (v) {
            _phi = v;
            applyPhiTheta();
          }
        },
        theta: {
          get: function () {
            return _theta;
          },
          set: function (v) {
            _theta = v;
            applyPhiTheta();
          }
        },
        dragging: {
          get: function () {
            return input$1.isDragging();
          }
        },
        pinching: {
          get: function () {
            return input$1.isPinching();
          }
        }
      });

      // Apply an initial phi and theta
      applyPhiTheta();

      return controls;

      function inputRotate(dx, dy) {
        var PI2 = Math.PI * 2;
        inputDelta[0] -= PI2 * dx * controls.rotateSpeed;
        inputDelta[1] -= PI2 * dy * controls.rotateSpeed;
      }

      function inputZoom(delta) {
        inputDelta[2] += delta * controls.zoomSpeed;
      }

      function inputPinch(delta) {
        inputDelta[2] -= delta * controls.pinchSpeed;
      }

      function updateDirection() {
        var cameraUp = controls.up || Y_UP;
        quatFromUnitVec3_1(upQuat, cameraUp, Y_UP);
        invert_1(upQuatInverse, upQuat);

        var distance = controls.distance;

        glVec3.subtract(offset, controls.position, controls.target);
        glVec3.transformQuat(offset, offset, upQuat);

        var theta = Math.atan2(offset[0], offset[2]);
        var phi = Math.atan2(Math.sqrt(offset[0] * offset[0] + offset[2] * offset[2]), offset[1]);

        theta += inputDelta[0];
        phi += inputDelta[1];

        theta = clamp_1(theta, controls.thetaBounds[0], controls.thetaBounds[1]);
        phi = clamp_1(phi, controls.phiBounds[0], controls.phiBounds[1]);
        phi = clamp_1(phi, EPSILON, Math.PI - EPSILON);

        distance += inputDelta[2];
        distance = clamp_1(distance, controls.distanceBounds[0], controls.distanceBounds[1]);

        var radius = Math.abs(distance) <= EPSILON ? EPSILON : distance;
        offset[0] = radius * Math.sin(phi) * Math.sin(theta);
        offset[1] = radius * Math.cos(phi);
        offset[2] = radius * Math.sin(phi) * Math.cos(theta);

        _phi = phi;
        _theta = theta;
        controls.distance = distance;

        glVec3.transformQuat(offset, offset, upQuatInverse);
        glVec3.add(controls.position, controls.target, offset);
        camLookAt(controls.direction, cameraUp, controls.position, controls.target);
      }

      function update() {
        updateDirection();
        var damp = typeof controls.damping === 'number' ? controls.damping : 1;
        for (var i = 0; i < inputDelta.length; i++) {
          inputDelta[i] *= 1 - damp;
        }
      }

      function copyInto(position, direction, up) {
        if (position) glVec3.copy(position, controls.position);
        if (direction) glVec3.copy(direction, controls.direction);
        if (up) glVec3.copy(up, controls.up);
      }

      function applyPhiTheta() {
        var phi = controls.phi;
        var theta = controls.theta;
        theta = clamp_1(theta, controls.thetaBounds[0], controls.thetaBounds[1]);
        phi = clamp_1(phi, controls.phiBounds[0], controls.phiBounds[1]);
        phi = clamp_1(phi, EPSILON, Math.PI - EPSILON);

        var dist = Math.max(EPSILON, controls.distance);
        controls.position[0] = dist * Math.sin(phi) * Math.sin(theta);
        controls.position[1] = dist * Math.cos(phi);
        controls.position[2] = dist * Math.sin(phi) * Math.cos(theta);
        glVec3.add(controls.position, controls.position, controls.target);

        updateDirection();
      }
    }

    function camLookAt(direction, up, position, target) {
      glVec3.copy(direction, target);
      glVec3.subtract(direction, direction, position);
      glVec3.normalize(direction, direction);
    }

    return orbitControls;

})));
