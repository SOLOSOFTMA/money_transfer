// Copyright (c) 2016, Frappe and contributors
// For license information, please see license.txt

frappe.ui.form.on('Agents', {
	refresh: function(frm) {
		frm.set_query("agents_location", function() {
			return {
				"filters": { "country": ["=", frm.doc.agents_country]}
			};
			});
		
	},
	
	agents_country: function(frm) {
//		frm.set_value("naming_series", frm.doc.agents );
	}
});
cur_frm.add_fetch('agent_user','full_name','agent_name');
cur_frm.add_fetch('agents_location','city_code','agents_city_code');