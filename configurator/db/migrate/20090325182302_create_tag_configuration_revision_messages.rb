class CreateTagConfigurationRevisionMessages < ActiveRecord::Migration
  def self.up
    create_table :tag_configuration_revision_messages do |t|
      t.integer :tag_configuration_revision_id, :null => false
      t.integer :position
      t.string :message
    end
    
    # messages are in the new table
    remove_column :tag_configuration_revisions, :message
    
    # acts_as_list doesn't let the position column be null
    change_column :tag_configuration_revisions, :revision_number, :integer, :null => true
  end

  def self.down
    drop_table :tag_configuration_revision_messages
    add_column :tag_configuration_revisions, :message, :string
  end
end
