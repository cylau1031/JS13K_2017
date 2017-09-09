/* global kontra */

const scenes = {
  0: {
    text: 'CONSCIOUS'
  },
  sceneText: {
    1: ['"...family?"', '"...accident"', '"...lost..."'],
    2: ['"...ok?"', '"...comatose"', '"...monitoring..."'],
    3: ['"condition not..."', '"...last the night?"', '"come back..."'],
    4: ['"...stabilizing"', '"we love you..."'],
    5: ['"See that...finger twitch!"', '"...GET THE DOCTOR!"', '"Don\'t give up..."'],
    win: 'Welcome back',
    lose:  'You died x_x'
  }
}


function getDirection(position, center) {
  var scale = 0.004; //scales it down so that memories move incremently instead of jumping to the center
  var random = Math.random() + .25; //randomizes the scaling for mixed speeds
  var direction =  { x: (center.x-position.x)*scale*random, y: (center.y - position.y)*scale*random}
  return direction;
}


kontra.init()
kontra.assets.imagePath = 'assets/images/'
kontra.assets.load('player.png', 'cloud.png')
  .then(() => {
    let gameState = {
      isPaused: false,
      level: 0,
      islevelTransition: true
    }

    const canvas = {
      lightness: 0,
      MAX_NUM_MEMORIES: 10,
      }

    let circle = kontra.sprite({
      x: 400,
      y: 300,
      color: 'white',
      radius: 100,
      render: function() {
        this.context.fillStyle = this.color
        this.context.beginPath()
        this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI)
        this.context.fill()
      }
    })

    let arc = kontra.sprite({
      x: circle.x,
      y: circle.y,
      color: 'white',
      radius: 110,
      lineWidth: 6,
      startAngle: (Math.PI * 2),
      angleLength: (Math.PI * 2)/15,
      update: function() {
        if (kontra.keys.pressed('left')) {
          this.startAngle += (Math.PI / 180) * 3
        }
        if (kontra.keys.pressed('right')) {
          this.startAngle -= (Math.PI / 180) * 3
        }
      },
      render: function() {
        this.context.lineWidth = this.lineWidth
        this.context.beginPath()
        this.context.arc(this.x, this.y, this.radius, this.startAngle, this.startAngle + this.angleLength)
        this.context.strokeStyle = this.color
        this.context.stroke()
      }
    })

    let pointKeeper = kontra.sprite({
      points: 0,
      x: 100,
      y: 100,
      update: function() {
        //if there was a collision then add points
      },
      render: function() {
        this.context.beginPath()
        this.context.font = '30px Arial'
        this.context.fillText(`${this.points}`, this.x, this.y)
      }
    })

    let lifeKeeper = kontra.sprite({
      livesLeft: 3,
      x: 550,
      y: 100,
      render: function() {
        this.context.font = '25px Arial'
        this.context.fillText(`Lives left: ${this.livesLeft}`, this.x, this.y)
      }
    })

    let scene = kontra.sprite({
      x: 200,
      y: 200,
      update: function() {
      },
      render: function() {
        this.context.beginPath()
        this.context.font = '30px Arial'
        this.context.fillStyle = 'white'
        this.context.beginPath()
        if (gameState.level === 0) {
          this.context.font = 'italic 50px Arial'
          this.context.fillStyle = 'white'
          this.context.fillText(scenes[0].text, 250, 300)
          this.context.font = 'italic 15px Arial'
          this.context.fillStyle = 'grey'
          this.context.fillText('Press space to continue.', 320, 575)
        } else if (gameState.level === 'lose') {
          this.context.font = 'italic 50px Arial'
          this.context.fillStyle = 'white'
          this.context.fillText(scenes[lose].text, 250, 300)
        } else {
          let textSpace = {x: this.x, y: this.y}
          for (let i = 0; i < scenes.sceneText[gameState.level].length; i++) {
            this.context.fillText(`${scenes.sceneText[gameState.level][i]}`, textSpace.x + (i * 100), textSpace.y + (i * 100))
          }
          this.context.font = 'italic 15px Arial'
          this.context.fillStyle = 'grey'
          this.context.fillText('Press space to continue.', 600, 575)
        }
      }
    })

    ///////////////////////////////////////
    //////////////MEMORIES/////////////////
    ///////////////////////////////////////

    const memories = kontra.pool({
      create: kontra.sprite,
      maxSize: canvas.MAX_NUM_MEMORIES
    });

    function spawnMemories() {
      var MAX_HEIGHT = kontra.canvas.height-20;
      var MAX_WIDTH = kontra.canvas.width-20;
      var CANVAS_CENTER = { x: MAX_WIDTH/2, y: MAX_HEIGHT/2 };

      //for(var i=0; i< canvas.MAX_NUM_MEMORIES; i++) {
      for(var i=0; i<1; i++) {
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
          color: 'blue',
          radius: 20,
          ttl: Infinity,
          speed: 0,
          type: 'enemy',
          update: function() {
            collidingWithArc(this, arc, circle)
            if(this.x < -20 || this.x > 820 || this.y < -20 || this.y > 620) {
              this.ttl = 0
            }
            checkPoints(this);
            this.advance()
          },
          render: function() {
            this.context.fillStyle = this.color
            this.context.beginPath()
            this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI)
            this.context.fill()
          }
        });
      }
    }
    const collidingCircles = function(memoryObj, circleObj) {
      let dx = memoryObj.x - circleObj.x
      let dy = memoryObj.y - circleObj.y
      let distance = Math.sqrt( dx * dx + dy * dy)
      return distance < memoryObj.radius + circleObj.radius
    }

    const collidingWithArc = function(memoryObj, arcObj, circleObj) {
      const dx = memoryObj.x - circleObj.x
      const dy = memoryObj.y - circleObj.y
      let angle = Math.atan2(dy, dx)

      const arcStartAngle = arcObj.startAngle % (2 * Math.PI)

      if (angle < 0) { angle = (Math.PI * 2) + angle }
      if (collidingCircles(memoryObj, arcObj) && angle > arcStartAngle && angle < (arcStartAngle + arcObj.angleLength)) {
        pointKeeper.points += 1
        memoryObj.ttl = 0
        canvas.lightness += 5
        kontra.canvas.style.backgroundColor = `hsl(0, 0%, ${canvas.lightness}%`


      } else if (collidingCircles(memoryObj, circleObj)) {
        pointKeeper.points -= 1
        if (pointKeeper.points < 0) {
          lifeKeeper.livesLeft -= 1
          pointKeeper.points = 0
        }
        memoryObj.ttl = 0
      }

    }

    const checkPoints = function(memoryObj) {
      if ( pointKeeper.points < 0 || lifeKeeper.livesLeft === 0 ) {
        gameState.islevelTransition = true
        gameState.level = 'lose'
        //memoryObj.ttl = 0
        gameState.isPaused = true;
        loop.stop();
      } else if (pointKeeper.points >= 3) {
        //changing winning points to 5-10
        pointKeeper.points = 0
        gameState.level += 1
        gameState.islevelTransition = true
      } else {
        //keep game running
      }
    }

    let loop = kontra.gameLoop({

      update: () => {
        if (!gameState.islevelTransition) {
          memories.update();
          if (memories.getAliveObjects().length === 0) {
            spawnMemories();
          }
          circle.update()
          arc.update()
          pointKeeper.update()
          lifeKeeper.update()
        } else {
          scene.update()
        }
      },
      render: () => {
        if (!gameState.islevelTransition) {
          memories.render()
          circle.render()
          arc.render()
          pointKeeper.render()
          lifeKeeper.render()
        } else {
          scene.render()
        }
      }
    })

    //keypress logic to pause and unpause the game
    kontra.keys.bind('esc', () => {
      if (!gameState.isPaused) {
        gameState.isPaused = true;
        loop.stop();
      } else {
        gameState.isPaused = false;
        loop.start();
      }
    });
    kontra.keys.bind('space', () => {
      if (gameState.islevelTransition) {
        gameState.islevelTransition = false
      }
    });

    loop.start()
  })
  .then(() => { })
  .catch(console.error)

