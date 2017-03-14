// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// License: GNU General Public License v3. See license.txt

// render
frappe.listview_settings['Send Money'] = {
	add_fields: ["name", "title","docstatus","withdraw_status","refund_status"],
	get_indicator: function(doc) {
		if(doc.docstatus==0) {
			return [__("Draft"), "red", "docstatus,=,0"];
		}else if(doc.docstatus==1 && doc.withdraw_status==1) {
			return [__("Withdraw"), "green", "withdraw_status,=,1|docstatus,=,1"];
		}else if(doc.docstatus==1 && doc.withdraw_status!=1) {
			return [__("Send"), "blue", "docstatus,=,1|withdraw_status,!=,1"]
		}else if(doc.docstatus==3 && doc.refund_status==1) {
			return [__("Refunded"), "orange", "docstatus,=,3|refund_status,=,1"]
		}else if(doc.docstatus==2) {
			return [__("Cancel"), "black", "docstatus,=,2"]
		}
	},
};
