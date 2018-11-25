MIN_PLAYERS = 3
MAX_LOG_LINES = 7
OK = 'OK'

Suit =
  NONE: -1
  SPADES: 0
  CLUBS: 1
  DIAMONDS: 2
  HEARTS: 3

SuitName = ['Spades', 'Clubs', 'Diamonds', 'Hearts']
ShortSuitName = ['S', 'C', 'D', 'H']

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

cardsToString = (rawCards) ->
  cardNames = []
  for raw in rawCards
    card = new Card(raw)
    cardNames.push card.name
  return "[ " + cardNames.join(',') + " ]"

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
    names = "log players turn pile pileWho throwID currentPlay".split(" ")
    state = {}
    for name in names
      state[name] = this[name]
    return state

  output: (text) ->
    @log.push text
    if @log.length > MAX_LOG_LINES
      @log.shift()

  headline: ->
    if @winner() != null
      return "Game Over"

    if @currentPlay
      playString = @currentPlay.type + " (#{@currentPlay.high})"
    else
      playString = "Anything"

    currentPlayer = @currentPlayer()
    headline = playString + " to " + currentPlayer.name
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

    # look for X of a kind
    reqValue = cards[0].value
    highestRaw = cards[0].raw
    for card in cards
      if card.value != reqValue
        return null
      if highestRaw < card.raw
        highestRaw = card.raw
    type = 'kind' + cards.length
    return {
      type: type
      high: highestRaw
    }

  canPass: (params) ->
    if @winner() != null
      return 'gameOver'

    currentPlayer = @currentPlayer()
    if params.id != currentPlayer.id
      return 'notYourTurn'

    if @everyonePassed()
      return 'throwAnything'

    return OK

  canPlay: (params, incomingPlay) ->
    if @winner() != null
      return 'gameOver'

    currentPlayer = @currentPlayer()
    if params.id != currentPlayer.id
      return 'notYourTurn'

    currentPlayer = @currentPlayer()
    if currentPlayer.pass
      return 'mustPass'

    if incomingPlay == null
      return 'invalidPlay'

    if @currentPlay == null
      return OK

    if @everyonePassed()
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
    ret = @canPlay(params, incomingPlay)
    if ret != OK
      return ret

    # TODO: make pretty names based on the play, add play to headline
    verb = "continues with"
    if @currentPlay
      if (incomingPlay.type != @currentPlay.type) or (incomingPlay.high < @currentPlay.high)
        # New play!
        @unpassAll()
        verb = "throws new play"

    @currentPlay = incomingPlay

    @throwID += 1
    currentPlayer = @currentPlayer()
    currentPlayer.hand = @removeCards(currentPlayer.hand, params.cards)

    @output("#{currentPlayer.name} #{verb} #{cardsToString(params.cards)}")

    if currentPlayer.hand.length == 0
      @output("#{currentPlayer.name} wins!")

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
      if currentPlayer.pass
        @aiLog("autopassing for player")
        @aiPass(currentPlayer)
        return true
      return false

    character = aiCharacters[currentPlayer.charID]
    ret = @brains[character.brain].play.apply(this, [currentPlayer, @currentPlay, @everyonePassed()])
    if ret == OK
      return true
    return false

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
          @aiLog("already passed, going to keep passing")
          return @aiPass(currentPlayer)

        if currentPlay and not everyonePassed
          if currentPlay.type != 'kind1'
            @aiLog("unwilling to do anything but singles, passing")
            return @aiPass(currentPlayer)
        else
          # no current play, throw the first card
          @aiLog("I can do anything, throwing a single")
          if @aiPlay(currentPlayer, [currentPlayer.hand[0]]) == OK
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
# Exports

module.exports =
  Card: Card
  Thirteen: Thirteen
  OK: OK
  aiCharacters: aiCharacters
