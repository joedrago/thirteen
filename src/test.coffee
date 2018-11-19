randomNumberSeed = 2
randomNumber = ->
  # This is here so I can debug deterministically
  # x = Math.sin(randomNumberSeed++) * 10000
  # return x - Math.floor(x)

  return Math.random()


class Card
  @SuitName: ['Spades', 'Clubs', 'Diamonds', 'Hearts']
  @ShortSuitName: ['S', 'C', 'D', 'H']

  constructor: (@raw) ->
    @suit  = Math.floor(@raw / 13)
    @value = Math.floor(@raw % 13)
    @valueName = switch @value
        when  8 then 'J'
        when  9 then 'Q'
        when 10 then 'K'
        when 11 then 'A'
        when 12 then '2'
        else
          String(@value + 3)
    @name = @valueName + Card.ShortSuitName[@suit]

class ShuffledDeck
  constructor: ->
    @cards = [ 0 ]
    for i in [1...52]
      j = Math.floor(randomNumber() * i)
      @cards.push @cards[j]
      @cards[j] = i

class Player
  constructor: (@name, @index) ->
    @hand = []
  setHand: (@hand) ->
  toString: ->
    cardNames = []
    for card in @hand
      cardNames.push card.name
    return "P#{@index}[#{@name}]: #{cardNames.join(",")}"

class Strategy
  constructor: ->
  plays: (hand) ->
    return {
      match1: hand.slice(0)
    }

class Thirteen
  constructor: ->
    debugNames = ["a", "b", "c", "d"]
    @players = []
    for i in [0...4]
      @players.push new Player(debugNames[i], i)

  toString: ->
    s = "Turn: #{@turn}\n"
    for player in @players
      s += player.toString() + "\n"
    return s

  deal: ->
    deck = new ShuffledDeck
    for playerIndex in [0...4]
      hand = []
      for cardIndex in [0...13]
        card = new Card(deck.cards.pop())
        if card.raw == 0
          @turn = playerIndex
        hand.push card
      hand.sort (a, b) ->
        return a.raw - b.raw
      @players[playerIndex].setHand(hand)

  winner: ->
    for player in @players
      if player.hand.length == 0
        return player.index
    return -1

  aiTurn: ->
    return true

  aiThink: ->
    strategy = new Strategy
    plays = strategy.plays(@players[@turn].hand)
    # console.log plays
    @turn = (@turn + 1) % @players.length


test = ->
  game = new Thirteen
  game.deal()
  console.log game.toString()

  while game.winner() == -1
    if game.aiTurn()
      game.aiThink()
    break

test()
