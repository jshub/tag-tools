require 'test_helper'

class DemoScriptTest < ActionController::IntegrationTest
  fixtures :all

  # Replace this with your real tests.
  test "the truth" do
    assert true
  end
  
  # Test we can open all the pages displayed in the demo without errors
  test "opening the pages in the demo script" do
    get '/'
    assert_response :redirect
    follow_redirect!
    assert_response :success
    assert_template 'store/index'
  end

  # Test making a purchase
  test "buying a product and checking out" do
    get '/store/buy'
    assert_response :success
    
    cart = session[:cart]
    assert_equal 0, cart.items.size

    xml_http_request :post, '/store/add_to_cart', { :ajax => true, :product_id => products(:tv1).id }
    assert_response :success
    cart = session[:cart]
    assert_equal 1, cart.items.size
    
    get '/store/checkout'
    assert_response :redirect
    get_via_redirect '/store/checkout'
    assert_template 'store/login.html.erb'
    
    post_via_redirect '/store/login', { :username => 'test', :password => 'password', :original_uri => '/store/checkout' }
    assert_response :success
    assert_template 'store/checkout.html.erb'
    
    post '/store/confirm'
    assert_response :success
    
    get '/store/buy'
    assert_response :success
    cart = session[:cart]
    assert_equal 0, cart.items.size
  end
  
end
