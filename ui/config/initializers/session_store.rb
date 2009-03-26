# Be sure to restart your server when you modify this file.

# Your secret key for verifying cookie session data integrity.
# If you change this key, all old sessions will become invalid!
# Make sure the secret is at least 30 characters and all random, 
# no regular words or you'll be exposed to dictionary attacks.
ActionController::Base.session = {
  :key         => '_ui_session',
  :secret      => '458ca6da53b480a343e2c51033b8a0f8398d6add24395ff794d4240ef931f957b0a4c74d607fa7f1d98eda8e45ea521e62650da61590fa652b277cacbda62d71'
}

# Use the database for sessions instead of the cookie-based default,
# which shouldn't be used to store highly confidential information
# (create the session table with "rake db:sessions:create")
# ActionController::Base.session_store = :active_record_store
