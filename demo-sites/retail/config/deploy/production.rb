# PRODUCTION-specific deployment configuration
# please put general deployment config in config/deploy.rb

# The gateway server is accessed before anything else and all ssh commands sent via it
set :gateway,     "intra.causata.com"
set :scm_domain,  "gromit"
set :domain,      "jshub.org"
set :rails_env,   "gromit"

#If you log into your server with a different user name than you are logged 
#into your local machine with, youll need to tell Capistrano about that user 
#name.
set :user, "capistrano"

# webserver root symlink path for passenger
set: :webroot, "/var/jshub/htdocs/#{application}"