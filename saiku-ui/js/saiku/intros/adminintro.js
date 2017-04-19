/**
 * Created by bugg on 04/04/17.
 */
function startIntro() {
	var j;
	$.getJSON("/js/saiku/intros/workspace.json", function (json) {
		console.log(json); // this will show the info it in firebug console
		j = json;
		var intro = introJs();
		intro.setOptions({
				"steps": [
					{
						"element": document.querySelector('#new_query'),
						"intro": "Click here to open a blank query."
					},
					{
						"element": document.querySelectorAll('#open_query')[0],
						"intro": "Click here to open a saved query",
						"position": "right"
					},
					{
						"element": document.querySelectorAll('#admin_icon')[0],
						"intro": "Click here for Administration functions",
						"position": "right"
					},
					{
						"element": document.querySelectorAll('#refresh_icon')[0],
						"intro": "Click here to refresh the cube list",
						"position": "right"
					},
					{
						"element": document.querySelectorAll('#cubesselect')[0],
						"intro": "Select a cube from this menu",
						"position": "right"
					},
					{
						"element": document.querySelectorAll('.metadata_attribute_container')[0],
						"intro": "This is your list of available measures and dimensions",
						"position": "right"
					},
					{
						"element": document.querySelectorAll('#new_icon')[0],
						"intro": "Click here for a blank query",
						"position": "right"
					},

					{
						"element": document.querySelectorAll('#save_icon')[0],
						"intro": "Click here to save your active query",
						"position": "right"
					},

					{
						"element": document.querySelectorAll('#edit_icon')[0],
						"intro": "Click here to switch between edit and view mode",
						"position": "right"
					},
					{
						"element": document.querySelectorAll('#run_icon')[0],
						"intro": "Click the run icon to execute the query",
						"position": "right"
					},
					{
						"element": document.querySelectorAll('#automatic_icon')[0],
						"intro": "Switch between automatic execution and manual mode",
						"position": "right"
					},
					{
						"element": document.querySelectorAll('#group_icon')[0],
						"intro": "Group duplicated cells",
						"position": "right"
					},
					{
						"element": document.querySelectorAll('#non_empty_icon')[0],
						"intro": "Click here to hide empty cells",
						"position": "right"
					},
					{
						"element": document.querySelectorAll('#swap_axis_icon')[0],
						"intro": "Select this button to pivot your table 90 degrees",
						"position": "right"
					},
					{
						"element": document.querySelectorAll('#show_mdx_icon')[0],
						"intro": "Show the MDX query used to create this report",
						"position": "right"
					},
					{
						"element": document.querySelectorAll('#zoom_mode_icon')[0],
						"intro": "Select this icon then drag your mouse across the table to zoom into sepcific regions",
						"position": "right"
					},
					{
						"element": document.querySelectorAll('#drillacross_icon')[0],
						"intro": "Select this icon then select a cell to drill across",
						"position": "right"
					},
					{
						"element": document.querySelectorAll('#drillthrough_icon')[0],
						"intro": "Select this icon then select a cell to drill through and view its constituent data",
						"position": "right"
					},
					{
						"element": document.querySelectorAll('#export_drillthrough_icon')[0],
						"intro": "Export a drill through to CSV",
						"position": "right"
					},
					{
						"element": document.querySelectorAll('#export_xls_icon')[0],
						"intro": "Export the table to Excel",
						"position": "right"
					},
					{
						"element": document.querySelectorAll('#export_csv_icon')[0],
						"intro": "Export the table to CSV",
						"position": "right"
					},
					{
						"element": document.querySelectorAll('#export_pdf_icon')[0],
						"intro": "Export the table to PDF",
						"position": "right"
					},
					{
						"element": document.querySelectorAll('#switch_to_mdx_icon')[0],
						"intro": "Switch to MDX mode",
						"position": "right"
					},
					{
						"element": document.querySelectorAll('#fullscreen_icon')[0],
						"intro": "Show the table in fullscreen",
						"position": "right"
					},
					{
						"element": document.querySelectorAll('#table_icon')[0],
						"intro": "Switch to table mode",
						"position": "left"
					},
					{
						"element": document.querySelectorAll('#chart_icon')[0],
						"intro": "Switch to chart mode",
						"position": "left"
					},

					{
						"element": document.querySelectorAll('#spark_bar_icon')[0],
						"intro": "Show spark bars alongside the table data",
						"position": "left"
					},
					{
						"element": document.querySelectorAll('#spark_line_icon')[0],
						"intro": "Show spark lines alongside the table data",
						"position": "left"
					},
					{
						"element": document.querySelectorAll('#stats_icon')[0],
						"intro": "Show stats about this table data",
						"position": "left"
					}



				]
			}



		);
		intro.start();


	});

}
