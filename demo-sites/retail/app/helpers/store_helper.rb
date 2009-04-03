module StoreHelper
  
  def render_shopping_cart
    if show_cart?
      render :partial => "cart", 
        :locals => { :cart => @cart, :action => "checkout" }
    end
  end
  
  def image_for (product)
    "store/products/#{product.image_file}"
  end
  
  def cart_size_message
    if @cart.size > 0
      "#{pluralize(@cart.size, 'item')}"
    else
      "Empty"
    end 
  end
  
  def show_cart?
    @cart && controller.action_name == 'index' || controller.action_name == 'buy'
  end
  
  def show_authenticate?
    if flash[:authentication] 
      flash[:authentication] = nil
      true
    else
      false
    end
  end
  
  def show_product_purchase?
    controller.action_name == 'confirm'
  end
  
end
