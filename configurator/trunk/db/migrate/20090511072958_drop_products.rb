class DropProducts < ActiveRecord::Migration
  def self.up
    drop_table :products
  end

  def self.down
    create_table :products do |t|
      t.string  :name
      t.string  :image_file
      t.decimal :price, :precision => 8, :scale => 2, :default => 0
      t.timestamps
    end
  end
end
