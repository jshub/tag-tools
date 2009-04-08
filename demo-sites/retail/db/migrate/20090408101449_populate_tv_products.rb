class PopulateTvProducts < ActiveRecord::Migration
  def self.up
    
    # Clear database before inserting new ones
    self.down
    
    tv  = Product.new
    tv.name = 'Samsung - 32" 720p Flat-Panel LCD HDTV'
    tv.image_file = 'tv_generic_samsung.png'
    tv.price = 599.99
    tv.sale_price = 497.99
    tv.model = 'LN32A330'
    tv.sku = 8742818
    tv.rating = 4.7
    tv.description = '2 HDMI inputs; PC input; black cabinet; 16:9 aspect ratio'
    tv.energy_compliant = true
    tv.reviews = 184
    tv.save!
    
    tv  = Product.new
    tv.name = 'Dynex &copy; - 32" Class 720p Flat-Panel LCD HDTV - Matte Black'
    tv.image_file = 'tv_generic_side.png'
    tv.price = 397.97
    tv.sale_price = 349.99
    tv.model = 'DX-LCD32-09'
    tv.sku = 8632553
    tv.rating = 4.3
    tv.description = '2 HDMI inputs; PC input; matte black finish; 16:9 aspect ratio'
    tv.energy_compliant = true
    tv.reviews = 216
    tv.save!

    tv  = Product.new
    tv.name = 'Sharp - 32" Class / 720p / 60Hz / LCD HDTV'
    tv.image_file = 'tv_generic_front.png'
    tv.price = 599.99
    tv.sale_price = 487.97
    tv.model = 'LC-32SB24U'
    tv.sku = 8849268
    tv.rating = 4.5
    tv.energy_compliant = true
    tv.description = '2 HDMI inputs; PC input; black cabinet; 16:9 aspect ratio'
    tv.save!

    tv  = Product.new
    tv.name = 'Sony - BRAVIA / 46" Class / 1080p / 60Hz / LCD HDTV'
    tv.image_file = 'tv_generic_sony.png'
    tv.price = 1599.99
    tv.sale_price = 1599.99
    tv.model = 'KDL-46V4100'
    tv.sku = 8828637
    tv.rating = 4.8
    tv.energy_compliant = true
    tv.description = '4 HDMI inputs; PC input; black cabinet; 16:9 widescreen aspect ratio'
    tv.save!

  end
  
  def self.down
    Product.delete_all
  end
end
