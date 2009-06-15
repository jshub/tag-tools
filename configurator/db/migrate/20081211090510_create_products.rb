#
# Create the Products table to hold data for the sample store
#

class CreateProducts < ActiveRecord::Migration
  def self.up
    create_table :products do |t|
      t.string  :name
      t.string  :image_file
      t.decimal :price, :precision => 8, :scale => 2, :default => 0
      t.timestamps
    end
  end

  def self.down
    drop_table :products
  end
end
