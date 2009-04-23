require 'test_helper'

class StoreControllerTest < ActionController::TestCase
  # Replace this with your real tests.
  test "the truth" do
    assert true
  end
  
  setup :setup_cart
  
  def cart
    session[:cart]
  end
  
  def setup_cart
    assert_nil cart
    post :add_to_cart, { :product_id => products(:tv1).id }
    assert_response :redirect
    assert_equal 1, cart.size
  end
  
  # Buy a product
  test "add to cart" do
    post :add_to_cart, { :product_id => products(:tv1).id, :ajax => true }
    assert_response :success
    assert_equal 2, cart.size
  end
  
  # Buy a product
  test "update cart" do
    post :update_quantity, { :product_id => products(:tv1).id, :quantity => 10 }
    assert_response :redirect
    assert_equal 10, cart.size
    
    post :remove_from_cart, { :product_id => products(:tv1).id }
    assert_response :redirect
    assert_equal 9, cart.size
  end
  
  # Buy a product
  test "checkout" do
    post :confirm
    assert_response :success
    assert_template 'thankyou'
    assert_nil cart

    assert_select 'div.hpurchase' do
      assert_select '.cart-price', products(:tv1).price.to_s
      assert_select '.n', products(:tv1).name
      assert_select '.quantity', 1
    end
  end
  
end
