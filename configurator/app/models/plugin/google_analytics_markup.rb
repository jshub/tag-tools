class Plugin::GoogleAnalyticsMarkup < Plugin
  def self.instance
    @instance ||= find_or_create_by_type self.name
  end
  
  def js_files
    ['data-capture/google-analytics-markup-plugin.js']
  end
  
  def plugin_type
    :data_capture
  end
end