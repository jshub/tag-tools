class Product < ActiveRecord::Base
  validates_presence_of :name, :image_file
  validates_numericality_of :price
end
