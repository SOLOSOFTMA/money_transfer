# -*- coding: utf-8 -*-
# Copyright (c) 2015, Caitlah Technology and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe, json
from frappe.utils import cstr, flt, fmt_money, formatdate
from frappe import msgprint, _, scrub
from frappe.model.document import Document

class Refund(Document):
	
	def validate(self):
		self.validate_refund()	
	
	
	def validate_refund(self):
		if not self.refund:
			msgprint(_("Please make sure to choose type of Refund").format(self.refund),
					raise_exception=1)
	
	def on_submit(self):
		self.make_gl_entries()
		self.make_trxn_entries()
		self.update_tabRefund_Status()
		self.update_Status()
		
	def make_gl_entries(self, cancel=0, adv_adj=0):
		from erpnext.accounts.general_ledger import make_gl_entries	
		gl_map = []
		
		sender = frappe.get_doc("Send Money",self.mctn)

		gl_map.append(
			frappe._dict({
				"posting_date": self.posting_date,
				"transaction_date": self.posting_date,
				"account": sender.sender_agents_account,
				"account_currency": sender.sender_currency,
				"credit": self.refund_amount,
				"voucher_type": self.doctype,
				"voucher_no": self.name,
				"against": "Cash in Till - T&T",
				"cost_center": "TBU - T&T",
				"remarks": "Refund"
			}))
		gl_map.append(
			frappe._dict({
				"account": "Cash in Till - T&T",
				"against": sender.sender_agents_account,
				"posting_date": self.posting_date,
				"debit": self.refund_amount,
				"voucher_type": self.doctype,
				"cost_center": "TBU - T&T",
				"voucher_no": self.name,
				"remarks": "Refund"
			}))
		gl_map.append(
			frappe._dict({
				"account": sender.sender_agents_account,
				"against": sender.sender_fees_account,
				"posting_date": self.posting_date,
				"credit": self.fees,
				"voucher_type": self.doctype,
				"voucher_no": self.name,
				"cost_center": "TBU - T&T",
				"remarks": "Refund - Fees"
				})
			)
		gl_map.append(
			frappe._dict({
				"account": sender.sender_fees_account,
				"against": sender.sender_agents_account,
				"posting_date": self.posting_date,
				"debit": self.fees,
				"voucher_type": self.doctype,
				"voucher_no": self.name,
				"cost_center": "TBU - T&T",
				"remarks": "Refund - Fees"
				})
			)
			
		if gl_map:
			make_gl_entries(gl_map, cancel=(self.docstatus == 2))
			
	def make_trxn_entries(self):
		doc = frappe.new_doc("Transactions Details")
		doc.update({
					"user_id": self.refund_by,
					"posting_date": self.posting_date,
					"currency": "TOP",
					"description": self.doctype,
					"outflow": self.refund_amount,
					"mctn": self.mctn
				})
		doc.insert()
		doc.submit()
	
	def update_tabRefund_Status(self):
		frappe.db.sql("""Update `tabSend Money` set refund_status=1 where name=%s""",self.mctn)
	
	def update_Status(self):
		frappe.db.sql("""Update `tabSend Money` set docstatus=3 where name=%s""",self.mctn)