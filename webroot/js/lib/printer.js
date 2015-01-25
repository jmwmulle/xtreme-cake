/**
 * Created by jono on 1/20/15.
 */
function XtremePrinter() {
	this.__style_template = function() {
		return {
			font_id:null,
			alignment:null,
			line_space:null,
			width:null,
			height:null,
			indent:null,
			bold:false,
			underline: false
		}
	}

	this.styles = {}

	/**
	 * print_accepted_order()
	 *
	 * @param {obj} order
	 * @returns {void}
	 */
	this.print_accepted_order = function(order) {
		var p = ""
	    p += order.address + '\n';
		p += 'Delivery Instructions: '+ order.delivery_instructions + '\n';
		p += 'Time Ordered: '+ order.time + '\n';
		p += 'Total: $' + order.price + '\n';
		p += 'Ordered for: ' + order.order_method + '\n';
		p += 'Paying with: ' + order.payment_method + '\n';
		if (order.paid) {
			p += 'Paid: Yes\n';
		} else {
			p += 'Paid: No\n';
		}
		p += print_items(order.food);
	        print_simple(p);
	        cut(true);
	};

	/**
	 * add_style()
	 * @param name
	 * @param font_id
	 * @param alignment
	 * @param line_space
	 * @param width
	 * @param height
	 * @param indent
	 * @param bold
	 * @param underline
	 * @returns {boolean}
	 */
	this.add_style = function(name, font_id, alignment, line_space, width, height, indent, bold, underline) {
		self.styles[name] = {
			font_id: font_id,
			alignment: alignment,
			line_space: line_space,
			width: width,
			height: height,
			indent: indent,
			bold: bold,
			underline: underline
		}
		return true;
	}


	/**
	 * extend_style()
	 *
	 * @param {str} name
	 * @param {str} parent_style
	 * @param {obj} variations
	 * @returns {boolean}
	 */
	
	this.extend_style = function(name, parent_style, variations) {
		try {
			self.styles[name]=  {
						font_id: font_id,
						alignment: alignment,
						line_space: line_space,
						width: width,
						height: height,
						indent: indent,
						bold: bold,
						underline: underline
					};
			for (var attr in self.styles[name]) {
				self.styles[name][attr] = attr in variations ? variations[attr] : self.style[parent_style][attr];
			}
			return true;
		} catch (e) {
			pr(e);
			return false;
		}

	}
	
	/**
	 * show_dialog()
	 *
	 * @param {str} message
	 * @param {str} title
	 * @returns {void}
	 */
	this.show_dialog = function (message, title) {
		Android.showDialog(message, title);
	}


	/**
	 *  print_text()
	 *
	 *  @param {str} text
	 *  @param {int} font_id
	 *  @param {str} alignment
	 *  @param {int} line_space
	 *  @param {int} size_w
	 *  @param {int} size_h
	 *  @param {int} x_pos
	 *  @param {bool} bold
	 *  @param {bool} underline
	 *  @returns {void}
	 */
	this.print_text = function (text, style) {
		var s = self.styles[style];
		Android.printText(text, s.font_id, s.alignment, s.line_space, s.width, s.height, s.indent, s.bold, s.underline);
	}

	/**
	 * print_simple()
	 * @param {str} text
	 * @returns {void}
	 */
	this.print_simple = function(text) {
		print_text(text, 1, 'left', 1, 1, 1, 1, false, false);
	}

	/**
	 * print_title()
	 * @param {str} text
	 * @wraps print_simple()
	 * @returns {void}
	 */
	this.print_title = function (text) {
	print_text(text, 1, 'left', 1, 2, 2, 1, true, false);
}


	/**
	 * cut()
	 * @param {bool} feed
	 * @returns {void}
	 */
	this.cut = function (feed) {
		Android.cut(feed);
	}

	/**
	 * print_items()
	 * @param {obj} items
	 * @returns {string}
	 */
	this.print_items = function (items) {
		var ret = "";
		for (var name in items) ret += print_item(name, items[name]);
		return ret;
	}

	/**
	 * print_item()
	 * @param {str} name
	 * @param {obj} item
	 * @returns {string}
	 */
	this.print_item = function (name, item) {
		var ret = "";
		ret += item.quantity+'x '+name+'\n';
		ret += '$' + item.price + '\n';
		for (var topping in item.toppings) {
			topping = item.toppings[topping];
			ret += '\t' + topping.title + ' ' + topping.weight +'\n';
		}
		ret += item.instructions + '\n';
		return ret;
	}

	return this;
}

function openPrinter(ip) {
    return Android.openPrinter(ip);
}

function playOrderTone() {
    Android.playTone();
}
