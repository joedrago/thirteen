Animation = require './Animation'
Hand = require './Hand'

SETTLE_MS = 250

class Pile
  constructor: (@game, @hand) ->
    @playID = -1
    @plays = []
    @anims = {}
    @settleTimer = 0
    @thrownColor = { r: 1, g: 1, b: 0, a: 1}
    @scale = 0.6

    # 1.0 is not messy at all, as you approach 0 it starts to all pile on one another
    messy = 0.2

    @playCardSpacing = 0.1

    centerX = @game.center.x
    centerY = @game.center.y
    offsetX = @hand.cardWidth * messy * @scale
    offsetY = @hand.cardHalfHeight * messy * @scale
    @playLocations = [
      { x: centerX, y: centerY + offsetY } # bottom
      { x: centerX - offsetX, y: centerY } # left
      { x: centerX, y: centerY - offsetY } # top
      { x: centerX + offsetX, y: centerY } # right
    ]
    @throwLocations = [
      { x: centerX, y: @game.height } # bottom
      { x: 0, y: centerY + offsetY } # left
      { x: centerX, y: 0 } # top
      { x: @game.width, y: centerY + offsetY } # right
    ]

  set: (pileID, pile, pileWho) ->
    if @playID != pileID
      @playID = pileID
      @plays.push {
        cards: pile.slice(0)
        who: pileWho
      }
      @settleTimer = SETTLE_MS

    # if (@playID != pileID) and (thrown.length > 0)
    #   @plays = thrown.slice(0) # the pile has become the thrown, stash it off one last time
    #   @playWho = thrownWho.slice(0)
    #   @playID = pileID
    #   @settleTimer = SETTLE_MS

    # # don't stomp the pile we're drawing until it is done settling and can fly off the screen
    # if @settleTimer == 0
    #   @plays = pile.slice(0)
    #   @playWho = pileWho.slice(0)
    #   @thrown = thrown.slice(0)
    #   @thrownWho = thrownWho.slice(0)
    #   @thrownTaker = thrownTaker

    @syncAnims()

  poke: ->
    @settleTimer = SETTLE_MS

  hint: (cards) ->
    for card in cards
      @anims[card.card] = new Animation {
        speed: @hand.cardSpeed
        x: card.x
        y: card.y
        r: card.r
        s: 1
      }

  syncAnims: ->
    seen = {}
    locations = @throwLocations
    for play in @plays
      for card, index in play.cards
        seen[card]++
        if not @anims[card]
          who = play.who
          location = locations[who]
          @anims[card] = new Animation {
            speed: @hand.cardSpeed
            x: location.x
            y: location.y
            r: -1 * Math.PI / 4
            s: @scale
          }

    toRemove = []
    for card,anim of @anims
      if not seen.hasOwnProperty(card)
        toRemove.push card
    for card in toRemove
      # @game.log "removing anim for #{card}"
      delete @anims[card]

    @updatePositions()

  updatePositions: ->
    locations = @playLocations
    for play, playIndex in @plays
      for v, index in play.cards
        anim = @anims[v]
        loc = play.who
        anim.req.x = locations[loc].x + (index * @hand.cardWidth * @playCardSpacing)
        anim.req.y = locations[loc].y
        anim.req.r = 0.2 * Math.cos(playIndex / 0.1)
        anim.req.s = @scale

  readyForNextTrick: ->
    return @resting()
    # return (@settleTimer == 0)

  update: (dt) ->
    updated = false

    if @settleTimer > 0
      updated = true
      @settleTimer -= dt
      if @settleTimer < 0
        @settleTimer = 0

    for card,anim of @anims
      if anim.update(dt)
        updated = true

    return updated

  # used by the game over screen. It returns true when neither the pile nor the last thrown are moving
  resting: ->
    for card,anim of @anims
      if anim.animating()
        return false
    if @settleTimer > 0
      return false
    return true

  render: ->
    for play, playIndex in @plays
      highlight = Hand.Highlight.PILE
      if playIndex == (@plays.length - 1)
        highlight = Hand.Highlight.NONE
      for v, index in play.cards
        anim = @anims[v]
        @hand.renderCard v, anim.cur.x, anim.cur.y, anim.cur.r, anim.cur.s, highlight

module.exports = Pile
