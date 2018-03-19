# -*- coding: utf-8 -*-
# Copyright (c) 2015, Frappe and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe, json
from frappe.utils import cstr, flt, fmt_money, formatdate
from frappe import msgprint, _, scrub
from frappe.model.document import Document
from erpnext.setup.utils import get_exchange_rate
from erpnext.controllers.accounts_controller import AccountsController
from erpnext.accounts.party import get_party_account

class SendMoney(Document):
	
	def validate(self):
		self.validate_amount_send()
		self.validate_sender_details()
		if not self.send_date:
			self.send_date = self.posting_date
		self.clear_withdraw_status()
		
		if not self.title:
			self.title = self.get_title()
		if not self.send_by:
			self.send_by = self.get_send_by()
		
	
	def get_send_by(self):
		return self.owner
		self.set_manual_mctn()
			
	
	def set_manual_mctn(self):
		if self.manual_mctn and not self.mctn:
			msgprint(_("Refrence # is Manadory").format(self.manual_mctn),
					raise_exception=1)
					
	def on_submit(self):
		self.make_gl_entries()
		self.make_trxn_entries()
		self.update_customer_info()
		self.validate_amount_recieved()
	

	def update_customer_info(self):
		frappe.db.sql("""Update `tabCustomer` set customer_details = %s, customer_id_type =%s, customer_id_no = %s, customer_id_1 = %s, customer_id_2 = %s, customer_id_3 = %s where customer_name = %s""", (self.sender_details, self.sender_id_type, self.sender_id_no, self.customer_id_1, self.customer_id_2, self.customer_id_3, self.sender_name))
		

	def clear_withdraw_status(self):
#		frappe.db.sql("""Update `tabSend Money` set withdraw_status=0 where mctn = %s""", self.name)
		self.withdraw_status = 0
#		msgprint(_("Reset Withdraw Status").format(self.withdraw_status),
#					raise_exception=1)

	def get_title(self):
		return self.sender_name
	
	def validate_amount_recieved(self):
		if not self.amount_received:
			if self.multicurrency == 1:
				self.amount_recieved == self.amount_send
			if self.multicurrency != 1
				self.amount_received == self.amount_send * self.exchange_rate
	
	def validate_amount_send(self):
		if not self.amount_send:
			msgprint(_("Amount Send is Manadory").format(self.purpose),
					raise_exception=1)
		if not self.fees:
			msgprint(_("Fees is Manadory").format(self.purpose),
					raise_exception=1)
		if not self.levy:
			msgprint(_("Levy is Manadory").format(self.purpose),
					raise_exception=1)
		
	def validate_sender_details(self):
		if not self.receiver_to:
			msgprint(_("To is Manadory").format(self.purpose),
					raise_exception=1)
		if not self.receiver_to_location:
			msgprint(_("Location is Manadory").format(self.purpose),
					raise_exception=1)
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
		self.del_transactions()
	
	def del_transactions(self):
		frappe.db.sql("""Update `tabTransactions Details` set docstatus=2 where mctn = %s""", self.name)
		frappe.db.sql("""Update `tabTransactions History` set docstatus=2 where mctn = %s""", self.name)
		
	
	def make_gl_entries(self, cancel=0, adv_adj=0):
		from erpnext.accounts.general_ledger import make_gl_entries	
		gl_map = []
		
		if self.sender_currency == "TOP":
			gl_map.append(
				frappe._dict({
					"posting_date": self.posting_date,
					"transaction_date": self.posting_date,
					"account": self.sender_agents_account,
					"account_currency": self.sender_currency,
					"debit": self.amount_send,
					"voucher_type": self.doctype,
					"voucher_no": self.name,
					"party_type" : "Customer",
					"party": self.sender_name,
					"against": "Cash in Till - T&T",
					"remarks": "Send Money Transaction"
				}))
			gl_map.append(
				frappe._dict({
					"account": "Cash in Till - T&T",
					"against": self.sender_agents_account,
					"posting_date": self.posting_date,
					"credit": self.amount_send,
					"voucher_type": self.doctype,
					"voucher_no": self.name,
					"remarks": "Send Money Transaction"
				}))
		
		if self.multicurrency and self.sender_currency != "TOP":
			gl_map.append(
				frappe._dict({
					"posting_date": self.posting_date,
					"transaction_date": self.posting_date,
					"account": self.sender_agents_account,
					"account_currency": self.sender_currency,
					"debit_in_account_currency": self.amount_send,
					"debit": flt(self.amount_send * self.exchange_rate),
					"voucher_type": self.doctype,
					"voucher_no": self.name,
					"party_type" : "Customer",
					"party": self.sender_name,
					"against": "Cash in Till - T&T",
					"remarks": "Send Money Transaction"
				}))
			gl_map.append(
				frappe._dict({
					"account": "Cash in Till - T&T",
					"against": self.sender_agents_account,
					"posting_date": self.posting_date,
					"credit_in_account_currency": self.amount_send,
					"credit": flt(self.amount_send * self.exchange_rate),
					"voucher_type": self.doctype,
					"voucher_no": self.name,
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
		if self.sender_currency =="TOP":
			gl_map.append(
				frappe._dict({
					"account": self.sender_agents_account,
					"against": "Govt Levy - T&T",
					"posting_date": self.posting_date,
					"debit": self.govt_levy,
					"voucher_type": self.doctype,
					"voucher_no": self.name,
					"cost_center": self.sender_cost_center,
					"remarks": "Ex Rate Govt Levy"
				})
			)
			gl_map.append(
				frappe._dict({
					"account": "Govt Levy - T&T",
					"against": self.sender_agents_account,
					"posting_date": self.posting_date,
					"credit": self.govt_levy,
					"voucher_type": self.doctype,
					"voucher_no": self.name,
					"cost_center": self.sender_cost_center,
					"remarks": "Ex Rate Govt Levy"
				})
			)
			
		if gl_map:
			make_gl_entries(gl_map, cancel=(self.docstatus == 2))
			
	def make_trxn_entries(self):
		doc = frappe.new_doc("Transactions Details")
		doc.update({
					"user_id": self.send_by,
					"posting_date": self.posting_date,
					"currency": self.sender_currency,
					"description": self.doctype,
					"inflow": self.total_amount_paid,
					"mctn": self.name
				})
		doc.insert()
		doc.submit()


	def get_exchange_rate(self):
		from erpnext.setup.utils import get_exchange_rate
		exchange_rate = get_exchange_rate(self.sender_currency, self.received_currency, self.posting_date)

		self.exchange_rate = exchange_rate
#		frappe.msgprint(_("Exchange rate for {0} to {1} for key date {2} is {3}.").format(self.sender_currency, self.received_currency, self.posting_date, exchange_rate))