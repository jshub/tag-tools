require 'test_helper'

class PluginTest < ActiveSupport::TestCase
  # Replace this with your real tests.
  test "the truth" do
    assert true
  end
  
  test "Sample GET plugin JS files" do
    plugin = Plugin::SampleGet.new
    assert_equal ['data-transport/sample-get-plugin.js'], plugin.js_files
  end
  
  test "database is populated with singleton instances" do
    db_plugins = Plugin.find :all, :order => :type
    assert_equal 2, db_plugins.length 
    assert_equal 'Microformat', db_plugins[0].name
    assert_equal 'SampleGet', db_plugins[1].name
    
    # and check the singletons
    mf_plugin = Plugin::Microformat.instance
    assert_equal mf_plugin, db_plugins[0]
    sample_get_plugin = Plugin::SampleGet.instance
    assert_equal sample_get_plugin, db_plugins[1]

    # and the fixtures instances
    assert_equal sample_get_plugin, plugins(:sample_get)
    assert_equal mf_plugin, plugins(:microformat)
  end
  
  test "retrieve name" do
    plugin = Plugin::SampleGet.instance
    assert_equal 'SampleGet', plugin.name
  end
  
end
