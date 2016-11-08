frappe.listview_settings['Received Money'] = {
	add_fields: ["title", "docstatus","posting_date","amount_received"],
	get_indicator: function(doc) {
        if(doc.docstatus==0){
        	return [__("Pending"), "red", "docstatus,=,0"]
		}
	}
}