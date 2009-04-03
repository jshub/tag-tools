class PopulateNewProducts < ActiveRecord::Migration
  def self.up
    
    # Clear database before inserting new ones
    self.down
    
    tv  = Product.new
    tv.name = 'Television - 42" Class 720p Flat-Panel Plasma HDTV'
    tv.image_file = '8849268_sc.jpg'
    tv.price = 499.99
    tv.save
    
    fridge = Product.new
    fridge.name = 'Side-by-Side Refrigerator with In-Door Ice and Water - Stainless-Steel'
    fridge.image_file = '7180365_rc.jpg'
    fridge.price = 849.99
    fridge.save

    laptop = Product.new
    laptop.name = 'Business Laptop with DVD Drive'
    laptop.image_file = '9172539_sc.jpg'
    laptop.price = 439.99
    laptop.save
    
    camera = Product.new
    camera.name = '12.1-Megapixel Digital Camera - Black'
    camera.image_file = '9223743_rc.jpg'
    camera.price = 219.49
    camera.save
  end
  
  def self.down
    Product.delete_all
  end
end
