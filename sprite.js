class Sprite {
  constructor(spritesheet, data) {
    this.spritesheet = spritesheet
    this.width = data.width
    this.height = data.height
    this.images = data.tiles
    this.currentFrame = 0
    this.speed = data.speed || 0.1
    this.reverse = data.reverse || false
    this.reversing = false
    this.lastUpdate = frameCount
  }

  draw(x, y) {
    let i = Math.floor(this.currentFrame)
    let tile = this.images[i]
    let img = this.spritesheet.get(tile.x, tile.y, this.width, this.height)
    image(img, x, y)

    if (this.images.length <= 1)
      return

    if (this.lastUpdate == frameCount)
      return

    if (!this.reversing)
      this.currentFrame += this.speed
    else
      this.currentFrame += -this.speed
    
    if (Math.floor(this.currentFrame) >= this.images.length) {
      if (!this.reverse) {
        this.currentFrame = 0
      }
      else {
        this.reversing = true
        this.currentFrame -= this.speed
      }
    } else if (this.currentFrame < 0) {
      this.reversing = false
      this.currentFrame += this.speed
    }

    this.lastUpdate = frameCount
  }
}
