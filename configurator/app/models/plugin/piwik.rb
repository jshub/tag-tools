  
  class Plugin::Piwik < Plugin
    def self.instance
      @instance ||= find_or_create_by_type self.name
    end
    
    def js_files
      ['data-output/piwik-plugin.js']
    end
    
    def plugin_type
      :data_transport
    end
  end
  
