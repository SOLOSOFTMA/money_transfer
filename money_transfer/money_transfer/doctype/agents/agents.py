# -*- coding: utf-8 -*-
# Copyright (c) 2015, Frappe and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class Agents(Document):

	def validate(self):
		if not self.title:
			self.title = self.get_title()
		if not self.agents:
			self.agents = self.get_title()

	def get_title(self):
		return self.name
