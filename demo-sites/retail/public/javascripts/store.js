/*
 * Function for the sample store
 */

/**
 * Add a product to the cart, bound to a 'add' button with jQuery
 */
function add_product(event, animation) {
  var form = event.target.form, product_id = form.product_id.value;
  if (window.jsHub) {
    jsHub.trigger("cart-add", {
      "sku": $('.sku', form).text(),
	  "model": $('.model', form).text(),
      quantity: 1
    });
  }
  if (window._gat) {
    var pageTracker = _gat._getTracker("UA-8152756-1");
    pageTracker._trackPageview('/basket/add/'+product_id);
  }
  $.post("add_to_cart", {
    ajax: true,
    product_id: form.product_id.value,
    authenticity_token: form.authenticity_token.value
  }, function (data) {
  	$("#cart").load("cart_status");
  	animation(product_id, data);
  }, "html");
  event.preventDefault();
}

/**
 * Add a product to the cart, bound to a 'add' button with jQuery.
 * Display the flash message in the sidebar on the product page.
 */
function add_product_sidebar(event) {
  add_product(event, function (product_id, flash) {
  	var div = $("#product-"+product_id+" .flash")
	div.html(flash).css("background-color", "#ffc").show();
	div.animate({ backgroundColor: "#ddd" }, 1000).slideUp(1000);
  });
}

/**
 * Add a product to the cart, bound to a 'add' button with jQuery.
 * Display the flash message at the top of the cart on the checkout page.
 */
function add_product_cart(event) {
  add_product(event, function(product_id, flash) {
    $('#shopping-cart').load('cart_contents', function() {
      var div = $("#cart-total, #cart-product-" + product_id + " .price");
      div.css("background-color", "#ffc").animate({ opacity: 1.0 }, 1000);
	  div.animate({ backgroundColor: "white" }, 1000);
    });
  });
}

/**
 * Update quantity of a product in the cart, bound to a quantity text field with jQuery
 */
function update_quantity(event) {
  var form = event.target.form, product_id = form.product_id.value;
  if (window.jsHub) {
    jsHub.trigger("cart-update", {
      "product-id": product_id,
      quantity: form.quantity.value
    });
  }
  $.post("update_quantity", {
    ajax: true,
    product_id: form.product_id.value,
    quantity: form.quantity.value,
    authenticity_token: form.authenticity_token.value
  }, function (data) {
  	$("#cart").load("cart_status");
    $('#shopping-cart').load('cart_contents', function() {
      var div = $("#cart-total, #cart-product-" + product_id + " .price");
      div.css("background-color", "#ffc").animate({ opacity: 1.0 }, 1000);
	  div.animate({ backgroundColor: "white" }, 1000);
    });
  }, "html");
  event.preventDefault();
  
  // jquery preventDefault does not seem to prevent the form submitting
  form.onsubmit = function () {
  	return false;
  }
  
  return false;
}

/**
 * Remove a product from the cart, bound to a 'remove' button with jQuery
 */
function remove_product(event) {
  var form = event.target.form, product_id = form.product_id.value;
  if (window.jsHub) {
    jsHub.trigger("cart-remove", {
      "product-id": product_id,
      quantity: 1
    });
  }
  if (window._gat) {
    var pageTracker = _gat._getTracker("UA-8152756-1");
    pageTracker._trackPageview('/basket/remove/'+product_id);
  }
  $.post("remove_from_cart", {
    ajax: true,
    product_id: product_id,
    authenticity_token: form.authenticity_token.value
  }, function (data) {
  	$("#cart").load("cart_status");
    $('#shopping-cart').load('cart_contents', function() {
      var div = $("#cart-total, #cart-product-" + product_id + " .price");
      div.css("background-color", "#ffc").animate({ opacity: 1.0 }, 1000);
	  div.animate({ backgroundColor: "white" }, 1000);
    });
  }, "html");
  event.preventDefault();
}

/////////////////////// PAGE INITIALISATION ////////////////////////

(function() {
  $(document).ready(function() {
    $('.hpage, .hauthentication, .hpurchase').each(function() {
      $(this).prepend('&lt;div class="' + $(this).attr('class') + '"&gt;<br/>').append('&lt;div&gt;');
      $(this).find('span').each(function() {
	  	var visibility = $(this).attr('data-visibility') ? 
		  ' data-visibility="' + $(this).attr('data-visibility') + '"' : '';
	  	$(this).before('&nbsp;&nbsp;&lt;span class="' + $(this).attr('class') + '"' + visibility + '&gt;')
		  .after('&lt;/span&gt;')
		  .filter(':not(.price, .money)').wrap("<b></b>");
      });
      $(this).find('abbr').each(function() {
	  	$(this)
		  .before('&lt;abbr class="' + $(this).attr('class') + '" title="' + $(this).attr('title') + '" &gt;')
		  .after('&lt;/abbr&gt;').wrap("<b></b>");
      });
    });
  })
})();
