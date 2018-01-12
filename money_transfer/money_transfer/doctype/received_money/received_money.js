// Copyright (c) 2016, Frappe and contributors
// For license information, please see license.txt

frappe.ui.form.on('Received Money', {

	setup: function(frm) {

		frm.get_field('deno_details').grid.editable_fields = [
			{fieldname: 'denomination', columns: 3},
			{fieldname: 'deno_amount', columns: 2},
			{fieldname: 'qty', columns: 2},
			{fieldname: 'total', columns: 2}
		];
		frm.get_field('product_table').grid.editable_fields = [
			{fieldname: 'item_code', columns: 2},
			{fieldname: 'description', columns: 2},
			{fieldname: 'qty', columns: 2},
			{fieldname: 'rate', columns: 2},
			{fieldname: 'amount', columns: 2}
		];
	},

	onload: function(frm) {

		frappe.call({
			"method": "frappe.client.get",
						args: {
							doctype: "Send Money",
							name: frm.doc.mctn,
							filters: {
								'docstatus' : 1
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
								cur_frm.set_value("sender_agents", data.message["sender_agents"]);
								cur_frm.set_value("sender_user_id", data.message["send_by"]);

								cur_frm.set_value("reference", data.message["reference"]);
								cur_frm.set_value("receiver_to_country", data.message["receiver_to"]);
								cur_frm.set_value("receiver_to_location", data.message["receiver_to_location"]);
								cur_frm.set_value("received_currency", data.message["received_currency"]);
	//							cur_frm.set_value("receiver_agents", data.message["receiver_agents"]);
								cur_frm.set_value("amount_send", data.message["amount_send"]);
								cur_frm.set_value("exchange_rate", data.message["exchange_rate"]);
								cur_frm.set_value("fees", data.message["fees"]);
								cur_frm.set_value("fees_amount", data.message["fees_amount"]);
								cur_frm.set_value("total_amount_paid", data.message["total_amount_paid"]);
								cur_frm.set_value("sender_name", data.message["sender_name"]);
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
								cur_frm.set_value("amount_received", data.message["amount_received"]);
								cur_frm.set_df_property("mctn", "read_only", 1);
								cur_frm.set_df_property("purpose", "read_only", 1);
								cur_frm.set_df_property("sender_from_country", "read_only", 1);
								cur_frm.set_df_property("exchange_rate", "read_only", 1);
								cur_frm.set_df_property("amount_send", "read_only", 1);
								cur_frm.set_df_property("sender_name", "read_only", 1);
								cur_frm.set_df_property("sender_details", "read_only", 1);
								cur_frm.set_df_property("total_denomination", "read_only", 1);
								cur_frm.set_df_property("receiver_agents_account", "read_only", 1);
								cur_frm.set_df_property("sender_agents_account", "read_only", 1);

							}
			})
	

		var Current_User = user;
		if (frm.doc.docstatus != 1){

		frappe.call({
			method:"frappe.client.get",
			args: {
				doctype:"Agents",
				filters: {'agent_user': Current_User
				},
			},
			callback: function(r) {
			frm.set_value("receiver_agents", r.message["name"]);
			var teller = (r.message["teller_function"]);
			if (teller != "Teller & Till"){
				cur_frm.set_df_property("denomination_starts", "hidden", true);
				cur_frm.set_df_property("deno_details", "hidden", true);
			} else if (teller == "Teller & Till"){
				cur_frm.set_df_property("denomination_starts", "hidden", false);
				cur_frm.set_df_property("deno_details", "hidden", false);

			}
			}
			})
		}

		if (!frm.receiver_agents_account){
			frappe.call({
				method:"frappe.client.get",
				args: {
					doctype:"Agents",
					filters: {'agent_user': Current_User
					},
				},
				callback: function(r) {
				frm.set_value("receiver_agents_account", r.message["agent_account"]);
				}
				})
			}

		if (frm.doc.docstatus != 1){
			var today = get_today()
			var Current_User = user;
			frm.set_value("posting_date", today);
			frm.set_value("received_agent", Current_User);

			frm.set_query("mctn", function() {
				return {
					"filters": {
							"docstatus": ["=", 1],
							"withdraw_status": ["!=", 1],
							"receiver_to_location": frm.doc.user_location
					}
				};
			});
		}


	},

	
	refresh: function(frm) {
		if (frm.doc.docstatus == 1 && frm.doc.purpose == "Shopping" && user_roles.indexOf("Sales Manager")!=-1 && !frm.doc.pickup_shopping) {
			frm.add_custom_button(__('Shopping Update'), function() {
				frm.set_value("pickup_shopping", 1);
				frm.set_value("pickup_date",  get_today());

			});
		}
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
				var Current_User = user;
				frappe.call({
					method:"frappe.client.get",
						args: {
								doctype:"Agents",
								filters: {"agent_user": Current_User
								},
							},
							callback: function(r) {
								cur_frm.set_value("user_location", r.message["agents_location"]);
							}
				})

		}

	},
	get_shopping_list: function(frm) {
		return frappe.call({
			method: "get_shopping_list",
			doc: frm.doc,
			callback: function(r, rt) {
				frm.refresh_field("product_table");
				frm.refresh_fields();
			}
		});
	},

//	mctn: function(frm) {
//		cur_frm.set_value("sender_from", "");


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
