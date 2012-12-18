intern_map_app
==============

This is the main app of the intern map project.  It's a Flask-based
simple web app to distribute the main code of this project to
authorized sources.

To set this up yourself (e.g. on Heroku) you need:
- The intern group number (or some other group number)
- A Facebook app ID (which you need to get yourself)
- A Bing maps API key
- A location data file (e.g. from using the code in the intern_map
  repository)

Running locally
---------------

For easier development, intern_map_app can also be run as a WSGI app
in a local webserver.  To do this, you want to point your webserver at
the wsgi file included in directory wsgi.  That directory also
contains a sample Apache configuration that can be used (assuming web
root /var/www, and a symlink /var/www/intern_map_app -> app
directory).  Note that you may also need another Facebook app ID
(because the domain of your locally-running project should be
"localhost", not wherever your production app is hosted).
