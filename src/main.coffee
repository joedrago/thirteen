# This file provides the rendering engine for the web version. None of this code is included in the Java version.

console.log 'web startup'

Game = require './Game'

# taken from http:#stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
componentToHex = (c) ->
  hex = Math.floor(c * 255).toString(16)
  return if hex.length == 1 then "0" + hex else hex
rgbToHex = (r, g, b) ->
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b)

SAVE_TIMER_MS = 3000

class NativeApp
  constructor: (@screen, @width, @height) ->
    @tintedTextureCache = []
    @lastTime = new Date().getTime()
    @lastInteractTime = new Date().getTime()
    @heardOneTouch = false
    @touchMouse = null
    window.addEventListener 'mousedown',  @onMouseDown.bind(this), false
    window.addEventListener 'mousemove',  @onMouseMove.bind(this), false
    window.addEventListener 'mouseup',    @onMouseUp.bind(this), false
    window.addEventListener 'touchstart', @onTouchStart.bind(this), false
    window.addEventListener 'touchmove',  @onTouchMove.bind(this), false
    window.addEventListener 'touchend',   @onTouchEnd.bind(this), false
    @context = @screen.getContext("2d")
    @textures = [
      # all card art
      "../images/cards.png"
      # fonts
      "../images/darkforest.png"
      # characters / other
      "../images/chars.png"
      # help
      "../images/howto1.png"
      "../images/howto2.png"
      "../images/howto3.png"
    ]

    @game = new Game(this, @width, @height)

    if typeof Storage != "undefined"
      state = localStorage.getItem "state"
      if state
        # console.log "loading state: #{state}"
        @game.load state

    @pendingImages = 0
    loadedTextures = []
    for imageUrl in @textures
      @pendingImages++
      console.log "loading image #{@pendingImages}: #{imageUrl}"
      img = new Image()
      img.onload = @onImageLoaded.bind(this)
      img.src = imageUrl
      loadedTextures.push img
    @textures = loadedTextures

    @saveTimer = SAVE_TIMER_MS

  onImageLoaded: (info) ->
    @pendingImages--
    if @pendingImages == 0
      console.log 'All images loaded. Beginning render loop.'
      requestAnimationFrame => @update()

  log: (s) ->
    console.log "NativeApp.log(): #{s}"

  updateSave: (dt) ->
    return if typeof Storage == "undefined"
    @saveTimer -= dt
    if @saveTimer <= 0
      @saveTimer = SAVE_TIMER_MS
      state = @game.save()
      # console.log "saving: #{state}"
      localStorage.setItem "state", state

  generateTintImage: (textureIndex, red, green, blue) ->
    img = @textures[textureIndex]
    buff = document.createElement "canvas"
    buff.width  = img.width
    buff.height = img.height

    ctx = buff.getContext "2d"
    ctx.globalCompositeOperation = 'copy'
    ctx.drawImage(img, 0, 0)
    fillColor = "rgb(#{Math.floor(red*255)}, #{Math.floor(green*255)}, #{Math.floor(blue*255)})"
    ctx.fillStyle = fillColor
    console.log "fillColor #{fillColor}"
    ctx.globalCompositeOperation = 'multiply'
    ctx.fillRect(0, 0, buff.width, buff.height)
    ctx.globalCompositeOperation = 'copy'
    ctx.globalAlpha = 1.0
    ctx.globalCompositeOperation = 'destination-in'
    ctx.drawImage(img, 0, 0)

    imgComp = new Image()
    imgComp.src = buff.toDataURL()
    return imgComp

  drawImage: (textureIndex, srcX, srcY, srcW, srcH, dstX, dstY, dstW, dstH, rot, anchorX, anchorY, r, g, b, a) ->
    texture = @textures[textureIndex]
    if (r != 1) or (g != 1) or (b != 1)
      tintedTextureKey = "#{textureIndex}-#{r}-#{g}-#{b}"
      tintedTexture = @tintedTextureCache[tintedTextureKey]
      if not tintedTexture
        tintedTexture = @generateTintImage textureIndex, r, g, b
        @tintedTextureCache[tintedTextureKey] = tintedTexture
        # console.log "generated cached texture #{tintedTextureKey}"
      texture = tintedTexture

    @context.save()
    @context.translate dstX, dstY
    @context.rotate rot # * 3.141592 / 180.0
    anchorOffsetX = -1 * anchorX * dstW
    anchorOffsetY = -1 * anchorY * dstH
    @context.translate anchorOffsetX, anchorOffsetY
    @context.globalAlpha = a
    @context.drawImage(texture, srcX, srcY, srcW, srcH, 0, 0, dstW, dstH)
    @context.restore()

  update: ->
    requestAnimationFrame => @update()

    now = new Date().getTime()
    dt = now - @lastTime

    timeSinceInteract = now - @lastInteractTime
    if timeSinceInteract > 5000
      goalFPS = 5 # calm down, nobody is doing anything for 5 seconds
    else
      goalFPS = 200 # as fast as possible
    if @lastGoalFPS != goalFPS
      console.log "switching to #{goalFPS} FPS"
      @lastGoalFPS = goalFPS

    fpsInterval = 1000 / goalFPS
    if dt < fpsInterval
      return
    @lastTime = now

    @context.clearRect(0, 0, @width, @height)
    @game.update(dt)
    renderCommands = @game.render()

    i = 0
    n = renderCommands.length
    while (i < n)
      drawCall = renderCommands.slice(i, i += 16)
      @drawImage.apply(this, drawCall)

    @updateSave(dt)

  onTouchStart: (evt) ->
    @lastInteractTime = new Date().getTime()
    @heardOneTouch = true
    touches = evt.changedTouches
    for touch in touches
      if @touchMouse == null
        @touchMouse = touch.identifier
      if @touchMouse == touch.identifier
        @game.touchDown(touch.clientX, touch.clientY)

  onTouchMove: (evt) ->
    @lastInteractTime = new Date().getTime()
    touches = evt.changedTouches
    for touch in touches
      if @touchMouse == touch.identifier
        @game.touchMove(touch.clientX, touch.clientY)

  onTouchEnd: (evt) ->
    @lastInteractTime = new Date().getTime()
    touches = evt.changedTouches
    for touch in touches
      if @touchMouse == touch.identifier
        @game.touchUp(touch.clientX, touch.clientY)
        @touchMouse = null
    if evt.touches.length == 0
      @touchMouse = null

  onMouseDown: (evt) ->
    if @heardOneTouch
      return
    @lastInteractTime = new Date().getTime()
    @game.touchDown(evt.clientX, evt.clientY)

  onMouseMove: (evt) ->
    if @heardOneTouch
      return
    @lastInteractTime = new Date().getTime()
    @game.touchMove(evt.clientX, evt.clientY)

  onMouseUp: (evt) ->
    if @heardOneTouch
      return
    @lastInteractTime = new Date().getTime()
    @game.touchUp(evt.clientX, evt.clientY)

screen = document.getElementById 'screen'
resizeScreen = ->
  desiredAspectRatio = 16 / 9
  currentAspectRatio = window.innerWidth / window.innerHeight
  if currentAspectRatio < desiredAspectRatio
    screen.width = window.innerWidth
    screen.height = Math.floor(window.innerWidth * (1 / desiredAspectRatio))
  else
    screen.width = Math.floor(window.innerHeight * desiredAspectRatio)
    screen.height = window.innerHeight
resizeScreen()
# window.addEventListener 'resize', resizeScreen, false

app = new NativeApp(screen, screen.width, screen.height)
