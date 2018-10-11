# Copyright (c) 2013, Sione Taumoepeau and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _
from frappe.utils import flt, today

def execute(filters=None):
	filters = frappe._dict(filters or {})
	return get_columns(), get_data(filters)

def get_columns():
	return [_("Status") + ":Data:140",
		_("Currency") + ":Data:140",
		_("MCTN") + ":Data:140",
		_("Posting Date") + ":Data:140",
		_("Withdraw") + ":Data:140",
		_("Deposit") + ":Data:140",
		_("Description") + ":Data:200",
		_("User") + ":Data:140"]

def get_data(filters):
	transaction_list = get_transaction_list(filters)
	data = []

	for transaction in transaction_list:

		data.append([transaction.docstatus, transaction.currency, transaction.mctn, transaction.posting_date, transaction.outflow, 
		transaction.inflow, transaction.description, transaction.user_id])
	
	return data


def get_transaction_list(filters):
	conditions = []

	transaction_list = frappe.db.sql(""" select docstatus, currency, posting_date, mctn, outflow, inflow, description, user_id
	from `tabTransactions Details` transaction where user_id = {condition} """, as_dict=1)

	return transaction_list