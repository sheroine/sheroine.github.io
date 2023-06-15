// 1 - our WebAudio context, **we will export and make this public at the bottom of the file**
let audioCtx;

// **These are "private" properties - these will NOT be visible outside of this module (i.e. file)**
// 2 - WebAudio nodes that are part of our WebAudio audio routing graph
let element, sourceNode, analyserNode, gainNode;
let lowBiquadFilter, highBiquadFilter, distortionFilter;
let distortionAmount = 0;

// 3 - here we are faking an enumeration
const DEFAULTS = Object.freeze({
    gain : .5,
    numSamples : 256,
    lowshelf : 0,
    highShelf : 0,
    distortion: 0
});

// 4 - create a new array of 8-bit integers (0-255)
// this is a typed array to hold the audio frequency data
let audioData = new Uint8Array(DEFAULTS.numSamples / 2);

// **Next are "public" methods - we are going to export all of these at the bottom of this file**
function setupWebaudio(filepath)
{
    // 1 - The || is because WebAudio has not been standardized across browsers yet
    const AudioContext = window.AudioContext || window.webkitAudiocontext;
    audioCtx = new AudioContext();

    // 2 - this creates an <audio> element
    element = new Audio();

    // 3 - have it point at a sound file
    loadSoundFile(filepath);

    // 4 - create a source node that points at the <audio> element
    sourceNode = audioCtx.createMediaElementSource(element);

    // 5 - create an analyser node
    // note the UK spelling of "Analyser"
    analyserNode = audioCtx.createAnalyser();

    /*
    // 6
    We will request DEFAULTS.numSamples number of samples or "bins" spaced equally 
    across the sound spectrum.

    If DEFAULTS.numSamples (fftSize) is 256, then the first bin is 0 Hz, the second is 172 Hz, 
    the third is 344Hz, and so on. Each bin contains a number between 0-255 representing 
    the amplitude of that frequency.
    */ 

    // fft stands for Fast Fourier Transform
    analyserNode.fftSize = DEFAULTS.numSamples;

    // 7 - create a gain (volume) node
    gainNode = audioCtx.createGain();
    gainNode.gain.value = DEFAULTS.gain;

    //lowshelf filter
    lowBiquadFilter = audioCtx.createBiquadFilter();
    lowBiquadFilter.type = "lowshelf";
    lowBiquadFilter.frequency.setValueAtTime(1000, audioCtx.currentTime);
    lowBiquadFilter.gain.setValueAtTime(DEFAULTS.lowshelf, audioCtx.currentTime);

    //highshelf filter
    highBiquadFilter = audioCtx.createBiquadFilter();
    highBiquadFilter.type = "highshelf";
    highBiquadFilter.frequency.setValueAtTime(1000, audioCtx.currentTime);
    highBiquadFilter.gain.setValueAtTime(DEFAULTS.highShelf, audioCtx.currentTime);

    //distortion filter
    distortionFilter = audioCtx.createWaveShaper();
    
    distortionFilter.curve = null; // being paranoid and trying to trigger garbage collection
    //distortionFilter.curve = makeDistortionCurve(distortionAmount);
    
    // 8 - connect the nodes - we now have an audio graph
    sourceNode.connect(lowBiquadFilter);
    lowBiquadFilter.connect(highBiquadFilter);
    highBiquadFilter.connect(distortionFilter);
    distortionFilter.connect(analyserNode);
    analyserNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);
}

function loadSoundFile(filepath)
{
    element.src = filepath;
}

function playCurrentSound()
{
    element.play();
}

function pauseCurrentSound()
{
    element.pause();
}

function setVolume(value)
{
    value = Number(value);  // make sure that it's a Number rather than a String
    gainNode.gain.value = value;
}

function setLowshelfFilter(value)
{
    value = Number(value);  // make sure that it's a Number rather than a String
    lowBiquadFilter.gain.setValueAtTime(value, audioCtx.currentTime);
}

function setHighshelfFilter(value)
{
    value = Number(value);  // make sure that it's a Number rather than a String
    highBiquadFilter.gain.setValueAtTime(value, audioCtx.currentTime);
}

function makeDistortionCurve(amount=20) 
{
    let n_samples = 256, curve = new Float32Array(n_samples);
    for (let i =0 ; i < n_samples; ++i ) 
    {
        let x = i * 2 / n_samples - 1;
        curve[i] =(Math.PI + 100 * x/2) / (Math.PI + 100 * Math.abs(x));    
    }
    return curve;
}

function setDistortionFilter(value)
{
    value = Number(value);  // make sure that it's a Number rather than a String
    distortionFilter.curve = makeDistortionCurve(amount);
}

function hasEnded()
{
    return element.ended;
}

function reloadTrack()
{
    element.load();
}

function getTrackDuration()
{
    return element.duration;
}

function getCurrentTime()
{
    return element.currentTime;
}

export{audioCtx, setupWebaudio, playCurrentSound, pauseCurrentSound, loadSoundFile, setVolume, setLowshelfFilter, setHighshelfFilter, setDistortionFilter, analyserNode, hasEnded, reloadTrack, getTrackDuration, getCurrentTime};