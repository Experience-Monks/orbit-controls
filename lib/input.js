var mouseWheel = require('mouse-wheel')
var eventOffset = require('mouse-event-offset')
var createPinch = require('touch-pinch')

module.exports = inputEvents
function inputEvents (opt) {
  var element = opt.element || window
  var parent = opt.parent || element
  var mouseStart = [0, 0]
  var dragging = false
  var tmp = [0, 0]
  var tmp2 = [0, 0]
  var pinch

  var zoomFn = opt.zoom
  var rotateFn = opt.rotate
  var pinchFn = opt.pinch
  var mouseWheelListener
  var enabled = false
  enable()

  return {
    isDragging: function () {
      return dragging
    },
    isPinching: isPinching,
    enable: enable,
    disable: disable
  }

  function enable () {
    if (enabled) return
    enabled = true
    if (zoomFn) {
      mouseWheelListener = mouseWheel(element, function (dx, dy) {
        zoomFn(dy)
      }, true)
    }

    if (rotateFn) {
      element.addEventListener('mousedown', onInputDown, false)

      // for dragging to work outside canvas bounds,
      // mouse move/up events have to be added to parent, i.e. window
      parent.addEventListener('mousemove', onInputMove, false)
      parent.addEventListener('mouseup', onInputUp, false)
    }

    if (rotateFn || pinchFn) {
      pinch = createPinch(element)

      // don't allow simulated mouse events
      element.addEventListener('touchstart', preventDefault, false)

      if (rotateFn) {
        element.addEventListener('touchmove', onTouchMove, false)
        pinch.on('place', onPinchPlace)
        pinch.on('lift', onPinchLift)
      }
      if (pinchFn) {
        pinch.on('change', onPinchChange)
      }
    }
  }

  function disable () {
    if (!enabled) return
    enabled = false
    if (mouseWheelListener) {
      element.removeEventListener('wheel', mouseWheelListener)
    }
    if (pinch) {
      pinch.disable()
      element.removeEventListener('touchstart', preventDefault, false)
      if (rotateFn) {
        element.removeEventListener('touchmove', onTouchMove, false)
      }
    }
    if (rotateFn) {
      parent.removeEventListener('mousedown', onInputDown, false)
      parent.removeEventListener('mousemove', onInputMove, false)
      parent.removeEventListener('mouseup', onInputUp, false)
    }
  }

  function preventDefault (ev) {
    ev.preventDefault()
  }

  function onTouchMove (ev) {
    if (!dragging || isPinching()) return

    // find currently active finger
    for (var i = 0; i < ev.changedTouches.length; i++) {
      var changed = ev.changedTouches[i]
      var idx = pinch.indexOfTouch(changed)
      // if pinch is disabled but rotate enabled,
      // only allow first finger to affect rotation
      var allow = pinchFn ? idx !== -1 : idx === 0
      if (allow) {
        onInputMove(changed)
        break
      }
    }
  }

  function onPinchPlace (newFinger, lastFinger) {
    dragging = !isPinching()
    if (dragging) {
      var firstFinger = lastFinger || newFinger
      onInputDown(firstFinger)
    }
  }

  function onPinchLift (lifted, remaining) {
    // if either finger is down, consider it dragging
    var sum = pinch.fingers.reduce(function (sum, item) {
      return sum + (item ? 1 : 0)
    }, 0)
    dragging = pinchFn && sum >= 1

    if (dragging && remaining) {
      eventOffset(remaining, element, mouseStart)
    }
  }

  function isPinching () {
    return pinch.pinching && pinchFn
  }

  function onPinchChange (current, prev) {
    pinchFn(current - prev)
  }

  function onInputDown (ev) {
    eventOffset(ev, element, mouseStart)
    if (insideBounds(mouseStart)) {
      dragging = true
    }
  }

  function onInputUp () {
    dragging = false
  }

  function onInputMove (ev) {
    var end = eventOffset(ev, element, tmp)
    if (pinch && isPinching()) {
      mouseStart = end
      return
    }
    if (!dragging) return
    var rect = getClientSize(tmp2)
    var dx = (end[0] - mouseStart[0]) / rect[0]
    var dy = (end[1] - mouseStart[1]) / rect[1]
    rotateFn(dx, dy)
    mouseStart[0] = end[0]
    mouseStart[1] = end[1]
  }

  function insideBounds (pos) {
    if (element === window ||
        element === document ||
        element === document.body) {
      return true
    } else {
      var rect = element.getBoundingClientRect()
      return pos[0] >= 0 && pos[1] >= 0 &&
        pos[0] < rect.width && pos[1] < rect.height
    }
  }

  function getClientSize (out) {
    var source = element
    if (source === window ||
        source === document ||
        source === document.body) {
      source = document.documentElement
    }
    out[0] = source.clientWidth
    out[1] = source.clientHeight
    return out
  }
}
