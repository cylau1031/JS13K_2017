/* global kontra */
kontra.init() 
console.log(kontra)
kontra.assets.imagePath = 'assets/images/'
kontra.assets.load('player.png')
  .then(() => {
    let player = kontra.sprite({
      x: 10,
      y: 10,
      image: kontra.assets.images.player,
      update: () => {
        //console.log('updating myself')
      }
    })
    ///////////////////////////////////////
    //////////////MEMORIES/////////////////
    ///////////////////////////////////////
    const maxNumMemories = 10;
    var memories = kontra.pool({
      create: kontra.sprite,
      maxSize: maxNumMemories
    });

    /**
     * Spawn a new wave of memories in random
     * positions around the map, all will move
     * towards center
     */
    //calculate dx, dy to travel to center
    const canvasHeight = kontra.canvas.height;
    const canvasWidth = kontra.canvas.width;
    function calculateDx(xStart) {
      return ((-2 * xStart + canvasWidth) / canvasWidth);
    }

    function calculateDy(yStart) {
      return ((-2 * yStart + canvasHeight) / canvasHeight);
    }

    function spawnWave() {
      //todo: randomize start pos
      var xStart = 0;
      var yStart = 0;
      // var spacer = y * 1.5;

      for (var i = 1; i <= maxNumMemories; i++) {
        xStart += i * 100;
        yStart += i * 100;
        memories.get({
          x: xStart,
          y: yStart,
          dx: calculateDx(xStart),
          dy: calculateDy(yStart) ,
          color: 'red',  // fill color of the sprite rectangle
          width: 20,     // width and height of the sprite rectangle
          height: 20,
          // image: kontra.assets.images.enemy,
          ttl: Infinity,
          //???
          // leftEdge: x - 90,
          // rightEdge: x + 90 + width,
          // bottomEdge: y + 140,
          speed: 2,
          type: 'enemy',
          update: function () {
            this.advance();

            // change enemy velocity to move back and forth
            // if (this.x <= this.leftEdge) {
            //   this.dx = this.speed;
            // }
            // else if (this.x >= this.rightEdge) {
            //   this.dx = -this.speed;
            // }
            // else if (this.y >= this.bottomEdge) {
            //   this.dy = 0;
            //   this.dx = -this.speed;
            //   this.y -= 5;
            // }
          },
        });
      }
    }

    //let board = kontra.sprite({})

    let loop = kontra.gameLoop({
      update: () => {

        //keypress logic

        //collision logic

        ///////////////////////////////////////
        //////////////MEMORIES/////////////////
        ///////////////////////////////////////
        memories.update();
        if (memories.getAliveObjects().length === 0) {
          spawnWave();
        }

        //pause or end game


        player.update()
        // memories.update()
        // board.update()
      },
      render: () => {
        player.render()
        memories.render()
        // board.render()
      }
    })

    kontra.keys.bind('p', () => {
      loop.stop(); 
    }) 

    loop.start()
  })
  .then(() => { })
  .catch(console.error)

  