frappe.listview_settings['Received Money'] = {
	add_fields: ["title", "docstatus","posting_date","purpose"],
	get_indicator: function(doc) {
        if(doc.docstatus==0){
        	return [__("Pending"), "red", "docstatus,=,0"]
		}
	}
}