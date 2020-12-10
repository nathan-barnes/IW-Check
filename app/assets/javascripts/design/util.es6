var UTIL = {
  debounce(func, wait, immediate) {
    var timeout;
    return () => {
      var context = this, args = arguments;
      var later = () => {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    }
  },

  jsonp(url){
    return new Promise(function(resolve, reject){
      var id = '_' + Math.round(10000 * Math.random())
      var callbackName = 'jsonp_callback_' + id;
      window[callbackName] = function(data){
        delete window[callbackName]
        // var el = document.getElementById(id)
        // el.parentNode.removeChild(el)
        resolve(data)
      }

      var src = url + '&callback=' + callbackName;
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = src;
      // script.id = id;
      // script.addEventListener('error', reject)
      (document.getElementsByTagName('head')[0] || document.body || document.documentElement).appendChild(script)
    })
  },

  // imgixTag(url) {
  //   // var imgix = 'https://imagewall.imgix.net/';
  //   // var format = '?q=50&h=260&auto=format';
  //   // var urlArray = url.split('/');
  //   // var dir = urlArray[urlArray.length - 2] + '/' + urlArray[urlArray.length - 1];
  //   // return imgix + dir + format;
  // }

  loadScript(url) {
    return new Promise(function(resolve, reject) {
      var script = document.createElement('script');

      script.async = true;
      script.src = url;

      // trigger fulfilled state when script is ready
      script.onload = resolve;

      // trigger rejected state when script is not found
      script.onerror = reject;

      document.head.appendChild(script);   
    });
  }
}

// Polyfill toblob(). (https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob#polyfill)
if (!HTMLCanvasElement.prototype.toBlob) {
 Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
  value: function (callback, type, quality) {

    var binStr = atob( this.toDataURL(type, quality).split(',')[1] ),
        len = binStr.length,
        arr = new Uint8Array(len);

    for (var i = 0; i < len; i++ ) {
     arr[i] = binStr.charCodeAt(i);
    }

    callback( new Blob( [arr], {type: type || 'image/png'} ) );
  }
 });
}
