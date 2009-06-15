class AddCodeAndHashesToTagConfigurationRevisions < ActiveRecord::Migration
  def self.up
    add_column :tag_configuration_revisions, :generated_code, :text
    add_column :tag_configuration_revisions, :sha1_debug, :string
    add_column :tag_configuration_revisions, :sha1_production, :string
  end

  def self.down
    remove_column :tag_configuration_revisions, :sha1_production
    remove_column :tag_configuration_revisions, :sha1_debug
    remove_column :tag_configuration_revisions, :generated_code
  end
end
