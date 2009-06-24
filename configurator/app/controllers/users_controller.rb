class UsersController < ApplicationController

  layout "tag_configurations"
  before_filter :require_no_user, :only => [:new, :create]
  before_filter :require_user, :only => [:show, :edit, :update]
  
  # GET /register  - show new user registration form
  # POST /register - create a new user account, and implicitly log in
  def register
    @user = User.new(params[:user])
    respond_to do |format|
      if request.post? && @user.save
        flash[:notice] = "Your account has been created."
        format.html { redirect_back_or_default account_url }
        format.xml  { render :xml => @user, :status => :created, :location => account_path }
      else
        format.html { render } # register.html.erb
        format.xml  { render :xml => @user }
      end
    end
  end
  
  # GET /account
  # GET /account.xml
  #
  # Show the current user's registration details
  def show
    @user = @current_user

    respond_to do |format|
      format.html { render } # show.html.erb
      format.xml  { render :xml => @user }
    end
  end


  # GET /users/username/edit
  def edit
    @user = @current_user

    respond_to do |format|
      format.html { render } # show.html.erb
      format.xml  { render :xml => @user }
    end
  end

  # PUT /users/1
  # PUT /users/1.xml
  def update
    @user = @current_user

    respond_to do |format|
      if @user.update_attributes(params[:user])
        flash[:notice] = 'Account details updated.'
        format.html { redirect_to account_url }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @user.errors, :status => :unprocessable_entity }
      end
    end
  end
end
