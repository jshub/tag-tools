module TagConfigurationsHelper
  
  SRC_FOLDER = "#{RAILS_ROOT}/app/javascripts"
  
  def tag_versions
    TagConfiguration::VERSIONS
  end
  
  def mf_plugin
    Plugin::Microformat.instance
  end
  
  def ga_markup_plugin
    Plugin::GoogleAnalyticsMarkup.instance
  end
  
  def causata_plugin
    Plugin::Causata.instance
  end
  
  def piwik_plugin
    Plugin::Piwik.instance
  end
  
  # used by _form.html.erb to render plugin configuration
  def label_for_plugin_param(plugin, param_name)
    plugin = Plugin.instance(plugin)
    "tag_configuration[plugin_config][#{plugin.id}][#{param_name}]"
  end
  
  # used by _form.html.erb to render plugin configuration
  def value_for_plugin_param(plugin, param_name)
    plugin = Plugin.instance(plugin)
    plugin_config = @tag_configuration.tag_configuration_plugins.find_by_plugin_id(plugin.id)
    if plugin_config
      return plugin_config.parameters[param_name.to_s]
    else
      nil
    end
  end
  
  def src_folder
    SRC_FOLDER
  end
  
  def revision_string
    if @tag_configuration.new_record?
      "unsaved configuration"
    else
      "revision #{@tag_configuration.current_revision_number}"
    end
  end
end
