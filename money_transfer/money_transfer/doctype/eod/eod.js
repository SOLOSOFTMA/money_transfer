// Copyright (c) 2016, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.ui.form.on('EOD', {
		refresh: function(frm) {

		},
		onload: function(frm) {
			  frm.set_value("eod_today", get_today());
		}
	
});
frappe.ui.form.on("EOD", "validate", function(frm) {
    if (frm.doc.eod_nextday <= get_today())  {
        msgprint(__("You can not select past date for Next Working Date"));
        validated = false;
    }
});
