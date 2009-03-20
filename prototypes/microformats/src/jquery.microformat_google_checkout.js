/**
 * @author liamc
 * Simple microformat parser for Google Checkout
 * ref: http://groups.google.com/group/google-checkout-developers-forum/web/google-checkout-cart-api-documentation 
 */
(function(){
  var Plugin = {
		
		// for convienience
		$ : ETL.$,
    google_checkout : function(id) {
			var vendor = {
				name : "Google Checkout",
				home_url : "", // vendor documentation home
				privacy_url : "", // where the opt-in/out functionality is
				server_urls : [], // array of URL's where data can be sent to
				event_type : "purchase" // TODO ETL event type - should be a Class instance?
			}
			
			// get the root of the microformat HTML
			var root = $(id);

      // build the data payload from the child elements
      var data = {
        // info about this data
        'meta' : vendor,       
        // get declared values and visibility policy
        'product-title' : { value: $('.product-title', root).text(), visibility: $('.product-title', root).attr( 'data-visibility')},
        'product-price' : { value: $('.product-price', root).text(), visibility: $('.product-price', root).attr( 'data-visibility')},
        'product-image' : { value: $('.product-image', root).attr( 'src'), visibility: $('.product-image', root).attr( 'data-visibility')}
			}
      // users can create their own attributes prefixed with 'product-attr-'
			// TODO deal with duplicates and maybe use compiled regex
      var custom_attributes = $('[class^=product-attr-]', root);
      custom_attributes.each(function(elm) {
				data[$(this).attr('class')] = { value: $(this).text(), visibility: $(this).attr( 'data-visibility')};
			})
			return data;
		}
  };
	
	// expose the api
  window.ETL = window.ETL || {};
  ETL.Plugin = ETL.Plugin || {};
  ETL.Plugin.google_checkout = Plugin.google_checkout;
})();