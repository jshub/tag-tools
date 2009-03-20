class YuitestController < ApplicationController
    
  # allow reciept of posted form from anywhere to acceptor method
  protect_from_forgery :except => :acceptor
  
  # add filters to /acceptor as desired
  around_filter TestrunnerResultLogger.new, :only => [:acceptor]
  
  def index
    @TestrunnerResults = TestrunnerResult.find(:all) 
    @TestrunnerResults.reverse!    
  end

  def destroy
    @result = TestrunnerResult.find(params[:id])
    @result.destroy
    redirect_to :action => 'index'
  end

  # remove all the requests from the db
  def destroy_all
    @TestrunnerResults = TestrunnerResult.find(:all)
    for result in @TestrunnerResults
      result.destroy
    end  
    redirect_to :action => 'index'
  end
  
  # recieves results posted from a HTML file anywhere (via protect_from_forgery) copying the JSUnit 'submitResults=true' param behaviour
  def acceptor
    # Visible output of params
    #@submitted_params = CGI.parse(request.raw_post)
    @params_json  = params.to_json    
    @cookies_json  = cookies.to_json   
    
    #redirect_to 'TODO page we came from'
  end  
  
end