// get a random number within a range
function random(min, max) {
  return Math.random() * (max - min) + min;
}

// get a random item from an array
function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

// Get the distance between 2 points on the canvas
function calculateDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

function convertColors(colors) {
  return colors.map((hex) => {
    return hex
      .replace(
        /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
        (m, r, g, b) => "#" + r + r + g + g + b + b
      )
      .substring(1)
      .match(/.{2}/g)
      .map((x) => parseInt(x, 16));
  });
}

export { random, randomItem, calculateDistance, convertColors };
