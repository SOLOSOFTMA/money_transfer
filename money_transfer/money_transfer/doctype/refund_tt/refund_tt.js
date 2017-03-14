// Copyright (c) 2016, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.ui.form.on('Refund TT', "onload", function(frm, dt, dn){
	
	frm.set_query("mctn", function() {
				return {
					"filters": { 
							"docstatus": ["=", 1],
							"refund_status": ["!=", 1]
					}
				};
	});
	
	frappe.call({
		"method": "frappe.client.get",
			args: {
				doctype: "Send TT",
				name: frm.doc.mctn,
				filters: {
				'docstatus' : 1
				},	
			},			
			callback: function (data) {
				cur_frm.set_value("total_amount_paid", data.message["total_amount_paid"]);
				cur_frm.set_value("fees_amount", data.message["fees_amount"]);
				cur_frm.set_value("amount_send", data.message["amount_send"]);
				cur_frm.set_value("agent_from_location", data.message["sender_from_location"]);
				cur_frm.set_value("posting_date", get_today());
				cur_frm.set_df_property("mctn", "read_only", 1);
				cur_frm.set_df_property("fees_amount", "read_only", 1);
				cur_frm.set_df_property("amount_send", "read_only", 1);
				cur_frm.set_df_property("total_amount_paid", "read_only", 1);		
			}								
		});
});

frappe.ui.form.on('Refund TT', "refresh", function(frm){
	var current_user = user;
	cur_frm.set_value("refund_by", current_user);
});

frappe.ui.form.on('Refund TT', "refund", function(frm){
	
	if (frm.doc.refund == "Full"){
		cur_frm.set_value("refund_amount", frm.doc.total_amount_paid);
		cur_frm.set_value("fees", frm.doc.fees_amount);
	}else if (frm.doc.refund == "Partial"){
		cur_frm.set_value("refund_amount", frm.doc.amount_send);
		cur_frm.set_value("fees", 0);
	}

});