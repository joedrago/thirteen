class ShuffledDeck
  constructor: ->
    @cards = [ 0 ]
    for i in [1...52]
      j = Math.floor(Math.random() * i)
      @cards.push @cards[j]
      @cards[j] = i

ShortSuitName = ['S', 'C', 'D', 'H']

handToString = ->
  names = []
  for card in hand
    suit  = Math.floor(card % 4)
    value = Math.floor(card / 4)
    valueName = switch value
      when  8 then 'J'
      when  9 then 'Q'
      when 10 then 'K'
      when 11 then 'A'
      when 12 then '2'
      else
        String(value + 3)
    name = valueName + ShortSuitName[suit]
    names.push name
  return names.join(",")

prettyName = (key) ->
  if key == 'allFour2s'
    return "All Four 2s"
  if key == 'tragedy'
    return "Tragedy Achievement"

  if matches = key.match("^([^0-9]+)([0-9]+)")
    switch matches[1]
      when "kind"
        switch matches[2]
          when "2"
            return "Pair"
          when "3"
            return "Trips"
          when "4"
            return "Quads"
      when "run"
        return "Run of #{matches[2]}"
      when "rop"
        return "Run of #{matches[2]} Pairs"
      when "rot"
        return "Run of #{matches[2]} Trips"
      when "roq"
        return "Run of #{matches[2]} Quads"

  # give up
  return key

makeStats = ->
  stats = {}
  stats.allFour2s = 0
  stats.tragedy = 0
  for kind in [2..4]
    key = "kind" + kind
    stats[key] = 0
  for run in [3..12]
    key = "run" + run
    stats[key] = 0
  for rop in [3..6]
    key = "rop" + rop
    stats[key] = 0
  for rot in [2..4]
    key = "rot" + rot
    stats[key] = 0
  for roq in [2..3]
    key = "roq" + roq
    stats[key] = 0
  return stats

handsSeen = 0
totalStats = makeStats()
loop
  deck = new ShuffledDeck
  for handIndex in [0...4]
    hand = []
    for cardIndex in [0...13]
      hand.push deck.cards.pop()
    hand.sort (a, b) ->
      return a - b
    handsSeen += 1

    has0 = false
    valuesSeen = new Array(13).fill(0)
    for card in hand
      suit  = Math.floor(card % 4)
      value = Math.floor(card / 4)
      valuesSeen[value] += 1
      if card == 0
        has0 = true

    handStats = makeStats()

    # look for kinds
    for value in [0...13]
      if valuesSeen[value] >= 2
        handStats.kind2 = 1
      if valuesSeen[value] >= 3
        handStats.kind3 = 1
      if valuesSeen[value] >= 4
        handStats.kind4 = 1

    if valuesSeen[12] >= 4
      handStats.allFour2s = 1

    # look for runs
    biggestRun = 0
    for startingPos in [0...10] # 10 instead of 11 because 2s can't be in a run
      currentRun = 0
      for index in [startingPos...12] # 12 instead of 13 because 2s can't be in a run
        if valuesSeen[index] >= 1
          currentRun += 1
        else
          break

      for len in [3...13]
        if currentRun >= len
          key = "run" + len
          handStats[key] = 1

    # look for rops
    biggestRun = 0
    for startingPos in [0...10] # 10 instead of 11 because 2s can't be in a run
      currentRun = 0
      for index in [startingPos...12] # 12 instead of 13 because 2s can't be in a run
        if valuesSeen[index] >= 2
          currentRun += 1
        else
          break

      for len in [3..6]
        if currentRun >= len
          key = "rop" + len
          handStats[key] = 1
          if (startingPos == 0) and has0
            handStats.tragedy += 1

    # look for rots
    biggestRun = 0
    for startingPos in [0...10] # 10 instead of 11 because 2s can't be in a run
      currentRun = 0
      for index in [startingPos...12] # 12 instead of 13 because 2s can't be in a run
        if valuesSeen[index] >= 3
          currentRun += 1
        else
          break

      for len in [2..4]
        if currentRun >= len
          key = "rot" + len
          handStats[key] = 1

    # look for roqs
    biggestRun = 0
    for startingPos in [0...10] # 10 instead of 11 because 2s can't be in a run
      currentRun = 0
      for index in [startingPos...12] # 12 instead of 13 because 2s can't be in a run
        if valuesSeen[index] >= 4
          currentRun += 1
        else
          break

      for len in [2..3]
        if currentRun >= len
          key = "roq" + len
          handStats[key] = 1

    # DEBUG!
    # if handStats.tragedy > 0
    #   console.log handToString(hand)
    #   process.exit(0)

    # add hand stats to totals
    for name of handStats
      totalStats[name] += handStats[name]

  if (handsSeen > 0) and (Math.floor((handsSeen-4) / 100000) != Math.floor(handsSeen / 100000))
    console.log "Hands Seen: #{handsSeen}"
    for key of totalStats
      avg = totalStats[key] / handsSeen
      console.log " * #{prettyName(key)}: seen:#{totalStats[key]} perc:#{(avg*100).toFixed(4)} - every #{(1/avg).toFixed(2)} hands"
