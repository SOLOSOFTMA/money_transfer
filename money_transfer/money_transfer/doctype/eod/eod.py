# -*- coding: utf-8 -*-
# Copyright (c) 2015, Caitlah Technology and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class EOD(Document):
	
	def validate(self):
		self.del_transactions() 
	
	def del_transactions(self):
		for tranx in frappe.get_all("Transactions Details", filters={"posting_date": eod_day}):
		frappe.db.sql("""delete from `tabTransactions Details`
			where posting_date= %s """,tranx.eod_day)
		                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
                                                                                                                  