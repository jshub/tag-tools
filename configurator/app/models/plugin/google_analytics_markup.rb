class Plugin::GoogleAnalyticsMarkup < Plugin
  def js_files
    ['data-capture/google-analytics-markup-plugin.js']
  end
  
  def plugin_type
    :data_capture
  end
end