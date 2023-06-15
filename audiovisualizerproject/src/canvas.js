/*
	The purpose of this file is to take in the analyser node and a <canvas> element: 
	  - the module will create a drawing context that points at the <canvas> 
	  - it will store the reference to the analyser node
	  - in draw(), it will loop through the data in the analyser node
	  - and then draw something representative on the canvas
	  - maybe a better name for this file/module would be *visualizer.js* ?
*/

import * as utils from './utils.js';
import * as classes from './classes.js';

let ctx,canvasWidth,canvasHeight,analyserNode,freqAudioData, waveAudioData;
let trackList, currentTrack, isGame;
let playerColor = "blue";
let pColorChanged = false;

const colors = Object.freeze
({
    red : "#ff0873",
    blue : "#08ffff",
    yellow : "#f8ff29",
    green : "#07f70f",
    orange : "#f7a707",
    rainbowGradient : [{percent: 0 , color: "#fa1919"}, {percent: .2 , color: "#eb9f13"}, {percent: .4 , color: "#fef826"}, 
        {percent: .6 , color: "#15f039"}, {percent: .8 , color: "#203bf4"}, {percent: 1 , color: "#871ff5"}],

    redGradient : [{percent: 0 , color: "#ff0873"}, {percent: .25 , color: "#bf0053"}, {percent: .5 , color: "#ed1e42"}, 
        {percent: .75 , color: "#ff5b78"}, {percent: 1 , color: "#ff10ad"}],

    blueGradient : [{percent: 0 , color: "#0089c7"}, {percent: .25 , color: "#25b4c1"}, {percent: .5 , color: "#96ecff"}, 
        {percent: .75 , color: "#478ceb"}, {percent: 1 , color: "#34dddd"}],

    yellowGradient : [{percent: 0 , color: "#f0cf38"}, {percent: .25 , color: "#f2f922"}, {percent: .5 , color: "#f2ff8a"}, 
        {percent: .75 , color: "#fff800"}, {percent: 1 , color: "#c8fc13"}],

    greenGradient : [{percent: 0 , color: "#a0ff80"}, {percent: .25 , color: "#00cd08"}, {percent: .5 , color: "#69ff32"}, 
        {percent: .75 , color: "#14c34e"}, {percent: 1 , color: "#8affbb"}],

    orangeGradient : [{percent: 0 , color: "#ffd581"}, {percent: .25 , color: "#f77307"}, {percent: .5 , color: "#f7b407"}, 
        {percent: .75 , color: "#eb4113"}, {percent: 1 , color: "#ff7c09"}]
});

function setupCanvas(canvasElement,analyserNodeRef, tracks = {})
{
	// create drawing context
	ctx = canvasElement.getContext("2d");
	canvasWidth = canvasElement.width;
	canvasHeight = canvasElement.height;
	// keep a reference to the analyser node
    analyserNode = analyserNodeRef;
    
	// this is the array where the analyser data will be stored
    freqAudioData = new Uint8Array(analyserNode.fftSize / 2);
    waveAudioData = new Uint8Array(analyserNode.fftSize / 2);

    trackList = tracks;
}

//basically for reset / initializing
function init(playingTrack, game = false)
{
    classes.GameObject.clearList();
    classes.GameObject.removePlayer();
    currentTrack = playingTrack;
    isGame = game;

    //stuff for classes
    switch(currentTrack)
    {
        case trackList.summerBreeze:
            new classes.Popper(ctx, utils.getRandom(50, canvasWidth - 50), utils.getRandom(50, canvasHeight - 50), 5, 30, canvasWidth, canvasHeight, 8, false);
            new classes.Popper(ctx, utils.getRandom(50, canvasWidth - 50), utils.getRandom(50, canvasHeight - 50), 5, 40, canvasWidth, canvasHeight, 6, true);
            break;

        case trackList.candyLand:
            new classes.Popper(ctx, utils.getRandom(50, canvasWidth - 50), utils.getRandom(50, canvasHeight - 50), 8, 50, canvasWidth, canvasHeight, 5, true);
            break;

        case trackList.fantasy:
            new classes.Bezier(ctx,canvasWidth/2,canvasHeight/2, 5, canvasWidth, canvasHeight, utils.getRandom(150, canvasWidth - 150),utils.getRandom(150, canvasHeight - 150),utils.getRandom(150, canvasWidth - 150),utils.getRandom(150, canvasHeight - 150), 5);
            new classes.Bezier(ctx,canvasWidth/2,canvasHeight/2, 5, canvasWidth, canvasHeight, utils.getRandom(150, canvasWidth - 150),utils.getRandom(150, canvasHeight - 150),utils.getRandom(150, canvasWidth - 150),utils.getRandom(150, canvasHeight - 150), 5);
            new classes.Bezier(ctx,canvasWidth/2,canvasHeight/2, 5, canvasWidth, canvasHeight, utils.getRandom(150, canvasWidth - 150),utils.getRandom(150, canvasHeight - 150),utils.getRandom(150, canvasWidth - 150),utils.getRandom(150, canvasHeight - 150), 5);
            new classes.Bezier(ctx,canvasWidth/2,canvasHeight/2, 5, canvasWidth, canvasHeight, utils.getRandom(150, canvasWidth - 150),utils.getRandom(150, canvasHeight - 150),utils.getRandom(150, canvasWidth - 150),utils.getRandom(150, canvasHeight - 150), 5);
            new classes.Bezier(ctx,canvasWidth/2,canvasHeight/2, 5, canvasWidth, canvasHeight, utils.getRandom(150, canvasWidth - 150),utils.getRandom(150, canvasHeight - 150),utils.getRandom(150, canvasWidth - 150),utils.getRandom(150, canvasHeight - 150), 5);
            new classes.QuadraticBezier(ctx, 0, 0, 5, canvasWidth, canvasHeight, utils.getRandom(150, canvasWidth - 150), utils.getRandom(150, canvasHeight - 150), 0, canvasHeight, 5);
            new classes.QuadraticBezier(ctx, canvasWidth, 0, 5, canvasWidth, canvasHeight, utils.getRandom(150, canvasWidth - 150), utils.getRandom(150, canvasHeight - 150), canvasWidth, canvasHeight, 5);
            break;
    }

    if (isGame)
    {
        //if its a game then do the player stuff
        new classes.Player(ctx, canvasWidth / 5, canvasHeight / 2, 8, canvasWidth, canvasHeight);
    }

    //returns true for saying init has been run so dont run again
    return true;
}

function update(mouseX = 0, mouseY = 0)
{
    // 1 - populate the freqAudioData array with the frequency data from the analyserNode
	// notice these arrays are passed "by reference" 
    analyserNode.getByteFrequencyData(freqAudioData);
	// OR
	analyserNode.getByteTimeDomainData(waveAudioData); // waveform data
	
    //------------------------------------------------------
    //sprite stuffs
    classes.GameObject.updateAll(freqAudioData, waveAudioData);

    switch(currentTrack)
    {
        case trackList.summerBreeze:
            break;

        case trackList.candyLand:
            let readNum = 15;
            let blipNum = Math.floor(waveAudioData.length / readNum);
            let spacing = canvasHeight / blipNum;
            for (let i = 0; i < blipNum; i++)
            {
                let average = 0;
                for (let j = 0 + (i * readNum); j < readNum + (i * readNum); j++)
                {
                    if(j < waveAudioData.length)
                    {
                        average += waveAudioData[j] - 128;
                    }
                }

                //if data length is not divisible by read num
                if (waveAudioData.length % readNum != 0 && i == blipNum - 1)
                {
                    //last blip will read less data than the rest
                    average /= waveAudioData.length - (blipNum * readNum);
                }
                else
                {
                    average /= readNum;
                }

                if (average > 80)
                {
                    new classes.Blip(ctx, canvasWidth, spacing * i + (spacing / 2), 5, canvasWidth, canvasHeight, {x: utils.getRandom(-0.8, -1.0), y: utils.getRandom(-0.6, 0.6)}, 5, false);
                }
            }
            break;
    }

    if(isGame)
    {
        //let the player move
        classes.GameObject.updatePlayer(mouseX, mouseY);
    }
}

function voidUpdate(mouseX = 0, mouseY = 0)
{
    //just so the bars dont freeze in place when track stops    
    // 1 - populate the freqAudioData array with the frequency data from the analyserNode
	// notice these arrays are passed "by reference" 
    analyserNode.getByteFrequencyData(freqAudioData);
	// OR
    analyserNode.getByteTimeDomainData(waveAudioData); // waveform data
    
    //let player move around
    classes.GameObject.updatePlayer(mouseX, mouseY);

    //allow player select here only
    if (pColorChanged)
    {
        switch(playerColor)
        {
            case "blue":
                classes.GameObject.getPlayer().setColor(colors.blue);
                break;

            case "yellow":
                classes.GameObject.getPlayer().setColor(colors.yellow);
                break;
                
            case "green":
                classes.GameObject.getPlayer().setColor(colors.green);
                break;
                
            case "orange":
                classes.GameObject.getPlayer().setColor(colors.orange);
                break;
        }
        pColorChanged = false;
    }
}

function playerSelect(color)
{
    playerColor = color;
    pColorChanged = true;
}

function draw(params={})
{
	// 2 - draw background
    ctx.save();
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.restore();
    
    // 4 - draw bars
    // always show bars
    let barSpacing = 3;
    let margin = 5;
    let screenWidthForBars = canvasWidth - (freqAudioData.length * barSpacing) - margin;
    let barWidth = screenWidthForBars / freqAudioData.length;
    let fillColor;

    //see which color the player picked
    if(params.showGradient)
    {
        switch(params.color)
        {
            case "red":
                fillColor = utils.getLinearGradient(ctx, 0, 0, canvasWidth, 0, colors.redGradient);
                break;
            case "blue":
                fillColor = utils.getLinearGradient(ctx, 0, 0, canvasWidth, 0, colors.blueGradient);
                break;        
            case "yellow":
                fillColor = utils.getLinearGradient(ctx, 0, 0, canvasWidth, 0, colors.yellowGradient);
                break;        
            case "green":
                fillColor = utils.getLinearGradient(ctx, 0, 0, canvasWidth, 0, colors.greenGradient);
                break;       
            case "orange":
                fillColor = utils.getLinearGradient(ctx, 0, 0, canvasWidth, 0, colors.orangeGradient);
                break;        
            case "rainbow":
                fillColor = utils.getLinearGradient(ctx, 0, 0, canvasWidth, 0, colors.rainbowGradient);
                break;
            default:
                fillColor = colors.red;
                break;
        }
        
    }
    else
    {
        switch(params.color)
        {
            case "red":
                fillColor = colors.red;
                break;
            case "blue":
                fillColor = colors.blue;
                break;        
            case "yellow":
                fillColor = colors.yellow;
                break;        
            case "green":
                fillColor = colors.green;
                break;       
            case "orange":
                fillColor = colors.orange;
                break;        
            case "rainbow":
                fillColor = utils.getLinearGradient(ctx, 0, 0, canvasWidth, 0, colors.rainbowGradient);
                break;
            default:
                fillColor = colors.red;
                break;
        }

    }

    let color = "hsl(0, 0%, 40%)";
    //loop through the data and draw white rects
    //so that the gradient overlay will show up properly
    switch (params.dataType)
    {
        case "freq":
            for(let i = 0; i < freqAudioData.length; i++)
            {
                //bottom
                utils.drawRect(ctx, margin + i * (barWidth + barSpacing), canvasHeight, barWidth, freqAudioData[i] + 20, color, 3);
                //top
                utils.drawRect(ctx, canvasWidth - (margin + i * (barWidth + barSpacing)), 0, barWidth, freqAudioData[i] + 20, color, 2);
            }            
            break;

        case "wave":
            //we will draw this from the center of the screen instead
            //and the bars have center pivots
            for(let i = 0; i < waveAudioData.length; i++)
            {
                //fluctuating bars in the middle
                utils.drawRect(ctx, margin + i * (barWidth + barSpacing), canvasHeight / 2, barWidth, waveAudioData[i] - 128 + barWidth, color, 1);
                
                //fluctuating bars in the top
                utils.drawRect(ctx, margin + i * (barWidth + barSpacing), 0, barWidth, waveAudioData[i] - 128, color, 1);
                
                //fluctuating bars in the bottom
                utils.drawRect(ctx, margin + i * (barWidth + barSpacing), canvasHeight, barWidth, waveAudioData[i] - 128, color, 1);
            }        
            break;

        default:
            for(let i = 0; i < freqAudioData.length; i++)
            {
                //bottom
                utils.drawRect(ctx, margin + i * (barWidth + barSpacing), canvasHeight, barWidth, freqAudioData[i] + 20, color, 3);
                //top
                utils.drawRect(ctx, canvasWidth - (margin + i * (barWidth + barSpacing)), 0, barWidth, freqAudioData[i] + 20, color, 2);
            }
            break;
    }

    //------------------------------------------------------
    //sprite stuffs
    classes.GameObject.drawAll();

    //the color overlay
    ctx.save();
    ctx.fillStyle = fillColor;
    ctx.globalCompositeOperation = "multiply";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.restore();

    //draw the player if it exists
    if(isGame)
    {
        classes.GameObject.drawPlayer();
    }

    // 6 - bitmap manipulation
	// TODO: right now. we are looping though every pixel of the canvas (320,000 of them!), 
	// regardless of whether or not we are applying a pixel effect
	// At some point, refactor this code so that we are looping though the image data only if
	// it is necessary

	// A) grab all of the pixels on the canvas and put them in the `data` array
	// `imageData.data` is a `Uint8ClampedArray()` typed array that has 1.28 million elements!
    // the variable `data` below is a reference to that array 
    let imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    let data = imageData.data;
    let length = data.length;
    let width = imageData.width //not using here
	
	// B) Iterate through each pixel, stepping 4 elements at a time (which is the RGBA for 1 pixel)
    for(let i = 0; i < length; i += 4)
    {
		// C) randomly change every 20th pixel
        if(params.showNoise && Math.random() < .05)
        {
			// data[i] is the red channel
			// data[i+1] is the green channel
			// data[i+2] is the blue channel
			// data[i+3] is the alpha channel
            data[i] = data [i + 1] = data[i + 2] = 0;   //zero out the red and green and blue channels
			data[i] = params.red;  
			data[i + 1] = params.green;  
			data[i + 2] = params.blue; 
        } // end if

        if(params.showInvert)
        {
            let red = data[i], green = data[i + 1], blue = data[i + 2];
            data[i] = 255 - red;    //set red value
            data[i + 1] = 255 - green;  //set green value
            data[i + 2] = 255 - blue;   //set blue value
        }
    } // end for

    //emboss effect
    if(params.showEmboss)
    {
        //note we are stepping through *each* sub-pixel
        for(let i = 0; i < length; i++)
        {
            if(i % 4 == 3) continue;    //skip alpha channel
            data[i] = 127 + 2 * data[i] - data[i + 4] - data[i + width * 4];
        } 
    }

	// D) copy image data back to canvas
    ctx.putImageData(imageData, 0, 0);

}

export {setupCanvas, update, voidUpdate, playerSelect, draw, init};