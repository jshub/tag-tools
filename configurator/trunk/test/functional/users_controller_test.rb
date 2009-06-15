require 'test_helper'

class UsersControllerTest < ActionController::TestCase
  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:users)
  end

  test "should be able to open login form" do
    # get request shows login form
    get :login
    assert_response :success
    assert_nil session[:user]
    assert_select 'form' do
      assert_select 'input[type=text]#email_address'
      assert_select 'input[type=password]#password'
    end
  end  
  
  test "user should not log in with wrong password" do
    post :login, {}, { :email_address => 'user1@jshub.org', :password => 'incorrect' }
    assert_nil session[:user]
    assert_select 'div#flash.notice', /email address or password/
  end
    
  test "unknown user can not log in" do
    post :login, {}, { :email_address => 'unknown@jshub.org', :password => 'incorrect' }
    assert_nil session[:user]
    assert_select 'div#flash.notice', /email address or password/
  end
    
  test "user should log in with correct password" do
    post :login, { :email_address => 'user1@jshub.org', :password => 'secret' }
    assert_equal users(:user1), session[:user], flash[:notice]
  end
  
  test "should be able to log out" do
    post :login, { :email_address => 'user1@jshub.org', :password => 'secret' }
    get :index # should have no effect
    assert_equal users(:user1), session[:user]
    get :logout
    assert_redirected_to :login
    assert_nil session[:user]
  end

  test "should be able to register" do
    new_user_params = { :name => 'userX', :email_address => 'userX@jshub.org', 
      :password => 'secret', :password_confirmation => 'secret' }
    post :register, { :user => new_user_params }
    assert_not_nil assigns(:user)
    assert_redirected_to user_path(assigns(:user))
  end

  test "should show user" do
    get :show, { :name => users(:user1).name }
    assert_response :success
  end

end
