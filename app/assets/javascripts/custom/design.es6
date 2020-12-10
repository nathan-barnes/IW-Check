class Design {
  get token() {
    let u = new Url;
    if (u.paths().length > 1 && u.paths()[1] !== "") {
      return u.paths()[1];
    } else {
      return false;
    }
  }

  removeToken() {
    let u = new Url;
    u.paths(["design"]);
    history.replaceState(window.history.state, "title", u);
  }

  visit() {
    let u = new Url;
    if (u.query.purchased === "true") {
      modal.open("#purchase-success-modal");
    }
  }

  // Saving
  save(callback, duplicate) {
    const data = {
      designData: DESIGN.params,
      title: document.getElementsByClassName("js-design-title")[0].value,
      duplicate: duplicate
    };

    this.setSaving();

    let token = "/";
    if (this.token) {
      token += this.token;
      this.saveImage(this.token, this.setSaved.bind(this, callback));
    }

    ajax({
      method: "POST",
      path: "/design" + token,
      data: data,
      success: (response) => {
        let u = new Url;
        if (response) {
          var jsonResponse = JSON.parse(response);
          if (jsonResponse.token) {
            this.saveImage(jsonResponse.token, callback);
            document.getElementsByClassName("js-token")[0].innerHTML = "ID " + jsonResponse.token;
            u.paths(["design", jsonResponse.token]);
            history.replaceState(window.history.state, "title", u);
          }
        }
        UNSAVED = false;

        // Only saved designs can be duplicated.
        document.querySelector('.js-duplicate').hidden = false;
      }
    });
  }

  saveImage(token, callback) {
    designApp.renderExport(320, 160)
      .then((blob) => {
        AWS.getSignedUrl(blob, function(image) {
          let data = {
            image: image
          }

          ajax({
            method: "PUT",
            path: "/design/" + token + "/update_image",
            data: data,
            success: (response) => {
              designObj.setSaved();
              if (typeof callback === "function") {
                callback();
              }
            }
          });
        });
      });
  }

  setSaving() {
    let saveButton = document.getElementsByClassName("js-save-design")[0];
    saveButton.classList.add("is-saving");
    saveButton.innerHTML = "Saving...";
  }

  setSaved(callback) {
    let saveButton = document.getElementsByClassName("js-save-design")[0];
    saveButton.classList.remove("is-saving");
    saveButton.innerHTML = "Save";
    if (typeof callback === "function") {
      callback();
    }
  }

  purchase() {
    let submitInvoiceButton = document.getElementsByClassName("js-invoice-submit")[0];
    submitInvoiceButton.classList.add("is-loading");

    let shipping_data = this.getShippingData();
    const data = {
      name: {
        fname: document.getElementsByClassName("js-invoice-fname")[0].value,
        lname: document.getElementsByClassName("js-invoice-lname")[0].value
      },
      email: document.getElementsByClassName("js-invoice-email")[0].value,
      shipping_data: shipping_data
    }

    this.purchaseRequest(data, submitInvoiceButton);
  }

  purchasePaidHalf() {
    let submitInvoiceButton = document.getElementsByClassName("js-invoice-submit--paid-half")[0];
    submitInvoiceButton.classList.add("is-loading");

    const data = {
      name: {
        fname: document.getElementsByClassName("js-invoice-fname--paid-half")[0].value,
        lname: document.getElementsByClassName("js-invoice-lname--paid-half")[0].value
      },
      email: document.getElementsByClassName("js-invoice-email--paid-half")[0].value,
    }

    this.purchaseRequest(data, submitInvoiceButton);
  }

  purchaseRequest(data, submitButton) {
    let token = this.token;
    if (!token) {
      console.error("Design has no token");
      return
    }

    ajax({
      method: "POST",
      path: "/design/" + token + "/purchase",
      data: data,
      success: (response) => {
        console.log(response);

        // Redirect to purchased design and open success modal when there
        let token = response;
        let u = new Url;
        u.paths([u.paths()[0], token]);
        u.clearQuery();
        u.query.purchased = "true";
        window.location = u;
      },
      failure: (response) => {
        submitButton.classList.remove("is-loading");
        modal.open("#purchase-failure-modal");
      }
    });
  }

  getTax() {
    let getTaxButton = document.getElementsByClassName("js-get-tax")[0];
    getTaxButton.classList.add("is-loading");

    let token = this.token;
    if (!token) {
      console.error("Design has no token");
      return
    }

    let shippingData = this.getShippingData();
    let shippingCost = parseInt(document.getElementsByClassName("js-purchase-shipping")[0].value);
    let imagewallCost = parseInt(document.getElementsByClassName("js-purchase-subtotal")[0].value);

    const data = {
      imagewall_cost: imagewallCost,
      shipping_cost: shippingCost,
      shipping_data: shippingData
    }

    ajax({
      method: "POST",
      path: "/design/" + token + "/get_taxes",
      data: data,
      success: (response) => {
        // Example response
        // {"taxable_amount":0.0,"amount_to_collect":0.0,"rate":0.0,"has_nexus":false,"freight_taxable":false,"tax_source":null}
        let taxjar = JSON.parse(response);
        let taxes = Math.round(taxjar["amount_to_collect"] * 100) / 100;
        
        let taxesElements = document.getElementsByClassName("js-purchase-taxes");
        for (let i = 0; i < taxesElements.length; i++) {
          taxesElements[i].innerHTML = taxes.toFixed(2);
        }
        let total = parseFloat(document.getElementsByClassName("js-purchase-total")[0].innerHTML);

        let grandTotalElements = document.getElementsByClassName("js-purchase-grand-total");
        let grandTotal = taxes + total;
        for (let i = 0; i < grandTotalElements.length; i++) {
          grandTotalElements[i].innerHTML = grandTotal.toFixed(2);
        }
        let depositElements = document.getElementsByClassName("js-purchase-deposit");
        for (let i = 0; i < depositElements.length; i++) {
          depositElements[i].innerHTML = (grandTotal / 2).toFixed(2);
        }

        getTaxButton.classList.remove("is-loading");

        modal.open("#purchase-options-modal");
      },
      failure: (response) => {
        // Hide all errors.
        const errorElements = document.querySelectorAll('.form-error-text');

        Array.from(errorElements).forEach((el) => {
          el.classList.remove('active');
        });

        // Show calc error.
        if (!status) {
          document.querySelector('.modal .js-calc-error').classList.add('active');
        }

        getTaxButton.classList.remove("is-loading");
      }
    });
  }

  getShippingData() {
    let shippingData = {
      city: document.getElementsByClassName("js-invoice-city")[0].value,
      street: document.getElementsByClassName("js-invoice-street")[0].value,
      state: document.getElementsByClassName("js-invoice-state")[0].value,
      zipcode: document.getElementsByClassName("js-invoice-zipcode")[0].value,
      country: document.getElementsByClassName("js-invoice-country")[0].value
    }
    return shippingData;
  }

  requestSupport() {
    const inputs = document.querySelectorAll(".modal .modal__input"),
          data = { "campaign": "ImageWall Contact Form" };
    
    let status = true;
        
    Array.from(inputs).forEach((input) => {
      if (input.value == "") {
        input.parentNode.classList.add('is-error');

        status = false;
      }
      
      if (input.name === "comments") {
        data["body"] = "ImageWall Quote Request: <a href='https://imagewall.com/design/" + this.token + "'>" + this.token + "\</a>\n\n" + input.value;
      } else {
        data[input.name] = input.value;
      }
    });
    
    // Hide all errors.
    const errorElements = document.querySelectorAll('.form-error-text');

    Array.from(errorElements).forEach((el) => {
      el.classList.remove('active');
    });

    // Show missing fields error.
    if (!status) {
      document.querySelector('.modal .js-missing-fields').classList.add('active');

      return false;
    }

    ajax({
      method: 'POST',
      path: IW['support_post_url'],
      data: data,
      success: (response) => {
        console.log(response);

        modal.open("#support-success-modal");
      }
    });
  }
}

var designObj = new Design();

document.addEventListener('click', (event) => {
  if (event.target && event.target.classList) {

    // Save Button
    if (event.target.classList.contains("js-save-design")) {
      if (loggedIn()) {
        designObj.save();
      } else {
        afterLogin = designObj.save.bind(designObj);
        modal.open("#signup-modal");
      }

    // Buy Button
    } else if (event.target.classList.contains("js-buy-button") && !event.target.classList.contains("is-calculating")) {

      const openSupportModal = () => {
        document.querySelector(".modal__support-id").innerHTML = designObj.token;

        modal.open("#support-modal");
      };
    
      // If logged in, save and then open purchase modal
      if (loggedIn()) {
        if (UNSAVED === true || !designObj.token) {
          designObj.save(() => openSupportModal() );
        } else {
          openSupportModal();
        }

      // Else prompt login, then save, then open purchase modal
      } else {
        afterLogin = designObj.save.bind(designObj, openSupportModal);
        modal.open("#signup-modal");
      }
    
    // Share Design button
    } else if (event.target.classList.contains("js-open-share-modal")) {
      let u = new Url;
      document.getElementsByClassName("js-design-url")[0].innerHTML = u;
      modal.open("#share-modal");

    // Duplicate Button
    } else if (event.target.classList.contains("js-duplicate")) {
      event.preventDefault();
      designObj.save(false, true);
    
    // Design support request button
    } else if (event.target.classList.contains("js-support-submit")) {
      event.preventDefault();
      designObj.requestSupport();
    }
  }
});

// Remove token from URL if no deisgn with that token exists
document.addEventListener("DOMContentLoaded", function(event) {
  if (document.getElementsByClassName("js-invalid-token").length > 0) {
    designObj.removeToken();
  }
});
