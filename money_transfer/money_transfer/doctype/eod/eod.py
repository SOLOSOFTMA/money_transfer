# -*- coding: utf-8 -*-
# Copyright (c) 2015, Caitlah Technology and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
import MySQLdb

class EOD(Document):
	
	def submit(self):
		self.save_to_temp_table()
		self.insert_record()
		self.empty_transactions()
		self.insert_Opening_Bal()
		self.empty_temp_table()
			
	def save_to_temp_table(self):	
		frappe.db.sql("""insert into `tabTemp` (user_id, currency, posting_date, inflow) select
		user_id, currency, posting_date, sum(inflow - outflow) as Total
		from `tabTransactions Details` GROUP BY user_id DESC, currency ASC""")
	
	def insert_record(self):	
		frappe.db.sql("""insert into `tabTransactions History` (name, modified_by, owner,
		docstatus, mctn, user_id, currency, posting_date, outflow, inflow, description) select name, modified_by, owner,
		docstatus, mctn, user_id, currency, posting_date, outflow, inflow, description from `tabTransactions Details`""")	

	def empty_transactions(self):	
		frappe.db.sql("""delete from `tabTransactions Details`""")
	
	def insert_Opening_Bal(self):	
		frappe.db.sql("""insert into `tabTransactions Details` (name, user_id, currency, posting_date, inflow, description) select name, user_id, 
		currency, posting_date, inflow, description from `tabTemp`""")
		
	def empty_temp_table(self):	
		frappe.db.sql("""delete from `tabTemp`""")
	
                                                                                                                  