// Copyright (c) 2016, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.ui.form.on('Received TT', {
		setup: function(frm) {
			frm.get_field('deno_details').grid.editable_fields = [
				{fieldname: 'denomination', columns: 3},
				{fieldname: 'deno_amount', columns: 2},
				{fieldname: 'qty', columns: 2},
				{fieldname: 'total', columns: 2}
			];
		},

		
		onload: function(frm) {
		frappe.call({
			"method": "frappe.client.get",
				args: {
					doctype: "Send TT",
					name: frm.doc.mctn,
					filters: {'docstatus': 1
					},
				},
						callback: function (data) {
							cur_frm.set_value("company", data.message["company"]);
							cur_frm.set_value("multicurrency", data.message["multicurrency"]);
							cur_frm.set_value("purpose", data.message["purpose"]);
							cur_frm.set_value("sender_from", data.message["sender_from"]);
							cur_frm.set_value("sender_from_country", data.message["sender_from_country"]);
							cur_frm.set_value("sender_from_location", data.message["sender_from_location"]);
							cur_frm.set_value("sender_currency", data.message["sender_currency"]);
							cur_frm.set_value("received_by", data.message["send_by"]);
							
							cur_frm.set_value("receiver_to", data.message["receiver_to"]);
							cur_frm.set_value("receiver_to_location", data.message["receiver_to_location"]);
							cur_frm.set_value("received_currency", data.message["received_currency"]);
						
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
							frappe.call({
								method:"frappe.client.get",
								args: {
									doctype:"Customer",
									filters: {'customer_name': data.message["receiver_name"]
									},
								},
								callback: function(r) {
									cur_frm.set_value("receiver_id_type", r.message["customer_id_type"]);
									cur_frm.set_value("receiver_id_no", r.message["customer_id_no"]);
									cur_frm.set_value("receiver_details", r.message["customer_details"]);
								}
							})
							cur_frm.set_value("received_agent_name", data.message["send_agent_name"]);
							cur_frm.set_value("bank_name",data.message["bank_name"]);
							cur_frm.set_value("bank_address",data.message["bank_address"]);
							cur_frm.set_value("account_number",data.message["account_number"]);
							cur_frm.set_value("bsb_number",data.message["bsb_number"]);
							cur_frm.set_value("swift_code",data.message["swift_code"]);
							
							
				}
			})
//			frappe.call({
//				"method": "frappe.client.get",
//				args: {
//					doctype: "File",
//					filters:{'attached_to_name': frm.doc.mctn},
//					},
//				callback: function (data) {
//				cur_frm.set_value("file",data.message["file_url"]);}
//			})
// ---------------------------------------------------------------------------------------------		
		var Current_User = user;
		frappe.call({
			method:"frappe.client.get",
			args: {
				doctype:"Agents",
				filters: {'agent_user': Current_User
				},
			}, 
			callback: function(r) { 
			var teller = (r.message["teller_function"]);
			if (teller != "Teller & Till"){
				cur_frm.set_df_property("denomination_section", "hidden", true);
				cur_frm.set_df_property("deno_details", "hidden", true);
			} else if (teller == "Teller & Till"){
				cur_frm.set_df_property("denomination_section", "hidden", false);
				cur_frm.set_df_property("deno_details", "hidden", false);
			}
			}
			})

		
		if (frm.doc.docstatus != 1){
			var today = get_today()
			var Current_User = user;
			frm.set_value("posting_date", today);
			frm.set_value("received_agent", Current_User);
		}
		
	},
	
	refresh: function(frm) {
		if (frm.doc.docstatus != 1){
			var Current_User = user;
			if (Current_User != "Administrator"){
					frappe.call({
						method:"frappe.client.get",
						args: {
							doctype:"User",
							filters: {'email': Current_User
							},
						}, 
						callback: function(r) { 
							cur_frm.set_value("received_agent_name", r.message["full_name"]);
						}
					})
				}
//				var Current_User = user;
				frappe.call({
					method:"frappe.client.get",
						args: {
								doctype:"Agents",
								filters: {"agent_user": Current_User
								},
							}, 
							callback: function(r) { 
								cur_frm.set_value("user_location", r.message["agents_location"]);
								cur_frm.set_value("receiver_agents", r.message["name"]);
							}
				})
				
		}

	},
//	mctn: function(frm) {

//	},
	
});
frappe.ui.form.on("Deno", "qty", function(frm, cdt, cdn){
  var d = locals[cdt][cdn];
  frappe.model.set_value(d.doctype, d.name, "total", d.deno_amount * d.qty);

  var denototal = 0;
  frm.doc.deno_details.forEach(function(d) { denototal += d.total; });

  frm.set_value("total_denomination", denototal);

});

frappe.ui.form.on("Deno", "denomination", function(frm, cdt, cdn){
	var d = locals[cdt][cdn];
	frappe.call({
			"method": "frappe.client.get",
			args: {
					doctype: "Denomination Table",
					filters: {'name': d.denomination
								},
				},
					callback: function (data) {
					frappe.model.set_value(d.doctype, d.name, "deno_amount",  data.message["denos"]);
				}
		})
});