/*
 * Function for the sample store
 */
/**
 * Add a product to the cart, bound to a 'add' button with jQuery
 */
function add_product(event) {
  var form = event.target.form;
  ETL.trigger("cart-add", {
    "product-id": form.product_id.value,
    quantity: 1
  });
  $("#shopping-cart").load("add_to_cart", {
    ajax: true,
    product_id: form.product_id.value,
    authenticity_token: form.authenticity_token.value
  });
  setTimeout(function () {
  	$("#cart").load("cart_status")
  }, 50);
  event.preventDefault();
}

/**
 * Update quantity of a product in the cart, bound to a quantity text field with jQuery
 */
function update_quantity(event) {
  var form = event.target.form;
  ETL.trigger("cart-update", {
    "product-id": form.product_id.value,
    quantity: form.quantity.value
  });
  $("#shopping-cart").load(ENV.APP_ROOT+"/update_quantity", {
    ajax: true,
    product_id: form.product_id.value,
    quantity: form.quantity.value,
    authenticity_token: form.authenticity_token.value
  });
  setTimeout(function () {
  	$("#cart").load("cart_status")
  }, 50);
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
  var form = event.target.form;
  ETL.trigger("cart-remove", {
    "product-id": form.product_id.value,
    quantity: 1
  });
  $("#shopping-cart").load(ENV.APP_ROOT+"/remove_from_cart", {
    ajax: true,
    product_id: form.product_id.value,
    authenticity_token: form.authenticity_token.value
  });
  setTimeout(function () {
  	$("#cart").load("cart_status")
  }, 50);
  event.preventDefault();
}

/////////////////////// PAGE INITIALISATION ////////////////////////

(function() {
  $(document).ready(function() {
    $('.hpage, .hauthentication, .hpurchase').each(function() {
      $(this).prepend('&lt;div class="' + $(this).attr('class') + '"&gt;<br/>').append('&lt;div&gt;');
      $(this).find('span').each(function() {
	  	$(this).before('&nbsp;&nbsp;&lt;span class="' + $(this).attr('class') + '"&gt;')
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
