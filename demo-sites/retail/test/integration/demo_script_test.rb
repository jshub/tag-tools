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
    assert_response :success
    assert_template 'store/index'
  end
end
