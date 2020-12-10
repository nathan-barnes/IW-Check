// {method, path, data, success, failure}
var ajax = (options) => {
  // Move data into params if options.method is GET and there is data
  console.count("ajax");
  if (options.method === "GET") {
    if (typeof options.data === "object") {
      let paramData = "";
      for (let key in options.data) {
        if (paramData !== "") {
          paramData += "&";
        }
        paramData += key + "=" + encodeURIComponent(options.data[key]);
      }
      options.path += "?" + paramData;
    }
  }

  const request = new XMLHttpRequest();
  request.open(options.method, options.path, true);
  const auth_token = document.querySelector("meta[name=csrf-token]").content;
  request.setRequestHeader('X-CSRF-Token', auth_token);
  request.setRequestHeader('X-Requested-With', "XMLHttpRequest");
  request.setRequestHeader('Content-Type', "application/json; charset=utf-8");
  request.onload = function() {
    if (this.status >= 200 && this.status < 400) {
      // Success!
      console.count("ajax success");
      if (typeof options.success === "function") {
        options.success(this.response);
      }
    } else {
      // We reached our target server, but it returned an error
      console.count("ajax failure");
      if (typeof options.failure === "function") {
        options.failure(this.response);
      }
    }
  };

  if (options.method !== "GET" && options.data !== undefined) {
    request.send(JSON.stringify(options.data));
  } else {
    request.send();
  }
};