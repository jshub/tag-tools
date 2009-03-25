# Be sure to restart your server when you modify this file.

# Your secret key for verifying cookie session data integrity.
# If you change this key, all old sessions will become invalid!
# Make sure the secret is at least 30 characters and all random, 
# no regular words or you'll be exposed to dictionary attacks.
ActionController::Base.session = {
  :key         => '_retail_session',
  :secret      => '21c45822701a89f46f28671b20499c559d2ecc8372a6564e7261bcc34f25d72db77698fd41f593464fc4c25a76d7768762f0ace770fecaba6e26075711938e93'
}

# Use the database for sessions instead of the cookie-based default,
# which shouldn't be used to store highly confidential information
# (create the session table with "rake db:sessions:create")
# ActionController::Base.session_store = :active_record_store
