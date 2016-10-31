# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from . import __version__ as app_version

app_name = "money_transfer"
app_title = "Money Transfer"
app_publisher = "Caitlah Technology"
app_description = "App for Money Transfer Services"
app_icon = "octicon octicon-markdown"
app_color = "red"
app_email = "sione.taumoepeau@gmail.com"
app_license = "MIT"

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/money_transfer/css/money_transfer.css"
# app_include_js = "/assets/money_transfer/js/money_transfer.js"

# include js, css files in header of web template
# web_include_css = "/assets/money_transfer/css/money_transfer.css"
# web_include_js = "/assets/money_transfer/js/money_transfer.js"

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
#	"Role": "home_page"
# }

# Website user home page (by function)
# get_website_user_home_page = "money_transfer.utils.get_home_page"

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Installation
# ------------

# before_install = "money_transfer.install.before_install"
# after_install = "money_transfer.install.after_install"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

notification_config = "money_transfer.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
#	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"money_transfer.tasks.all"
# 	],
# 	"daily": [
# 		"money_transfer.tasks.daily"
# 	],
# 	"hourly": [
# 		"money_transfer.tasks.hourly"
# 	],
# 	"weekly": [
# 		"money_transfer.tasks.weekly"
# 	]
# 	"monthly": [
# 		"money_transfer.tasks.monthly"
# 	]
# }

# Testing
# -------

# before_tests = "money_transfer.install.before_tests"

# Overriding Whitelisted Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "money_transfer.event.get_events"
# }

