# Copyright (c) 2013, Caitlah Technology and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.utils import flt, getdate, cstr
from frappe import _

def execute(filters=None):
	
	validate_filters(filters)
	
	columns = get_columns(filters)

	data = get_result(filters)
	
	return columns, data
	
def validate_filters(filters):
	if filters.from_date > filters.to_date:
		frappe.throw(_("From Date must be before To Date"))

def get_columns(filters):
	columns = [
		_("Status") + "::90", _("Teller Name") + ":Link/User:200", _("MCTN") + "::120",
		_("Currency") + ":Link/Currency:160", _("Posting Date") + ":Date:90", 
		_("Withdraw") + "::100", _("Deposit") + "::100", _("Transactions Desc") + "::400"
	]

	return columns

def get_result(filters):

	transactions_entries = get_transactions_entries(filters)

	result = get_result_as_list(transactions_entries, filters)

	return result

def get_transactions_entries(filters):

	transaction_entries = frappe.db.sql("""select td.docstatus, tu.full_name, td.mctn, td.currency,
			td.posting_date, td.outflow, td.inflow, td.description
		from `tabTransactions Details` td, `tabAgents` ta, `tabUser` tu
		WHERE td.user_id = ta.agent_user
		AND ta.agent_user = tu.email AND td.user_id = %(username)s
		AND td.posting_date BETWEEN %(from_date)s AND %(to_date)s
		ORDER BY tu.full_name ASC""", filters, as_dict=1)

	return transaction_entries
	
def get_result_as_list(data, filters):
	result = []
	for d in data:
		row = [d.get("docstatus"), d.get("full_name"), d.get("mctn"), d.get("currency")]
		row += [d.get("posting_date"), d.get("outflow"), d.get("inflow"),
			d.get("description")
		]
		result.append(row)

	return result