class CreateInspectors < ActiveRecord::Migration
  def self.up
    create_table :inspectors do |t|

      t.timestamps
    end
  end

  def self.down
    drop_table :inspectors
  end
end
