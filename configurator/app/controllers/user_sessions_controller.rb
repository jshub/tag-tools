class UserSessionsController < ApplicationController
  before_filter :require_no_user, :only => [:new, :create]
  before_filter :require_user, :only => :destroy
  
  layout "tag_configurations"
  
  # GET /login   - show login form
  # POST /login  - authenticate and redirect to requested page  
  def login
    @user_session = UserSession.new(params[:user_session])
    if request.post? && params[:user_session]
      if @user_session.save
        flash[:notice] = "Login successful!"
        redirect_back_or_default account_url
      else
        flash[:notice] = "That email address or password was not recognized"
      end
    end
  end
  
  # GET /logout  - clear authenticated session
  def logout
    if current_user_session
      current_user_session.destroy
      flash[:notice] = "You have been safely logged out"
    end
    session[:return_to] = params[:return_to]
    redirect_back_or_default login_url
  end
end