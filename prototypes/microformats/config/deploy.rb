set :application, "microformats"
set :repository,  "https://www.etl2dot0.com/svn/javascript/tag-tools/prototypes/microformats/"

# If you aren't deploying to /u/apps/#{application} on the target
# servers (which is the default), you can specify the actual location
# via the :deploy_to variable:
set :deploy_to, "/Users/liamc/UNIX/share/capistrano/#{application}"

# If you aren't using Subversion to manage your source code, specify
# your SCM below:
# set :scm, :subversion

#role :app, "liamc.local"
role :web, "liamc.local"
#role :db,  "liamc.local", :primary => true

# Additional variables
#set :user, "liamc"
#set :scm_username, "liamc"

# Override dafault tasks

namespace :newjs do
  task :setup, :roles => :web do
    deploy.setup
    puts "Checking out '#{application}' to '#{deploy_to}'"
    deploy.update
    #install_website
    #apache.restart
  end
  task :update, :roles => :web do
    puts "Updating '#{application}' in '#{deploy_to}'"
    deploy.update
    #website_generate
    #apache.restart
  end
  task :install_website, :roles => :web do
    run "cd #{deploy_to}/#{current_dir} && script/generate install_website"
  end
  task :website_generate, :roles => :web do
    run "cd #{deploy_to}/#{current_dir} && rake website_generate"
  end
end

# Additional tasks
namespace :apache do
  desc "Start Apache"
  task :start, :roles => :web do
    sudo "/usr/sbin/apachectl start > /dev/null"
  end

  desc "Stop Apache"
  task :stop, :roles => :web do
    sudo "/usr/sbin/apachectl stop > /dev/null"
  end

  desc "Restart Apache"
  task :restart, :roles => :web do
    sudo "/usr/sbin/apachectl restart > /dev/null"
  end
end
