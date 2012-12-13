import sys

app_root = '/var/www/intern_map_app'
app_venv = app_root + '/venv'

sys.path.insert(0, app_root)

activate_this = app_venv + '/bin/activate_this.py'
execfile(activate_this, dict(__file__=activate_this))

from where_app import app as application
