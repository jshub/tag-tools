#
# Recreates the Products table to hold data for the sample store and use with hproduct
#

class RecreateProducts < ActiveRecord::Migration

  def self.up
      
    create_table :products do |t|
      t.string   :name
      t.string   :image_file
      t.decimal  :price, :precision => 8, :scale => 2, :default => 0
      t.decimal  :sale_price, :precision => 8, :scale => 2, :default => 0
      t.string   :model
      t.string   :sku
      t.decimal  :rating, :precision => 8, :scale => 1, :default => 0
      t.string   :description 
      t.boolean   :energy_compliant 
      t.integer  :reviews
      t.timestamps
    end
  end

  def self.down
    drop_table :products
  end

end
