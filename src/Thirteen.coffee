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

playToCardCount = (play) ->
  if matches = play.type.match(/^rop(\d+)/)
    return parseInt(matches[1]) * 2
  if matches = play.type.match(/^run(\d+)/)
    return parseInt(matches[1])
  if matches = play.type.match(/^kind(\d+)/)
    return parseInt(matches[1])
  return 1 # ??

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
# Achievements

achievementsList = [
  {
    id: "veteran"
    title: "I've Seen Some Things"
    description: ["Play 50 Hands."]
    progress: (ach) ->
      if ach.state.totalGames >= 50
        return "Total Played: `aaffaa`#{ach.state.totalGames}`` Games"
      return "Progress: #{ach.state.totalGames} / 50"
  }
  {
    id: "tryhard"
    title: "Tryhard"
    description: ["Earn a 5 game win streak."]
    progress: (ach) ->
      bestStreak = ach.state.bestStreak
      bestStreak ?= 0
      if bestStreak >= 5
        return "Best Streak: `aaffaa`#{bestStreak}`` Wins"
      s = ""
      if bestStreak > 1
        s = "s"
      return "Best Streak: #{bestStreak} Win#{s}"
  }
  {
    id: "breaker"
    title: "Spring Break"
    description: ["Break a 2."]
  }
  {
    id: "keepitlow"
    title: "Keep It Low, Boys"
    description: ["Play a Single 2 on top of a Single 3."]
  }
  {
    id: "suited"
    title: "Doesn't Even Matter"
    description: ["Throw a suited run."]
  }
  {
    id: "tony"
    title: "The Tony"
    description: ["Throw a run of 7 or more cards, and then lose."]
  }
  {
    id: "sampler"
    title: "Sampler Platter"
    description: ["In a single hand: play at least one Single,", "one Pair, one Trips, and one Run."]
  }
  {
    id: "tragedy"
    title: "Tragedy"
    description: ["Begin the game by throwing a two breaker involving", "the 3 of Spades."]
  }
  {
    id: "indomitable"
    title: "Indomitable"
    description: ["Throw a run ending in the Ace of Hearts."]
  }
  {
    id: "rekt"
    title: "Get Rekt"
    description: ["Win while all opponents still have 10 or more cards."]
  }
  {
    id: "late"
    title: "Fashionably Late"
    description: ["Pass until all 4 2s are thrown, and then win."]
  }
  {
    id: "pairs"
    title: "Pairing Up"
    description: ["Throw 5 pairs in a single round."]
  }
  {
    id: "yourself"
    title: "You Played Yourself"
    description: ["Beat your own play."]
  }
  {
    id: "thirteen"
    title: "Thirteen"
    description: ["Earn 13 achievements."]
  }
]

achievementsMap = {}
for e in achievementsList
  achievementsMap[e.id] = e

# ---------------------------------------------------------------------------------------------------------------------------
# Thirteen

class Thirteen
  @STARTING_MONEY: 25

  constructor: (@game, params) ->
    return if not params

    if params.state
      for k,v of params.state
        if params.state.hasOwnProperty(k)
          this[k] = params.state[k]
      @initAchievements()
    else
      @newGame(params.money)

  initAchievements: ->
    @ach ?= {}
    @ach.earned ?= {}
    @ach.state ?= {}
    @ach.state.totalGames ?= 0
    @fanfares = []

  deal: (params) ->
    deck = new ShuffledDeck()
    for player, playerIndex in @players
      @game.log "dealing 13 cards to player #{playerIndex}"

      player.place = 0
      player.hand = []
      for j in [0...13]
        raw = deck.cards.shift()
        if raw == 0
          @turn = playerIndex
        player.hand.push(raw)

      # console.log "@game.options.sortIndex #{@game.options.sortIndex}"
      if (@game.options.sortIndex == 0) or player.ai
        # Normal
        player.hand.sort (a,b) -> return a - b
      else
        # Reverse
        player.hand.sort (a,b) -> return b - a

    @initAchievements()
    @ach.state.threwSingle = false
    @ach.state.threwPair = false
    @ach.state.threwTrips = false
    @ach.state.threwRun = false
    @ach.state.threwRun7 = false
    @ach.state.twosSeen = 0
    @ach.state.fashionablyLate = false
    @ach.state.pairsThrown = 0
    @ach.state.bestStreak ?= 0

    @pile = []
    @pileWho = -1
    @throwID = 0
    @currentPlay = null
    @unpassAll()

    forMoney = ""
    if @money
      forMoney = " (for money)"
    @output("Hand dealt#{forMoney}, " + @players[@turn].name + " plays first")

    return OK

  # ---------------------------------------------------------------------------------------------------------------------------
  # Thirteen methods

  newGame: (money = false) ->
    # new game
    @log = []
    @streak = 0
    @lastStreak = 0
    @money = false
    if money
      @money = true
    console.log "for money: #{@money}"

    @players = [
      { id: 1, name: 'Player', index: 0, pass: false, money: Thirteen.STARTING_MONEY }
    ]

    for i in [1...4]
      @addAI()

    @deal()

  save: ->
    names = "log players turn pile pileWho throwID currentPlay streak lastStreak ach money".split(" ")
    state = {}
    for name in names
      state[name] = this[name]
    return state

  output: (text) ->
    @log.push text
    while @log.length > MAX_LOG_LINES
      @log.shift()

  headline: ->
    if @gameOver()
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

  canThrowAnything: ->
    if @pile.length == 0
      return true
    if not @currentPlay
      return true
    if @everyonePassed()
      return true
    return false

  findPlayer: (id) ->
    for player in @players
      if player.id == id
        return player
    return undefined

  currentPlayer: ->
    return @players[@turn]

  findPlace: (place) ->
    for player in @players
      if (place == 4) and (player.place == 0)
        return player
      if player.place == place
        return player
    return undefined

  payout: ->
    place1 = @findPlace(1)
    place2 = @findPlace(2)
    place3 = @findPlace(3)
    place4 = @findPlace(4)

    if not place1 or not place2 or not place3 or not place4
      @output "error with payouts!"
      return

    @output "#{place4.name} pays $2 to #{place1.name}"
    @output "#{place3.name} pays $1 to #{place2.name}"

    place1.money += 2
    place2.money += 1
    place3.money += -1
    place4.money += -2
    return

  # all INCLUDING the current player
  entireTablePassed: ->
    for player, playerIndex in @players
      if player.place != 0
        continue
      if not player.pass
        return false
    return true

  # all but the current player
  everyonePassed: ->
    for player, playerIndex in @players
      if (player.place != 0) and (@pileWho != playerIndex)
        continue
      if playerIndex == @turn
        continue
      if not player.pass
        return false
    return true

  playerAfter: (index) ->
    loop
      index = (index + 1) % @players.length
      if @players[index].place == 0
        return index
    return 0 # impossible?

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
      money: Thirteen.STARTING_MONEY

    @addPlayer(ai)

    @game.log("added AI player")
    return OK

  updatePlayerHand: (cards) ->
    # This maintains the reorganized order of the player's hand
    @players[0].hand = cards.slice(0)

  winner: ->
    for player, i in @players
      if player.place == 1
        return player
    return null

  someoneGaveUp: ->
    if not @money
      return false
    if not @game.options.givingUp
      return false
    for player in @players
      if player.money <= 0
        return true
    return false

  gameOver: ->
    np = @nextPlace()
    if @money
      return (np > 3)
    return (np > 1)

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

  nextPlace: ->
    highestPlace = 0
    for player in @players
      player.place ?= 0
      if highestPlace < player.place
        highestPlace = player.place
    return highestPlace + 1

  splitPlayType: (playType) ->
    if matches = playType.match(/^([^0-9]+)(\d+)/)
      return [matches[1], parseInt(matches[2])]
    return [playType, 1]

  hasPlay: (currentPlay, hand) ->
    # quick check. if you dont have enough cards, you can't have a play
    if (playToCardCount(currentPlay) > hand.length)
      return false

    if @game.options.autopassIndex == 2
      # limited, assume there's a play in there somewhere, if there's enough cards
      return true

    leftovers = []
    plays = {}
    spl = @splitPlayType(currentPlay.type)
    switch spl[0]
      when 'rop'
        leftovers = @aiCalcRops(hand, plays, spl[1])
      when 'run'
        leftovers = @aiCalcRuns(hand, plays, false, spl[1])
      when 'kind'
        leftovers = @alCalcKinds(hand, plays, true)

    plays.kind1 ?= []
    for leftover in leftovers
      plays.kind1.push [leftover]

    if plays[currentPlay.type]? and plays[currentPlay.type].length > 0
        for play in plays[currentPlay.type]
          if @highestCard(play) > currentPlay.high
            return true

    # special case kinds
    if spl[0] == 'kind'
      # check bigger kinds
      for biggerKind in [spl[1]..4]
        biggerType = "kind#{biggerKind}"
        if plays[biggerType]? and plays[biggerType].length > 0
            for play in plays[biggerType]
              if @highestCard(play) > currentPlay.high
                return true

    # no plays, pass
    return false

  canPass: (params) ->
    if @gameOver()
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
    if @gameOver()
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

    breakerThrown = false
    newThrow = true

    # TODO: make pretty names based on the play, add play to headline
    verb = "throws:"
    if @currentPlay
      if @canBeBroken(@currentPlay) and @isBreakerType(incomingPlay.type)
        # 2 breaker!
        @unpassAll()
        verb = "breaks 2:"
        breakerThrown = true
        newThrow = false
      else if (incomingPlay.type != @currentPlay.type) or (incomingPlay.high < @currentPlay.high)
        # New play!
        @unpassAll()
        verb = "throws new:"
      else
        newThrow = false
    else
      verb = "begins:"

    # Achievements
    @ach.state.twosSeen ?= 0
    @ach.state.pairsThrown ?= 0
    for card in params.cards
      if card >= 48
        @ach.state.twosSeen += 1
    if (@ach.state.twosSeen == 4) and (@players[0].hand.length == 13)
      @ach.state.fashionablyLate = true
    console.log "@ach.state.fashionablyLate #{@ach.state.fashionablyLate}"
    if @turn == 0
      if @everyonePassed() and not newThrow
        @earn "yourself"
      if incomingPlay.type == 'kind2'
        @ach.state.pairsThrown += 1
        if @ach.state.pairsThrown >= 5
          @earn "pairs"
      if breakerThrown
        @earn "breaker"
      if @isBreakerType(incomingPlay.type) and (@pile.length == 0)
        @earn "tragedy"
      if @isRunType(incomingPlay.type) and @isSuited(params.cards)
        @earn "suited"
      if @currentPlay and (@currentPlay.type == 'kind1') and (@currentPlay.high <= 3) and (incomingPlay.type == 'kind1') and (incomingPlay.high >= 48)
        @earn "keepitlow"
      if @isRunType(incomingPlay.type) and (incomingPlay.high == 47) # Ace of Hearts
        @earn "indomitable"
      if @isBigRun(incomingPlay, 7)
        console.log "threwRun7: true"
        @ach.state.threwRun7 = true
      if incomingPlay.type == 'kind1'
        @ach.state.threwSingle = true
      if incomingPlay.type == 'kind2'
        @ach.state.threwPair = true
      if incomingPlay.type == 'kind3'
        @ach.state.threwTrips = true
      if incomingPlay.type.match(/^run/)
        @ach.state.threwRun = true
      if @ach.state.threwSingle and @ach.state.threwPair and @ach.state.threwTrips and @ach.state.threwRun
        @earn "sampler"

    @currentPlay = incomingPlay

    @throwID += 1
    currentPlayer = @currentPlayer()
    currentPlayer.hand = @removeCards(currentPlayer.hand, params.cards)

    @output("#{currentPlayer.name} #{verb} #{playToString(incomingPlay)}")

    if currentPlayer.hand.length == 0
      # Game over! do gameover things.

      currentPlayer.place = @nextPlace()

      if @money
        placeString = "4th"
        if currentPlayer.place == 1
          placeString = "1st"
        else if currentPlayer.place == 2
          placeString = "2nd"
        else if currentPlayer.place == 3
          placeString = "3rd"
        @output("#{currentPlayer.name} takes #{placeString} place")

        if currentPlayer.place == 3
          @payout()

          if @game.options.givingUp
            for player in @players
              if player.money <= 0
                @output("#{player.name} gives up")

      else
        @output("#{currentPlayer.name} wins!")

      if currentPlayer.place == 1
        if @turn == 0
          @streak += 1
          @lastStreak = @streak
        else
          @lastStreak = @streak
          @streak = 0

      @ach.state.bestStreak ?= 0
      if @ach.state.bestStreak < @lastStreak
        @ach.state.bestStreak = @lastStreak

      # Achievements
      if @ach.state.bestStreak >= 5
        @earn "tryhard"
      @ach.state.totalGames += 1
      if @ach.state.totalGames >= 50
        @earn "veteran"
      if currentPlayer.place == 1
        if @turn == 0
          # player won
          if (@players[1].hand.length >= 10) and (@players[2].hand.length >= 10) and (@players[3].hand.length >= 10)
            @earn "rekt"
          if @ach.state.fashionablyLate
            @earn "late"
        else
          # player lost
          if @ach.state.threwRun7
            @earn "tony"

    achievementCount = 0
    for achievement in achievementsList
      if @ach.earned[achievement.id]
        achievementCount += 1
    if achievementCount >= 13
      @earn "thirteen"

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
    if not currentPlayer.ai and @currentPlay and not @hasPlay(@currentPlay, currentPlayer.hand)
      @output("#{currentPlayer.name} auto-passes (no plays)")
    else if currentPlayer.pass
      @output("#{currentPlayer.name} auto-passes")
    else
      @output("#{currentPlayer.name} passes")
    currentPlayer.pass = true
    @turn = @playerAfter(@turn)
    @game.pile.poke()
    return OK

  aiPlay: (currentPlayer, cards) ->
    return @play({'id':currentPlayer.id, 'cards':cards})

  aiPass: (currentPlayer) ->
    return @pass({'id':currentPlayer.id})

  earn: (id) ->
    if @ach.earned[id]
      return
    achievement = achievementsMap[id]
    if not achievement?
      return

    @ach.earned[id] = true
    @output("Earned: #{achievement.title}")
    @fanfares.push achievement.title


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
    if @gameOver()
      return false

    if @entireTablePassed()
      @turn = @playerAfter(@pileWho)
      @unpassAll()
      @currentPlay = null
      @output('Whole table passes, control to ' + @players[@turn].name)

    currentPlayer = @currentPlayer()
    if not currentPlayer.ai
      if @game.options.autopassIndex != 0 # Not disabled
        if not @canThrowAnything()
          if @currentPlay and (@currentPlay.type == 'kind1') and (@currentPlay.high >= 48) and @hasBreaker(currentPlayer.hand)
            # do nothing, player can drop a breaker
          else if @currentPlay and not @hasPlay(@currentPlay, currentPlayer.hand)
            @aiLog("autopassing for player, no plays")
            @aiPass(currentPlayer)
            return true
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

  aiFindRuns: (hand, eachSize, size, preferStrongRuns = false) ->
    runs = []

    cards = hand.map (raw) -> new Card(raw)
    cards = cards.sort (a, b) -> return a.raw - b.raw
    valueArrays = []
    for i in [0...13]
      valueArrays.push []
    for card in cards
      valueArrays[card.value].push(card)

    if preferStrongRuns
      firstStartingValue = 12 - size
      lastStartingValue = 0
      byAmount = -1
    else
      firstStartingValue = 0
      lastStartingValue = 12 - size
      byAmount = 1
    for startingValue in [firstStartingValue..lastStartingValue] by byAmount
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

  aiCalcRuns: (hand, plays, smallRuns, singleSize = null) ->
    if singleSize != null
      preferStrongRuns = true
      startSize = singleSize
      endSize = singleSize
      byAmount = 1
    else
      preferStrongRuns = false
      if smallRuns
        startSize = 3
        endSize = 12
        byAmount = 1
      else
        startSize = 12
        endSize = 3
        byAmount = -1
    for runSize in [startSize..endSize] by byAmount
      [runs, leftovers] = @aiFindRuns(hand, 1, runSize, preferStrongRuns)
      if runs.length > 0
        key = "run#{runSize}"
        plays[key] = runs
      hand = leftovers

    return hand

  aiCalcRops: (hand, plays, singleSize = null) ->
    if singleSize != null
      preferStrongRuns = true
      startSize = singleSize
      endSize = singleSize
    else
      preferStrongRuns = false
      startSize = 3
      endSize = 6
    for runSize in [startSize..endSize]
      [rops, leftovers] = @aiFindRuns(hand, 2, runSize, preferStrongRuns)
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

  isRunType: (playType) ->
    if playType.match(/^run/)
      return true
    return false

  isSuited: (hand) ->
    if hand.length < 1
      return false
    cards = hand.map (raw) -> new Card(raw)
    suit = cards[0].suit
    for card in cards
      if card.suit != suit
        return false
    return true

  isBigRun: (play, atLeast) ->
    if matches = play.type.match(/^run(\d+)/)
      len = parseInt(matches[1])
      if len >= atLeast
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

#      H  D  C  S
#  2: 51 50 49 48
#  A: 47 46 45 44
#  K: 43 42 41 40
#  Q: 39 38 37 36
#  J: 35 34 33 32
# 10: 31 30 29 28
#  9: 27 26 25 24
#  8: 23 22 21 20
#  7: 19 18 17 16
#  6: 15 14 13 12
#  5: 11 10  9  8
#  4:  7  6  5  4
#  3:  3  2  1  0

debug2 = ->
  game =
    options:
      autopassIndex: 1
  thir = new Thirteen(game)
  currentPlay =
    type: 'run3'
    high: 26
  hand = [
    10, 11, 15, 19, 23, 27
  ]
  console.log thir.hasPlay(currentPlay, hand)


# debug()
# debug2()

# ---------------------------------------------------------------------------------------------------------------------------
# Exports

module.exports =
  Card: Card
  Thirteen: Thirteen
  OK: OK
  aiCharacters: aiCharacters
  achievementsList: achievementsList
  achievementsMap: achievementsMap
