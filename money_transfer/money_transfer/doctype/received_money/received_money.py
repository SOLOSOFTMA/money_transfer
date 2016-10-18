# -*- coding: utf-8 -*-
# Copyright (c) 2015, Frappe and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe, json
from frappe.utils import cstr, flt, fmt_money, formatdate
from frappe import msgprint, _, scrub
from frappe.model.document import Document
from erpnext.controllers.accounts_controller import AccountsController
from erpnext.accounts.party import get_party_account

class ReceivedMoney(Document):

	def validate(self):
		if not self.title:
			self.title = self.get_title()
		if not self.withdraw_date:
			self.withdraw_date = self.posting_date
		if not self.received_transaction_status:
			self.received_transaction_status = 'Withdraw'
		self.validate_Total_Denomination()
	
	def validate_Total_Denomination(self):
		if self.received_agent == self.sender_user_id:
			msgprint(_("You are not Authorise to Withdraw this transaction").format(self.mctn),
					raise_exception=1)
		if self.amount_received != self.total_denomination:
			msgprint(_("Please make sure that Your Total Amount Paid = Total Denomination").format(self.total_denomination),
					raise_exception=1)
		
	def get_title(self):
		return self.mctn
	
	def on_submit(self):
		self.make_gl_entries()
		self.make_trxn_entries()
	
	def make_gl_entries(self, cancel=0, adv_adj=0):
		from erpnext.accounts.general_ledger import make_gl_entries
		
		gl_map = []
		gl_map.append(
            frappe._dict({
				"posting_date": self.posting_date,
				"transaction_date": self.withdraw_date,
                "account": self.receiver_agents_account,
                "party_type": "Customer",
                "party": self.receiver_name,
				"account_currency": self.received_currency,
				"credit": self.amount_received,
                "remarks": "Test Send Money",
				"voucher_type": self.doctype,
				"voucher_no": self.name,
				"against": "Cash in Till - T&T"
            }))
		gl_map.append(
            frappe._dict({
                "account": "Cash in Till - T&T",
				"against": self.receiver_agents_account,
				"posting_date": self.posting_date,
				"transaction_date": self.withdraw_date,
				"debit": self.amount_received,
				"voucher_type": self.doctype,
				"voucher_no": self.name,
				"party_type": "Customer",
				"party": self.receiver_name,
                "remarks": "Test Journal"
            }))

		if gl_map:
			make_gl_entries(gl_map, cancel=cancel, adv_adj=adv_adj)
	
	def make_trxn_entries(self):
		doc = frappe.new_doc("Transactions Details")
		doc.update({
					"user_id": self.receiver_to,
					"posting_date": self.withdraw_date,
					"description": self.doctype,
					"currency": self.received_currency,
					"outflow": self.amount_received,
					"mctn": self.mctn
				})
		doc.insert()
		doc.submit()