  class Plugin::Microformat < Plugin
    def self.instance
      @instance ||= find_or_create_by_type self.name
    end
    
    def js_files
      ['data-capture/hAuthentication-plugin.js', 
       'data-capture/hPage-plugin.js', 
       'data-capture/hProduct-plugin.js', 
       'data-capture/hPurchase-plugin.js']
    end

    def plugin_type
      :data_capture
    end
  end
  
