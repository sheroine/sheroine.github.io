import * as utils from "./utils.js";

let gameObjectList = [];
let player = null;
const normalSpeed = 1.0;
const dashSpeed = 2.0;

const playerColors = Object.freeze
({
    blue : "#08ffff",
    yellow : "#f8ff29",
    green : "#07f70f",
    orange : "#f7a707"
});

class GameObject
{
    //canvas element reference
    ctx;
    //position
    x;
    y;
    size;

    //for movement
    forward;
    speed;

    canvasWidth;
    canvasHeight;

    constructor(ctx, x = 0, y = 0, size = 1.0, canvasWidth, canvasHeight, front = true)
    {
        if (front) gameObjectList.push(this);
        else gameObjectList.unshift(this);
        Object.assign(this, {ctx, x, y, size, canvasWidth, canvasHeight});
        this.forward = utils.getRandomUnitVector();
        this.speed = utils.getRandom(0.5, 1.0);
    }

    //updating all the objects in the array
    static updateAll(frequencyAudioData, waveAudioData)
    {
        for (let object of gameObjectList)
        {
            object.update(frequencyAudioData, waveAudioData);
        }
    }

    //drawing all the objects in the array
    static drawAll()
    {
        for (let object of gameObjectList)
        {
            object.draw();
        }
    }

    static updatePlayer(xPos, yPos)
    {
        player.update(xPos, yPos);
    }

    static drawPlayer()
    {
        player.draw();
    }

    removeObject()
    {        
        gameObjectList = gameObjectList.filter(o => o != this); //array function
    }

    static clearList()
    {
        gameObjectList = [];
    }

    static removePlayer()
    {
        player = null;
    }

    static print()
    {
        console.log(gameObjectList.length);
        console.log(gameObjectList);
    }

    static getPlayer()
    {
        return player;
    }

    move()
    {       
		this.x += this.forward.x * this.speed;
        this.y += this.forward.y * this.speed;
    }

    reflectX(){
		this.forward.x *= -1;
	}

	reflectY(){
		this.forward.y *= -1;
    }
}

class Player extends GameObject
{
    hits = 0;
    dashes = 0;
    color = playerColors.blue;

    constructor(ctx, x = 0, y = 0, size = 1.0, canvasWidth, canvasHeight)
    {
        super(ctx, x, y, size, canvasWidth, canvasHeight);
        player = this;
    }

    update(xPos, yPos)
    {
        this.x = xPos;
        this.y = yPos;
        //collision detection
    }

    draw()
    {
        switch(this.color)
        {
            //square, triangle, and pentagon has slight size multipler
            //because they are drawn inside the circle of the given radius
            //if they all use this.size, the circle will the largest
            //so I gave them a size multiplier just to make them appear closer to the size of the circle
            //but we will still use this.size for circular collision detection for all of them
            case playerColors.blue:                
                utils.drawRegularPolygon(this.ctx, this.x, this.y, this.size * 1.2, 4, this.color, Math.PI / 4);
                break;

            case playerColors.yellow:
                utils.drawRegularPolygon(this.ctx, this.x, this.y, this.size * 1.2, 3, this.color);
                break;

            case playerColors.green:
                utils.drawRegularPolygon(this.ctx, this.x, this.y, this.size * 1.2, 5, this.color);
                break;

            case playerColors.orange:
                utils.drawCircle(this.ctx, this.x, this.y, this.size, this.color);
                break;
            
            default:
                utils.drawSquare(this.ctx, this.x, this.y, this.size * 2, playerColors.blue);
                break;
        }
    }

    setColor(color)
    {
        this.color = color;
    }
}

//obstacle in the screen that will shoot out "Blips", acting like bullets
class Popper extends GameObject
{
    maxSize;
    //num of dots it will emit
    //default emit 6
    dotNum;
    //emit type true - circles, false - squares
    circles;
    //which node inside the audio array should it read from
    node;
    drawSize;
    prevPercent = 0.0;
    counter = 30;
    
    constructor(ctx, x = 0, y = 0, size = 1.0, maxSize = 1.0, canvasWidth, canvasHeight , dotNum = 6, circles = true)
    {
        super(ctx, x, y, size, canvasWidth, canvasHeight);
        if(dotNum <= 0)
        {
            dotNum = 6;
        }
        else if(dotNum > 12)
        {
            dotNum = 12;
        }
        Object.assign(this, {maxSize, dotNum, circles});
        //the array is of 128 long but the back of the array doesn't always have data
        this.node = Math.floor(utils.getRandom(0, 100));
        //this.node = 0;
    }
    
    update(frequencyAudioData, waveAudioData)
    {
        super.move();
        // check sides and bounce
        if(this.x <= this.size/2 || this.x >= this.canvasWidth - this.size/2)
        {
            super.reflectX();
            super.move();
        }

        if(this.y <= this.size/2 || this.y >= this.canvasHeight - this.size/2)
        {
            super.reflectY();
            super.move();
        }

        let percent = frequencyAudioData[this.node] / 255;
        this.drawSize = percent * this.maxSize + this.size;

        //if its not on cooldown and the value of percent is more than 20% larger than prevPercent or percent is larger than 0.7
        if(this.counter <= 0 && ((percent - this.prevPercent) / this.prevPercent > 0.2 || percent > 0.7))
        {
            this.pop();
            //cooldown lasts for 30 frames
            this.counter = 30;
        }
        this.prevPercent = percent;

        if(this.counter > 0)
        {
            this.counter--;
        }
    }

    draw()
    {
        if(this.circles)
        {
            utils.drawCircle(this.ctx, this.x, this.y, this.drawSize, "white");
        }
        else
        {
            utils.drawSquare(this.ctx, this.x, this.y, this.drawSize * 2, "white");
        }
    }

    pop()
    {
        //spawn the number of blips set in the constructor
        //spawned blips will move outwards from the popper
        //spawned blips expend in a circle from where they are spawned
        let variation = utils.getRandom(0, Math.PI);
        for (let i = 0; i < this.dotNum; i++) 
        {
            let forward = {x: Math.sin(Math.PI * 2 / this.dotNum * i + variation), y: Math.cos(Math.PI * 2 / this.dotNum * i + variation)}

            new Blip(this.ctx, this.x, this.y, this.size, this.canvasWidth, this.canvasHeight, forward, this.speed * 2, this.circles);
        }
        new Sploder(this.ctx, this.x, this.y);
    }
}

// little bullets spawned from a popper
class Blip extends GameObject
{
    //circle or square blip
    circles;

    constructor(ctx, x, y, size, canvasWidth, canvasHeight ,forward, speed, circles = true)
    {
        super(ctx, x, y, size, canvasWidth, canvasHeight);
        Object.assign(this, {forward, speed, circles});
    }

    update()
    {
        super.move();
        //if it runs off screen, deletes itself
        if(this.x <= -this.size/2 || this.x >= this.canvasWidth + this.size/2 ||
            this.y <= -this.size/2 || this.y >= this.canvasHeight + this.size/2)
        {
            super.removeObject();
        }
    }

    draw()
    {
        if(this.circles)
        {
            utils.drawCircle(this.ctx, this.x, this.y, this.size, "white");
        }
        else
        {
            utils.drawSquare(this.ctx, this.x, this.y, this.size * 2, "white");
        }
    }
}

//splody effect when popper spits out blips
class Sploder extends GameObject
{
    color = 100;
    lifetime = 10;
    timer = 0;
    constructor(ctx, x, y)
    {
        super(ctx, x, y, 0, 0, 0, false);
    }

    update()
    {
        this.timer++;
        this.size += 10;
        this.color -= 100/this.lifetime;
        if (this.timer > this.lifetime) 
        {
            super.removeObject();
        }
    }

    draw()
    {
        utils.drawCircle(this.ctx, this.x, this.y, this.size, `rgba(255, 255, 255, ${this.color}%)`);
    }
}

class QuadraticBezier extends GameObject
{
    ctrl1Forward;

    constructor(ctx, x, y, size = 1.0, canvasWidth, canvasHeight, controlX, controlY, endX, endY)
    {
        super(ctx, x, y, size, canvasWidth, canvasHeight);
        Object.assign(this, {controlX, controlY, endX, endY});
        this.ctrl1Forward = utils.getRandomUnitVector();
    }
    
    update(frequencyAudioData, waveAudioData)
    {
        let speedMultiplier = 0;
        for (let data of waveAudioData)
        {
            speedMultiplier += data - 128;
        }
        speedMultiplier /= waveAudioData.length; 

        this.move(speedMultiplier);
        if((this.controlX <= this.size/2 && this.ctrl1Forward.x < 0.0)||
            (this.controlX >= this.canvasWidth - this.size/2 && this.ctrl1Forward.x > 0.0))
        {
            this.ctrl1Forward.x = this.reflect(this.ctrl1Forward.x);
            this.move(speedMultiplier);
        }

        if((this.controlY <= this.size/2 && this.ctrl1Forward.y < 0.0) ||
            (this.controlY >= this.canvasHeight - this.size/2 && this.ctrl1Forward.y > 0.0))
        {
            this.ctrl1Forward.y = this.reflect(this.ctrl1Forward.y);
            this.move(speedMultiplier);
        }
    }

    draw()
    {
        utils.drawQuadraticBezier(this.ctx,this.x, this.y, this.controlX, this.controlY, this.endX, this.endY, "white", this.size);
    }

    move(multiplier)
    {
        this.controlX += this.ctrl1Forward.x * Math.abs(this.speed + multiplier);
        this.controlY += this.ctrl1Forward.y * Math.abs(this.speed + multiplier);
    }

    reflect(number){
        return number *= -1;
    }

}

class Bezier extends GameObject
{
    ctrl1Forward;
    ctrl2Forward;

    constructor(ctx, x, y, size = 1.0, canvasWidth, canvasHeight, controlX, controlY, controlXA, controlYA)
    {
        super(ctx, x, y, size, canvasWidth, canvasHeight);
        Object.assign(this, {controlX, controlY, controlXA, controlYA});
        this.ctrl1Forward = utils.getRandomUnitVector();
        this.ctrl2Forward = utils.getRandomUnitVector();
    }
    
    update(frequencyAudioData, waveAudioData)
    {
        let speedMultiplier = 0;
        for (let data of waveAudioData)
        {
            speedMultiplier += data - 128;
        }
        speedMultiplier /= waveAudioData.length; 

        this.move(speedMultiplier);
        if((this.controlX <= this.size/2 && this.ctrl1Forward.x < 0.0)||
            (this.controlX >= this.canvasWidth - this.size/2 && this.ctrl1Forward.x > 0.0))
        {
            this.ctrl1Forward.x = this.reflect(this.ctrl1Forward.x);
            this.move(speedMultiplier);
        }

        if((this.controlY <= this.size/2 && this.ctrl1Forward.y < 0.0) ||
            (this.controlY >= this.canvasHeight - this.size/2 && this.ctrl1Forward.y > 0.0))
        {
            this.ctrl1Forward.y = this.reflect(this.ctrl1Forward.y);
            this.move(speedMultiplier);
        }

        if((this.controlXA <= this.size/2 && this.ctrl2Forward.x < 0.0) || 
            (this.controlXA >= this.canvasWidth - this.size/2 && this.ctrl2Forward.x > 0.0))
        {
            this.ctrl2Forward.x = this.reflect(this.ctrl2Forward.x);
            this.move(speedMultiplier);
        }

        if((this.controlYA <= this.size/2 && this.ctrl2Forward.y < 0.0) || 
            (this.controlYA >= this.canvasHeight - this.size/2 && this.ctrl2Forward.y > 0.0))
        {
            this.ctrl2Forward.y = this.reflect(this.ctrl2Forward.y);
            this.move(speedMultiplier);
        }
    }

    draw()
    {
        utils.drawCubicBezier(this.ctx,this.x, this.y, this.controlX, this.controlY, this.controlXA, this.controlYA, this.x, this.y, "white", this.size);
    }

    move(multiplier)
    {
        this.controlX += this.ctrl1Forward.x * Math.abs(this.speed + multiplier);
        this.controlY += this.ctrl1Forward.y * Math.abs(this.speed + multiplier);
        this.controlXA += this.ctrl2Forward.x * Math.abs(this.speed + multiplier);
        this.controlYA += this.ctrl2Forward.y * Math.abs(this.speed + multiplier);
    }

    reflect(number){
        return number *= -1;
    }

}

export {GameObject, Player, Popper, Blip, Sploder, QuadraticBezier, Bezier};