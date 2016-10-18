// Copyright (c) 2016, Frappe and contributors
// For license information, please see license.txt

frappe.ui.form.on('Received Money', {
	onload: function(frm) {
		var today = get_today()
		var Current_User = user;
		frm.set_value("posting_date", today);
		frm.set_value("received_agent", Current_User);
		
		frm.set_query("mctn", function() {
			return {
				"filters": { "docstatus": ["=", 1]}
			};
		});
	},
	
	recalculate: function(frm) {		
		var Total_P, Total_S=0.00
		Total_P = frm.doc.total_p100 + frm.doc.total_p50 + frm.doc.total_p20 + frm.doc.total_p10 + frm.doc.total_p5 + frm.doc.total_p2 + frm.doc.total_p1;
		Total_S = frm.doc.total_s50 + frm.doc.total_s20 + frm.doc.total_s10 + frm.doc.total_s5;
		frm.set_value("total_denomination", Total_P + Total_S);
	},
	
	mctn: function(frm) {
		cur_frm.set_value("sender_from", "");
				frappe.call({
						"method": "frappe.client.get",
						args: {
							doctype: "Send Money",
							filters: {'name': frm.doc.mctn,
							'docstatus': 1},
							name: frm.doc.sender_from
						},
						callback: function (data) {
							cur_frm.set_value("company", data.message["company"]);
							cur_frm.set_value("multicurrency", data.message["multicurrency"]);
							cur_frm.set_value("purpose", data.message["purpose"]);
							cur_frm.set_value("sender_from", data.message["sender_from"]);
							cur_frm.set_value("sender_from_country", data.message["sender_from_country"]);
							cur_frm.set_value("sender_from_location", data.message["sender_from_location"]);
							cur_frm.set_value("sender_currency", data.message["sender_currency"]);
							cur_frm.set_value("sender_agents", data.message["sender_agents"]);
							cur_frm.set_value("sender_user_id", data.message["send_by"]);
							
							cur_frm.set_value("receiver_to", data.message["receiver_to"]);
							cur_frm.set_value("receiver_to_country", data.message["receiver_to_country"]);
							cur_frm.set_value("receiver_to_location", data.message["receiver_to_location"]);
							cur_frm.set_value("received_currency", data.message["received_currency"]);
							cur_frm.set_value("receiver_agents", data.message["receiver_agents"]);
							
							cur_frm.set_value("amount_send", data.message["amount_send"]);
							cur_frm.set_value("exchange_rate", data.message["exchange_rate"]);
							cur_frm.set_value("amount_received", data.message["amount_received"]);
							cur_frm.set_value("fees", data.message["fees"]);
							cur_frm.set_value("fees_amount", data.message["fees_amount"]);
							cur_frm.set_value("total_amount_paid", data.message["total_amount_paid"]);
							
							cur_frm.set_value("sender_name", data.message["sender_name"]);
							cur_frm.set_value("sender_id_type", data.message["sender_id_type"]);
							cur_frm.set_value("sender_id_no", data.message["sender_id_no"]);
							cur_frm.set_value("sender_details", data.message["sender_details"]);
							cur_frm.set_value("sender_agents_account", data.message["sender_agents_account"]);
							cur_frm.set_value("receiver_agents_account", data.message["receiver_agent_account"]);
							
							cur_frm.set_value("receiver_name", data.message["receiver_name"]);
							cur_frm.set_value("receiver_details", data.message["receiver_details"]);
							
				}
			})
	},
	
	p100: function(frm) {
		frm.set_value("total_p100", flt(frm.doc.p100*100));
		cur_frm.total_denomination();
	},
	p50: function(frm) {
		frm.set_value("total_p50", flt(frm.doc.p50*50));
	},
	p20: function(frm) {
		frm.set_value("total_p20", flt(frm.doc.p20*20));
	},
	p10: function(frm) {
		frm.set_value("total_p10", flt(frm.doc.p10*10));
	},
	p5: function(frm) {
		frm.set_value("total_p5", flt(frm.doc.p5*5));
	},
	p2: function(frm) {
		frm.set_value("total_p2", flt(frm.doc.p2*2));
	},
	p1: function(frm) {
		frm.set_value("total_p1", flt(frm.doc.p1*1));
	},
	// Seniti
	s50: function(frm) {
		frm.set_value("total_s50", flt(frm.doc.s50*0.5));
	},
	s20: function(frm) {
		frm.set_value("total_s20", flt(frm.doc.s20*0.2));
	},
	s10: function(frm) {
		frm.set_value("total_s10", flt(frm.doc.s10*0.1));
	},
	s5: function(frm) {
		frm.set_value("total_s5", flt(frm.doc.s5*0.05));
	},
	
	total_denomination: function(frm) {
		
	}
	
});

//cur_frm.cscript.update_totals = function(doc) {
//	var Total_P, Total_S=0.00
//	Total_P = frm.doc.total_p100 + frm.doc.total_p50 + frm.doc.total_p20 + frm.doc.total_p10 + frm.doc.total_p5 + frm.doc.total_p2 + frm.doc.total_p1;
//	Total_S = frm.doc.total_s50 + frm.doc.total_s20 + frm.doc.total_s10 + frm.doc.total_s5;
//	frm.set_value("total_denomination", Total_P + Total_S);
//}