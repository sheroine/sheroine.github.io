(function()
{
    "use strict";
    let ctx, canvas;
    const canvasWidth = 800;
    const canvasHeight = 800;

    let mouseX, mouseY;
    let paused = false;

    let flowers = [];

    let padding;
    let petalSize;
    let divergence;
    let cFillStyle;
    let lineColor;
    let circlepetal;
    let flowerSize;
    let lines;

    // #1 - wait for page to load
    window.onload = init; 
    
    function init(){
        // #2 - get pointer to <canvas> element on page
        canvas = document.querySelector('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        
        // #3 - get pointer to "drawing context" and drawing API
        ctx = canvas.getContext('2d');

        //divergence = document.querySelector("#divergenceSlider").value;
        circlepetal = document.querySelector("#petalShape").checked;

        controls();
        update();
    }

    function cls(ctx)
    {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    }

    function update()
    {
        //if it is paused, it stops everything else from going
        if(paused)
        return;

        requestAnimationFrame(update);

        for(let i = 0; i < flowers.length; i++)
        {
            if(flowers[i].draw())
            {
                flowers.splice(i, 1);
                i--;
            }
        }
    }

    function controls()
    {
        document.querySelector("#playButton").onclick = function()
        {
            if(!paused) return;
            paused = false;
            update();
        }
        
        document.querySelector("#pauseButton").onclick = function()
        {
            paused = true;
        }

        document.querySelector("#resetButton").onclick = function(){ cls(ctx); }

        //canvas click
        canvas.onclick = function(e)
        {
            let rect = e.target.getBoundingClientRect();
            mouseX = e.clientX - rect.x;
            mouseY = e.clientY - rect.y;

            flowers.push(new mxwLIB.Flower(ctx, mouseX, mouseY, padding, petalSize, divergence, cFillStyle, lineColor, circlepetal, lines, flowerSize));
        }

        //background color
        document.querySelector("#bgColor").onchange = function(e)
        {
            switch(e.target.value)
            {
                case "white":
                    canvas.style.backgroundImage = "none";
                    canvas.style.backgroundColor = "white";
                    break;

                case "black":
                    canvas.style.backgroundImage = "none";
                    canvas.style.backgroundColor = "black";
                    break;

                case "green":
                    canvas.style.backgroundImage = "none";
                    canvas.style.backgroundColor = "green";
                    break;

                case "tree":			
                    canvas.style.backgroundImage = "url(media/i-am-baby-groot-zulkarnain-sudibya.jpg)";
                    canvas.style.backgroundSize = "contain";
                    canvas.style.backgroundPosition = "center";
                    break;

                case "sword":
                    canvas.style.backgroundColor = "black";
                    canvas.style.backgroundImage = "url(media/minecraft-sword.png)";
                    canvas.style.backgroundSize = "contain";
                    canvas.style.backgroundPosition = "center";
                    break;

                case "cheese":
                    canvas.style.backgroundColor = "yellow";
                    canvas.style.backgroundImage = "url(media/cheese.png)";
                    canvas.style.backgroundSize = "contain";
                    canvas.style.backgroundPosition = "center";
                    break;

                case "grinch":
                    canvas.style.backgroundColor = "green";
                    canvas.style.backgroundImage = "url(media/grinch.jpg)";
                    canvas.style.backgroundSize = "contain";
                    canvas.style.backgroundPosition = "center";
                    break;
            }
        }
    
        //flower size radio buttons
        let flowerSizeButtons = document.querySelectorAll('[name=flowerSize]');
        for (let i = 0; i < flowerSizeButtons.length; i++)
        {
            flowerSizeButtons[i].onchange = function(e)
            {
                //onchange event is only called when the button is selected
                //it wont be triggered if it is deselected when another button is selected
                flowerSize = e.target.value;
            }
        }

        //divergence slider
        document.querySelector("#divergenceSlider").oninput = function(e)
        {
            document.querySelector("#currentDivergence").innerHTML = e.target.value;
            divergence = e.target.value;
            flowers.forEach(flower => {
                flower.setDivergence(e.target.value);
            });
        }

        //petal shape checkbox
        document.querySelector("#petalShape").onclick = function(e)
        {
            circlepetal = e.target.checked;
            flowers.forEach(flower => {
                flower.setPetalShape(e.target.checked);
            });
        }

        //lines checkbox
        document.querySelector("#lines").onclick = function(e)
        {
            lines = e.target.checked;
            flowers.forEach(flower => {
                flower.setLines(e.target.checked);
            });
        }

        //color picker for petals
        document.querySelector("#colorPicker").onchange = function(e)
        {
            cFillStyle = e.target.value;
            flowers.forEach(flower => {
                flower.setColor(e.target.value);
            });
        }

        //color picker for lines
        document.querySelector("#lineColorPicker").onchange = function(e)
        {
            lineColor = e.target.value;
            flowers.forEach(flower => {
                flower.setLineColor(e.target.value);
            });
        }

        //petal padding radio buttons
        let petalPaddingButtons = document.querySelectorAll('[name=pPadding]');
        for (let i = 0; i < petalPaddingButtons.length; i++)
        {
            petalPaddingButtons[i].onchange = function(e)
            {
                //onchange event is only called when the button is selected
                //it wont be triggered if it is deselected when another button is selected
                padding = e.target.value;
            }
        }

        //petal size radio buttons
        let petalSizeButtons = document.querySelectorAll('[name=pSize]');
        for (let i = 0; i < petalSizeButtons.length; i++)
        {
            petalSizeButtons[i].onchange = function(e)
            {
                //onchange event is only called when the button is selected
                //it wont be triggered if it is deselected when another button is selected
                petalSize = e.target.value;
            }
        }

        //save image button
        document.querySelector("#save").onclick = function(e)
        {
            let imageURL = canvas.toDataURL("image/png");
            e.target.href = imageURL;
        }

    }
})();
