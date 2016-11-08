// Copyright (c) 2016, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.ui.form.on('Transfer from Bank to Vault', {
	refresh: function(frm) {

	},
	
		onload: function(frm) {
		if (frm.doc.docstatus != 1){
		var today = get_today()
		frm.set_value("transfer_date", today);
	  
	  
		var Current_User = user;						


	}
	}
});
