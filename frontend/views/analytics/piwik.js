'use strict';

var piwik = {
  PWK_SITE_ID : '$$(piwik.site_id)'
  PWK_SERVER : '$$(piwik.server)',
};

if (piwik.SITE_ID && piwik.PWK_SERVER) {
  var _paq = _paq || [];
  _paq.push(['trackPageView']);
  _paq.push(['enableLinkTracking']);
  (function() {
    _paq.push(['setTrackerUrl', piwik.SERVER + '/piwik.php']);
    _paq.push(['setSiteId', piwik.SITE_ID]);
    var d = document;
    var g = d.createElement('script');
    var s = d.getElementsByTagName('script')[0];
    g.type = 'text/javascript';
    g.async = true;
    g.defer = true;
    g.src = piwik.SERVER + '/piwik.js'; s.parentNode.insertBefore(g,s);
  })();
}
