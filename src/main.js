/* global kontra */
kontra.init()
//console.log(kontra)
kontra.assets.imagePath = 'assets/images/'
kontra.assets.load('player.png')
  .then(() => {
    let player = kontra.sprite({
      x: 10,
      y: 10,
      image: kontra.assets.images.player,
      update: () => {
        console.log('updating myself')
      }
    })
    //let memories = [kontra.sprite({})]
    //let board = kontra.sprite({})

    let loop = kontra.gameLoop({
      update: () => {

        //keypress logic

        //collision logic

        //pause or end game

        player.update()
        // memories.update()
        // board.update()
      },
      render: () => {
        player.render()
        // memories.render()
        // board.render()
      }
    })

    loop.start()
})
  .then(() => {})
  .catch(console.error)
