// Copyright (c) 2016, Caitlah Technology and contributors
// For license information, please see license.txt

frappe.query_reports["Tellers Summary Report"] = {
	"filters": [
		{
			"fieldname":"company",
			"label": __("Company"),
			"fieldtype": "Link",
			"options": "Company",
			"default": frappe.defaults.get_user_default("Company"),
			"reqd": 1
		},
		{
			"fieldname":"from_date",
			"label": __("From Date"),
			"fieldtype": "Date",
			"default": frappe.datetime.add_months(frappe.datetime.get_today(), -1),
			"reqd": 1,
			"width": "60px"
		},
		{
			"fieldname":"to_date",
			"label": __("To Date"),
			"fieldtype": "Date",
			"default": frappe.datetime.get_today(),
			"reqd": 1,
			"width": "60px"
		},
		{
			"fieldname":"user",
			"label": __("User"),
			"fieldtype": "Link",
			"options": "User",
			"get_query": function() {
				var user = frappe.query_report.filters_by_name.user.get_value();
				return {
					"doctype": "User",
					"filters": {
						"user": user,
					}
				}
			}
		}
	]
}
