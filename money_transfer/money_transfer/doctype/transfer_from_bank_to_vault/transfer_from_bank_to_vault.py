# -*- coding: utf-8 -*-
# Copyright (c) 2015, Caitlah Technology and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class TransferfromBanktoVault(Document):
	def validate(self):
		if not self.title:
			self.title = self.doctype
	
	def on_submit(self):
		self.make_trxn_entries_in()
		self.make_gl_entries()
		
	def make_trxn_entries_in(self):
		doc = frappe.new_doc("Transactions Details")
		doc.update({
					"user_id": frappe.session.user,
					"posting_date": self.transfer_date,
					"currency": "TOP",
					"description": self.doctype,
					"inflow": self.transfer_amount,
					"mctn": self.name
				})
		doc.insert()
		doc.submit()
		
	def make_gl_entries(self, cancel=0, adv_adj=0):
		from erpnext.accounts.general_ledger import make_gl_entries
		
		gl_map = []
		gl_map.append(
            frappe._dict({
				"posting_date": self.transfer_date,
				"transaction_date": self.transfer_date,
                "account": self.transfer_to_vault,
				"credit": self.transfer_amount,
                "remarks": "Transfer from Bank to Vault",
				"voucher_type": self.doctype,
				"voucher_no": self.name,
				"against": self.transfer_to_vault
            }))
		gl_map.append(
            frappe._dict({
                "posting_date": self.transfer_date,
				"transaction_date": self.transfer_date,
				"account": self.transfer_from_bank,
				"debit": self.transfer_amount,
                "remarks": "Transfer from Bank to Vault",
				"voucher_type": self.doctype,
				"voucher_no": self.name,
				"against": self.transfer_from_bank
            }))

		if gl_map:
			make_gl_entries(gl_map, cancel=cancel, adv_adj=adv_adj)
