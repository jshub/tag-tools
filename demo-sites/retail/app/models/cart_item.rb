#
# Represents an item added to a shopping cart in the example store
#

class CartItem
  attr_reader :product
  attr_accessor :quantity
  
  def initialize(product)
    @product = product
    @quantity = 1
  end
  
  def increment_quantity
    @quantity += 1
  end
  
  def decrement_quantity
    @quantity -= 1
    @quantity
  end
  
  def name
    @product.name
  end
  
  def id
    @product.id
  end
  
  def price
    @product.price * @quantity
  end
end