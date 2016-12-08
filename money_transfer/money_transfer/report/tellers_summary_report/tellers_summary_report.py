# Copyright (c) 2013, Caitlah Technology and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.utils import flt, getdate, cstr
from frappe import _
from erpnext.accounts.utils import get_account_currency

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
		_("Withdraw") + "::100", _("Deposit") + "::100", _("Transections Desc") + "::400"
	]

	return columns

def get_result(filters):

	transactions_entries = get_transactions_entries(filters)

	result = get_result_as_list(transactions_entries, filters)

	return result

def get_transactions_entries(filters):
	select_fields = """, sum(debit_in_account_currency) as debit_in_account_currency,
		sum(credit_in_account_currency) as credit_in_account_currency""" \
		if filters.get("show_in_account_currency") else ""

	group_by_condition = "group by voucher_type, voucher_no, account, cost_center" \
		if filters.get("group_by_voucher") else "group by name"

	transaction_entries = frappe.db.sql("""
		select
			`tabTransaction Details`.docstatus, `tabUser`.full_name,
			`tabTransaction Details`.mctn, `tabTransaction Details`.currency
			posting_date, account, party_type, party,
			sum(debit) as debit, sum(credit) as credit,
			voucher_type, voucher_no, cost_center, project,
			remarks
		from `tabGL Entry`
		where company=%(company)s
		order by posting_date, account"""\
		.format(select_fields=select_fields), filters, as_dict=1)

	return transaction_entries
	
def get_result_as_list(data, filters):
	result = []
	for d in data:
		row = [d.get("docstatus"), d.get("account"), d.get("debit"), d.get("credit")]

		if filters.get("show_in_account_currency"):
			row += [d.get("debit_in_account_currency"), d.get("credit_in_account_currency")]

		row += [d.get("voucher_type"), d.get("voucher_no"), d.get("against"),
			d.get("party_type"), d.get("party"), d.get("project"), d.get("cost_center"), d.get("remarks")
		]

		result.append(row)

	return result