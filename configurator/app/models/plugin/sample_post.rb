class Plugin::SamplePost < Plugin
  def js_files
    ['data-transport/sample-post-plugin.js']
  end
  
  def plugin_type
    :data_transport
  end
end
