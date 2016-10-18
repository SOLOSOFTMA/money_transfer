// Copyright (c) 2016, Frappe and contributors
// For license information, please see license.txt

frappe.ui.form.on('Send Money', {
	
	onload: function(frm) {
	  var today = get_today()
	  frm.set_value("posting_date", today);

	  var Current_User = user;
	  frm.set_value("send_by", Current_User);
	  if (Current_User != "Administrator"){
		  cur_frm.set_value("sender_from", "");
					frappe.call({
							"method": "frappe.client.get",
							args: {
								doctype: "Agents",
								filters: {'agent_user': Current_User},
								name: frm.doc.sender_from
							},
							callback: function (data) {
								cur_frm.set_value("sender_from", data.message["name"]);
								cur_frm.set_value("sender_from_country", data.message["agents_country"]);
								cur_frm.set_value("sender_from_location", data.message["agents_location"]);
								cur_frm.set_value("sender_currency", data.message["agents_currency"]);
								cur_frm.set_value("sender_agents", data.message["agents"]);
								cur_frm.set_value("sender_agents_account", data.message["agent_account"]);
								cur_frm.set_value("sender_fees_account", data.message["agent_fees_account"]);
								cur_frm.set_value("sender_cost_center", data.message["agent_cost_center"]);
					}
				})
	 } 
	},
	
	refresh: function(frm) {

	},
	
	amount_send: function(frm) {
		frm.set_value("amount_received", flt(frm.doc.amount_send * frm.doc.exchange_rate));
	},
		
	fees: function(frm) {
		if(frm.doc.fees == "Yes"){
			if(flt(frm.doc.amount_send)<1000) {
				frm.set_value("fees_amount", 5.00);
				frm.set_value("total_amount_paid", flt(frm.doc.amount_send + frm.doc.fees_amount));
			}
			else if(flt(frm.doc.amount_send)>1000) {
				frm.set_value("fees_amount", 10.00);
				frm.set_value("total_amount_paid", flt(frm.doc.amount_send + frm.doc.fees_amount));
			}
		}
		if(frm.doc.fees =="No"){
			frm.set_value('fees_amount', 0.00);
			frm.set_value("total_amount_paid", flt(frm.doc.amount_send + frm.doc.fees_amount));
		}else if (frm.doc.fees ==""){
			frm.set_value('fees_amount', "");
			frm.set_value("total_amount_paid", "");
		}
	},
	receiver_to: function(frm) {

        if(frm.doc.receiver_to == frm.doc.sender_from) {
            msgprint("You are not only allowed to Send and Received Money on the same Agent");
			frm.set_value("receiver_to", "");
			frm.set_value("receiver_to_country", "");
			frm.set_value("receiver_to_location", "");
		}	
		if (frm.doc.sender_from_country != frm.doc.receiver_to_country) {
			frm.set_value("multicurrency", 1);
		}else {
			frm.set_value("multicurrency", 0);
		}
		
		if (frm.doc.sender_currency == frm.doc.received_currency){
		  cur_frm.set_value("exchange_rate", 1.00);
		}else if (frm.doc.sender_currency != frm.doc.received_currency) {
			cur_frm.set_value("exchange_rate", "");
				frappe.call({
						"method": "frappe.client.get",
						args: {
							doctype: "Currency Exchange",
							filters: {'from_currency': frm.doc.sender_currency,
									  'to_currency': frm.doc.received_currency},
							name: frm.doc.exchange_rate
						},
						callback: function (data) {
							cur_frm.set_value("exchange_rate", data.message["exchange_rate"]);
				}
			})
		}
//		var MTCN_Value = "" + frm.doc.sender_agents + frm.doc.receiver_agents + "";
//		frm.set_value("naming_series", MTCN_Value + "-");
	}
	
});
	
	cur_frm.add_fetch('sender_from','agents_country','sender_from_country');
	cur_frm.add_fetch('sender_from','agents_location','sender_from_location');
	cur_frm.add_fetch('sender_from','agents_currency','sender_currency');
	cur_frm.add_fetch('sender_from','agents','sender_agents');
	cur_frm.add_fetch('sender_name','customer_details','sender_details');
	cur_frm.add_fetch('sender_from','agent_account','sender_agents_account');
	cur_frm.add_fetch('sender_from','agent_fees_account','sender_fees_account');
	
	cur_frm.add_fetch('receiver_to','agents_country','receiver_to_country');
	cur_frm.add_fetch('receiver_to','agents_location','receiver_to_location');
	cur_frm.add_fetch('receiver_to','agents_currency','received_currency');
	cur_frm.add_fetch('receiver_to','agents','receiver_agents');
	
	cur_frm.add_fetch('sender_name','customer_details','sender_details');
	cur_frm.add_fetch('receiver_name','customer_details','receiver_details');
	cur_frm.add_fetch('receiver_to','agent_account','receiver_agent_account');
	cur_frm.add_fetch('receiver_to','agent_cost_center','receiver_cost_center');
	cur_frm.add_fetch('sender_from','agent_cost_center','sender_cost_center');


