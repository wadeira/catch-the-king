// bronze 10
// prata 400
// ouro 550

const CTK_TABLE_CARDS = {
  1: 7,
  2: 4,
  3: 5,
  4: 5,
  5: 3,
  6: 1
}

const CTK_HAND_CARDS = {
  1: 5,
  2: 2,
  3: 2,
  4: 1,
  5: 1,
  6: 1
}

class CatchTheKing {
  constructor(id) {

    // Generate Hand
    this.hand = []
    this.points = 0
    this.lastReveal = 0
    this.lastRevealTimer = undefined
    for (let val of Object.keys(CTK_HAND_CARDS))
    for (let i = 0; i < CTK_HAND_CARDS[val]; i++)
      this.hand.push(val)

    // Generate Table
    this.table = []

    if (id) {
      this.loadGame(id)
      return
    }

    for (let val of Object.keys(CTK_TABLE_CARDS))
    for (let i = 0; i < CTK_TABLE_CARDS[val]; i++)
      this.table.push({
        revealed: false,
        value: val
      })

    // Shuffle table
    for (let i = this.table.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i+1))
      let temp = this.table[i]
      this.table[i] = this.table[j]
      this.table[j] = temp
    }
  }

  loadGame(id) {
    this.points = 0
    this.lastReveal = 0
    this.hand = []

    for (let val of Object.keys(CTK_HAND_CARDS))
    for (let i = 0; i < CTK_HAND_CARDS[val]; i++)
      this.hand.push(val)

    if (this.lastRevealTimer)
      clearTimeout(this.lastRevealTimer)

    let order = atob(id).split('')
    
    this.table = []

    for (let i of order) {
      this.table.push({
        revealed: false,
        value: parseInt(i)
      })
    }

    console.log(this.table)
  }

  play({ x, y }) {
    let index = this.getIndex({ x, y })
    let card = this.table[index]
    let holdingCard = this.hand[0]

    if (!holdingCard)
      return
      
    if (card.revealed)
      return
    
    this.lastReveal = card.value

    if (this.lastRevealTimer != undefined)
      clearTimeout(this.lastRevealTimer)
    
    this.lastRevealTimer = setTimeout(() => {
      this.lastReveal = 0
      this.lastRevealTimer = undefined
    }, 2000)

    // Remove all temporary values
    this.table.map(tile => {
      tile.warning_animation = 0
      tile.temporary_reveal = 0
    })
    
    // Get nearby tiles
    let tilesNearby = this.tilesNearby({ x, y })
    let fiveNearby = !!tilesNearby.find(tile => tile.value == 5)

    // set warning if a five is nearby
    if (fiveNearby) {
      tilesNearby.map(t => {
        if (!t.revealed)
          t.warning_animation = Date.now()
      })
    }
    if (holdingCard <= card.value || (holdingCard == 5 && fiveNearby) || holdingCard == 6) {
      this.hand.shift()
    }

    if (card.value <= holdingCard) {
      card.revealed = true

      if (card.value != 5 || !fiveNearby)
        this.points += card.value < 6 ? card.value * 10 : 100

      // Check if a row was completed
      let xCompleted = true
      let yCompleted = true
      let aCompleted = true
      let bCompleted = true

      for (let i = 0; i < 5; i++) {
        // Check if X row is is missing a card revealed
        if (!this.table[this.getIndex({ x: i, y })].revealed)
          xCompleted = false
        
        // Check if Y row is is missing a card revealed
        if (!this.table[this.getIndex({ x, y: i })].revealed)
          yCompleted = false

        // Check if diagonal A (\) is missing a card revealed
        if (!this.table[this.getIndex({ x: i, y: i })].revealed)
          aCompleted = false

        // Check if diagonal B (/) is missing a card revealed
        if (!this.table[this.getIndex({ x: 4-i, y: i })].revealed)
          bCompleted = false
      }

      if (xCompleted) this.points += 10
      if (yCompleted) this.points += 10
      if (aCompleted && x==y) this.points += 10
      if (bCompleted && x+y==4) this.points += 10
    } else {
      card.temporary_reveal = Date.now()
    }
  }

  getPosition(index) {
    return {
      x: index % 5,
      y: Math.floor(index / 5)
    }
  }

  getIndex({ x, y }) {
    return (y * 5) + x
  }

  tilesNearby({ x, y }) {
    let tiles = []
    
    for (let i in this.table) {
      let pos = this.getPosition(i)
      let distance = Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2))

      if (distance < 2 && distance > 0) {
        tiles.push(this.table[i])
      }
    }

    return tiles
  }

  seed() {
    return btoa(this.table.map(i => i.value).join(''))
  }
}
