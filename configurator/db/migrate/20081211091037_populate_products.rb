#
# Prepopulate database with Christmas products
#

class PopulateProducts < ActiveRecord::Migration
  def self.up
    
    # Clear database before inserting new ones
    self.down
    
    xmastree = Product.new
    xmastree.name = 'Grow your own Christmas tree'
    xmastree.image_file = 'growxmastree2.jpg'
    xmastree.price = 1.89
    xmastree.save
    
    puppet = Product.new
    puppet.name = 'Finger puppets'
    puppet.image_file = 'fingerpuppetxmas2.jpg'
    puppet.price = 0.99
    puppet.save

    twisty = Product.new
    twisty.name = 'Christmas twisty puzzle'
    twisty.image_file = 'puzzlexmastwisty2.jpg'
    twisty.price = 2.99
    twisty.save
    
    frame = Product.new
    frame.name = 'Animal photo frames'
    frame.image_file = 'animalphotoframe2.jpg'
    frame.price = 1.49
    frame.save
  end
  
  def self.down
    Product.delete_all
  end
end
