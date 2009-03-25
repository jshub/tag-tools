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
  $("#shopping-cart").load(ENV.APP_ROOT+"/add_to_cart", {
    ajax: true,
    product_id: form.product_id.value,
    authenticity_token: form.authenticity_token.value
  });
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
  event.preventDefault();
}
