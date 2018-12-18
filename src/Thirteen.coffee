MIN_PLAYERS = 3
MAX_LOG_LINES = 6
OK = 'OK'

Suit =
  NONE: -1
  SPADES: 0
  CLUBS: 1
  DIAMONDS: 2
  HEARTS: 3

SuitName = ['Spades', 'Clubs', 'Diamonds', 'Hearts']
ShortSuitName = ['S', 'C', 'D', 'H']
GlyphSuitName = ["\xc8", "\xc9", "\xca", "\xcb"]

# ---------------------------------------------------------------------------------------------------------------------------
# AI Name Generator

aiCharacterList = [
  { id: "mario",    name: "Mario",      sprite: "mario",    brain: "normal" }
  { id: "luigi",    name: "Luigi",      sprite: "luigi",    brain: "normal" }
  { id: "peach",    name: "Peach",      sprite: "peach",    brain: "normal" }
  { id: "daisy",    name: "Daisy",      sprite: "daisy",    brain: "normal" }
  { id: "yoshi",    name: "Yoshi",      sprite: "yoshi",    brain: "normal" }
  { id: "toad",     name: "Toad",       sprite: "toad",     brain: "normal" }
  { id: "bowser",   name: "Bowser",     sprite: "bowser",   brain: "normal" }
  { id: "bowserjr", name: "Bowser Jr",  sprite: "bowserjr", brain: "normal" }
  { id: "koopa",    name: "Koopa",      sprite: "koopa",    brain: "normal" }
  { id: "rosalina", name: "Rosalina",   sprite: "rosalina", brain: "normal" }
  { id: "shyguy",   name: "Shyguy",     sprite: "shyguy",   brain: "normal" }
  { id: "toadette", name: "Toadette",   sprite: "toadette", brain: "normal" }
]

aiCharacters = {}
for character in aiCharacterList
  aiCharacters[character.id] = character

randomCharacter = ->
  r = Math.floor(Math.random() * aiCharacterList.length)
  return aiCharacterList[r]

# ---------------------------------------------------------------------------------------------------------------------------
# Card

class Card
  constructor: (@raw) ->
    @suit  = Math.floor(@raw % 4)
    @value = Math.floor(@raw / 4)
    @valueName = switch @value
      when  8 then 'J'
      when  9 then 'Q'
      when 10 then 'K'
      when 11 then 'A'
      when 12 then '2'
      else
        String(@value + 3)
    @name = @valueName + ShortSuitName[@suit]
    # console.log "#{@raw} -> #{@name}"
  glyphedName: ->
    return @valueName + GlyphSuitName[@suit]

cardsToString = (rawCards) ->
  cardNames = []
  for raw in rawCards
    card = new Card(raw)
    cardNames.push card.name
  return "[ " + cardNames.join(',') + " ]"

playTypeToString = (type) ->
  if matches = type.match(/^rop(\d+)/)
    return "Run of #{matches[1]} Pairs"
  if matches = type.match(/^run(\d+)/)
    return "Run of #{matches[1]}"
  if matches = type.match(/^kind(\d+)/)
    if matches[1] == '1'
      return 'Single'
    if matches[1] == '2'
      return 'Pair'
    if matches[1] == '3'
      return 'Trips'
    return 'Quads'
  return type

playToString = (play) ->
  highCard = new Card(play.high)
  return "#{playTypeToString(play.type)} - #{highCard.glyphedName()}"

# ---------------------------------------------------------------------------------------------------------------------------
# Deck

class ShuffledDeck
  constructor: ->
    # dat inside-out shuffle!
    @cards = [ 0 ]
    for i in [1...52]
      j = Math.floor(Math.random() * i)
      @cards.push(@cards[j])
      @cards[j] = i

# ---------------------------------------------------------------------------------------------------------------------------
# Thirteen

class Thirteen
  constructor: (@game, params) ->
    return if not params

    if params.state
      for k,v of params.state
        if params.state.hasOwnProperty(k)
          this[k] = params.state[k]
    else
      # new game
      @log = []
      @streak = 0
      @lastStreak = 0

      @players = [
        { id: 1, name: 'Player', index: 0, pass: false }
      ]

      for i in [1...4]
        @addAI()

      @deal()

  deal: (params) ->
    deck = new ShuffledDeck()
    for player, playerIndex in @players
      @game.log "dealing 13 cards to player #{playerIndex}"

      player.hand = []
      for j in [0...13]
        raw = deck.cards.shift()
        if raw == 0
          @turn = playerIndex
        player.hand.push(raw)

      console.log "@game.options.sortIndex #{@game.options.sortIndex}"
      if (@game.options.sortIndex == 0) or player.ai
        # Normal
        player.hand.sort (a,b) -> return a - b
      else
        # Reverse
        player.hand.sort (a,b) -> return b - a

    @pile = []
    @pileWho = -1
    @throwID = 0
    @currentPlay = null
    @unpassAll()

    @output('Hand dealt, ' + @players[@turn].name + ' plays first')

    return OK

  # ---------------------------------------------------------------------------------------------------------------------------
  # Thirteen methods

  save: ->
    names = "log players turn pile pileWho throwID currentPlay streak lastStreak".split(" ")
    state = {}
    for name in names
      state[name] = this[name]
    return state

  output: (text) ->
    @log.push text
    while @log.length > MAX_LOG_LINES
      @log.shift()

  headline: ->
    if @winner() != null
      return "Game Over"

    if @pile.length == 0
      playString = "throw Anything with the 3\xc8"
    else
      if @currentPlay
        playString = "beat " + playToString(@currentPlay)
      else
        playString = "throw Anything"

    currentPlayer = @currentPlayer()
    if currentPlayer.ai
      playerColor = 'b0b000'
    else
      playerColor = 'ff7700'
    headline = "`#{playerColor}`#{currentPlayer.name}`ffffff` to #{playString}"
    if @everyonePassed()
      headline += " (or throw anything)"
    return headline

  findPlayer: (id) ->
    for player in @players
      if player.id == id
        return player
    return undefined

  currentPlayer: ->
    return @players[@turn]

  everyonePassed: ->
    for player, playerIndex in @players
      if playerIndex == @turn
        continue
      if not player.pass
        return false
    return true

  playerAfter: (index) ->
    return (index + 1) % @players.length

  addPlayer: (player) ->
    if not player.ai
      player.ai = false

    @players.push player
    player.index = @players.length - 1
    @output(player.name + " joins the game")

  namePresent: (name) ->
    for player in @players
      if player.name == name
        return true

    return false

  addAI: ->
    loop
      character = randomCharacter()
      if not @namePresent(character.name)
        break

    ai =
      charID: character.id
      name: character.name
      id: 'ai' + String(@players.length)
      pass: false
      ai: true

    @addPlayer(ai)

    @game.log("added AI player")
    return OK

  updatePlayerHand: (cards) ->
    # This maintains the reorganized order of the player's hand
    @players[0].hand = cards.slice(0)

  winner: ->
    for player, i in @players
      if player.hand.length == 0
        return player
    return null

  hasCard: (hand, rawCard) ->
    for raw in hand
      if raw == rawCard
        return true
    return false

  hasCards: (hand, rawCards) ->
    for raw in rawCards
      if not @hasCard(hand, raw)
        return false
    return true

  removeCards: (hand, rawCards) ->
    newHand = []
    for card in hand
      keepMe = true
      for raw in rawCards
        if card == raw
          keepMe = false
          break
      if keepMe
        newHand.push card
    return newHand

  classify: (rawCards) ->
    cards = rawCards.map (raw) -> new Card(raw)
    cards = cards.sort (a, b) -> return a.raw - b.raw
    highestRaw = cards[cards.length - 1].raw

    # look for a run of pairs
    if (cards.length >= 6) and ((cards.length % 2) == 0)
      foundRop = true
      for card, cardIndex in cards
        if cardIndex == 0
          continue
        if card.value == 12
          # no 2s in a run
          foundRop = false
          break
        if (cardIndex % 2) == 1
          # odd card, must match last card exactly
          if card.value != (cards[cardIndex - 1].value)
            foundRop = false
            break
        else
          # even card, must increment
          if card.value != (cards[cardIndex - 1].value + 1)
            foundRop = false
            break

      if foundRop
        return {
          type: 'rop' + Math.floor(cards.length / 2)
          high: highestRaw
        }

    # look for a run
    if cards.length >= 3
      foundRun = true
      for card, cardIndex in cards
        if cardIndex == 0
          continue
        if card.value == 12
          # no 2s in a run
          foundRun = false
          break
        if card.value != (cards[cardIndex - 1].value + 1)
          foundRun = false
          break

      if foundRun
        return {
          type: 'run' + cards.length
          high: highestRaw
        }

    # look for X of a kind
    reqValue = cards[0].value
    for card in cards
      if card.value != reqValue
        return null
    type = 'kind' + cards.length
    return {
      type: type
      high: highestRaw
    }

  handHas3S: (hand) ->
    for raw in hand
      if raw == 0
        return true
    return false

  canPass: (params) ->
    if @winner() != null
      return 'gameOver'

    currentPlayer = @currentPlayer()
    if params.id != currentPlayer.id
      return 'notYourTurn'

    if @pile.length == 0
      return 'mustThrow3S'

    if @everyonePassed()
      return 'throwAnything'

    return OK

  canPlay: (params, incomingPlay, handHas3S) ->
    if @winner() != null
      return 'gameOver'

    currentPlayer = @currentPlayer()
    if params.id != currentPlayer.id
      return 'notYourTurn'

    if incomingPlay == null
      return 'invalidPlay'

    if @pile.length == 0
      if not handHas3S
        return 'mustThrow3S'

    currentPlayer = @currentPlayer()
    if currentPlayer.pass
      if @currentPlay and @canBeBroken(@currentPlay)
        if @isBreakerType(incomingPlay.type)
          return OK
        else
          return 'mustBreakOrPass'
      return 'mustPass'

    if @currentPlay == null
      return OK

    if @everyonePassed()
      return OK

    if @canBeBroken(@currentPlay) and @isBreakerType(incomingPlay.type)
      # 2 breaker!
      return OK

    if incomingPlay.type != @currentPlay.type
      return 'wrongPlay'

    if incomingPlay.high < @currentPlay.high
      return 'tooLowPlay'

    return OK

  play: (params) ->
    incomingPlay = @classify(params.cards)
    console.log "incomingPlay", incomingPlay

    console.log "someone calling play", params
    ret = @canPlay(params, incomingPlay, @handHas3S(params.cards))
    if ret != OK
      return ret

    # TODO: make pretty names based on the play, add play to headline
    verb = "throws:"
    if @currentPlay
      if @canBeBroken(@currentPlay) and @isBreakerType(incomingPlay.type)
        # 2 breaker!
        @unpassAll()
        verb = "breaks 2:"
      else if (incomingPlay.type != @currentPlay.type) or (incomingPlay.high < @currentPlay.high)
        # New play!
        @unpassAll()
        verb = "throws new:"
    else
      verb = "begins:"

    @currentPlay = incomingPlay

    @throwID += 1
    currentPlayer = @currentPlayer()
    currentPlayer.hand = @removeCards(currentPlayer.hand, params.cards)

    @output("#{currentPlayer.name} #{verb} #{playToString(incomingPlay)}")

    if currentPlayer.hand.length == 0
      @output("#{currentPlayer.name} wins!")
      if currentPlayer.ai
        @lastStreak = @streak
        @streak = 0
      else
        @streak += 1
        @lastStreak = @streak

    @pile = params.cards.slice(0)
    @pileWho = @turn

    @turn = @playerAfter(@turn)
    return OK

  unpassAll: ->
    for player in @players
      player.pass = false
    return

  pass: (params) ->
    ret = @canPass(params)
    if ret != OK
      return ret

    currentPlayer = @currentPlayer()
    if currentPlayer.pass
      @output("#{currentPlayer.name} auto-passes")
    else
      @output("#{currentPlayer.name} passes")
    currentPlayer.pass = true
    @turn = @playerAfter(@turn)
    return OK

  aiPlay: (currentPlayer, cards) ->
    return @play({'id':currentPlayer.id, 'cards':cards})

  aiPass: (currentPlayer) ->
    return @pass({'id':currentPlayer.id})

  # ---------------------------------------------------------------------------------------------------------------------------
  # AI

  # Generic logging function; prepends current AI player's guts before printing text
  aiLog: (text) ->
    currentPlayer = @currentPlayer()
    if not currentPlayer.ai
      return false

    character = aiCharacters[currentPlayer.charID]
    @game.log('AI['+currentPlayer.name+' '+character.brain+']: hand:'+cardsToString(currentPlayer.hand)+' pile:'+cardsToString(@pile)+' '+text)

  # Detects if the current player is AI during a BID or TRICK phase and acts according to their 'brain'
  aiTick: ->
    if @winner() != null
      return false

    currentPlayer = @currentPlayer()
    if not currentPlayer.ai
      if @currentPlay and (@currentPlay.type == 'kind1') and @hasBreaker(currentPlayer.hand)
        # do nothing, player can drop a breaker
      else if currentPlayer.pass
        @aiLog("autopassing for player")
        @aiPass(currentPlayer)
        return true
      return false

    character = aiCharacters[currentPlayer.charID]
    ret = @brains[character.brain].play.apply(this, [currentPlayer, @currentPlay, @everyonePassed()])
    if ret == OK
      return true
    return false

  alCalcKinds: (hand, plays, match2s = false) ->
    cards = hand.map (raw) -> new Card(raw)
    cards = cards.sort (a, b) -> return a.raw - b.raw
    valueArrays = []
    for i in [0...13]
      valueArrays.push []
    for card in cards
      valueArrays[card.value].push(card)

    hand = []
    for valueArray, value in valueArrays
      if (valueArray.length > 1) and (match2s or (value < 12))
        key = "kind#{valueArray.length}"
        plays[key] ?= []
        plays[key].push valueArray.map (v) -> v.raw
      else
        for v in valueArray
          hand.push v.raw

    return hand

  aiFindRuns: (hand, eachSize, size) ->
    runs = []

    cards = hand.map (raw) -> new Card(raw)
    cards = cards.sort (a, b) -> return a.raw - b.raw
    valueArrays = []
    for i in [0...13]
      valueArrays.push []
    for card in cards
      valueArrays[card.value].push(card)

    lastStartingValue = 12 - size
    for startingValue in [0...lastStartingValue]
      runFound = true
      for offset in [0...size]
        if valueArrays[startingValue+offset].length < eachSize
          runFound = false
          break
      if runFound
        run = []
        for offset in [0...size]
          for each in [0...eachSize]
            run.push(valueArrays[startingValue+offset].pop().raw)
        runs.push run

    leftovers = []
    for valueArray in valueArrays
      for card in valueArray
        leftovers.push card.raw

    return [runs, leftovers]

  aiCalcRuns: (hand, plays, smallRuns) ->
    if smallRuns
      startSize = 3
      endSize = 12
      byAmount = 1
    else
      startSize = 12
      endSize = 3
      byAmount = -1
    for runSize in [startSize..endSize] by byAmount
      [runs, leftovers] = @aiFindRuns(hand, 1, runSize)
      if runs.length > 0
        key = "run#{runSize}"
        plays[key] = runs
      hand = leftovers

    return hand

  aiCalcRops: (hand, plays) ->
    startSize = 3
    endSize = 6
    for runSize in [startSize..endSize]
      [rops, leftovers] = @aiFindRuns(hand, 2, runSize)
      if rops.length > 0
        key = "rop#{runSize}"
        plays[key] = rops
      hand = leftovers

    return hand

  aiCalcPlays: (hand, strategy = {}) ->
    plays = {}

    # We always want to use rops if we have one
    if strategy.seesRops
      hand = @aiCalcRops(hand, plays)

    if strategy.prefersRuns
      hand = @aiCalcRuns(hand, plays, strategy.smallRuns)
      hand = @alCalcKinds(hand, plays, strategy.match2s)
    else
      hand = @alCalcKinds(hand, plays, strategy.match2s)
      hand = @aiCalcRuns(hand, plays, strategy.smallRuns)

    kind1 = hand.map (v) -> [v]
    if kind1.length > 0
      plays.kind1 = kind1
    return plays

  numberOfSingles: (plays) ->
    if not plays.kind1?
      return 0
    nonTwoSingles = 0
    for raw in plays.kind1
      if raw < 48
        nonTwoSingles += 1
    return nonTwoSingles

  breakerPlays: (hand) ->
    return @aiCalcPlays(hand, { seesRops: true, prefersRuns: false })

  isBreakerType: (playType) ->
    if playType.match(/^rop/) or playType == 'kind4'
      return true
    return false

  canBeBroken: (play) ->
    if play.type != 'kind1'
      return false
    card = new Card(play.high)
    return (card.value == 12)

  hasBreaker: (hand) ->
    plays = @breakerPlays(hand)
    for playType, playlist of plays
      if @isBreakerType(playType)
        if playlist.length > 0
          return true
    return false

  aiCalcBestPlays: (hand) ->
    bestPlays = null
    for bits in [0...16]
      strategy =
        smallRuns: (bits & 1) == 1
        prefersRuns: (bits & 2) == 2
        match2s: (bits & 4) == 4
        seesRops: (bits & 8) == 8
      plays = @aiCalcPlays(hand, strategy)
      if bestPlays == null
        bestPlays = plays
      else
        np = @numberOfSingles(plays)
        nbp = @numberOfSingles(bestPlays)
        if np < nbp
          bestPlays = plays
        else if np == nbp
          # flip a coin!
          if Math.floor(Math.random() * 2) == 0
            bestPlays = plays
    return bestPlays

  prettyPlays: (plays, extraPretty = false) ->
    pretty = {}
    for type, arr of plays
      pretty[type] = []
      for play in arr
        names = []
        for raw in play
          card = new Card(raw)
          names.push(card.name)
        pretty[type].push(names)
    if extraPretty
      s = ""
      for typeName, throws of pretty
        s += "      * #{playTypeToString(typeName)}:\n"
        if typeName == 'kind1'
          s += "        * #{throws.map((v) -> v[0]).join(',')}\n"
        else
          for t in throws
            s += "        * #{t.join(',')}\n"
      return s
    return JSON.stringify(pretty)

  highestCard: (play) ->
    highest = 0
    for p in play
      if highest < p
        highest = p
    return highest

  findPlayWith3S: (plays) ->
    for playType, playlist of plays
      for play in playlist
        if @handHas3S(play)
          return play

    console.log "findPlayWith3S: something impossible is happening"
    return []

# ---------------------------------------------------------------------------------------------------------------------------
# AI Brains

  # Brains must have:
  # * id: internal identifier for the brain
  # * name: pretty name
  # * play(currentPlayer) attempts to play a card by calling aiPlay(). Should return true if it successfully played a card (aiPlay() returned true)
  brains:

    # ------------------------------------------------------------
    # Normal: Intended to be used by most characters.
    #         Not too dumb, not too smart.
    normal:
      id:   "normal"
      name: "Normal"

      # normal
      play: (currentPlayer, currentPlay, everyonePassed) ->
        if currentPlayer.pass
          if @canBeBroken(currentPlay) and @hasBreaker(currentPlayer.hand)
            breakerPlays = @breakerPlays(currentPlayer.hand)
            for playType, playlist of breakerPlays
              if (playType.match(/^rop/) or (playType == 'kind4')) and (playlist.length > 0)
                @aiLog("breaking 2")
                if @aiPlay(currentPlayer, playlist[0]) == OK
                  return OK

          @aiLog("already passed, going to keep passing")
          return @aiPass(currentPlayer)

        plays = @aiCalcBestPlays(currentPlayer.hand)
        @aiLog("best plays: #{@prettyPlays(plays)}")

        if @pile.length == 0
          play = @findPlayWith3S(plays)
          @aiLog("Throwing my play with the 3S in it")
          if @aiPlay(currentPlayer, play) == OK
            return OK

        if currentPlay and not everyonePassed
          if plays[currentPlay.type]? and (plays[currentPlay.type].length > 0)
            for play in plays[currentPlay.type]
              if @highestCard(play) > currentPlay.high
                if @aiPlay(currentPlayer, play) == OK
                  return OK
            @aiLog("I guess I can't actually beat this, passing")
            return @aiPass(currentPlayer)
          else
            @aiLog("I don't have that play, passing")
            return @aiPass(currentPlayer)
        else
          # no current play, throw the first card
          @aiLog("I can do anything, throwing a random play")
          playTypes = Object.keys(plays)
          playTypeIndex = Math.floor(Math.random() * playTypes.length)
          if @aiPlay(currentPlayer, plays[playTypes[playTypeIndex]][0]) == OK
            return OK

        # find the first card that beats the currentPlay's high
        for rawCard in currentPlayer.hand
          if rawCard > currentPlay.high
            @aiLog("found smallest single (#{rawCard}), playing")
            if @aiPlay(currentPlayer, [rawCard]) == OK
              return OK
            break

        @aiLog("nothing else to do, passing")
        return @aiPass(currentPlayer)

# ---------------------------------------------------------------------------------------------------------------------------
# Debug code

debug = ->
  thir = new Thirteen()
  fullyPlayed = 0
  totalAttempts = 100

  for attempt in [0...totalAttempts]
    deck = new ShuffledDeck()
    hand = []
    for j in [0...13]
      raw = deck.cards.shift()
      hand.push(raw)
    # hand = [51,50,49,48,47,46,45,44,43,42,41,40,39]
    # hand = [0,1,2,3,4,5,6,7,8,9,10,11,12]
    hand.sort (a,b) -> return a - b

    console.log("------------------------------------------------------------------------")
    console.log("Hand #{attempt+1}: #{cardsToString(hand)}")
    console.log("")

    foundFullyPlayed = false
    for bits in [0...16]
      strategy =
        smallRuns: (bits & 1) == 1
        prefersRuns: (bits & 2) == 2
        match2s: (bits & 4) == 4
        seesRops: (bits & 8) == 8
      plays = thir.aiCalcPlays(hand, strategy)

      console.log("   * Strategy: #{JSON.stringify(strategy)}")
      console.log(thir.prettyPlays(plays, true))

      if not plays.kind1
        foundFullyPlayed = true

    if foundFullyPlayed
      fullyPlayed += 1

  console.log "fullyPlayed: #{fullyPlayed} / #{totalAttempts}"

# debug()

# ---------------------------------------------------------------------------------------------------------------------------
# Exports

module.exports =
  Card: Card
  Thirteen: Thirteen
  OK: OK
  aiCharacters: aiCharacters
