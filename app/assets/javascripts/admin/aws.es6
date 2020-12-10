var AWS = {
  getSignedUrl: function(file, callback) {
    let fileName = file.name;
    if (!fileName) {
      fileName = "generated-fileName.png";
    }

    ajax({
      path: '/aws-signed-url',
      method: 'GET',

      // filename used for the S3 key
      data: {mime: file.type, filename: fileName},
      // Not sure what data returns, maybe just this.response?
      success: function(response) {
        const data = JSON.parse(response);
        console.log("getSignedUrl Success");
        const form = new FormData();
        form.append("key", data.key);
        form.append("AWSAccessKeyId", "AKIAICN2L75R7TMWQ66Q");
        form.append("Content-Type", file.type);
        form.append("acl", "public-read");
        form.append("policy", data.policy);
        form.append("signature", data.signature);
        form.append("success_action_status", "201");
        form.append("file", file);

        AWS.uploadS3(file, form, callback);
      }
    });
  },

  uploadS3: function(file, form, callback) {
    var S3_BUCKET = "imagewall-media";
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = () => {
      if (xhr.readyState == 4) {
        if (window.DOMParser) {
          var parser = new DOMParser();
          var xmlDoc = parser.parseFromString(xhr.responseText, "text/xml");
        // Internet Explorer
        } else {
          var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
          xmlDoc.async = false;
          xmlDoc.loadXML(txt);
        }

        var urlEncoded = xmlDoc.getElementsByTagName("Location")[0].innerHTML;
        var url = unescape(urlEncoded);

        callback(url);
      }
    };

    xhr.open('POST', "https://" + S3_BUCKET + ".s3.amazonaws.com/", true);
    xhr.send(form);
  }
}