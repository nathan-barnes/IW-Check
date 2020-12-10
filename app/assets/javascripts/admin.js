// Admin JS Manifest

//= require sortable.min
//= require domurl.min

//= require admin/util
//= require admin/aws

//= require blocks/ajax
//= require blocks/search
//= require blocks/menu

//= require admin/thing-index
//= require admin/thing-edit
//= require admin/user-index
//= require admin/user-edit

if (document.getElementsByClassName("js-thing-index")[0] || document.getElementsByClassName("js-thing-category-index")[0]) {
  var thingIndex = new ThingIndex();
}

if (document.getElementsByClassName("js-thing-edit")[0]) {
  var thingEdit = new ThingEdit();
}

if (document.getElementsByClassName("js-user-index")[0]) {
  bindUserIndexEvents();
}

if (document.getElementsByClassName("js-user-edit")[0]) {
  bindUserEditEvents();
}
