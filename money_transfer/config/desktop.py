# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from frappe import _

def get_data():
	return [
		{
			"module_name": "Money Transfer",
			"color": "red",
			"icon": "octicon octicon-markdown",
			"type": "module",
			"label": _("Money Transfer")
		},
		{
			"module_name": "Money Transfer",
			"_doctype": "Send Money",
			"color": "red",
			"icon": "octicon octicon-tag",
			"type": "module",
			"label": _("Send Money")
		}
	]
