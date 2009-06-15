class CreatePlugins < ActiveRecord::Migration
  def self.up
    # Table to hold available plugins
    create_table :plugins, :force => true do |t|
      t.string   :type
      t.timestamps
    end

  end

  def self.down
    drop_table :plugins
  end
end
