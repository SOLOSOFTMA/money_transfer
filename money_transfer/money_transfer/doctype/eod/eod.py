# -*- coding: utf-8 -*-
# Copyright (c) 2015, Caitlah Technology and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
import MySQLdb

class EOD(Document):
	
	def validate(self):
		self.check_eod_Maintenance()
	
	def submit(self):
		self.save_to_temp_table()
		self.insert_record()
		self.empty_transactions()
		self.insert_Opening_Bal()
		self.update_posting_date()
		self.update_opening_balance()
		self.empty_temp_table()
		self.update_description()
		self.update_docstatus()
		self.update_status()
		
		
	def check_eod_Maintenance(self):
		if not self.eod_check:
			msgprint(_("Please make sure EOD Maintenance is Check"))
			
	def save_to_temp_table(self):	
		frappe.db.sql("""insert into `tabTemp` (name, user_id, currency, posting_date, inflow) select
		concat(user_id, '-', convert(posting_date,char(10))), user_id, currency, posting_date, sum(inflow - outflow) as Total
		from `tabTransactions Details` GROUP BY user_id DESC, currency ASC""")
	
	def insert_record(self):	
		frappe.db.sql("""insert into `tabTransactions History` (name, modified_by, owner,
		docstatus, mctn, user_id, currency, posting_date, outflow, inflow, description) select name, modified_by, owner,
		docstatus, mctn, user_id, currency, posting_date, outflow, inflow, description from `tabTransactions Details`""")	

	def empty_transactions(self):	
		frappe.db.sql("""delete from `tabTransactions Details`""")
	
	def insert_Opening_Bal(self):	
		frappe.db.sql("""insert into `tabTransactions Details` (name, creation, modified_by, owner, user_id, currency, posting_date, inflow, description) select name, posting_date-1, user_id, user_id, user_id, 
		currency, posting_date, inflow, description from `tabTemp`""")
		
	def empty_temp_table(self):
		frappe.db.sql("""delete from `tabTemp`""")
	
	def update_posting_date(self):
		frappe.db.sql("""Update `tabTransactions Details` set posting_date = %s""", self.eod_nextday)
	
	def update_description(self):
		frappe.db.sql("""Update `tabTransactions Details` set description="Opening Balance" """)
	
	def update_docstatus(self):
		frappe.db.sql("""Update `tabTransactions Details` set docstatus=1 """)
		
	def update_opening_balance(self):
		frappe.db.sql("""Update `tabTransactions Details` set inflow="0.00" where currency in ("NZD","AUD")""")
	
	def update_status(self):
			frappe.db.sql("""Update `tabEOD` set docstatus=1 where eod_today = %s""", self.eod_today)
