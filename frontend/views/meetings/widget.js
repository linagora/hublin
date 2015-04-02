'use strict';

(function() {
  var links = document.getElementsByClassName('hublin-link');

  if (!links || !links.length) {
    return;
  }

  var head = document.getElementsByTagName('head')[0],
      div = document.createElement('div'),
      stylesheet = document.createElement('link');

  stylesheet.type = 'text/css';
  stylesheet.rel = 'stylesheet';
  stylesheet.href = 'https://hubl.in/css/widget.css';
  head.insertBefore(stylesheet, head.firstChild);

  div.className = 'hublin-widget';
  div.innerHTML = '__(Chat on Hubl.in)';
  div.title = '__(An easy and free VideoChat service)';
  links[0].appendChild(div);
})();
