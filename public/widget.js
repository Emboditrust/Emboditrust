(function () {
  'use strict';

  var BASE_URL = "https://emboditrust.com";
  var WIDGET_STYLES_LOADED = false;

  function loadStyles() {
    if (WIDGET_STYLES_LOADED) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = BASE_URL + '/widget.css';
    document.head.appendChild(link);
    WIDGET_STYLES_LOADED = true;
  }

  function buildIframeUrl(verificationCode, config) {
    var params = new URLSearchParams();
    if (config.companyName) params.set('companyName', config.companyName);
    if (config.logoUrl) params.set('logoUrl', config.logoUrl);
    if (config.faviconUrl) params.set('faviconUrl', config.faviconUrl);
    if (config.primaryColor) params.set('primaryColor', config.primaryColor);
    if (config.secondaryColor) params.set('secondaryColor', config.secondaryColor);
    if (config.accentColor) params.set('accentColor', config.accentColor);
    if (config.supportEmail) params.set('supportEmail', config.supportEmail);
    if (config.supportPhone) params.set('supportPhone', config.supportPhone);
    if (config.verificationHeadline) params.set('verificationHeadline', config.verificationHeadline);
    if (config.verificationDescription) params.set('verificationDescription', config.verificationDescription);
    var qs = params.toString();
    return BASE_URL + '/widget/verify/' + encodeURIComponent(verificationCode) + (qs ? '?' + qs : '');
  }

  function createIframe(url) {
    var iframe = document.createElement('iframe');
    iframe.className = 'et-widget-iframe';
    iframe.src = url;
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowtransparency', 'true');
    iframe.setAttribute('scrolling', 'no');
    iframe.style.width = '100%';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '16px';
    iframe.style.overflow = 'hidden';
    iframe.style.boxShadow = '0 4px 24px rgba(0,0,0,0.08)';
    iframe.style.background = 'transparent';
    iframe.style.minHeight = '400px';
    return iframe;
  }

  function resizeIframe(iframe) {
    try {
      var height = iframe.contentWindow.document.documentElement.scrollHeight;
      if (height > 100) {
        iframe.style.height = height + 'px';
      }
    } catch (e) {
    }
  }

  function initWidget(config) {
    var container = document.querySelector(config.container);
    if (!container) {
      console.error('[EmbodiTrust] Container not found: ' + config.container);
      return;
    }
    if (!config.verificationCode) {
      console.error('[EmbodiTrust] verificationCode is required');
      return;
    }

    loadStyles();

    var wrapper = document.createElement('div');
    wrapper.className = 'et-widget-container';

    var iframeUrl = buildIframeUrl(config.verificationCode, config);
    var iframe = createIframe(iframeUrl);
    wrapper.appendChild(iframe);
    container.appendChild(wrapper);

    var resizeTimer;
    iframe.addEventListener('load', function () {
      resizeTimer = setInterval(function () {
        resizeIframe(iframe);
      }, 500);
      setTimeout(function () {
        resizeIframe(iframe);
      }, 1000);
    });

    window.addEventListener('message', function (event) {
      if (event.origin !== BASE_URL) return;
      if (event.data && event.data.type === 'et-resize' && event.data.height) {
        iframe.style.height = event.data.height + 'px';
      }
    });

    return {
      destroy: function () {
        if (resizeTimer) clearInterval(resizeTimer);
        if (wrapper.parentNode) {
          wrapper.parentNode.removeChild(wrapper);
        }
      },
      iframe: iframe
    };
  }

  function verify(code, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', BASE_URL + '/api/verify/embedded/' + encodeURIComponent(code), true);
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.onload = function () {
      try {
        var data = JSON.parse(xhr.responseText);
        if (callback) callback(null, data);
      } catch (e) {
        if (callback) callback(e, null);
      }
    };
    xhr.onerror = function () {
      if (callback) callback(new Error('Network error'), null);
    };
    xhr.send();
  }

  var instances = {};

  window.EmbodiTrust = {
    init: function (config) {
      var id = config.container || '__default__';
      if (instances[id]) {
        instances[id].destroy();
      }
      instances[id] = initWidget(config);
      instances[id].id = id;
      return instances[id];
    },
    verify: function (code, callback) {
      verify(code, callback);
    },
    destroy: function (container) {
      var id = container || '__default__';
      if (instances[id]) {
        instances[id].destroy();
        delete instances[id];
      }
    },
    destroyAll: function () {
      Object.keys(instances).forEach(function (id) {
        instances[id].destroy();
      });
      instances = {};
    }
  };
})();
