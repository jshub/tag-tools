# 
# Fake store for demonstrating markup
#

class StoreController < ApplicationController
  
  # GET /store
  def index
    @hpage = { :pagename => 'Homepage', :category => 'Store' }

    @cart = find_cart

    respond_to do |format|
      format.html {
        render :layout => 'homepage'
      }
    end
  end
  
  # GET /store/buy
  # GET /store/buy.xml
  def buy
    @page_title = "Products"
    @page_breadcrumb = "Buy Stuff > Products"

    @hpage = { :pagename => 'View catalog', :category => 'Store' }
    @products = Product.find(:all)
    @cart = find_cart
    
    # NB this is different from the hpage pagename for demonstration purposes
    @ga_pagename = '"store/catalog"'
   
    respond_to do |format|
      format.html {
        render :template => 'store/catalog'
      }
      format.xml  { render :xml => @products }
    end
  end
  
  # GET /store/cart_status
  def cart_status
    @cart = find_cart
    render :partial => "cart_header"
  end
  
  # POST /store/add_to_cart
  def add_to_cart
    @hpage = { :pagename => 'Add to cart', :category => 'Store' }

    @product = Product.find( params[:product_id] )
    @cart = find_cart
    @cart.add(@product)
    session[:cart] = @cart
    flash[:notice] = "\"#{@product.name}\" added to cart"
    
    if params[:ajax] 
      logger.info "Product added, rendering cart partial"
      render :partial => "cart"
    else
      logger.info "Product added, redirecting to buy page"
      redirect_to( :action => :buy )
    end
  end
  
  # POST /store/update_quantity
  def update_quantity
    @product = Product.find( params[:product_id] )
    @cart = find_cart
    @cart.update_quantity( @product, params[:quantity].to_i )
    flash[:notice] = "\"#{@product.name}\" updated"
    
    if params[:ajax] 
      logger.info "Product updated, rendering cart partial"
      render :partial => "cart"
    else
      logger.info "Product updated, redirecting to buy page"
      redirect_to( :action => :buy )
    end
  end
  
  # POST /store/remove_from_cart
  def remove_from_cart
    @hpage = { :pagename => 'Remove from cart', :category => 'Store' }

    @product = Product.find( params[:product_id] )
    @cart = find_cart
    @cart.remove(@product)
    flash[:notice] = "\"#{@product.name}\" removed from cart"
    
    if params[:ajax] 
      logger.debug "Product removed, rendering cart partial"
      render :partial => "cart"
    else
      logger.debug "Product removed, redirecting to buy page"
      redirect_to( :action => :buy )
    end
  end
  
  # GET /store/login
  # POST /store/login
  def login
    @page_title = "Login"
    @page_breadcrumb = "Buy Stuff > Login"
    @hpage = { :pagename => 'Login', :category => 'Store' }

    @cart = find_cart
    if params[:username]
      # in real life, we would validate this, of course
      session[:username] = params[:username]
      flash[:authentication] = true
      redirect_to ( params[:original_uri] || { :action => "index" } )
    else
      render :layout => 'login'
    end
  end
  
  # GET /store/logout
  # POST /store/logout
  def logout
    @page_title = "Logout"
    @page_breadcrumb = "Buy Stuff > Logout"
    @hpage = { :pagename => 'Logout', :category => 'Store' }

    session[:username] = nil
    if params[:original_uri] 
      redirect_to params[:original_uri]
    else
      redirect_to :action => "index"
    end
  end
  
  # GET /store/checkout
  # GET /store/checkout.xml
  def checkout
    @page_title = "Checkout"
    @page_breadcrumb = "Buy Stuff > Checkout"
    @hpage = { :pagename => 'Checkout', :category => 'Store' }

    # you have to log in
    if session[:username]
      @cart = find_cart
      respond_to do |format|
        format.html { render }
        format.xml  { render :xml => @cart }
      end
    else
      redirect_to :action => :login, 
        :original_uri => url_for( :action => "checkout" )
    end
  end
  
  # GET /store/confirm
  def confirm
    @page_title = "Checkout"
    @page_breadcrumb = "Buy Stuff > Checkout > Confirmation"
    @hpage = { :pagename => 'Thank you', :category => 'Store' }

    @cart = find_cart
    render :template => "store/thankyou"
    #session[:cart] = nil
  end

  def contact
    @page_title = ""
    @page_breadcrumb = ""

    @hpage = { :pagename => 'Contact', :category => 'Store' }  
  end
  
  private
  
  def find_cart
    session[:cart] ||= Cart.new
  end
  
end
