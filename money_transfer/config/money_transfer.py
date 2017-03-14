from __future__ import unicode_literals
from frappe import _

def get_data():
	return [
		{
			"label": _("Send Money & TT"),
			"items": [
				{
					"type": "doctype",
					"name": "Send Money",
					"description": _("Send Money."),
				},
				{
					"type": "doctype",
					"name": "Send TT",
					"description": _("Send TT."),
				},
				{
					"type": "doctype",
					"name": "Refund",
					"description": _("Refund."),
				},
			]
		},
		{
			"label": _("Received Money & TT"),
			"items": [
				{
					"type": "doctype",
					"name": "Received Money",
					"description": _("Received Money."),
				},
				{
					"type": "doctype",
					"name": "Received TT",
					"description": _("Received TT."),
				},
			]
		},
		{
			"label": _("Tellers"),
			"items": [
				{
					"type": "doctype",
					"name": "Teller Transfer",
					"description": _("Teller Transfer."),
				},
				{
					"type": "doctype",
					"name": "Transfer to Vault",
					"description": _("Transfer to Vault."),
				},
				{
					"type": "doctype",
					"name": "Transfer from Vault",
					"description": _("Transfer from Vault."),
				},
			]
		},
		{
			"label": _("Setup"),
			"items": [
				{
					"type": "doctype",
					"name": "Agents",
					"description": _("Agents."),
				},
				{
					"type": "doctype",
					"name": "Currency Exchange",
					"description": _("Currency exchange rate master.")
				},
				{
					"type": "doctype",
					"name": "Location",
					"description": _("Location."),
				},
				{
					"type": "doctype",
					"name": "Transfer from Bank to Vault",
					"description": _("Transfer from Bank to Vault."),
				},
				{
					"type": "doctype",
					"name": "Transfer from Vault to Bank",
					"description": _("Transfer from Vault to Bank."),
				},
			]
		},
		{
			"label": _("Reports"),
			"items": [
				{
					"type": "report",
					"is_query_report": True,
					"name": "Tellers Report",
					"doctype": "Send Money"
				},
				{
					"type": "report",
					"is_query_report": True,
					"name": "Tellers Details Report Today",
					"doctype": "Send Money"
				},
				{
					"type": "report",
					"is_query_report": True,
					"name": "Tellers Details Report",
					"doctype": "Send Money"
				},
				
				{
					"type": "report",
					"is_query_report": True,
					"name": "Tellers Summary Report",
					"doctype": "Transactions Details"
				},
				
				{
					"type": "report",
					"is_query_report": True,
					"name": "Send Money Yet to Withdraw",
					"doctype": "Send Money"
				},
				{
					"type": "report",
					"is_query_report": True,
					"name": "Send TT Yet to Withdraw",
					"doctype": "Send TT"
				},
			]
		},
		{
			"label": _("OET"),
			"items": [
				{
					"type": "report",
					"is_query_report": True,
					"name": "OET Report",
					"doctype": "Received Money"
				},
				{
					"type": "report",
					"is_query_report": True,
					"name": "OET Report TT",
					"doctype": "Received TT"
				},
			]
		},
		{
			"label": _("Shopping"),
			"items": [
				{
					"type": "doctype",
					"name": "Item",
					"description": _("Products."),
				},
				{
					"type": "report",
					"is_query_report": True,
					"name": "Shopping Transactions List",
					"doctype": "Received Money"
				},
				{
					"type": "report",
					"is_query_report": True,
					"name": "Shopping Pickup List",
					"doctype": "Received Money"
				},
			]
		},
		{
			"label": _("End of Day"),
			"items": [
				{
					"type": "doctype",
					"name": "EOD",
					"description": _("EOD."),
				},
			]
		},
	]
