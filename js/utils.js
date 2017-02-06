
function isElementOnScreen(id) {
  var element = document.getElementById(id);
  var bounds = element.getBoundingClientRect();
  return bounds.top < window.innerHeight && bounds.bottom > distanceToTopForActiveConcertInfo;
}


// Returns a random number between min (inclusive) and max (exclusive)
function getRandomInt(min, max)     {
  return Math.random() * (max - min) + min;
}
