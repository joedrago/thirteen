Animation = require './Animation'
Button = require './Button'
FontRenderer = require './FontRenderer'
SpriteRenderer = require './SpriteRenderer'
Menu = require './Menu'
Hand = require './Hand'
Pile = require './Pile'
{Thirteen, OK, aiCharacters} = require './Thirteen'

# temp
BUILD_TIMESTAMP = "0.0.1"

class Game
  constructor: (@native, @width, @height) ->
    @version = BUILD_TIMESTAMP
    @log("Game constructed: #{@width}x#{@height}")
    @fontRenderer = new FontRenderer this
    @spriteRenderer = new SpriteRenderer this
    @font = "darkforest"
    @zones = []
    @nextAITick = 1000 # will be set by options
    @center =
      x: @width / 2
      y: @height / 2
    @aaHeight = @width * 9 / 16
    @log "height: #{@height}. height if screen was 16:9 (aspect adjusted): #{@aaHeight}"
    @pauseButtonSize = @aaHeight / 15
    @colors =
      white:      { r:   1, g:   1, b:   1, a:   1 }
      black:      { r:   0, g:   0, b:   0, a:   1 }
      red:        { r:   1, g:   0, b:   0, a:   1 }
      orange:     { r:   1, g: 0.5, b:   0, a:   1 }
      gold:       { r:   1, g:   1, b:   0, a:   1 }
      buttontext: { r:   1, g:   1, b:   1, a:   1 }
      lightgray:  { r: 0.5, g: 0.5, b: 0.5, a:   1 }
      background: { r:   0, g: 0.2, b:   0, a:   1 }
      pile:       { r: 0.4, g: 0.2, b:   0, a:   1 }
      logbg:      { r: 0.1, g:   0, b:   0, a:   1 }
      arrow:      { r:   1, g:   1, b:   1, a:   1 }
      arrowclose: { r:   1, g: 0.5, b:   0, a: 0.3 }
      hand_pick:  { r:   0, g: 0.1, b:   0, a: 1.0 }
      hand_reorg: { r: 0.4, g:   0, b:   0, a: 1.0 }
      overlay:    { r:   0, g:   0, b:   0, a: 0.6 }
      mainmenu:   { r: 0.1, g: 0.1, b: 0.1, a:   1 }
      pausemenu:  { r: 0.1, g: 0.0, b: 0.1, a:   1 }
      bid:        { r:   0, g: 0.6, b:   0, a:   1 }

    @textures =
      "cards": 0
      "darkforest": 1
      "chars": 2
      "howto1": 3
      "howto2": 4
      "howto3": 5

    @thirteen = null
    @lastErr = ''
    @paused = false
    @howto = 0
    @renderCommands = []

    @optionMenus =
      speeds: [
        { text: "AI Speed: Slow", speed: 2000 }
        { text: "AI Speed: Medium", speed: 1000 }
        { text: "AI Speed: Fast", speed: 500 }
        { text: "AI Speed: Ultra", speed: 250 }
      ]
      sorts: [
        { text: "Sort Order: Normal" }
        { text: "Sort Order: Reverse" }
      ]
    @options =
      speedIndex: 1
      sortIndex: 0
      sound: true

    @mainMenu = new Menu this, "Thirteen", "solid", @colors.mainmenu, [
      (click) =>
        if click
          @howto = 1
        return "How To Play"
      (click) =>
        if click
          @options.speedIndex = (@options.speedIndex + 1) % @optionMenus.speeds.length
        return @optionMenus.speeds[@options.speedIndex].text
      (click) =>
        if click
          @options.sortIndex = (@options.sortIndex + 1) % @optionMenus.sorts.length
        return @optionMenus.sorts[@options.sortIndex].text
      (click) =>
        if click
          @newGame()
        return "Start"
    ]

    @pauseMenu = new Menu this, "Paused", "solid", @colors.pausemenu, [
      (click) =>
        if click
          @paused = false
        return "Resume Game"
      (click) =>
        if click
          @newGame()
          @paused = false
        return "New Game"
      (click) =>
        if click
          @howto = 1
        return "How To Play"
      (click) =>
        if click
          @options.speedIndex = (@options.speedIndex + 1) % @optionMenus.speeds.length
        return @optionMenus.speeds[@options.speedIndex].text
      (click) =>
        if click
          @options.sortIndex = (@options.sortIndex + 1) % @optionMenus.sorts.length
        return @optionMenus.sorts[@options.sortIndex].text
    ]

    @newGame()

  # -----------------------------------------------------------------------------------------------------
  # logging

  log: (s) ->
    @native.log(s)

  # -----------------------------------------------------------------------------------------------------
  # load / save

  load: (json) ->
    @log "(CS) loading state"
    try
      state = JSON.parse json
    catch
      @log "load failed to parse state: #{json}"
      return
    if state.options
      for k, v of state.options
        @options[k] = v

    if state.thirteen
      @log "recreating game from savedata"
      @thirteen = new Thirteen this, {
        state: state.thirteen
      }
      @prepareGame()

  save: ->
    # @log "(CS) saving state"
    state = {
      options: @options
    }

    # TODO: ENABLE SAVING HERE
    # if @thirteen?
    #   state.thirteen = @thirteen.save()

    return JSON.stringify state

  # -----------------------------------------------------------------------------------------------------

  aiTickRate: ->
    return @optionMenus.speeds[@options.speedIndex].speed

  newGame: ->
    @thirteen = new Thirteen this, {}
    @log "player 0's hand: " + JSON.stringify(@thirteen.players[0].hand)
    @prepareGame()

  prepareGame: ->
    @hand = new Hand this
    @pile = new Pile this, @hand
    @hand.set @thirteen.players[0].hand

  # -----------------------------------------------------------------------------------------------------
  # input handling

  touchDown: (x, y) ->
    # @log("touchDown #{x},#{y}")
    @checkZones(x, y)

  touchMove: (x, y) ->
    # @log("touchMove #{x},#{y}")
    if @thirteen != null
      @hand.move(x, y)

  touchUp: (x, y) ->
    # @log("touchUp #{x},#{y}")
    if @thirteen != null
      @hand.up(x, y)

  # -----------------------------------------------------------------------------------------------------
  # headline (game state in top left)

  prettyErrorTable: {
    # bidOutOfRange:      "You are somehow bidding an impossible value. The game must be broken."
    # dealerFucked:       "Dealer restriction: You may not make total bids match total tricks."
    # doNotHave:          "You are somehow attempting to play a card you don't own. The game must be broken."
    # forcedHigherInSuit: "You have a higher value in the lead suit. You must play it. (Rule 2)"
    # forcedInSuit:       "You have at least one of the lead suit. You must play it. (Rule 1)"
    # gameOver:           "The game is over.  The game must be broken."
    # indexOutOfRange:    "You don't have that index. The game must be broken."
    # lowestCardRequired: "You must start the round with the lowest card you have."
    # nextIsConfused:     "Interal error. The game must be broken."
    # noNext:             "Interal error. The game must be broken."
    # notBiddingNow:      "You are trying to bid during the wrong phase."
    # notEnoughPlayers:   "Cannot start the game without more players."
    # notInTrick:         "You are trying to play a card during the wrong phase."
    # notYourTurn:        "It isn't your turn."
    # trumpNotBroken:     "Trump isn't broken yet. Lead with a non-spade."
  }

  prettyError: ->
    pretty = @prettyErrorTable[@lastErr]
    return pretty if pretty
    return @lastErr

  calcHeadline: ->
    return "" if @thirteen == null

    headline = ""
    # switch @thirteen.state
    #   when State.BID
    #     headline = "Waiting for `ff7700`#{@thirteen.players[@thirteen.turn].name}`` to `ffff00`bid``"
    #   when State.TRICK
    #     headline = "Waiting for `ff7700`#{@thirteen.players[@thirteen.turn].name}`` to `ffff00`play``"
    #   when State.ROUNDSUMMARY
    #     headline = "Waiting for next round..."
    #   when State.POSTGAMESUMMARY
    #     headline = "Game over!"

    errText = ""
    if (@lastErr.length > 0) and (@lastErr != OK)
      errText = "  ERROR: `ff0000`#{@prettyError()}"
      headline += errText

    return headline

  # -----------------------------------------------------------------------------------------------------
  # game over information

  gameOverText: ->
    winner = @thirteen.winner()
    if winner.name == "Player"
      return ["You win!"]
    return ["#{winner.name} wins!"]
  # -----------------------------------------------------------------------------------------------------
  # card handling

  pass: ->
    @lastErr = @thirteen.pass {
      id: 1
    }

  play: (cards) ->
    console.log "(game) playing cards", cards

    @thirteen.updatePlayerHand(@hand.cards)

    rawCards = []
    for card in cards
      rawCards.push card.card

    ret = @thirteen.play {
      id: 1
      cards: rawCards
    }
    @lastErr = ret
    if ret == OK
      @hand.set @thirteen.players[0].hand
      @pile.hint cards

  playPicked: ->
    if not @hand.picking
      return
    cards = @hand.selectedCards()
    @hand.selectNone()
    if cards.length == 0
      return @pass()
    # @hand.togglePicking()
    return @play(cards)

  # -----------------------------------------------------------------------------------------------------
  # main loop

  update: (dt) ->
    @zones.length = 0 # forget about zones from the last frame. we're about to make some new ones!

    updated = false
    if @updateMainMenu(dt)
      updated = true
    if @updateGame(dt)
      updated = true

    return updated

  updateMainMenu: (dt) ->
    updated = false
    if @mainMenu.update(dt)
      updated = true
    return updated

  updateGame: (dt) ->
    return false if @thirteen == null

    updated = false

    if @pile.update(dt)
      updated = true
    if @pile.readyForNextTrick()
      @nextAITick -= dt
      if @nextAITick <= 0
        @nextAITick = @aiTickRate()
        if @thirteen.aiTick()
          updated = true
    if @hand.update(dt)
      updated = true

    @pile.set @thirteen.throwID, @thirteen.pile, @thirteen.pileWho

    if @pauseMenu.update(dt)
      updated = true

    return updated

  render: ->
    # Reset render commands
    @renderCommands.length = 0

    if @howto > 0
      @renderHowto()
    else if @thirteen == null
      @renderMainMenu()
    else
      @renderGame()

    return @renderCommands

  renderHowto: ->
    howtoTexture = "howto#{@howto}"
    @log "rendering #{howtoTexture}"
    @spriteRenderer.render "solid", 0, 0, @width, @height, 0, 0, 0, @colors.black
    @spriteRenderer.render howtoTexture, 0, 0, @width, @aaHeight, 0, 0, 0, @colors.white
    arrowWidth = @width / 20
    arrowOffset = arrowWidth * 4
    color = if @howto == 1 then @colors.arrowclose else @colors.arrow
    @spriteRenderer.render "arrowL", @center.x - arrowOffset, @height, arrowWidth, 0, 0, 0.5, 1, color, =>
      @howto--
      if @howto < 0
        @howto = 0
    color = if @howto == 3 then @colors.arrowclose else @colors.arrow
    @spriteRenderer.render "arrowR", @center.x + arrowOffset, @height, arrowWidth, 0, 0, 0.5, 1, color, =>
      @howto++
      if @howto > 3
        @howto = 0

  renderMainMenu: ->
    @mainMenu.render()

  renderGame: ->

    # background
    @spriteRenderer.render "solid", 0, 0, @width, @height, 0, 0, 0, @colors.background

    textHeight = @aaHeight / 25
    textPadding = textHeight / 5
    characterHeight = @aaHeight / 5
    countHeight = textHeight

    # Log
    for line, i in @thirteen.log
      @fontRenderer.render @font, textHeight, line, 0, (i+1) * (textHeight + textPadding), 0, 0, @colors.white

    aiPlayers = [
      @thirteen.players[1]
      @thirteen.players[2]
      @thirteen.players[3]
    ]

    characterMargin = characterHeight / 2
    @charCeiling = @height * 0.6

    # left side
    if aiPlayers[0] != null
      character = aiCharacters[aiPlayers[0].charID]
      characterWidth = @spriteRenderer.calcWidth(character.sprite, characterHeight)
      @spriteRenderer.render character.sprite, characterMargin, @charCeiling, 0, characterHeight, 0, 0, 1, @colors.white
      @renderCount aiPlayers[0], aiPlayers[0].index == @thirteen.turn, countHeight, characterMargin + (characterWidth / 2), @charCeiling - textPadding, 0.5, 0
      @renderAIHand aiPlayers[0].count, characterMargin + (characterWidth / 2), @charCeiling - textPadding, 0.5, 0
    # top side
    if aiPlayers[1] != null
      character = aiCharacters[aiPlayers[1].charID]
      @spriteRenderer.render character.sprite, @center.x, 0, 0, characterHeight, 0, 0.5, 0, @colors.white
      @renderCount aiPlayers[1], aiPlayers[1].index == @thirteen.turn, countHeight, @center.x, characterHeight, 0.5, 0
      @renderAIHand aiPlayers[0].count, characterMargin + (characterWidth / 2), @charCeiling - textPadding, 0.5, 0
    # right side
    if aiPlayers[2] != null
      character = aiCharacters[aiPlayers[2].charID]
      characterWidth = @spriteRenderer.calcWidth(character.sprite, characterHeight)
      @spriteRenderer.render character.sprite, @width - characterMargin, @charCeiling, 0, characterHeight, 0, 1, 1, @colors.white
      @renderCount aiPlayers[2], aiPlayers[2].index == @thirteen.turn, countHeight, @width - (characterMargin + (characterWidth / 2)), @charCeiling - textPadding, 0.5, 0
      @renderAIHand aiPlayers[0].count, characterMargin + (characterWidth / 2), @charCeiling - textPadding, 0.5, 0

    # card area
    handAreaHeight = 0.27 * @height
    if @hand.picking
      handareaColor = @colors.hand_pick
    else
      handareaColor = @colors.hand_reorg
    @spriteRenderer.render "solid", 0, @height, @width, handAreaHeight, 0, 0, 1, handareaColor, =>
      @hand.togglePicking()

    # pile
    pileDimension = @height * 0.4
    @spriteRenderer.render "pile", @width / 2, @height / 2, pileDimension, pileDimension, 0, 0.5, 0.5, @colors.white, =>
      @playPicked()
    @pile.render()

    @hand.render()
    @renderCount @thirteen.players[0], 0 == @thirteen.turn, countHeight, @center.x, @height, 0.5, 1

    if @thirteen.winner() and @pile.resting()
      lines = @gameOverText()
      gameOverSize = @aaHeight / 8
      gameOverY = @center.y
      if lines.length > 1
        gameOverY -= (gameOverSize >> 1)
      @fontRenderer.render @font, gameOverSize, lines[0], @center.x, gameOverY, 0.5, 0.5, @colors.orange
      if lines.length > 1
        gameOverY += gameOverSize
        @fontRenderer.render @font, gameOverSize, lines[1], @center.x, gameOverY, 0.5, 0.5, @colors.orange

      restartQuitSize = @aaHeight / 12
      shadowDistance = restartQuitSize / 8
      @fontRenderer.render @font, restartQuitSize, "Play Again", shadowDistance + @center.x, shadowDistance + (@height - (handAreaHeight * 0.5)), 0.5, 1, @colors.black, =>
      @fontRenderer.render @font, restartQuitSize, "Play Again", @center.x, @height - (handAreaHeight * 0.5), 0.5, 1, @colors.gold, =>
        @thirteen.deal()
        @prepareGame()

    # Headline (includes error)
    @fontRenderer.render @font, textHeight, @calcHeadline(), 0, 0, 0, 0, @colors.lightgray

    @spriteRenderer.render "pause", @width, 0, 0, @pauseButtonSize, 0, 1, 0, @colors.white, =>
      @paused = true

    if not @hand.picking
      @fontRenderer.render @font, textHeight, "Unlocked", 0.02 * @width, @height - handAreaHeight, 0, 0, @colors.white

    if @paused
      @pauseMenu.render()

    return

  renderCount: (player, myTurn, countHeight, x, y, anchorx, anchory) ->
    if myTurn
      nameColor = "`ff7700`"
    else
      nameColor = ""
    nameString = " #{nameColor}#{player.name}`` "
    cardCount = player.hand.length
    if cardCount > 1
      trickColor = "ffff33"
    else
      trickColor = "ff3333"
    countString = " `#{trickColor}`#{cardCount}`` left "

    nameSize = @fontRenderer.size(@font, countHeight, nameString)
    countSize = @fontRenderer.size(@font, countHeight, countString)
    if nameSize.w > countSize.w
      countSize.w = nameSize.w
    else
      nameSize.w = countSize.w
    nameY = y
    countY = y
    boxHeight = countSize.h
    if player.id != 1
      boxHeight *= 2
      if anchory > 0
        nameY -= countHeight
      else
        countY += countHeight
    @spriteRenderer.render "solid", x, y, countSize.w, boxHeight, 0, anchorx, anchory, @colors.overlay
    @fontRenderer.render @font, countHeight, nameString, x, nameY, anchorx, anchory, @colors.white
    if player.id != 1
      @fontRenderer.render @font, countHeight, countString, x, countY, anchorx, anchory, @colors.white

  renderAIHand: (cardCount, countHeight, x, y, anchorx, anchory) ->
    # TODO: make this draw a tiny hand of cards on the AI chars

    # cardHeight = Math.floor(@height * CARD_RENDER_SCALE)
    # cardWidth  = Math.floor(cardHeight * CARD_IMAGE_W / CARD_IMAGE_H)
    # @game.drawImage "cards",
    # Hand.CARD_IMAGE_OFF_X + (Hand.CARD_IMAGE_ADV_X * rank), Hand.CARD_IMAGE_OFF_Y + (Hand.CARD_IMAGE_ADV_Y * suit), Hand.CARD_IMAGE_W, Hand.CARD_IMAGE_H,
    # x, y, @cardWidth * scale, @cardHeight * scale,
    # rot, 0.5, 0.5, 1,1,1,1, cb

  # -----------------------------------------------------------------------------------------------------
  # rendering and zones

  drawImage: (texture, sx, sy, sw, sh, dx, dy, dw, dh, rot, anchorx, anchory, r, g, b, a, cb) ->
    @renderCommands.push @textures[texture], sx, sy, sw, sh, dx, dy, dw, dh, rot, anchorx, anchory, r, g, b, a

    if cb?
      # caller wants to remember where this was drawn, and wants to be called back if it is ever touched
      # This is called a "zone". Since zones are traversed in reverse order, the natural overlap of
      # a series of renders is respected accordingly.
      anchorOffsetX = -1 * anchorx * dw
      anchorOffsetY = -1 * anchory * dh
      zone =
        # center (X,Y) and reversed rotation, used to put the coordinate in local space to the zone
        cx:  dx
        cy:  dy
        rot: rot * -1
        # the axis aligned bounding box used for detection of a localspace coord
        l:   anchorOffsetX
        t:   anchorOffsetY
        r:   anchorOffsetX + dw
        b:   anchorOffsetY + dh
        # callback to call if the zone is clicked on
        cb:  cb
      @zones.push zone

  checkZones: (x, y) ->
    for zone in @zones by -1
      # move coord into space relative to the quad, then rotate it to match
      unrotatedLocalX = x - zone.cx
      unrotatedLocalY = y - zone.cy
      localX = unrotatedLocalX * Math.cos(zone.rot) - unrotatedLocalY * Math.sin(zone.rot)
      localY = unrotatedLocalX * Math.sin(zone.rot) + unrotatedLocalY * Math.cos(zone.rot)
      if (localX < zone.l) or (localX > zone.r) or (localY < zone.t) or (localY > zone.b)
        # outside of oriented bounding box
        continue
      zone.cb(x, y)
      return true
    return false

  # -----------------------------------------------------------------------------------------------------

module.exports = Game
