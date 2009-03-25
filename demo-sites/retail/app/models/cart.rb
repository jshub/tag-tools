#
# Represents a shopping cart in the example store
#

class Cart
  attr_reader :items, :order_id
  
  def initialize 
    @items = []
    @order_id = 123456
  end
  
  def add(product)
    current_item = @items.find {|item| item.product == product}
    if current_item
      current_item.increment_quantity
    else
      @items << CartItem.new(product)
    end
  end
  
  def remove(product)
    current_item = @items.find {|item| item.product == product}
    if current_item
      if current_item.quantity > 1
        current_item.decrement_quantity
      else
        @items.delete current_item
      end
    end
  end
  
  def update_quantity(product, qty)
    current_item = @items.find {|item| item.product == product}
    if current_item
      if qty > 0
        current_item.quantity = qty
      else
        @items.delete current_item
      end
    else
      current_item = CartItem.new(product)
      current_item.quantity = qty
      @items << current_item
    end
  end
  
  def size
    count = 0 
    @items.each {|item| count += item.quantity} 
    return count
  end
  
  def total_price
    price = 0 
    @items.each {|item| price += item.price } 
    return price
  end
end