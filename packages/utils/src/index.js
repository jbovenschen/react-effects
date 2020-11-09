// get a random number within a range
function random(min, max) {
  return Math.random() * (max - min) + min;
}

// get a random item from an array
function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
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

export { random, randomItem, convertColors };
