class CreateTagConfigurations < ActiveRecord::Migration
  def self.up
    # Tables to hold tag configuration data supplied by users
    create_table :tag_configurations do |t|
      t.string   :name
      t.string   :version
      t.timestamps
    end
    
    create_table :tag_configuration_plugins do |t|
      t.integer  :tag_configuration_id, :null => false
      t.integer  :plugin_id, :null => false
    end 
    
    create_table :tag_configuration_plugin_parameters do |t|
      t.integer  :tag_configuration_plugin_id, :null => false
      t.string   :param_name
      t.string   :param_value
    end
    
  end
  
  def self.down
    drop_table :tag_configurations
    drop_table :tag_configuration_plugins
    drop_table :tag_configuration_plugin_parameters
  end
end
