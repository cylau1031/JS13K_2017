/* global kontra */
const scenes = {
  sceneText: {
    0: 'CONSCIOUS',
    1: ['"...family?"', '"...accident"', '"...lost..."'],
    2: ['"...ok?"', '"...comatose"', '"...monitoring..."'],
    3: ['"condition not..."', '"...last the night?"', '"come back..."'],
    4: ['"...stabilizing"', '"we love you..."', '"can...hear us?"'],
    5: ['"See that...finger twitch!"', '"...GET THE DOCTOR!"', '"Don\'t give up..."'],
    win: 'Welcome back',
    lose:  'You died x_x'
  }
}


kontra.init()
kontra.assets.imagePath = 'assets/images/'
kontra.assets.load('player.png', 'cloud.png')
  .then(() => {
    let gameState = {
      isPaused: false,
      level: 0,
      islevelTransition: true,
      completedLevel: false
    }

    const canvas = {
      lightness: 0
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
        if (gameState.level === 1) {
          this.context.beginPath()
          this.context.font = 'italic 15px Arial'
          this.context.fillStyle = 'grey'
          this.context.fillText(`Left (clockwise) & right (counter-clockwise) keys to move paddle and collect your consciousness.`, 100, 575)
        }
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
        if (kontra.keys.pressed('left') || kontra.keys.pressed('a')) {
          this.startAngle += (Math.PI / 180) * 4
        }
        if (kontra.keys.pressed('right') || kontra.keys.pressed('d')) {
          this.startAngle -= (Math.PI / 180) * 4
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

    const spaceDraw = function (ctx, actionText) {
      ctx.font = 'italic 15px Arial'
      ctx.fillStyle = 'grey'
      ctx.fillText(`Press space to ${actionText}.`, 320, 575)
    }
    const titleSceneDraw = function(ctx, text) {
      ctx.font = '50px Arial'
      ctx.fillStyle = 'grey'
      ctx.fillText(text, 250, 300)
    }
    const flatlineDraw =  function(ctx) {
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 2
      ctx.moveTo(0, 300)
      ctx.lineTo(70, 300)
      ctx.lineTo(100, 200)
      ctx.lineTo(130, 400)
      ctx.lineTo(160, 300)
      ctx.lineTo(800, 300)
      ctx.stroke()
    }

    let scene = kontra.sprite({
      x: 200,
      y: 200,
      render: function() {
        this.context.beginPath()
        this.context.font = '30px Arial'
        this.context.fillStyle = 'white'
        this.context.beginPath()
        if (gameState.level === 0) {
          titleSceneDraw(this.context, scenes.sceneText[0])
          spaceDraw(this.context, 'continue')
        } else if (gameState.level === 'lose') {
          canvas.lightness = 0
          kontra.canvas.style.backgroundColor = `hsl(0, 0%, ${canvas.lightness}%`
          flatlineDraw(this.context)
        } else if (gameState.level === 'win'){
          canvas.lightness = 100
          kontra.canvas.style.backgroundColor = `hsl(0, 0%, ${canvas.lightness}%`
          document.body.style.backgroundColor = `hsl(0, 0%, ${canvas.lightness}%`
          titleSceneDraw(this.context, scenes.sceneText.win)
          spaceDraw(this.context, 'play again')
        } else {
          kontra.canvas.style.backgroundColor = `hsl(0, 0%, 0%)`
          let textSpace = {x: this.x, y: this.y}
          for (let i = 0; i < scenes.sceneText[gameState.level].length; i++) {
            this.context.fillText(`${scenes.sceneText[gameState.level][i]}`, textSpace.x + (i * 100), textSpace.y + (i * 100))
          }
          spaceDraw(this.context, 'continue')
        }
      }
    })


    const collidingCircles = function(memoryObj, circleObj) {
      const dx = memoryObj.x - circleObj.x
      const dy = memoryObj.y - circleObj.y
      const distance = Math.sqrt( dx * dx + dy * dy)
      return distance < memoryObj.radius + circleObj.radius
    }

    const collidingWithArc = function(memoryObj) {
      const dx = memoryObj.x - circle.x
      const dy = memoryObj.y - circle.y
      let angle = Math.atan2(dy, dx)
      const arcStartAngle = arc.startAngle % (2 * Math.PI)
      if (angle < 0) angle = (Math.PI * 2) + angle
      return collidingCircles(memoryObj, arc) && angle > arcStartAngle && angle < (arcStartAngle + arc.angleLength)
    }

    const checkPoints = function() {
      if (pointKeeper.points < 0 || lifeKeeper.livesLeft === 0 ) {
        gameState.islevelTransition = true
        gameState.level = 'lose'
        //gameState.isPaused = true;
        //loop.stop();
      } else if (pointKeeper.points >= 5) {
        //changing winning points to 5-10
        pointKeeper.points = 0
        if (gameState.level === 5) {
          gameState.level = 'win'
        } else {
          gameState.level += 1
          //gameState.completedLevel = true
        }
        gameState.islevelTransition = true
      } else {
        //keep game running
      }
    }

    ///////////////////////////////////////
    //////////////MEMORIES/////////////////
    ///////////////////////////////////////

    const memories = kontra.pool({
      create: kontra.sprite,
      maxSize: canvas.MAX_NUM_MEMORIES
    });


    function getDirection(position, center) {

      var levelUp;
      if (gameState.level < 5) {
        levelUp = (gameState.level + 1)/2;
      } else {
        levelUp = (gameState.level)/4;
      }

      var scale = 0.004; //scales it down so that memories move incremently instead of jumping to the center
      //var random = Math.random() + .25; //randomizes the scaling for mixed speeds
      var direction =  { x: (center.x-position.x)*scale*levelUp, y: (center.y - position.y)*scale*levelUp}
      return direction;
    }

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
            if (collidingWithArc(this)) {
              this.ttl = 0
              canvas.lightness += 3
              kontra.canvas.style.backgroundColor = `hsl(0, 0%, ${canvas.lightness}%`
              pointKeeper.points += 1
              checkPoints()
            } else if (collidingCircles(this, circle)) {
              pointKeeper.points -= 1
              if (canvas.lightness >= 3) {
                canvas.lightness -= 3
                kontra.canvas.style.backgroundColor = `hsl(0, 0%, ${canvas.lightness}%`
              }
              if (pointKeeper.points < 0) {
                lifeKeeper.livesLeft -= 1
                pointKeeper.points = 0
              }
              this.ttl = 0
            }
            checkPoints();
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

    const restartGame = function () {
      gameState.level = 0
      gameState.islevelTransition = true
      canvas.lightness = 0
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
        if (gameState.level === 0) {
          gameState.level += 1
        } else {
          gameState.islevelTransition = false
        }
        if (gameState.level === 'win') {
          restartGame()
        }
      } else {
        // if (gameState.completedLevel) {
        //   gameState.completedLevel = false
        //   gameState.islevelTransition = true
        // }
      }
    });

    loop.start()
  })
  .then(() => { })
  .catch(console.error)
