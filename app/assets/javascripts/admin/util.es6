var util = {
  findAncestorByTagName(el, tagName) {
    while ((el = el.parentElement) && el.tagName !== tagName) {
      if (el.tagName === "HTML") {
        return "parent not found";
      }
    }
    return el;
  },

  findAncestorByClassName(el, className) {
    while ((el = el.parentElement) && !el.classList.contains(className)) {
      if (el.tagName === "HTML") {
        return "parent not found";
      }
    }
    return el;
  },
  
  htmlToElement(html) {
    const template = document.createElement('div');
    template.innerHTML = html.trim();
    return template.firstChild;
  },

  htmlToElements(html) {
    const template = document.createElement('div');
    template.innerHTML = html.trim();
    return template.childNodes;
  }
}