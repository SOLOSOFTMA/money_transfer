# Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
# MIT License. See license.txt

from __future__ import unicode_literals
import frappe

def get_notification_config():
	return {
		"for_doctype": {
			"Money Transfer": {"docstatus": 0},
			"Send Money": {"docstatus": 0},
			"Send TT": {"docstatus": 0},
			"Received TT": {"docstatus": 0},
			"Transfer to Vault": {"docstatus": 0},
			"Transfer from Vault": {"docstatus": 0},
			"Teller Transfer": {"docstatus": 0}
		}
	}