class Plugin < ActiveRecord::Base
  
  has_many :tag_configuration_plugins, :dependent => :destroy
  has_many :tag_configurations, :through => :tag_configuration_plugins
  
  validates_uniqueness_of :type
  
  def name
    /Plugin::(.+)Plugin/.match(self.class.name)[1]
  end
  
  def self.instance(plugin_classname)
    # tip from http://infovore.org/archives/2006/08/02/getting-a-class-object-in-ruby-from-a-string-containing-that-classes-name/
    plugin_class = self.const_get("#{plugin_classname.to_s.camelize}Plugin")
    raise ArgumentError, "Cannot resolve to plugin type: #{plugin_classname}" if plugin_class == nil
    logger.debug "Found #{plugin_class}"
    plugin_class.send('instance')
  end
  
  class CausataPlugin < Plugin
    def self.instance
      @instance ||= find_or_create_by_type self.name
    end
    
    def js_files
      ['data-output/causata-output-plugin.js']
    end
    
    def plugin_type
      :data_transport
    end
  end
  
  class PiwikPlugin < Plugin
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
  
  class MicroformatPlugin < Plugin
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
  
  class GoogleAnalyticsMarkupPlugin < Plugin
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
  
end