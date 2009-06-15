class UsersController < ApplicationController

 layout "tag_configurations"

  # GET /users
  # GET /users.xml
# this won't be implemented until we have an admin site
  def index
    @users = User.find(:all)

    respond_to do |format|
      format.html { render :layout => 'tag_configurations_users' } # index.html.erb
      format.xml  { render :xml => @users }
    end
  end

  # GET /register  - show new user registration form
  # POST /register - create a new user account, and implicitly log in
  def register
    @user = User.new(params[:user])
    
    respond_to do |format|
      if request.post? and @user.save
        flash[:notice] = "Your account has been created."
        format.html { redirect_to(@user) }
        format.xml  { render :xml => @user, :status => :created, :location => @user }
      else
        format.html { render :layout => 'tag_configurations_users' } # register.html.erb
        format.xml  { render :xml => @user }
      end
    end
  end

  # GET /login   - show login form
  # POST /login  - authenticate and redirect to requested page
  def login
    if request.post?
      @user = User.authenticate(params[:email_address] || '', params[:password] || '')
      if @user
        session[:user] = @user
        uri = session[:original_uri] || @user
        session[:original_uri] = nil
        redirect_to uri
        return
      else
        flash[:notice] = "That email address or password was not recognized"
      end
    end

    respond_to do |format|
      format.html { render :layout => 'tag_configurations_users' } # login.html.erb
      format.xml  { render :xml => @user }
    end
  end

  # GET /logout  - clear authenticated session
  def logout
    session[:user] = nil
    flash[:notice] = "You have been successfully logged out"
    uri = session[:original_uri] || :login
    session[:original_uri] = nil
    redirect_to uri
  end

  # GET /users/username
  # GET /users/username.xml
  def show
    @user = User.find_by_name(params[:name])

    respond_to do |format|
      format.html { render :layout => 'tag_configurations_users' } # show.html.erb
      format.xml  { render :xml => @user }
    end
  end


  # GET /users/username/edit
  def edit
    @user = User.find_by_name(params[:name])

    respond_to do |format|
      format.html { render :layout => 'tag_configurations_users' } # show.html.erb
      format.xml  { render :xml => @user }
    end
  end

  # PUT /users/1
  # PUT /users/1.xml
  def update
    @user = User.find(params[:id])

    respond_to do |format|
      if @user.update_attributes(params[:user])
        flash[:notice] = 'User was successfully updated.'
        format.html { redirect_to(@user) }
        format.xml  { head :ok }
      else
        format.html { render :action => "edit" }
        format.xml  { render :xml => @user.errors, :status => :unprocessable_entity }
      end
    end
  end
end
