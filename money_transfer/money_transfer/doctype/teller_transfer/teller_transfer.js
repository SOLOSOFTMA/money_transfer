// Copyright (c) 2016, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.ui.form.on('Teller Transfer', {
	refresh: function(frm) {

	},
	
	onload: function(frm) {
	if (frm.doc.docstatus != 1){
	  var today = get_today()
	  frm.set_value("transfer_date", today);

	  var Current_User = user;
	  if (Current_User != "Administrator"){
		  cur_frm.set_value("transfer_from_agent", "");
					frappe.call({
							"method": "frappe.client.get",
							args: {
								doctype: "Agents",
								filters: {'agent_user': Current_User},
								name: frm.doc.sender_from
							},
							callback: function (data) {
								cur_frm.set_value("transfer_from_agent", data.message["name"]);
					}
					});
	 } 
	}
	}
});
