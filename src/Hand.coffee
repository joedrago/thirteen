Animation = require './Animation'

CARD_IMAGE_W = 120
CARD_IMAGE_H = 162
CARD_IMAGE_OFF_X = 4
CARD_IMAGE_OFF_Y = 4
CARD_IMAGE_ADV_X = CARD_IMAGE_W
CARD_IMAGE_ADV_Y = CARD_IMAGE_H
CARD_RENDER_SCALE = 0.35                  # card height coefficient from the screen's height
CARD_HAND_CURVE_DIST_FACTOR = 3.5         # factor with screen height to figure out center of arc. bigger number is less arc
CARD_HOLDING_ROT_ORDER = Math.PI / 12     # desired rotation of the card when being dragged around for ordering's sake
CARD_HOLDING_ROT_PLAY = -1 * Math.PI / 12 # desired rotation of the card when being dragged around with intent to play
CARD_PLAY_CEILING = 0.60                  # how much of the top of the screen represents "I want to play this" vs "I want to reorder"

NO_CARD = -1

Selected =
  NONE: -1
  UNSELECTED: 0
  SELECTED: 1

# taken from http://stackoverflow.com/questions/1211212/how-to-calculate-an-angle-from-three-points
# uses law of cosines to figure out the hand arc angle
findAngle = (p0, p1, p2) ->
    a = Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)
    b = Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2)
    c = Math.pow(p2.x - p0.x, 2) + Math.pow(p2.y - p0.y, 2)
    return Math.acos( (a+b-c) / Math.sqrt(4*a*b) )

calcDistance = (p0, p1) ->
  return Math.sqrt(Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2))

calcDistanceSquared = (x0, y0, x1, y1) ->
  return Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2)

class Hand
  @CARD_IMAGE_W: CARD_IMAGE_W
  @CARD_IMAGE_H: CARD_IMAGE_H
  @CARD_IMAGE_OFF_X: CARD_IMAGE_OFF_X
  @CARD_IMAGE_OFF_Y: CARD_IMAGE_OFF_Y
  @CARD_IMAGE_ADV_X: CARD_IMAGE_ADV_X
  @CARD_IMAGE_ADV_Y: CARD_IMAGE_ADV_Y
  @CARD_RENDER_SCALE: CARD_RENDER_SCALE

  constructor: (@game) ->
    @cards = []
    @anims = {}
    @positionCache = {}

    @picking = false
    @picked = []
    @pickPaint = false

    @dragIndexStart = NO_CARD
    @dragIndexCurrent = NO_CARD
    @dragX = 0
    @dragY = 0

    # render / anim metrics
    @cardSpeed =
      r: Math.PI * 2
      s: 2.5
      t: 2 * @game.width
    @playCeiling = CARD_PLAY_CEILING * @game.height
    @cardHeight = Math.floor(@game.height * CARD_RENDER_SCALE)
    @cardWidth  = Math.floor(@cardHeight * CARD_IMAGE_W / CARD_IMAGE_H)
    @cardHalfHeight = @cardHeight >> 1
    @cardHalfWidth  = @cardWidth >> 1
    arcMargin = @cardWidth / 2
    arcVerticalBias = @cardHeight / 50
    bottomLeft  = { x: arcMargin,                y: arcVerticalBias + @game.height }
    bottomRight = { x: @game.width - arcMargin, y: arcVerticalBias + @game.height }
    @handCenter = { x: @game.width / 2,         y: arcVerticalBias + @game.height + (CARD_HAND_CURVE_DIST_FACTOR * @game.height) }
    @handAngle = findAngle(bottomLeft, @handCenter, bottomRight)
    @handDistance = calcDistance(bottomLeft, @handCenter)
    @handAngleAdvanceMax = @handAngle / 7 # never space the cards more than what they'd look like with this handsize
    @game.log "Hand distance #{@handDistance}, angle #{@handAngle} (screen height #{@game.height})"

  togglePicking: ->
    @picking = !@picking
    if @picking
      @picked = new Array(@cards.length).fill(false)

  set: (cards) ->
    @cards = cards.slice(0)
    if @picking
      @picked = new Array(@cards.length).fill(false)
    @syncAnims()
    @warp()

  syncAnims: ->
    seen = {}
    for card in @cards
      seen[card]++
      if not @anims[card]
        @anims[card] = new Animation {
          speed: @cardSpeed
          x: 0
          y: 0
          r: 0
        }
    toRemove = []
    for card,anim of @anims
      if not seen.hasOwnProperty(card)
        toRemove.push card
    for card in toRemove
      # @game.log "removing anim for #{card}"
      delete @anims[card]

    @updatePositions()

  calcDrawnHand: ->
    drawnHand = []
    for card,i in @cards
      if i != @dragIndexStart
        drawnHand.push card

    if @dragIndexCurrent != NO_CARD
      drawnHand.splice @dragIndexCurrent, 0, @cards[@dragIndexStart]
    return drawnHand

  wantsToPlayDraggedCard: ->
    return false if @dragIndexStart == NO_CARD
    return @dragY < @playCeiling

  updatePositions: ->
    drawnHand = @calcDrawnHand()
    wantsToPlay = @wantsToPlayDraggedCard()
    desiredRotation = CARD_HOLDING_ROT_ORDER
    positionCount = drawnHand.length
    if wantsToPlay
      desiredRotation = CARD_HOLDING_ROT_PLAY
      positionCount--
    positions = @calcPositions(positionCount)
    drawIndex = 0
    for card,i in drawnHand
      anim = @anims[card]
      if i == @dragIndexCurrent
        anim.req.x = @dragX
        anim.req.y = @dragY
        anim.req.r = desiredRotation
        if not wantsToPlay
          drawIndex++
      else
        pos = positions[drawIndex]
        anim.req.x = pos.x
        anim.req.y = pos.y
        anim.req.r = pos.r
        drawIndex++

  # immediately warp all cards to where they should be
  warp: ->
    for card,anim of @anims
      anim.warp()

  # reorder the hand based on the drag location of the held card
  reorder: ->
    return if @dragIndexStart == NO_CARD
    return if @cards.length < 2 # nothing to reorder
    positions = @calcPositions(@cards.length)
    closestIndex = 0
    closestDist = @game.width * @game.height # something impossibly large
    for pos, index in positions
      dist = calcDistanceSquared(pos.x, pos.y, @dragX, @dragY)
      if closestDist > dist
        closestDist = dist
        closestIndex = index
    @dragIndexCurrent = closestIndex

  selectedCards: ->
    if not @picking
      return []

    cards = []
    for card, i in @cards
      if @picked[i]
        anim = @anims[card]
        cards.push {
          card: card
          x: anim.cur.x
          y: anim.cur.y
          r: anim.cur.r
          index: i
        }
    return cards

  down: (@dragX, @dragY, index) ->
    @up(@dragX, @dragY) # ensure we let go of the previous card in case the events are dumb
    if @picking
      @picked[index] = !@picked[index]
      @pickPaint = @picked[index]
      return
    @game.log "picking up card index #{index}"
    @dragIndexStart = index
    @dragIndexCurrent = index
    @updatePositions()

  move: (@dragX, @dragY) ->
    return if @dragIndexStart == NO_CARD
    #@game.log "dragging around card index #{@dragIndexCurrent}"
    @reorder()
    @updatePositions()

  up: (@dragX, @dragY) ->
    return if @dragIndexStart == NO_CARD
    @reorder()
    if @wantsToPlayDraggedCard()
      @game.log "trying to play a #{@cards[@dragIndexStart]} from index #{@dragIndexStart}"
      cardIndex = @dragIndexStart
      card = @cards[cardIndex]
      anim = @anims[card]
      @dragIndexStart = NO_CARD
      @dragIndexCurrent = NO_CARD
      @game.play [{
        card: card
        x: anim.cur.x
        y: anim.cur.y
        r: anim.cur.r
        index: cardIndex
      }]
    else
      @game.log "trying to reorder #{@cards[@dragIndexStart]} into index #{@dragIndexCurrent}"
      @cards = @calcDrawnHand() # is this right?

    @dragIndexStart = NO_CARD
    @dragIndexCurrent = NO_CARD
    @updatePositions()

  update: (dt) ->
    updated = false
    for card,anim of @anims
      if anim.update(dt)
        updated = true
    return updated

  render: ->
    return if @cards.length == 0
    drawnHand = @calcDrawnHand()
    for v, index in drawnHand
      continue if v == NO_CARD
      anim = @anims[v]
      do (anim, index) =>
        if @picking
          if @picked[index]
            selectedState = Selected.SELECTED
          else
            selectedState = Selected.UNSELECTED
        else
          if @wantsToPlayDraggedCard()
            if (index == @dragIndexCurrent)
              selectedState = Selected.SELECTED
            else
              selectedState = Selected.UNSELECTED
          else
            selectedState = Selected.NONE
        @renderCard v, anim.cur.x, anim.cur.y, anim.cur.r, 1, selectedState, (clickX, clickY) =>
          @down(clickX, clickY, index)

  renderCard: (v, x, y, rot, scale, selected, cb) ->
    rot = 0 if not rot
    rank = Math.floor(v / 4)
    suit = Math.floor(v % 4)

    col = switch selected
      when Selected.NONE
        [1, 1, 1]
      when Selected.UNSELECTED
        # [0.3, 0.3, 0.3]
        [1, 1, 1]
      when Selected.SELECTED
        [0.5, 0.5, 0.9]

    @game.drawImage "cards",
    CARD_IMAGE_OFF_X + (CARD_IMAGE_ADV_X * rank), CARD_IMAGE_OFF_Y + (CARD_IMAGE_ADV_Y * suit), CARD_IMAGE_W, CARD_IMAGE_H,
    x, y, @cardWidth * scale, @cardHeight * scale,
    rot, 0.5, 0.5, col[0],col[1],col[2],1, cb

  calcPositions: (handSize) ->
    if @positionCache.hasOwnProperty(handSize)
      return @positionCache[handSize]
    return [] if handSize == 0

    advance = @handAngle / handSize
    if advance > @handAngleAdvanceMax
      advance = @handAngleAdvanceMax
    angleSpread = advance * handSize                # how much of the angle we plan on using
    angleLeftover = @handAngle - angleSpread        # amount of angle we're not using, and need to pad sides with evenly
    currentAngle = -1 * (@handAngle / 2)            # move to the left side of our angle
    currentAngle += angleLeftover / 2               # ... and advance past half of the padding
    currentAngle += advance / 2                     # ... and center the cards in the angle

    positions = []
    for i in [0...handSize]
      x = @handCenter.x - Math.cos((Math.PI / 2) + currentAngle) * @handDistance
      y = @handCenter.y - Math.sin((Math.PI / 2) + currentAngle) * @handDistance
      currentAngle += advance
      positions.push {
        x: x
        y: y
        r: currentAngle - advance
      }

    @positionCache[handSize] = positions
    return positions

  # renderHand: ->
  #   return if @hand.length == 0
  #   for v,index in @hand
  #     do (index) =>
  #       @renderCard v, x, y, currentAngle, 1, Selected.NONE, (clickX, clickY) =>
  #         @down(clickX, clickY, index)

module.exports = Hand
