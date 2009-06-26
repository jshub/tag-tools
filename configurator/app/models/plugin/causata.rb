class Plugin::Causata < Plugin
  def js_files
    ['data-output/causata-output-plugin.js']
  end
  
  def plugin_type
    :data_transport
  end
end
