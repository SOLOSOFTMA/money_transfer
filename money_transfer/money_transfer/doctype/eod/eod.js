// Copyright (c) 2016, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.ui.form.on('EOD', {
		refresh: function(frm) {

		},
		onload: function(frm) {
			if(frm.doc.docstatus!=1){
				if (!frm.doc.eod_today) {
			  frm.set_value("eod_today", get_today());
				}
			}
		},
});
frappe.ui.form.on("EOD", "eod_nextday", function(frm) {
	var p = frm.doc;
	var date = get_today();
    if (frm.doc.eod_nextday <= get_today())  {
        msgprint("You can not select past date for Next Working Date");
		frappe.model.set_value(p.doctype, p.name, "eod_nextday", "");
    }
});