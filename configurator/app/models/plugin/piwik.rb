class Plugin::Piwik < Plugin
  def js_files
    ['data-output/piwik-plugin.js']
  end
  
  def plugin_type
    :data_transport
  end
end

