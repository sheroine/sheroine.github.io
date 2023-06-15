// Why are the all of these ES6 Arrow functions instead of regular JS functions?
// No particular reason, actually, just that it's good for you to get used to this syntax
// For Project 2 - any code added here MUST also use arrow function syntax

const makeColor = (red, green, blue, alpha = 1) =>
{
  return `rgba(${red},${green},${blue},${alpha})`;
};

const getRandom = (min, max) => 
{
  return Math.random() * (max - min) + min;
};

const getRandomColor = () => 
{
  const floor = 35; // so that colors are not too bright or too dark 
  const getByte = () => getRandom(floor,255-floor);
  return `rgba(${getByte()},${getByte()},${getByte()},1)`;
};

const getRandomUnitVector = () =>
{
	let x = getRandom(-1,1);
	let y = getRandom(-1,1);
	let length = Math.sqrt(x*x + y*y);
  if(length == 0) // very unlikely
  {
		x=1; // point right
		y=0;
  } 
  else
  {
		x /= length;
		y /= length;
	}
	return {x:x, y:y};
}

const getLinearGradient = (ctx,startX,startY,endX,endY,colorStops) => 
{
  let lg = ctx.createLinearGradient(startX,startY,endX,endY);
  for(let stop of colorStops)
  {
    lg.addColorStop(stop.percent,stop.color);
  }
  return lg;
};


const goFullscreen = (element) => 
{
  if (element.requestFullscreen) 
  {
    element.requestFullscreen();
  } 
  else if (element.mozRequestFullscreen) 
  {
    element.mozRequestFullscreen();
  } 
  else if (element.mozRequestFullScreen)  // camel-cased 'S' was changed to 's' in spec
  {
    element.mozRequestFullScreen();
  } 
  else if (element.webkitRequestFullscreen) 
  {
  element.webkitRequestFullscreen();
  }
  // .. and do nothing if the method is not supported
};

const drawRect = (ctx, x, y, width, height, color, type = 1, rotation = 0) =>
{
  ctx.save();
  ctx.fillStyle = color;
  ctx.translate(x, y);
  ctx.rotate(rotation);
  //1 - center pivot
  //2 - top center
  //3 - bottom center
  switch(type)
  {
    case 1:
      ctx.fillRect(0 - width / 2, 0 - height / 2, width, height);
      break;

    case 2:
      ctx.fillRect(0 - width / 2, 0, width, height);
      break;

    case 3:
      ctx.scale(1, -1);
      ctx.fillRect(0 - width / 2, 0, width, height);
      break;

    default:
      ctx.fillRect(0 - width / 2, 0 - height / 2, width, height);
      break;
  }
  ctx.restore();
}

const drawSquare = (ctx, x, y, width, color, rotation = 0) =>
{
  ctx.save();
  ctx.fillStyle = color;
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.fillRect(0 - width / 2, 0 - width / 2, width, width);
  ctx.restore();
}

const drawCircle = (ctx, x, y, radius, color) =>
{
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2, false);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

const drawRegularPolygon = (ctx, x, y, radius, sides, color, rotation = 0) =>
{
  ctx.save();
  ctx.fillStyle = color;
  ctx.translate(x, y);
  ctx.rotate(rotation);

  let angle = 2 * Math.PI / sides;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  for (let i = 1; i < sides; i++)
  {
    ctx.lineTo(radius * Math.cos(angle * i), radius * Math.sin(angle * i));    
  }
  ctx.closePath();

  ctx.fill();
  ctx.restore();
}

const drawQuadraticBezier = (ctx, startX, startY, controlX, controlY, endX, endY, color, lWidth) =>
{
  ctx.save();
  ctx.lineWidth = lWidth;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(startX,startY);
  ctx.quadraticCurveTo(controlX, controlY, endX, endY);
  ctx.closePath();
  // ctx.fillStyle = "blue"
  // ctx.fillRect(controlX,controlY,5,5);
  ctx.stroke();
  ctx.restore();
}

const drawCubicBezier = (ctx, startX, startY, controlX, controlY, controlXA, controlYA, endX, endY, color, lWidth) =>
{
  ctx.save();
  ctx.lineWidth = lWidth;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(startX,startY);
  ctx.bezierCurveTo(controlX, controlY, controlXA, controlYA, endX, endY);
  ctx.closePath();
  // ctx.fillStyle = "white"
  // ctx.fillRect(controlX,controlY,5,5);
  // ctx.fillRect(controlXA,controlYA,5,5);
  ctx.stroke();
  ctx.restore();
}


  
export {makeColor, getRandom, getRandomColor, getRandomUnitVector, getLinearGradient, goFullscreen, drawRect, drawSquare, drawCircle, drawRegularPolygon, drawQuadraticBezier,drawCubicBezier};