class CreateTagConfigurationRevisions < ActiveRecord::Migration
  def self.up
    create_table :tag_configuration_revisions do |t|
      t.integer :tag_configuration_id, :null => false
      t.integer :revision_number, :null => false
      t.integer :user_id, :null => false
      t.string  :message
      t.timestamps
    end
    
    # in case of confusion between version of code and version of configuration
    rename_column :tag_configurations, :version, :jshub_version
  end

  def self.down
    drop_table :tag_configuration_revisions

    rename_column :tag_configurations, :jshub_version, :version
  end
end
