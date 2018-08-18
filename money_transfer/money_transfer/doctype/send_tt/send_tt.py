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
		self.clear_withdraw_status()
	
	def get_send_by(self):
		return self.owner
					
	def on_submit(self):
#		self.make_gl_entries()
		
		self.make_trxn_entries()
		self.update_customer_info()
		self.check_payment()
#		self.create_sales_invoices()

	def update_customer_info(self):
		frappe.db.sql("""Update `tabCustomer` set customer_details = %s, customer_id_type =%s, customer_id_no = %s, customer_id_1 = %s, customer_id_2 = %s, customer_id_3 = %s where customer_name = %s""", (self.sender_details, self.sender_id_type, self.sender_id_no, self.customer_id_1, self.customer_id_2, self.customer_id_3, self.sender_name))
		
	
#	def update_customer_info(self):
#		frappe.db.sql("""Update `tabCustomer` set customer_details = %s, customer_id_type =%s, customer_id_no = %s where customer_name = %s""", (self.sender_details, self.sender_id_type, self.sender_id_no, self.sender_name))
	
	def clear_withdraw_status(self):
		self.withdraw_status = 0

	def del_transactions(self):
		frappe.db.sql("""Update `tabTransactions Details` set docstatus=2 where mctn = %s""", self.name)
		
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
		self.del_transactions()
	
	def check_payment(self):

		if self.payment_method == "CREDIT":
			self.create_sales_invoices()
			
		if self.payment_method != "CREDIT":
			self.make_gl_entries()
	
	def make_gl_entries(self, cancel=0, adv_adj=0):
		from erpnext.accounts.general_ledger import make_gl_entries		
		gl_map = []
		
		Account = "Cash in Till - T&T"
		
		if self.sender_currency == "TOP":
			gl_map.append(
				frappe._dict({
					"posting_date": self.posting_date,
					"transaction_date": self.posting_date,
					"account": self.sender_agents_account,
					"account_currency": self.sender_currency,
					"debit": self.amount_send,
					"voucher_type": self.doctype,
					"party_type": "Customer",
					"party": self.sender_name,
					"voucher_no": self.name,
					"against": Account,
					"remarks": "Send Money Transaction"
				}))
			gl_map.append(
				frappe._dict({
					"account": Account,
					"against": self.sender_agents_account,
					"posting_date": self.posting_date,
					"credit": self.amount_send,
					"voucher_type": self.doctype,
					"voucher_no": self.name,
					"party_type": "Customer",
					"party": self.sender_name,
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
					"against": Account,
					"remarks": "Send Money Transaction"
				}))
			gl_map.append(
				frappe._dict({
					"account": Account,
					"against": self.sender_agents_account,
					"posting_date": self.posting_date,
					"credit_in_account_currency": self.amount_send,
					"credit": flt(self.amount_send * self.exchange_rate),
					"voucher_type": self.doctype,
					"voucher_no": self.name,
					"party_type": "Customer",
					"party": self.sender_name,
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

		if not self.option_send_to_country and not self.option_send_to_currency:
			exchange_rate = get_exchange_rate(self.sender_currency, self.receive_currency, self.posting_date)

		if self.option_send_to_country and self.option_send_to_currency:
			exchange_rate = get_exchange_rate(self.sender_currency, self.option_send_to_currency, self.posting_date)

		self.exchange_rate = exchange_rate
	

	def create_sales_invoices(self):
		
		doc = frappe.new_doc("Sales Invoice")
		doc.customer = self.sender_name
		doc.ref_tt = self.name
		
		item = doc.append('items', {
		'item_code' : "Send TT",
		'item_name' : "Send TT",
		'qty' : 1,
		'rate' : self.total_amount_paid
		})
		

		
		doc.save(ignore_permissions=True)
		doc.save()
		doc.submit()

#@frappe.whitelist()
#def get_mode_of_payment(doc):
#	return frappe.db.sql(""" select mpa.default_account, mpa.parent, mp.type as type from `tabMode of Payment Account` mpa,
#		 `tabMode of Payment` mp where mpa.parent = mp.name and mpa.company = %(company)s""", {'company': doc.company}, as_dict=1)