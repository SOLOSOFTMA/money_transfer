# -*- coding: utf-8 -*-
# Copyright (c) 2015, Caitlah Technology and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class TellerTransfer(Document):
	def validate(self):
		if not self.title:
			self.title = self.doctype
	
	def on_submit(self):
		self.make_trxn_entries_out()
		self.make_trxn_entries_in()
	
	def make_trxn_entries_out(self):
		userid = frappe.get_doc("Agents", self.transfer_from_agent)
		doc = frappe.new_doc("Transactions Details")
		doc.update({
					"user_id": userid.agent_user,
					"posting_date": self.transfer_date,
					"currency": "TOP",
					"description": self.doctype,
					"outflow": self.transfer_amount,
					"mctn": self.name
				})
		doc.insert()
		doc.submit()
	
	def make_trxn_entries_in(self):
		userid = frappe.get_doc("Agents", self.transfer_to_agent)
		doc = frappe.new_doc("Transactions Details")
		doc.update({
					"user_id": userid.agent_user,
					"posting_date": self.transfer_date,
					"currency": "TOP",
					"description": self.doctype,
					"inflow": self.transfer_amount,
					"mctn": self.name
				})
		doc.insert()
		doc.submit()
		
