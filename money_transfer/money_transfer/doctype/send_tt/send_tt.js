// Copyright (c) 2016, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.ui.form.on('Send TT', {
		
	onload: function(frm) {
		if (frm.doc.docstatus != 1){
		  var today = get_today()
		  frm.set_value("posting_date", today);

		  var Current_User = user;
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
									cur_frm.set_value("sender_currency", data.message["agents_currency"]);
									cur_frm.set_value("sender_city_code", data.message["agents_city_code"]);
									cur_frm.set_value("sender_agents_account", data.message["agent_account"]);
									cur_frm.set_value("sender_fees_account", data.message["agent_fees_account"]);
									cur_frm.set_value("sender_cost_center", data.message["agent_cost_center"]);
									
						}
				})
			} 
		}
	},
	
	refresh: function(frm) {
		frm.set_query("receiver_to_location", function() {
			return {
				"filters": { "country": ["=", frm.doc.receiver_to],
							"City" : ["!=", frm.doc.sender_from_location]}
			};
		});		
		var Current_User = user;
		  if (Current_User != "Administrator"){
						frappe.call({
								"method": "frappe.client.get",
								args: {
									doctype: "Agents",
									filters: {'agent_user': Current_User},
								},
								callback: function (data) {	
								var user_location =(data.message["agents_location"]);
								var user_country = (data.message["agents_country"]);									
								 if (frm.doc.withdraw_status != 1 && frm.doc.docstatus == 1 && frm.doc.receiver_to_location == user_location) {
									frm.add_custom_button(__('Withdraw'), function() {
									frappe.route_options = {
														"mctn": frm.doc.name
														}
									frappe.new_doc("Received TT");
									frappe.set_route("Form", "Received TT", doc.name);
									});
								}
								
									
						}
				})								
		}
		
			
	},
	
	amount_send: function(frm) {
		frm.set_value("amount_received", (Math.floor(flt(frm.doc.amount_send * frm.doc.exchange_rate) * 20)/20));
		calculate_total_amount(frm);
	},
		
	fees: function(frm) {
		if(frm.doc.fees == "Yes" && frm.doc.sender_from_location != "Otahuhu"){
			if(flt(frm.doc.amount_send)<1000) {
				frm.set_value("fees_amount", 5.00);
				calculate_total_amount(frm);
			}
			else if(flt(frm.doc.amount_send)>=1000) {
				frm.set_value("fees_amount", 10.00);
				calculate_total_amount(frm);
			}
		}else if(frm.doc.fees == "Yes" && frm.doc.sender_from_location == "Otahuhu"){
			if (frm.doc.amount_send <= 300){
				frm.set_value("fees_amount", 5.00);
				calculate_total_amount(frm);
			}
			else if (frm.doc.amount_send > 300 && frm.doc.amount_send <= 700){
				frm.set_value("fees_amount", 7.00);
				calculate_total_amount(frm);
			}
			else if (frm.doc.amount_send > 700 && frm.doc.amount_send <= 1000){
				frm.set_value("fees_amount", 10.00);
				calculate_total_amount(frm);
			}
			else if (frm.doc.amount_send > 1000 && frm.doc.amount_send <= 3000){
				frm.set_value("fees_amount", 15.00);
				calculate_total_amount(frm);
			}
			else if (frm.doc.amount_send > 3000 && frm.doc.amount_send <= 5000){
				frm.set_value("fees_amount", 20.00);
				calculate_total_amount(frm);
			}
			else if (frm.doc.amount_send > 5000 && frm.doc.amount_send <= 7000){
				frm.set_value("fees_amount", 25.00);
				calculate_total_amount(frm);
			}else if(frm.doc.amount_send > 7000){
				frm.set_value("fees_amount", 30.00);
				calculate_total_amount(frm);
			}
		}
			
		if(frm.doc.fees =="No"){
			frm.set_value('fees_amount', 0.00);
			calculate_total_amount(frm);
		}else if (frm.doc.fees ==""){
			frm.set_value('fees_amount', "");
			calculate_total_amount(frm);
		}
	},
	receiver_to: function(frm) {
		if (frm.doc.receiver_to == ""){
			frappe.msgprint(__("Please select where you send Money to"))
			return;
		}
		
		frappe.call({
			"method": "frappe.client.get",
			args: {
					doctype: "Location",
					filters: {'country': frm.doc.receiver_to},
				},
					callback: function (data) {
					cur_frm.set_value("received_currency", data.message["currency"]);
				}
		});
		
	},
	receiver_to_location: function(frm) {
		
		frappe.call({
			"method": "frappe.client.get",
			args: {
					doctype: "Location",
					filters: {'City': frm.doc.receiver_to_location
								},
				},
					callback: function (data) {
					cur_frm.set_value("receiver_city_code", data.message["city_code"]);
						var MTCN_Value = "" + frm.doc.sender_city_code + frm.doc.receiver_city_code + "";
						frm.set_value("naming_series", MTCN_Value + "-" + "TT" + "-");
				}
		});
		frappe.call({
			"method": "frappe.client.get",
			args: {
					doctype: "Agents",
					filters: {'agents_location': frm.doc.receiver_to_location
								},
				},
					callback: function (data) {
					cur_frm.set_value("receiver_agent_account", data.message["agent_account"]);
				}
		});
		if (frm.doc.sender_from_country != frm.doc.receiver_to) {
			frm.set_value("multicurrency", 1);
				frappe.call({
						"method": "frappe.client.get",
						args: {
							doctype: "Currency Exchange",
							filters: {'name': frm.doc.sender_currency + "-" + frm.doc.received_currency,
									  'from_currency': frm.doc.sender_currency,
									  'to_currency': frm.doc.received_currency},
						},
						callback: function (data) {
							
							cur_frm.set_value("exchange_rate", data.message["exchange_rate"]);
				}
				});
			
		}else {
			frm.set_value("multicurrency", 0);
			cur_frm.set_value("exchange_rate", 1.00);
		}
	},
	levy: function(frm) {
		if (frm.doc.levy == "Yes"){
			frm.set_value("govt_levy", flt(frm.doc.amount_send * 0.005));
			calculate_total_amount(frm);
		}if (frm.doc.levy == "No"){
			frm.set_value("govt_levy", 0.00);
			calculate_total_amount(frm);
		}else if (frm.doc.levy == ""){
			frm.set_value("govt_levy", "");
		}
	}
	
});

	cur_frm.add_fetch('sender_from','agents_country','sender_from_country');
	cur_frm.add_fetch('sender_from','agents_location','sender_from_location');
	cur_frm.add_fetch('sender_from','agents_currency','sender_currency');
	cur_frm.add_fetch('sender_from','agents_city_code','sender_city_code');
	cur_frm.add_fetch('sender_name','customer_details','sender_details');
	cur_frm.add_fetch('sender_from','agent_account','sender_agents_account');
	cur_frm.add_fetch('sender_from','agent_fees_account','sender_fees_account');
	cur_frm.add_fetch('sender_from','agent_name','send_agent_name');
	cur_frm.add_fetch('sender_name','customer_details','sender_details');
	cur_frm.add_fetch('receiver_name','customer_details','receiver_details');
	cur_frm.add_fetch('sender_from','agent_cost_center','sender_cost_center');
	cur_frm.add_fetch('person_lodge_application','customer_details','person_lodge_app_details');



var calculate_total_amount = function(frm){
	if (frm.doc.fees_amount == ""){
		frm.doc,fees_amount = 0
	}
	var total_amount = flt(frm.doc.amount_send + frm.doc.fees_amount + frm.doc.govt_levy);
	frm.set_value("total_amount_paid", total_amount);
		
}