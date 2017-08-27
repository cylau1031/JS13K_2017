/* global kontra */
const MAX_NUM_MEMORIES = 10;

var gameState = {
  isPaused : false
}

function getDirection(position, center) {
  var scale = 0.004; //scales it down so that memories move incremently instead of jumping to the center
  var random = Math.random() + .25; //randomizes the scaling for mixed speeds 
  var direction =  { x: (center.x-position.x)*scale*random, y: (center.y - position.y)*scale*random}
  return direction; 
}



kontra.init() 
console.log(kontra)
kontra.assets.imagePath = 'assets/images/'
kontra.assets.load('player.png', 'cloud.png')
  .then(() => {
    const canvasHeight = kontra.canvas.height;
    const canvasWidth = kontra.canvas.width;

    //I ADDED A CLOUD FOR NO REASON... just playing around 
    //DONT MIND THIS CLOUD lol -pat

    let cloud = kontra.sprite({
      x: canvasWidth/4,
      y: canvasHeight/4,
      image: kontra.assets.images.cloud
    })

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

    // const maxNumMemories = 10;
    // var memories = kontra.pool({
    //   create: kontra.sprite,
    //   maxSize: maxNumMemories
    // });

    /**
     * Spawn a new wave of memories in random
     * positions around the map, all will move
     * towards center
     */
    //calculate dx, dy to travel to center
    
    // function calculateDx(xStart) {
    //   return ((-2 * xStart + canvasWidth) / canvasWidth);
    // }

    // function calculateDy(yStart) {
    //   return ((-2 * yStart + canvasHeight) / canvasHeight);
    // }
    // function spawnWave() {
    //   //todo: randomize start pos
    //   var xStart = 0;
    //   var yStart = 0;
      // var spacer = y * 1.5;

    //   for (var i = 1; i <= maxNumMemories; i++) {
    //     xStart += i * 100;
    //     yStart += i * 100;
    //     memories.get({
    //       x: xStart,
    //       y: yStart,
    //       dx: calculateDx(xStart),
    //       dy: calculateDy(yStart) ,
    //       color: 'red',  // fill color of the sprite rectangle
    //       width: 20,     // width and height of the sprite rectangle
    //       height: 20,
    //       // image: kontra.assets.images.enemy,
    //       ttl: Infinity,
    //       //???
    //       // leftEdge: x - 90,
    //       // rightEdge: x + 90 + width,
    //       // bottomEdge: y + 140,
    //       speed: 2,
    //       type: 'enemy',
    //       update: function () {
    //         this.advance();

    //         // change enemy velocity to move back and forth
    //         // if (this.x <= this.leftEdge) {
    //         //   this.dx = this.speed;
    //         // }
    //         // else if (this.x >= this.rightEdge) {
    //         //   this.dx = -this.speed;
    //         // }
    //         // else if (this.y >= this.bottomEdge) {
    //         //   this.dy = 0;
    //         //   this.dx = -this.speed;
    //         //   this.y -= 5;
    //         // }
    //       },
    //     });
    //   }
    // }







    const memories = kontra.pool({
      create: kontra.sprite,
      maxSize: MAX_NUM_MEMORIES
    });

    function spawnMemories() {
      var MAX_HEIGHT = kontra.canvas.height-20; 
      var MAX_WIDTH = kontra.canvas.width-20; 
      var CANVAS_CENTER = { x: MAX_WIDTH/2, y: MAX_HEIGHT/2 }; 

      for(var i=0; i<MAX_NUM_MEMORIES; i++) {
        //toggle is used to determine which side of the board the memories will appear on
        //Math.random is used to determine the toggle
        //essentially '00'=>top, '01'=>bottom, '10'=>left, '11'=>right
        var toggle = '' + Math.round(Math.random()) + Math.round(Math.random());
        var position; 
        if(toggle === '00') position = { x: Math.random() * MAX_WIDTH, y: 0}
        else if(toggle === '01') position = { x: Math.random() * MAX_WIDTH, y: MAX_HEIGHT}
        else if(toggle === '10') position = { x: 0, y: Math.random() * MAX_WIDTH }
        else if(toggle === '11') position = { x: MAX_WIDTH, y: Math.random() * MAX_HEIGHT}
        else position = { x: 0, y: 0}   
        var direction = getDirection(position, CANVAS_CENTER); 
        memories.get({
          x: position.x, 
          y: position.y, 
          dx: direction.x, 
          dy: direction.y, 
          color: 'red', 
          width: 20, 
          height: 20, 
          ttl: Infinity, 
          speed: 0, 
          type: 'enemy', 
          update: function() {
            this.advance(); 
          }
        }); 
      }
    }
    
    


    //let board = kontra.sprite({})

    let loop = kontra.gameLoop({

      update: () => {
        memories.update();
        if (memories.getAliveObjects().length === 0) {
          spawnMemories();
        }

        //keypress logic

        //collision logic

        ///////////////////////////////////////
        //////////////MEMORIES/////////////////
        ///////////////////////////////////////
        // memories.update()
        // board.update()
      },
      render: () => {
        player.render()
        cloud.render() 
        memories.render()
        // board.render()
      }
    })

    //keypress logic to pause and unpause the game 
    kontra.keys.bind('esc', () => {
      if(!gameState.isPaused) {
        gameState.isPaused = true; 
        loop.stop(); 
      } else {
        gameState.isPaused = false; 
        loop.start(); 
      }
    }); 

    

    loop.start()
  })
  .then(() => { })
  .catch(console.error)

  