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
	  if (Current_User == frm.doc.owner){
		  cur_frm.set_value("transfer_from_agent", "");
					frappe.call({
							"method": "frappe.client.get",
							args: {
								doctype: "Agents",
								filters: {'agent_user': Current_User,
								'teller_function': ["!=","Vault"]},
								name: frm.doc.sender_from
							},
							callback: function (data) {
								cur_frm.set_value("transfer_from_agent", data.message["name"]);
					}
					});
	 } 
	 frm.set_query("transfer_to_agent", function() {
				return {
					"filters": { 
							'agents_enabled': ["=", 1],
					}
				};
			});
	}
	}
});
