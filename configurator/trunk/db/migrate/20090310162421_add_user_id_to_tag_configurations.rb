class AddUserIdToTagConfigurations < ActiveRecord::Migration
  def self.up
    add_column :tag_configurations, :user_id, :integer
  end

  def self.down
    remove_column :tag_configurations, :user_id
  end
end
