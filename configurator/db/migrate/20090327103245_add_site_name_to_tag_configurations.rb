class AddSiteNameToTagConfigurations < ActiveRecord::Migration
  def self.up
    add_column :tag_configurations, :site_name, :string
  end

  def self.down
    remove_column :tag_configurations, :site_name
  end
end
