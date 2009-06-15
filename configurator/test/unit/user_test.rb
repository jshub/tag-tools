require 'test_helper'

class UserTest < ActiveSupport::TestCase
  # Replace this with your real tests.
  test "the truth" do
    assert true
  end
  
  test "username is a valid email address" do
    user = users(:user1)
    assert user.valid?, user.errors.inspect
    [ 'valid@domainname.com', 'valid@domainname.co.uk' ].each do |adr|
      user.email_address = adr
      assert user.valid?, "Email address #{adr} should be valid"
    end
    [ 'noTLD@domainname', 'nodomain', 'has spaces@domainname.com' ].each do |adr|
      user.email_address = adr
      assert !user.valid?, "Email address #{adr} should not be valid"
      assert user.errors.invalid?(:email_address)
    end    
  end
  
  test "find by email address is not case sensitive" do
    user = User.find_by_email_address('user1@jshub.org')
    assert_equal users(:user1), user
    user = User.find_by_email_address('User1@JSHUB.org')
    assert_equal users(:user1), user
    user = User.find_by_email_address(' user1@jshub.org ')
    assert_equal users(:user1), user
    user = User.find_by_email_address('not in fixtures')
    assert_nil user
  end
  
  test "password authentication" do
    user = User.authenticate('user1@jshub.org', 'secret')
    assert_equal users(:user1), user
    user = User.authenticate('user1@jshub.org', 'wrong password')
    assert_nil user
    user = User.authenticate('user1@jshub.org', 'Secret')
    assert_nil user
    user = User.authenticate('wrong username', 'secret')
    assert_nil user
  end
  
  test "authenticate by email address is not case sensitive" do
    user = User.authenticate('user1@jshub.org', 'secret')
    assert_equal users(:user1), user
    user = User.authenticate('USER1@JSHUB.org', 'secret')
    assert_equal users(:user1), user
    user = User.authenticate('  user1@jshub.org  ', 'secret')
    assert_equal users(:user1), user
  end
end
