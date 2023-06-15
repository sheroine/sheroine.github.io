(function()
{
    "use strict";

    const drawParams = Object.freeze
    ({
        "smallSize" : 2,
        "mediumSize" : 4,
        "largeSize" : 6,
        "thiccSize" : 10,

        "smallFlower" : 100,
        "mediumFlower" : 250,
        "largeFlower" : 400,
        "thiccFlower" : 600
    });

    class Flower
    {    
        //for self
        ctx;
        n = 0;
        prevDotX;
        prevDotY;

        //changable
        x;
        y;
        c;
        dotsize;
        color;
        lineColor;
        circlePetal;
        size;
        divergence;
        lines;


        constructor(ctx, x = 0, y = 0, c = "medium", dotsize = "medium", divergence = 137.5, color = "#ff0000", lineColor = "#ff0000", circlePetal = true, lines = false, size = "small")
        {
            this.ctx = ctx;
            this.x = x;
            this.y = y;
            // this.c = c;
            switch(c)
            {
                case "small":
                    this.c = drawParams.smallSize;
                    break;

                case "medium":
                    this.c = drawParams.mediumSize;
                    break;
                
                case "large":
                    this.c = drawParams.largeSize;
                    break;
                
                case "thicc":
                    this.c = drawParams.thiccSize;
                    break;

                default:
                    this.c = drawParams.mediumSize;
                    break;
            }
            // this.dotsize = dotsize;
            switch(dotsize)
            {
                case "small":
                    this.dotsize = drawParams.smallSize;
                    break;

                case "medium":
                    this.dotsize = drawParams.mediumSize;
                    break;
                
                case "large":
                    this.dotsize = drawParams.largeSize;
                    break;
                
                case "thicc":
                    this.dotsize = drawParams.thiccSize;
                    break;

                default:
                    this.dotsize = drawParams.mediumSize;
                    break;
            }
            this.divergence = divergence;
            this.color = color;
            this.lineColor = lineColor;
            this.circlePetal = circlePetal;
            this.lines = lines;

            switch(size)
            {
                case "small":
                    this.size = drawParams.smallFlower;
                    break;

                case "medium":
                    this.size = drawParams.mediumFlower;
                    break;
                
                case "large":
                    this.size = drawParams.largeFlower;
                    break;
                
                case "thicc":
                    this.size = drawParams.thiccFlower;
                    break;

                default:
                    this.size = drawParams.smallFlower;
                    break;
            }
        }

        draw()
        {
            if(this.n < this.size)
            {
                // each frame draw a new dot
                // `a` is the angle
                // `r` is the radius from the center of the flower
                // `c` is the "padding" between the dots
                let a = this.n * mxwLIB.dtr(this.divergence);
                let r = this.c * Math.sqrt(this.n);

                // now calculate the `x` and `y`
                let dotX = r * Math.cos(a) + this.x;
                let dotY = r * Math.sin(a) + this.y;

                if(this.circlePetal)
                {
                    mxwLIB.drawCircle(this.ctx, dotX, dotY, this.dotsize, this.color);
                }
                else
                {
                    mxwLIB.drawRect(this.ctx, dotX, dotY, this.dotsize, this.dotsize, this.color);
                }

                if(this.lines)
                {
                    mxwLIB.drawLine(this.ctx, this.prevDotX, this.prevDotY, dotX, dotY, this.dotsize - 1, this.lineColor, 0.3);
                }

                this.prevDotX = dotX;
                this.prevDotY = dotY;

                this.n++;
                
                return false;
            }  

            return true;
        }

        setDivergence(number)
        {
            this.divergence = number;
        }

        setColor(color)
        {
            this.color = color;
        }

        setLineColor(color)
        {
            this.lineColor = color;
        }

        setPetalShape(bool)
        {
            this.circlePetal = bool;
        }

        setLines(bool)
        {
            this.lines = bool;
        }
    }

    function dtr(degrees)
    {
        return degrees * (Math.PI/180);
    }

    function drawRect(ctx, x, y, width, height, color, rotation = 0)
    {
        //console.log("rect");
        ctx.save();
        ctx.fillStyle = color;
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.fillRect(0 - width / 2, 0 - height / 2, width, height);
        ctx.restore();
    }

    function drawCircle(ctx, x, y, radius, color)
    {
        ctx.save();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    function drawLine(ctx, startX, startY, endX, endY, width, color, opacity = 1)
    {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    }

    window["mxwLIB"] = 
    {
        drawParams,
        Flower,
        dtr,
        drawRect,
        drawCircle,
        drawLine
    }
})();
