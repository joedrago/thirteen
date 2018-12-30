Animation = require './Animation'
Button = require './Button'
FontRenderer = require './FontRenderer'
SpriteRenderer = require './SpriteRenderer'
Menu = require './Menu'
Hand = require './Hand'
Pile = require './Pile'
{Thirteen, OK, aiCharacters, achievementsList} = require './Thirteen'

# temp
BUILD_TIMESTAMP = "1.16"

RenderMode =
  GAME: 0
  HOWTO: 1
  ACHIEVEMENTS: 2
  PAUSE: 3
  OPTIONS: 4

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
      arrow:      { r:   1, g:   1, b:   1, a:   1 }
      arrowclose: { r:   1, g: 0.5, b:   0, a: 0.3 }
      background: { r:   0, g: 0.2, b:   0, a:   1 }
      bid:        { r:   0, g: 0.6, b:   0, a:   1 }
      black:      { r:   0, g:   0, b:   0, a:   1 }
      buttontext: { r:   1, g:   1, b:   1, a:   1 }
      game_over:  { r:   1, g: 0.5, b:   0, a:   1 }
      gold:       { r:   1, g:   1, b:   0, a:   1 }
      hand_any:   { r:   0, g:   0, b: 0.2, a: 1.0 }
      hand_pick:  { r:   0, g: 0.1, b:   0, a: 1.0 }
      hand_drag:  { r: 0.4, g:   0, b:   0, a: 1.0 }
      hand_push:  { r: 0.2, g:   0, b: 0.2, a: 1.0 }
      lightgray:  { r: 0.5, g: 0.5, b: 0.5, a:   1 }
      logbg:      { r: 0.1, g:   0, b:   0, a:   1 }
      logcolor:   { r: 0.5, g: 0.5, b: 0.5, a:   1 }
      mainmenu:   { r: 0.1, g: 0.1, b: 0.1, a:   1 }
      orange:     { r:   1, g: 0.5, b:   0, a:   1 }
      overlay:    { r:   0, g:   0, b:   0, a: 0.6 }
      pausemenu:  { r: 0.1, g: 0.0, b: 0.1, a:   1 }
      optionmenu: { r: 0.0, g: 0.1, b: 0.1, a:   1 }
      pile:       { r: 0.4, g: 0.2, b:   0, a:   1 }
      play_again: { r:   0, g:   0, b:   0, a: 0.6 }
      red:        { r:   1, g:   0, b:   0, a:   1 }
      white:      { r:   1, g:   1, b:   1, a:   1 }
      ach_bg:     { r: 0.1, g: 0.1, b: 0.1, a:   1 }
      ach_header: { r:   1, g: 0.5, b:   0, a:   1 }
      ach_title:  { r:   1, g:   1, b:   1, a:   1 }
      ach_desc:   { r: 0.7, g: 0.7, b: 0.7, a:   1 }

    @textures =
      "cards": 0
      "darkforest": 1
      "chars": 2
      "howto1": 3

    @thirteen = null
    @lastErr = ''
    @renderMode = RenderMode.GAME
    @renderCommands = []
    @achievementFanfare = null

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
      autopasses: [
        { text: "AutoPass: Disabled" }
        { text: "AutoPass: Full" }
        { text: "AutoPass: Limited" }
      ]
    @options =
      speedIndex: 1
      sortIndex: 0
      sound: true
      autopassIndex: 2
      pushSorting: false
      givingUp: true

    @pauseMenu = new Menu this, "Paused", "solid", @colors.pausemenu, [
      (click) =>
        if click
          @renderMode = RenderMode.GAME
        return "Resume Game"
      (click) =>
        if click
          @renderMode = RenderMode.OPTIONS
        return "Options"
      (click) =>
        if click
          @renderMode = RenderMode.ACHIEVEMENTS
        return "Achievements"
      (click) =>
        if click
          @renderMode = RenderMode.HOWTO
        return "How To Play"
      (click) =>
        if click
          @newGame(true)
          @renderMode = RenderMode.GAME
        return "New Money Game"
      (click) =>
        if click
          @newGame(false)
          @renderMode = RenderMode.GAME
        return "New Game"
    ]

    @optionMenu = new Menu this, "Options", "solid", @colors.optionmenu, [
      (click) =>
        if click
          @options.speedIndex = (@options.speedIndex + 1) % @optionMenus.speeds.length
        return @optionMenus.speeds[@options.speedIndex].text
      (click) =>
        if click
          @options.autopassIndex = (@options.autopassIndex + 1) % @optionMenus.autopasses.length
        return @optionMenus.autopasses[@options.autopassIndex].text
      (click) =>
        if click
          @options.sortIndex = (@options.sortIndex + 1) % @optionMenus.sorts.length
        return @optionMenus.sorts[@options.sortIndex].text
      (click) =>
        if click
          @options.givingUp = !@options.givingUp
        if @options.givingUp
          return "Giving Up: Enabled"
        return "Giving Up: Disabled"
      (click) =>
        if click
          @options.pushSorting = !@options.pushSorting
        if @options.pushSorting
          return "Push Sorting: Enabled"
        return "Push Sorting: Disabled"
      (click) =>
        if click
          @renderMode = RenderMode.PAUSE
        return "Back"
    ]

    @thirteen = new Thirteen this, {}
    @log "player 0's hand: " + JSON.stringify(@thirteen.players[0].hand)
    @prepareGame()

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

    if @thirteen?
      @thirteen.updatePlayerHand(@hand.cards)
      state.thirteen = @thirteen.save()

    return JSON.stringify state

  # -----------------------------------------------------------------------------------------------------

  aiTickRate: ->
    return @optionMenus.speeds[@options.speedIndex].speed

  newGame: (money) ->
    @thirteen.newGame(money)
    @prepareGame()

  prepareGame: ->
    @hand = new Hand this
    @pile = new Pile this, @hand
    @hand.set @thirteen.players[0].hand
    @lastErr = ''

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
      gameOver:           "The game is over."
      invalidPlay:        "Not a valid play."
      mustBreakOrPass:    "You passed already, so 2-breaker or pass."
      mustPass:           "You must pass."
      mustThrow3S:        "You must use the 3\xc8 in your play."
      notYourTurn:        "It is not your turn."
      throwAnything:      "You have control, throw anything."
      tooLowPlay:         "This play is not stronger than the current play."
      wrongPlay:          "This play does not match the current play."
  }

  prettyError: ->
    pretty = @prettyErrorTable[@lastErr]
    return pretty if pretty
    return @lastErr

  calcHeadline: ->
    return "" if @thirteen == null

    headline = @thirteen.headline()
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
      errText = "  `ffffff`ERROR: `ff0000`#{@prettyError()}"
      headline += errText

    return headline

  # -----------------------------------------------------------------------------------------------------
  # game over information

  gameOverText: ->
    winner = @thirteen.winner()
    firstLine = "#{winner.name} wins!"
    secondLine = "Try Again..."
    if winner.name == "Player"
      firstLine = "You win!"
      if @thirteen.lastStreak == 1
        secondLine = "A new streak!"
      else
        secondLine = "#{@thirteen.lastStreak} in a row!"
    else
      if @thirteen.lastStreak == 0
        secondLine = "Try again..."
      else
        secondLine = "Streak ended: #{@thirteen.lastStreak} wins"
    if @thirteen.someoneGaveUp()
      moneyDelta = @thirteen.players[0].money - Thirteen.STARTING_MONEY
      if moneyDelta > 0
        secondLine = "Game Over: You won $#{moneyDelta}"
      else if moneyDelta < 0
        secondLine = "Game Over: You lost $#{-1 * moneyDelta}"
      else
        secondLine = "Game Over: You broke even!"
    return [firstLine, secondLine]

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
    if not @hand.picking()
      return
    cards = @hand.selectedCards()
    # @hand.selectNone()
    if cards.length == 0
      return @pass()
    return @play(cards)

  # -----------------------------------------------------------------------------------------------------
  # main loop

  update: (dt) ->
    @zones.length = 0 # forget about zones from the last frame. we're about to make some new ones!

    updated = false
    if @updateGame(dt)
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

    if @optionMenu.update(dt)
      updated = true

    if @achievementFanfare != null
      @achievementFanfare.time += dt
      if @achievementFanfare.time > 5000
        @achievementFanfare = null
      updated = true

    if @achievementFanfare == null
      if @thirteen.fanfares.length > 0
        @achievementFanfare =
          title: @thirteen.fanfares.shift()
          time: 0

    return updated

  render: ->
    # Reset render commands
    @renderCommands.length = 0

    switch @renderMode
      when RenderMode.HOWTO
        @renderHowto()
      when RenderMode.ACHIEVEMENTS
        @renderAchievements()
      when RenderMode.OPTIONS
        @renderOptions()
      when RenderMode.PAUSE
        @renderPause()
      else
        @renderGame()

    return @renderCommands

  renderPause: ->
    @pauseMenu.render()

  renderOptions: ->
    @optionMenu.render()

  renderHowto: ->
    howtoTexture = "howto1"
    @log "rendering #{howtoTexture}"
    @spriteRenderer.render "solid", 0, 0, @width, @height, 0, 0, 0, @colors.black
    @spriteRenderer.render howtoTexture, 0, 0, @width, @aaHeight, 0, 0, 0, @colors.white, =>
      @renderMode = RenderMode.PAUSE

  debug: ->
    console.log "debug ach"
    console.log @thirteen.ach
    # @thirteen.ach.earned = {}
    # @thirteen.ach.earned.veteran = true
    # @thirteen.ach.earned.tryhard = true
    # @thirteen.ach.earned.breaker = true
    # @thirteen.ach.earned.keepitlow = true
    # @thirteen.ach.earned.suited = true
    # @thirteen.ach.earned.tony = true
    # @thirteen.ach.earned.sampler = true
    # @thirteen.ach.earned.tragedy = true
    # @thirteen.ach.earned.indomitable = true
    # @thirteen.ach.earned.rekt = true
    # @thirteen.ach.earned.late = true
    # @thirteen.ach.earned.pairs = true

    # @thirteen.ach.state.totalGames = 0
    # @thirteen.streak = 0

  renderAchievements: ->
    @spriteRenderer.render "solid", 0, 0, @width, @height, 0, 0, 0, @colors.ach_bg, =>
      @renderMode = RenderMode.PAUSE

    titleHeight = @height / 20
    titleOffset = titleHeight / 2
    @fontRenderer.render @font, titleHeight, "Achievements", @center.x, titleOffset, 0.5, 0.5, @colors.ach_header

    imageMargin = @width / 15
    topHeight = titleHeight
    x = @width / 120
    y = topHeight
    titleHeight = @height / 22
    descHeight = @height / 30
    imageDim = titleHeight * 2
    for ach, achIndex in achievementsList
      icon = "star_off"
      if @thirteen.ach.earned[ach.id]
        icon = "star_on"
      @spriteRenderer.render icon, x, y, imageDim, imageDim, 0, 0, 0, @colors.white
      @fontRenderer.render @font, titleHeight, ach.title, x + imageMargin, y, 0, 0, @colors.ach_title
      @fontRenderer.render @font, descHeight, ach.description[0], x + imageMargin, y + titleHeight, 0, 0, @colors.ach_desc
      if ach.progress?
        progress = ach.progress(@thirteen.ach)
        @fontRenderer.render @font, descHeight, progress, x + imageMargin, y + titleHeight + descHeight, 0, 0, @colors.ach_desc
      else
        if ach.description.length > 1
          @fontRenderer.render @font, descHeight, ach.description[1], x + imageMargin, y + titleHeight + descHeight, 0, 0, @colors.ach_desc
      if achIndex == 6
        y = topHeight
        x += @width / 2
      else
        y += titleHeight * 3

  renderAIHand: (hand, x, y, offset) ->
    sorted = hand.sort (a, b) -> a - b
    for raw, i in sorted
      @hand.renderCard raw, x + (i * offset), y, 0, 0.7, 0

  renderGame: ->

    # background
    @spriteRenderer.render "solid", 0, 0, @width, @height, 0, 0, 0, @colors.background

    textHeight = @aaHeight / 25
    textPadding = textHeight / 5
    characterHeight = @aaHeight / 5
    countHeight = textHeight

    drawGameOver = @thirteen.gameOver() and @pile.resting()

    # Log
    for line, i in @thirteen.log
      @fontRenderer.render @font, textHeight, line, 0, (i+1.5) * (textHeight + textPadding), 0, 0, @colors.logcolor

    aiPlayers = [
      @thirteen.players[1]
      @thirteen.players[2]
      @thirteen.players[3]
    ]

    characterMargin = characterHeight / 2
    @charCeiling = @height * 0.6

    aiCardSpacing = @width * 0.015

    # left side
    if aiPlayers[0] != null
      if drawGameOver
        @renderAIHand aiPlayers[0].hand, @width * 0.2, @height * 0.62, aiCardSpacing

      character = aiCharacters[aiPlayers[0].charID]
      characterWidth = @spriteRenderer.calcWidth(character.sprite, characterHeight)
      @spriteRenderer.render character.sprite, characterMargin, @charCeiling, 0, characterHeight, 0, 0, 1, @colors.white, =>
        # @debug()
      @renderCount aiPlayers[0], @thirteen.money, drawGameOver, aiPlayers[0].index == @thirteen.turn, countHeight, characterMargin + (characterWidth / 2), @charCeiling - textPadding, 0.5, 0

    # top side
    if aiPlayers[1] != null
      if drawGameOver
        @renderAIHand aiPlayers[1].hand, @width * 0.6, @height * 0.18, aiCardSpacing

      character = aiCharacters[aiPlayers[1].charID]
      @spriteRenderer.render character.sprite, @center.x, 0, 0, characterHeight, 0, 0.5, 0, @colors.white
      @renderCount aiPlayers[1], @thirteen.money, drawGameOver, aiPlayers[1].index == @thirteen.turn, countHeight, @center.x, characterHeight, 0.5, 0

    # right side
    if aiPlayers[2] != null
      if drawGameOver
        @renderAIHand aiPlayers[2].hand, @width * 0.7, @height * 0.62, aiCardSpacing

      character = aiCharacters[aiPlayers[2].charID]
      characterWidth = @spriteRenderer.calcWidth(character.sprite, characterHeight)
      @spriteRenderer.render character.sprite, @width - characterMargin, @charCeiling, 0, characterHeight, 0, 1, 1, @colors.white
      @renderCount aiPlayers[2], @thirteen.money, drawGameOver, aiPlayers[2].index == @thirteen.turn, countHeight, @width - (characterMargin + (characterWidth / 2)), @charCeiling - textPadding, 0.5, 0

    # card area
    handAreaHeight = 0.27 * @height
    cardAreaText = null
    switch @hand.mode
      when Hand.PICKING
        handareaColor = @colors.hand_pick
        if (@thirteen.turn == 0) and (@thirteen.everyonePassed() or (@thirteen.currentPlay == null))
          handareaColor = @colors.hand_any
          if @thirteen.pile.length == 0
            cardAreaText = 'Anything (3\xc8)'
          else
            cardAreaText = 'Anything'
      when Hand.PUSHING
        handareaColor = @colors.hand_push
        cardAreaText = 'Sorting'
      else
        cardAreaText = 'Dragging'
        handareaColor = @colors.hand_drag
    @spriteRenderer.render "solid", 0, @height, @width, handAreaHeight, 0, 0, 1, handareaColor, =>
      @hand.cycleMode()

    # pile
    pileDimension = @height * 0.4
    pileSprite = "pile"
    if (@thirteen.turn >= 0) and (@thirteen.turn <= 3)
      pileSprite += @thirteen.turn
    @spriteRenderer.render pileSprite, @width / 2, @height / 2, pileDimension, pileDimension, 0, 0.5, 0.5, @colors.white, =>
      @playPicked()
    @pile.render()

    @hand.render()

    if drawGameOver
      # @spriteRenderer.render "solid", 0, 0, @width, @height - handAreaHeight, 0, 0, 0, @colors.play_again

      lines = @gameOverText()
      gameOverSize = @aaHeight / 8
      gameOverY = @center.y
      if lines.length > 1
        gameOverY -= (gameOverSize >> 1)
      @fontRenderer.render @font, gameOverSize, lines[0], @center.x, gameOverY, 0.5, 0.5, @colors.game_over
      if lines.length > 1
        gameOverY += gameOverSize
        @fontRenderer.render @font, gameOverSize, lines[1], @center.x, gameOverY, 0.5, 0.5, @colors.game_over

      playAgainText = "Play Again"
      if @thirteen.someoneGaveUp()
        playAgainText = "New Money Game"
      @spriteRenderer.render "solid", 0, @height, @width, handAreaHeight, 0, 0, 1, @colors.play_again, =>
        if @thirteen.someoneGaveUp()
          @thirteen.newGame(true, true) # special case: allow you to keep your streaks going
        else
          @thirteen.deal()
        @prepareGame()

      restartQuitSize = @aaHeight / 12
      shadowDistance = restartQuitSize / 8
      @fontRenderer.render @font, restartQuitSize, playAgainText, shadowDistance + @center.x, shadowDistance + (@height - (handAreaHeight * 0.5)), 0.5, 1, @colors.black
      @fontRenderer.render @font, restartQuitSize, playAgainText, @center.x, @height - (handAreaHeight * 0.5), 0.5, 1, @colors.gold

    @renderCount @thirteen.players[0], @thirteen.money, drawGameOver, 0 == @thirteen.turn, countHeight, @center.x, @height, 0.5, 1

    # Headline (includes error)
    @fontRenderer.render @font, textHeight, @calcHeadline(), 0, 0, 0, 0, @colors.lightgray

    @spriteRenderer.render "pause", @width, 0, 0, @pauseButtonSize, 0, 1, 0, @colors.white, =>
      @renderMode = RenderMode.PAUSE

    if cardAreaText != null
      @fontRenderer.render @font, textHeight, cardAreaText, 0.02 * @width, @height - handAreaHeight, 0, 0, @colors.white

    if @achievementFanfare != null
      if @achievementFanfare.time < 1000
        opacity = @achievementFanfare.time / 1000
      else if @achievementFanfare.time > 4000
        opacity = 1 - ((@achievementFanfare.time - 4000) / 1000)
      else
        opacity = 1
      color = {r:1, g:1, b:1, a:opacity}
      x = @width * 0.6
      y = 0
      xText = x + (@width * 0.06)
      @spriteRenderer.render "au", x, y, 0, @height / 10, 0, 0, 0, color, =>
        @achievementFanfare = null
        @renderMode = RenderMode.ACHIEVEMENTS
      @fontRenderer.render @font, textHeight, "Achievement Earned", xText, y, 0, 0, color
      @fontRenderer.render @font, textHeight, @achievementFanfare.title, xText, y + textHeight, 0, 0, color

    return

  renderCount: (player, money, drawGameOver, myTurn, countHeight, x, y, anchorx, anchory) ->
    if myTurn
      nameColor = "`ff7700`"
    else
      nameColor = ""
    nameString = " #{nameColor}#{player.name}``"
    if money
      player.money ?= 0
      nameString += ": $ `aaffaa`#{player.money}"
    nameString += " "
    cardCount = player.hand.length
    if drawGameOver or (cardCount == 0)
      if money
        placeString = "4th"
        if player.place == 1
          placeString = "1st"
        else if player.place == 2
          placeString = "2nd"
        else if player.place == 3
          placeString = "3rd"
        countString = " `ffaaff`#{placeString}`` Place "
      else
        if player.place == 1
          countString = " `ffffaa`Winner`` "
        else
          countString = " `ffaaff`Loser`` "
    else
      countString = " `ffff33`#{cardCount}`` left "

    nameSize = @fontRenderer.size(@font, countHeight, nameString)
    countSize = @fontRenderer.size(@font, countHeight, countString)
    if nameSize.w > countSize.w
      countSize.w = nameSize.w
    else
      nameSize.w = countSize.w
    nameY = y
    countY = y
    boxHeight = countSize.h
    if true # player.id != 1
      boxHeight *= 2
      if anchory > 0
        nameY -= countHeight
      else
        countY += countHeight
    @spriteRenderer.render "solid", x, y, countSize.w, boxHeight, 0, anchorx, anchory, @colors.overlay
    @fontRenderer.render @font, countHeight, nameString, x, nameY, anchorx, anchory, @colors.white
    if true # player.id != 1
      @fontRenderer.render @font, countHeight, countString, x, countY, anchorx, anchory, @colors.white

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
