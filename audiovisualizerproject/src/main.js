/*
	main.js is primarily responsible for hooking up the UI to the rest of the application 
	and setting up the main event loop
*/

// We will write the functions in this file in the traditional ES5 way
// In this instance, we feel the code is more readable if written this way
// If you want to re-write these as ES6 arrow functions, to be consistent with the other files, go ahead!

import * as utils from './utils.js';
import * as audio from './audio.js';
import * as canvas from './canvas.js';

let gamestate;
let initRan = false;
let progressBar;
let mouseX = 0, mouseY = 0;

const drawParams = Object.seal(
{
    color : "red",
    showGradient : false,
    showNoise : false,
    showInvert : false,
    showEmboss : false,
    red : 255,
    blue : 255,
    green : 255,
    dataType : "freq"
});

// 1 - here we are faking an enumeration
const SOUNDTRACKS = Object.freeze({
    summerBreeze  :  "audio/SummerBreeze-Tobu.mp3",
    candyLand : "audio/Tobu-Candyland-pt2.mp3",
    fantasy : "audio/Tobu-Itro-FantasyTesting.mp3"
});

const GAMESTATE = Object.freeze(
{
    GAME : "game",
    PAUSED : "paused",
    VOID : "void",   //the void between games and it's not paused
    NOTGAME : "notGame"
});

const controlsObject = Object.seal(
{
    //values
    _track : SOUNDTRACKS.summerBreeze,
    _volume : 50,
    _lowshelf : 0,
    _highshelf : 0,
    _distortion : false,
    _game : false,

    //getters, setters
    set track(value)
    {
        this._track = value;
        changeTrack();
    },

    get track()
    {
        return this._track;
    },

    set volume(value)
    {
        this._volume = value;
        //set the gain
        audio.setVolume(controlsObject.volume / 100 * 2);
    },

    get volume()
    {
        return this._volume;
    },

    set color(value)
    {
        drawParams.color = value;
        canvas.draw(drawParams);
    },

    get color()
    {
        return drawParams.color;
    },

    set gradient(value)
    {
        drawParams.showGradient = value;
        canvas.draw(drawParams);
    },

    get gradient()
    {
        return drawParams.showGradient;
    },

    set noise(value)
    {
        drawParams.showNoise = value;
        if(drawParams.showNoise)
        {
            drawParams.red = utils.getRandom(0, 255);
            drawParams.green = utils.getRandom(0, 255);
            drawParams.blue = utils.getRandom(0, 255);
        }
        canvas.draw(drawParams);
    },

    get noise()
    {
        return drawParams.showNoise;
    },

    set invert(value)
    {
        drawParams.showInvert = value;
        canvas.draw(drawParams);
    },

    get invert()
    {
        return drawParams.showInvert;
    },

    set emboss(value)
    {
        drawParams.showEmboss = value;
        canvas.draw(drawParams);
    },

    get emboss()
    {
        return drawParams.showEmboss;
    },

    set lowshelf(value)
    {
        this._lowshelf = value;
        audio.setLowshelfFilter(value);
    },

    get lowshelf()
    {
        return this._lowshelf;
    },

    set highshelf(value)
    {
        this._highshelf = value;
        audio.setHighshelfFilter(value);
    },

    get highshelf()
    {
        return this._highshelf;
    },

    set distortion(value)
    {
        this._distortion = value;

        if(this._distortion)
        {
            distortionFilter.curve = null;
            audio.setDistortionFilter(value);
        }
        else
        {
            distortionFilter.curve = null;
        }
    },

    get distortion()
    {
        return this._distortion;
    },

    set dataType(value)
    {
        drawParams.dataType = value;
        canvas.draw(drawParams);
    },

    get dataType()
    {
        return drawParams.dataType;
    },

    set game(value)
    {
        this._game = value;
        this.toggleGame();
    },

    get game()
    {
        return this._game;
    },
    
    //functions
    toggleGame()
    {
        let dependentNodes = document.querySelectorAll("[data-isgame]");
        for (const element of dependentNodes)
        {
            element.dataset.isgame = this._game.toString();
        }
        
        //pause the current track if it is playing
        if (playButton.dataset.playing == "yes")
        {
            playButton.dispatchEvent(new MouseEvent("click"));
        }

        if(this._game)
        {
            //set to void so game can start
            initRan = false;
            gamestate = GAMESTATE.VOID;
        }
        else
        {
            //turns back to audio visualizer
            gamestate = GAMESTATE.NOTGAME;
            audio.reloadTrack();
            canvas.init(controlsObject.track, this._game);
        }
    },
});

function init()
{
    audio.setupWebaudio(controlsObject.track);
	let canvasElement = document.querySelector("canvas"); // hookup <canvas> element
    setupUI(canvasElement);

    progressBar = document.querySelector("#progressBar");
    
    //just an audio visualizer at first
    gamestate = GAMESTATE.NOTGAME;
  
    canvas.setupCanvas(canvasElement, audio.analyserNode, SOUNDTRACKS);
    canvas.init(controlsObject.track, controlsObject.game);
    loop();
}

function setupUI(canvasElement)
{
    const gui = new dat.GUI({width: 250});
    gui.close();

    gui.add(controlsObject, 'track', {SummerBreeze: SOUNDTRACKS.summerBreeze, CandylandPt_II: SOUNDTRACKS.candyLand, Fantasy: SOUNDTRACKS.fantasy}).name('Track Select: ');
    gui.add(controlsObject, 'volume', 0, 100).name('Volume: ');

    const appearanceFolder = gui.addFolder('Visual Effects');
    appearanceFolder.add(controlsObject, 'color', {Red: "red", Blue: "blue", Yellow: "yellow", Green: "green", Orange: "orange", Rainbow: "rainbow"}).name('Color Scheme: ');
    appearanceFolder.add(controlsObject, 'gradient').name('Gradient');
    appearanceFolder.add(controlsObject, 'noise').name('Noise');
    appearanceFolder.add(controlsObject, 'invert').name('Invert Colors');
    appearanceFolder.add(controlsObject, 'emboss').name('Emboss');

    const audioFolder = gui.addFolder('Audio Effects');
    audioFolder.add(controlsObject, 'lowshelf', -15, 15).name('Bass: ');
    audioFolder.add(controlsObject, 'highshelf', -30, 30).name('Treble: ');
    audioFolder.add(controlsObject, 'distortion').name('Distortion: ');

    gui.add(controlsObject, 'dataType', {Frequency: "freq", Waveform: "wave"}).name('Data Type: ');
    gui.add(controlsObject, 'game').name('Gamify');

    // A - hookup fullscreen button
    const fsButton = document.querySelector("#fsButton");
        
    // add .onclick event to button
    fsButton.onclick = e => {
        // console.log("init called");
        utils.goFullscreen(canvasElement);
    };

    //add .onclick event to button
    playButton.onclick = e =>
    {
        //check if context is in suspended state (autoplay policy)
        if (audio.audioCtx.state == "suspended")
        {
            audio.audioCtx.resume();
        }

        // console.log(`audioCtx.state after = ${audio.audioCtx.state}`);
        if(e.target.dataset.playing == "no")
        {
            //if track is currently paused, play it
            audio.playCurrentSound();
            e.target.dataset.playing = "yes"; //css sets text to "Pause"

            if(gamestate == GAMESTATE.PAUSED || gamestate == GAMESTATE.VOID )
            {
                gamestate = GAMESTATE.GAME;
            }
        }
        else
        {
            //if track is playing, pause it
            audio.pauseCurrentSound();
            e.target.dataset.playing = "no";  //css sets text to "Play"

            if(gamestate == GAMESTATE.GAME)
            {
                gamestate = GAMESTATE.PAUSED;
            }
        }

    };

    //player select dropdown
    let playerSelectionDD = document.querySelector("#playerSelect");
    playerSelectionDD.onchange = e =>
    {
        canvas.playerSelect(e.target.value);
    }

    canvasElement.onmousemove = e =>
    {
        let rect = e.target.getBoundingClientRect();
        mouseX = e.clientX - rect.x;
        mouseY = e.clientY - rect.y;
    }

} // end setupUI

const changeTrack = () =>
{        
    audio.loadSoundFile(controlsObject.track);
    //pause the current track if it is playing
    if (playButton.dataset.playing == "yes")
    {
        playButton.dispatchEvent(new MouseEvent("click"));
    }

    //should run canvas.init anyways because diff tracks have diff stuff
    canvas.init(controlsObject.track, controlsObject.game);
    if(gamestate != GAMESTATE.NOTGAME)
    {
        initRan = false;
        gamestate = GAMESTATE.VOID;
    }
}

function loop()
{
    requestAnimationFrame(loop);

    // console.log(audio.getCurrentTime(), audio.getTrackDuration());
    if(!isNaN(audio.getTrackDuration()))
    {
        progressBar.max = audio.getTrackDuration();
        progressBar.value = audio.getCurrentTime();
    }

    switch(gamestate)
    {
        case GAMESTATE.GAME:
            canvas.update(mouseX, mouseY);
            canvas.draw(drawParams);
            if(audio.hasEnded())
            {
                playButton.dispatchEvent(new MouseEvent("click"));
                initRan = false;
                gamestate = GAMESTATE.VOID;
                // console.log(gamestate);
            }
            break;

        case GAMESTATE.PAUSED:
            //should have nothing here
            break;

        case GAMESTATE.VOID:
            //reloads track
            audio.reloadTrack();
            if(!initRan)
            {
                //makes it so init is only ran once instead of run every frame
                initRan = canvas.init(controlsObject.track, controlsObject.game);
            }
            canvas.voidUpdate(mouseX, mouseY);
            canvas.draw(drawParams);
            break;

        case GAMESTATE.NOTGAME:
            canvas.update();
            canvas.draw(drawParams);
            if(audio.hasEnded() && playButton.dataset.playing == "yes")
            {
                playButton.dispatchEvent(new MouseEvent("click"));
            }
            break;
    }
    
}

export {init};