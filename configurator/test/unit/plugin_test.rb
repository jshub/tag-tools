require 'test_helper'

class PluginTest < ActiveSupport::TestCase
  # Replace this with your real tests.
  test "the truth" do
    assert true
  end
  
  test "Causata plugin JS files" do
    plugin = Plugin::Causata.new
    assert_equal ['data-output/causata-output-plugin.js'], plugin.js_files
  end
  
  test "database is populated with singleton instances" do
    db_plugins = Plugin.find :all, :order => :type
    assert_equal 2, db_plugins.length 
    assert_equal 'Causata', db_plugins[0].name
    assert_equal 'Microformat', db_plugins[1].name
    
    # and check the singletons
    causata_plugin = Plugin::Causata.instance
    assert_equal causata_plugin, db_plugins[0]
    mf_plugin = Plugin::Microformat.instance
    assert_equal mf_plugin, db_plugins[1]

    # and the fixtures instances
    assert_equal causata_plugin, plugins(:causata)
    assert_equal mf_plugin, plugins(:microformat)
  end
  
  test "retrieve name" do
    plugin = Plugin::Causata.instance
    assert_equal 'Causata', plugin.name
  end
  
end
