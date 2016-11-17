// Copyright (c) 2016, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.ui.form.on('Denomination', {
	setup: function(frm) {
		frm.get_field('deno_details').grid.editable_fields = [
			{fieldname: 'denomination', columns: 3},
			{fieldname: 'deno_amount', columns: 1},
			{fieldname: 'qty', columns: 1},
			{fieldname: 'total', columns: 2}
		];
	},


	refresh: function(frm) {

	}
});

frappe.ui.form.on("Deno", "qty", function(frm, cdt, cdn){
  var d = locals[cdt][cdn];
  frappe.model.set_value(d.doctype, d.name, "total", d.deno_amount * d.qty);

  var denototal = 0;
  frm.doc.deno_details.forEach(function(d) { denototal += d.total; });

  frm.set_value("total_deno", denototal);

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
