frappe.listview_settings['Send TT'] = {
	add_fields: ["withdraw_status","docstatus"],
	get_indicator: function(doc) {
		if(doc.docstatus==0) {
			return [__("Pending"), "orange", "docstatus,=,0"];
		}else if(doc.withdraw_status==1 && doc.docstatus==1) {
			return [__("Withdraw"), "green", "withdraw_status,=,1|docstatus,=,1"];
		
		}else if(doc.withdraw_status!=1 && doc.docstatus==1) {
			return [__("Send"), "blue", "withdraw_status,!=,1|docstatus,=,1"];
		}else if(doc.docstatus==2) {
			return [__("Cancel"), "red", "docstatus,=,2"];
		}
	},
	
};
