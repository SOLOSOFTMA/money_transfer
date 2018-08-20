// Copyright (c) 2016, Frappe and contributors
// For license information, please see license.txt

frappe.ui.form.on('Send Money', {
	
	setup: function(frm) {
		frm.get_field('product_table').grid.editable_fields = [
			{fieldname: 'item_code', columns: 2},
			{fieldname: 'description', columns: 2},
			{fieldname: 'qty', columns: 2},
			{fieldname: 'rate', columns: 2},
			{fieldname: 'amount', columns: 2}
		];
	},

	onload: function(frm) {
			
		if (frappe.user.has_role("Sales Master Manager")){
			cur_frm.set_df_property("confirm_deposit", "hidden", false);
		} else{
			cur_frm.set_df_property("confirm_deposit", "hidden", true);	
		}
		if (frm.doc.docstatus != 1){
		  var today = get_today()
		  frm.set_value("posting_date", today);
		  
		   if (frm.doc.purpose == "Shopping"){
			  cur_frm.set_df_property("shopping_section", "hidden", false);
		  }else if (frm.doc.purpose != "Shopping"){
			  cur_frm.set_df_property("shopping_section", "hidden", true);
			
		  }
		 
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
									cur_frm.set_value("sender_from_country", data.message["agents_country"]);
									cur_frm.set_value("sender_from_location", data.message["agents_location"]);
									cur_frm.set_value("sender_currency", data.message["agents_currency"]);
									cur_frm.set_value("sender_city_code", data.message["agents_city_code"]);
									cur_frm.set_value("sender_agents_account", data.message["agent_account"]);
									cur_frm.set_value("sender_fees_account", data.message["agent_fees_account"]);
									cur_frm.set_value("sender_cost_center", data.message["agent_cost_center"]);
									cur_frm.set_value("received_currency", "");
						}
				})
			} 
		}	
	},

	refresh: function(frm) {
		if(frm.doc.docstatus == 0) {
//			cur_frm.appframe.buttons.Submit.remove();
//			cur_frm.frm_head.appframe.clear_buttons('print');
		}
		if (frm.doc.docstatus == 1 ) {
			var Current_User = user;
			frappe.call({
					"method": "frappe.client.get",
					args: {
							doctype: "Agents",
							filters: {'agent_user': Current_User},
							},
						callback: function (d) {
							var user_location =(d.message["agents_location"]);
							var user_country = (d.message["agents_country"]);
							if (user_country == "Tonga" && frm.doc.withdraw_status != 1 && frm.doc.refund_status != 1 && frm.doc.docstatus == 1 && frm.doc.sender_from_location == user_location) {
								frm.add_custom_button(__('Refund'), function(){
								frappe.route_options = {
														"mctn": frm.doc.name
													}
								frappe.new_doc("Refund");
								frappe.set_route("Form", "Refund", doc.name);
								});
								}
							
						  if (frm.doc.withdraw_status != 1 && frm.doc.docstatus == 1 && frm.doc.receiver_to_location == user_location && frm.doc.confirm_deposit == "Confirm") {
							 frm.add_custom_button(__('Withdraw'), function() {
							 frappe.route_options = {
												"mctn": frm.doc.name
												}
							frappe.new_doc("receive Money");
							frappe.set_route("Form", "receive Money", doc.name);
							});
							}	
						}
					})
				}
		
			frm.set_query("receiver_to_location", function() {
				return {filters: { country: ["=", frm.doc.receiver_to], City: ["!=", frm.doc.sender_from_location]}};
			});
		},
	
	convert_top : function(frm){
		var Convert_TOP = flt(frm.doc.shopping_total/frm.doc.exchange_rate);
		cur_frm.set_value("amount_send", Convert_TOP);
		
	},
	
	purpose: function(frm){
		 if (frm.doc.purpose == "Shopping"){
			  cur_frm.set_df_property("shopping_section", "hidden", false);
		  }else if (frm.doc.purpose != "Shopping"){
			  cur_frm.set_df_property("shopping_section", "hidden", true);
			
		  }
	},
	
	amount_send: function(frm) {
		if (frm.doc.sender_currency != "TOP" && frm.doc.received_currency != "TOP"){
			if (frm.doc.check_special_rate == 1){
				frm.set_value("amount_receive", (Math.ceil(flt(frm.doc.amount_send * frm.doc.special_rate) * 5)/5));
			} else if (frm.doc.check_special_rate == 0){
				frm.set_value("amount_receive", (Math.ceil(flt(frm.doc.amount_send * frm.doc.exchange_rate) * 5)/5));
			}
		}
		if (frm.doc.sender_currency != "TOP" && frm.doc.received_currency == "TOP"){
			if (frm.doc.check_special_rate == 1){
				frm.set_value("amount_received", (Math.ceil(flt(frm.doc.amount_send * frm.doc.special_rate) * 20)/20));
			} else if (frm.doc.check_special_rate == 0){
				frm.set_value("amount_received", (Math.ceil(flt(frm.doc.amount_send * frm.doc.exchange_rate) * 20)/20));
			}
		}
		if (frm.doc.sender_currency == "TOP" && frm.doc.received_currency == "TOP"){
							frm.set_value("amount_received", frm.doc.amount_send);
				}
			
		
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
		if (frm.doc.receiver_to==null){
			cur_frm.set_value("received_currency", null);
			frappe.msgprint(__("Please select where you send Money to"))
		}
		frappe.call({
			"method": "frappe.client.get",
			args: {
					doctype: "Location",
					filters: {
						'country': frm.doc.receiver_to
						},
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
					doctype: "Agents",
					filters: {'agents_location': frm.doc.receiver_to_location
								},
				},
					callback: function (data) {
					cur_frm.set_value("receiver_agent_account", data.message["agent_account"]);
				}
		});
		if (frm.doc.sender_from_country != frm.doc.receiver_to) {
			var today = get_today();
			frm.set_value("multicurrency", 1);
				frappe.call({
						method : "get_exchange_rate",
						doc: frm.doc,
						callback: function(data) {
						//	cur_frm.set_value("exchange_rate", data.message["exchange_rate"]);
						frm.refresh_fields("exchange_rate");
						}	
				});
			
		}else {
			cur_frm.set_value("multicurrency", 0);
			cur_frm.set_value("exchange_rate", 1.00);
		}
		
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
						frm.set_value("naming_series", MTCN_Value + "-");
				}
		});
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
	},
	sender_name: function(frm){

	}
	
});

	cur_frm.add_fetch('sender_name','customer_id_type','sender_id_type');
	cur_frm.add_fetch('sender_name','customer_id_no','sender_id_no');
	cur_frm.add_fetch('sender_name','customer_details','sender_details');
	cur_frm.add_fetch('sender_name','customer_id_1','customer_id_1');
	cur_frm.add_fetch('sender_name','customer_id_2','customer_id_2');
	cur_frm.add_fetch('sender_name','customer_id_3','customer_id_3');
	cur_frm.add_fetch('receiver_name','customer_details','receiver_details');

	cur_frm.add_fetch('sender_from','agents_country','sender_from_country');
	cur_frm.add_fetch('sender_from','agents_location','sender_from_location');
	cur_frm.add_fetch('sender_from','agents_currency','sender_currency');
	cur_frm.add_fetch('sender_from','agents_city_code','sender_city_code');
	
	cur_frm.add_fetch('sender_from','agent_account','sender_agents_account');
	cur_frm.add_fetch('sender_from','agent_fees_account','sender_fees_account');
	cur_frm.add_fetch('sender_from','agent_name','send_agent_name');
	cur_frm.add_fetch('receiver_name','customer_details','receiver_details');
	cur_frm.add_fetch('sender_from','agent_cost_center','sender_cost_center');

	
frappe.ui.form.on("Money Transfer Product", "item_code", function(frm, cdt, cdn){
	var d = locals[cdt][cdn];
	frappe.call({
			"method": "frappe.client.get",
			args: {
					doctype: "Item",
					filters: {'name': d.item_code
								},
				},
				callback: function (data) {
					frappe.model.set_value(d.doctype, d.name, "rate",  data.message["standard_rate"]);
					frappe.model.set_value(d.doctype, d.name, "description",  data.message["item_name"]);
				}
		})
});
frappe.ui.form.on("Money Transfer Product", "qty", function(frm, cdt, cdn){
  var d = locals[cdt][cdn];
  frappe.model.set_value(d.doctype, d.name, "amount", d.rate * d.qty);

  var total_amount = 0;
  frm.doc.product_table.forEach(function(d) { total_amount += d.amount; });

  frm.set_value("shopping_total", total_amount);

});

var calculate_total_amount = function(frm){
	if (frm.doc.fees_amount == ""){
		frm.doc,fees_amount = 0
	}
	if (frm.doc.govt_levy == ""){
		frm.doc,govt_levy = 0
	}
	var total_amount = flt(frm.doc.amount_send + frm.doc.fees_amount + frm.doc.govt_levy);
	frm.set_value("total_amount_paid", total_amount);
		
}



