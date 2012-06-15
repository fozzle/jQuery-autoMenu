/**
 * onThisPage scans the desired portion of the page looking for heading tags. It 
 * will generate a linked, nested unordered list that will reflect the hiearchy of headings,
 * as well as anchors at each heading tag. This list will be appended inside the selected element.
 * 
 * Params: 
 * startDepth - int: the top heading level you want to start the list at (1 for h1, 2 for h2
 * etc). Defaults to two (h2 headings). [inclusive]
 * 
 * endDepth - int: the bottom heading level you want to end the list at (1 for h1, 2 for h2, etc.) 
 * Defaults to four (h4). [inclusive]
 * 
 * scanLocation - jQuery selector: the div or element you want to scan in order to 
 * create the list. Defaults to "#content".
 * 
 * ignoreLocation - jQuery selector: the div or element you want to ignore in
 * your scan. Defaults to "#page-outline".
 * 
 * pageOffset - int: How far to push down after an anchor is clicked.
 * 
 * Example Usage: ("#menu").onThisPage({
 * 						startDepth: 2,
 * 						endDepth: 4,
 * 						scanLocation: "body"
 * 						})
 * Would create a linked, nested list looking at heading tags in the body element,
 * starting at h2, going down to h4. It would appear in any element with the id "menu". 
 */
(function($) {
	$.fn.onThisPage = function (settings) {
			settings = $.extend({  // this defines the defaults
							startDepth : 2,  // starting level param
							endDepth: 4,  // ending level param
							scanLocation: "#content",  // scan location param
							ignoreLocation: "#page-outline",  // ignore location param
							offset: 40 // how much further to scroll down past the header
						}, settings);
			var result = $('<div/>');
			var curDepth = 0;
			
			// look only in scan location
			$(settings.scanLocation).find('h1,h2,h3,h4,h5,h6').each(function() {  // filter out any headings below our desired start depth
				var startDepth = settings.startDepth;  // the depth you want to start at
				var headingDepth = parseInt(this.tagName.substring(1));  // look at the heading tag to determine depth
				var endDepth = settings.endDepth;  // where you want the depth to end
				curDepth = startDepth-1;
				// if the heading tag falls within acceptable ranges we're going
				// to want to put it in our list, so we add a heading tag to it
				if (startDepth <= headingDepth && headingDepth <= endDepth) {
					if ($(this).closest(settings.ignoreLocation).length == 0) {  // make sure the heading is not inside of the ignore location
						var slug = $(this).text()
							  .toLowerCase()
							  .replace(/[^\w ]+/g,'')
							  .replace(/ +/g,'-');  // replace spaces and parens with dashes
						
						$(this).attr('id', slug);  // anchoring 
						
						// The reason we add this heading class to every single heading
						// that meets our criteria is because it's a way to get a list
						// of all the eligible headings while preserving document order.
						// A normal heading selector would group them by tag type instead
						// of the order they appear in documents.
						$(this).addClass('heading');  
					}
				}
			});  // end heading tagger function

			$('.heading').each(function() {
				//creates a li element, containing a link via slug to the current header
				var li = $('<li/>').html($('<a/>', {href: '#'+$(this).attr("id"),
													text: $(this).text()}));
				
				var depth = parseInt(this.tagName.substring(1));  // looks at the number of the heading tag
				
				// This if block determines whether a further nested list is required
				// and if it is, it creates it. If needs to step back out of a list,
				// it will look at the current lists parent and do so. 
				// This decision is performed by comparing the "depth" of the heading
				// tag with a curDepth variable, which tracks how far "down" we 
				// currently are.
				if(depth > curDepth) { // going deeper 
					while (depth > curDepth){
						result.append($('<ul/>'));
						result = result.children('ul');
						curDepth++;
					}
					result.append(li);  // if stepping down into another list, create it, and add the li to it
					result = li;  // the new result is the li we just appended to the unordered list
				} else if (depth < curDepth) { // going shallower
					while (depth < curDepth) {
						result = result.parents('ul:first');
						curDepth--;
					}
					result.after(li);
					result = li;  // the new result is the li we were just working with
				} else { // same level
					result.parent().append(li);  // if it's the same, then simply look at the last results parent and append there
					result = li;  // the new result is the li we were just working with
				}
				
				// the curDepth is now the same as the heading we just looked at
				curDepth = depth;
			});  // end list building function
			
			result = result.parents('ul:last');  // gather the list
			$(this).append(result);  // append to desired location
			$('.heading').removeClass();  // clean up
			}
})(jQuery);