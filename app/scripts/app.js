/* globals window, jQuery */
$ = jQuery;
(function(window, $, undefined) {
  'use strict';
  console.log('Hello, Araport_ePlant!');
  $('link[rel=stylesheet][href*="https://www.araport.org/sites/default/files/css/"]').remove();
  $('link[rel=stylesheet][href*="https://maxcdn.bootstrapcdn.com/"]').remove();
})(window, jQuery);
