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

class SendTT(Document):
	def __init__(self, arg1, arg2=None):
		super(SendTT, self).__init__(arg1, arg2)
	
	def validate(self):
		self.validate_sender_details()
		if not self.send_date:
			self.send_date = self.posting_date
		if not self.transaction_status:
			self.transaction_status='Send'
		if not self.title:
			self.title = self.get_title()
		if not self.send_by:
			self.send_by = self.get_send_by()
	
	def get_send_by(self):
		return self.owner
					
	def on_submit(self):
		self.make_gl_entries()
		self.make_trxn_entries()
		
		
	def get_title(self):
		return self.sender_name
		
	def validate_sender_details(self):
		if not self.purpose:
			msgprint(_("Purpose of Payment is Manadory").format(self.purpose),
					raise_exception=1)
		if not self.sender_name:
			msgprint(_("Sender Name is Manadory").format(self.sender_name),
					raise_exception=1)
		if not self.sender_id_type:
			msgprint(_("Sender ID Type is Manadory").format(self.sender_id_type),
					raise_exception=1)
		if not self.sender_id_no:
			msgprint(_("Sender ID No is Manadory").format(self.sender_id_no),
					raise_exception=1)
		if not self.receiver_name:
			msgprint(_("Receiver Name is Manadory").format(self.receiver_name),
					raise_exception=1)
	
	def on_cancel(self):
		self.make_gl_entries(1)
	
	def make_gl_entries(self, cancel=0, adv_adj=0):
		from erpnext.accounts.general_ledger import make_gl_entries	
		
		gl_map = []
		gl_map.append(
            frappe._dict({
				"posting_date": self.posting_date,
				"transaction_date": self.posting_date,
                "account": self.sender_agents_account,
                "party_type": "Customer",
                "party": self.sender_name,
				"account_currency": self.sender_currency,
				"debit_in_account_currency": self.amount_send,
				"debit": self.amount_received,
				"voucher_type": self.doctype,
				"voucher_no": self.name,
				"against": "Cash in Vault - T&T",
				"remarks": "Send Money Transaction"
            }))
			
		gl_map.append(
            frappe._dict({
                "account": "Cash in Till - T&T",
				"against": self.sender_agents_account,
				"posting_date": self.posting_date,
				"credit": self.amount_received,
				"voucher_type": self.doctype,
				"voucher_no": self.name,
				"party_type": "Customer",
				"party": self.receiver_name,
                "remarks": "Send Money Transaction"
            }))
		if self.sender_currency =="TOP":
			gl_map.append(
				frappe._dict({
					"account": self.sender_agents_account,
					"against": self.sender_fees_account,
					"posting_date": self.posting_date,
					"debit": self.fees_amount,
					"voucher_type": self.doctype,
					"voucher_no": self.name,
					"cost_center": self.sender_cost_center,
					"remarks": "Fees"
				})
			)
			gl_map.append(
				frappe._dict({
					"account": self.sender_fees_account,
					"against": self.sender_agents_account,
					"posting_date": self.posting_date,
					"credit": self.fees_amount,
					"voucher_type": self.doctype,
					"voucher_no": self.name,
					"cost_center": self.sender_cost_center,
					"remarks": "Fees"
				})
			)
		if self.multicurrency and self.sender_currency != "TOP":
			gl_map.append(
				frappe._dict({
					"account": self.sender_fees_account,
					"against": self.sender_agents_account,
					"posting_date": self.posting_date,
					"account_currency": self.sender_currency,
					"credit_in_account_currency": self.fees_amount,
					"credit": flt(self.fees_amount * self.exchange_rate),
					"voucher_type": self.doctype,
					"voucher_no": self.name,
					"cost_center": self.sender_cost_center,
					"remarks": "Fees"
				})
			)
			gl_map.append(
				frappe._dict({
					"account": self.sender_agents_account,
					"against": self.sender_fees_account,
					"posting_date": self.posting_date,
					"account_currency": self.sender_currency,
					"debit_in_account_currency": self.fees_amount,
					"debit": flt(self.fees_amount * self.exchange_rate),
					"voucher_type": self.doctype,
					"voucher_no": self.name,
					"cost_center": self.sender_cost_center,
					"remarks": "Fees"
				})
			)
			
		if gl_map:
			make_gl_entries(gl_map, cancel=(self.docstatus == 2))
			
	def make_trxn_entries(self):
		doc = frappe.new_doc("Transactions Details")
		doc.update({
					"user_id": self.sender_from,
					"posting_date": self.posting_date,
					"currency": self.sender_currency,
					"description": self.doctype,
					"inflow": self.total_amount_paid,
					"mctn": self.name
				})
		doc.insert()
		doc.submit()