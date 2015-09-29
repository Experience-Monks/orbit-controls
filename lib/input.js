var mouseWheel = require('mouse-wheel')
var eventOffset = require('mouse-event-offset')
var createPinch = require('touch-pinch')

module.exports = inputEvents
function inputEvents (opt) {
  var element = opt.element || window
  var source = opt.parent || element
  var mouseStart = [0, 0]
  var dragging = false
  var tmp = [0, 0]
  var tmp2 = [0, 0]
  var pinch
  
  var zoomFn = opt.zoom
  var rotateFn = opt.rotate
  var pinchFn = opt.pinch
  
  if (zoomFn) {
    mouseWheel(element, function (dx, dy) {
      zoomFn(dy)
    }, true)
  }
  
  if (rotateFn) {
    source.addEventListener('mousedown', onInputDown)
    source.addEventListener('mousemove', onInputMove)
    source.addEventListener('mouseup', onInputUp)
  }
  
  if (rotateFn || pinchFn) {
    pinch = createPinch(source, element)
    
    // don't allow simulated mouse events
    source.addEventListener('touchstart', preventDefault)
    
    if (rotateFn) touchRotate()
    if (pinchFn) touchPinch()
  }

  function preventDefault (ev) {
    ev.preventDefault()
  }
  
  function touchRotate () {
    source.addEventListener('touchmove', function (ev) {
      if (!dragging || pinch.pinching) return
        
      // find currently active finger
      for (var i=0; i<ev.changedTouches.length; i++) {
        var changed = ev.changedTouches[i]
        var idx = pinch.identifiers.indexOf(changed.identifier)
        if (idx !== -1) {
          onInputMove(changed)
          break
        }
      }
    })
    
    pinch.on('place', function () {
      dragging = !pinch.pinching
      if (dragging) {
        onInputDown(pinch.touches[0])
      }
    })
    
    pinch.on('lift', function (lifted, remaining) {
      dragging = !pinch.pinching
      if (dragging && remaining) {
        eventOffset(remaining, element, mouseStart)
      }
    })
  }
  
  function touchPinch () {
    var lastPinch = 0
    
    pinch.on('start', function (start) {
      lastPinch = start
    })
    
    pinch.on('move', function (current) {
      pinchFn(current - lastPinch)
      lastPinch = current
    })
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
    if (pinch && pinch.pinching) {
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
