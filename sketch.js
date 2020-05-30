const ANIMATION_DURATION = 2000
let game;

let spritesheet, spritedata
let sprites = {}

let cardSize = {
  w: 50,
  h: 36
}

function createGame() {
  game = new CatchTheKing()
}

function preload() {
  spritesheet = loadImage('king_001.png')
  spritedata = loadJSON('ctk.json')
}


function setup() {
  let canvas = createCanvas(400, 265)
  canvas.parent('game')
  
  createGame();

  // Load sprites
  for (let name of Object.keys(spritedata.sprites)) {
    let data = spritedata.sprites[name]

    sprites[name] = new Sprite(spritesheet, data)
  }
}

function draw() {
  // Clear canvas
  background(16, 16, 21)

  push()
  {
    translate(10, 10)
    sprites['background'].draw(0, 0)
    sprites['card-k'].draw(100, 100)
  }
  pop()


  // Draw table
  push()
  {
    translate(14, 14)
    for (let index in game.table) {
      let card = game.table[index]
      let position = game.getPosition(index)
      
      let x = position.x * (cardSize.w + 1)
      let y = position.y * (cardSize.h + 1)
      
      if (card.revealed || (card.temporary_reveal + ANIMATION_DURATION > Date.now()))
        sprites[`card-${card.value}`].draw(x, y)
      else if (card.warning_animation && card.warning_animation + ANIMATION_DURATION > Date.now()) 
        sprites['card-e'].draw(x, y)
      else if (!game.hand.length) {
        sprites[`card-${card.value}`].draw(x, y)
        
        fill(0, 0, 0, 200)
        rect(x, y, cardSize.w, cardSize.h)
      }
      else
        sprites['card-k'].draw(x, y)
    }
  }
  pop()

  // Draw sidebar
  push()
  {
    translate(280, 10);
    fill(220);
    textAlign(CENTER, CENTER)

    // My card
    sprites['sb-title'].draw(0, 0)
    text('Minha Carta', 46, 10);
    sprites['card-bg'].draw(15, 22)
    if (game.hand.length)
      sprites[`card-${game.hand[0]}`].draw(15 + 8, 22 + 6)
    
    // Revealed Card
    sprites['sb-title'].draw(0, 72)
    text('Carta Revelada', 46, 82);
    sprites['card-bg'].draw(15, 94)
    if (game.lastReveal != 0)
      sprites[`card-${game.lastReveal}`].draw(15 + 8, 94 + 6)

    // Points
    sprites['sb-title'].draw(0, 144)
    text('Pontos', 46, 154);
    sprites['points-bg'].draw(0, 162)
    text(game.points, 46, 172)
  }
  pop()
  
  // Draw hand
  push()
  {
    translate(0, 215)
    for (let i = 0; i < 6; i++) {
      sprites['card-bg'].draw(i * 63, 0)
      let index = game.hand.indexOf((i + 1).toString());
      let count = game.hand.filter(val => val == (i + 1)).length

      if (game.hand[0] == game.hand[index])
          count--
          
      if (index !== -1 && count > 0) {
        sprites[`card-${i + 1}`].draw((i * 63) + 8, 6)

        if (count > 0) {
          sprites['card-count'].draw((i * 63) + 40, -10)
          textSize(10)
          textAlign(CENTER, CENTER)
          fill(255)
          text('X' + count, (i * 63) + 51, 4)
        }
      }
    }
  }
  pop()
}

function mouseClicked() {
  // Get tile clicked
  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height)
    return

  let x = mouseX - 10 // translated to (10, 10)
  let y = mouseY - 10

  let position = {
    x: Math.floor(x / (cardSize.w + 4)),
    y: Math.floor(y / (cardSize.h + 4))
  }

  // Make sure its in the table
  if (x < 0 || x > sprites['background'].width || y < 0 || y > sprites['background'].height)
    return 

  let index = game.getIndex(position)
  let card = game.table[index]

  if (card.revealed) {
    return
  }

  game.play(position)

  // Reset sprite animations
  sprites['card-e'].currentFrame = 0
}