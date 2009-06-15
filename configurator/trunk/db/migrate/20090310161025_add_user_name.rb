class AddUserName < ActiveRecord::Migration
  def self.up
    add_column :users, :name, :string, :limit => 30
  end

  def self.down
    remove_column :users, :name
  end
end
