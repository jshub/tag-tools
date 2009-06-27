class Plugin::SampleGet < Plugin
  def js_files
    ['data-transport/sample-get-plugin.js']
  end
  
  def plugin_type
    :data_transport
  end
end

