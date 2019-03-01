'use strict';
// For the save book button

// $('#formButton').toggle(function() {
//   $('#hidden-form').addClass('active');
// }, function () {
//   $('#hidden-form').removeClass('active')
// });

$('#formButton').click(function(){
  $('.hidden-field').toggle();
});
