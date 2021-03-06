/**
 * J. Mulle, for XtremePizza, 9/5/14 1:03 AM
 * www.introspectacle.net
 * Email: this.impetus@gmail.com
 * Twitter: @thisimpetus
 * About.me: about.me/thisimpetus
 */



window.XBS = {
//	init: function (is_splash, page_name, host, cart) {
//		XBS.cart = xbs_cart;
//		XBS.data = xbs_data;
//		XBS.event = xbs_events;
//		XBS.layout = xbs_layout;
//		XBS.modal = xbs_modal;
//		XBS.menu = xbs_menu;
//		XBS.printer = new XtremePrinter();
//		XBS.routing = xbs_routing;
//		XBS.splash = xbs_splash;
//		XBS.validation = xbs_validation;
//		XBS.vendor = xbs_vendor;
//		XBS.vendor_ui = xbs_vendor_ui;
//		XBS.setHost(host);
//		XBS.data.Service = cart.Service;
//		XBS.data.Order = cart.Order;
//		XBS.data.User = cart.User;
//		XBS.data.Invoice = cart.Invoice;
//		XBS.data.store_status = store_status;
//		XBS.data.cfg.page_name = page_name;
//		XBS.data.cfg.is_splash = is_splash === true;
//		var init_status = {
//			cart: XBS.cart.init(cart),
//			layout: XBS.layout.init(),
//			menu: XBS.menu.init(),
//			modal: XBS.modal.init(),
//			printer: XBS.printer.is_xtreme_tablet() ? XBS.printer.init() : 'not_tablet',
//			routing: XBS.routing.init(),
//			store: XBS.store_status(),
//			splash: XBS.splash.init(),
//			vendor: XBS.vendor.init()
//		};
//
//		if (XBS.data.cfg.page_name == XSM.page_name.vendor_ui) XBS.vendor_ui.init();
//
//		if (XBS.data.debug === false && XBS.data.cfg.page_name != XSM.page_name.vendor_ui) {
//			$(XBS.routing).trigger(C.ROUTE_REQUEST, {request: 'launch_apology', trigger: {}});
//		}
//	},

	store_status: function() {
		for (var key in XBS.data.store_status) {
			if (XBS.data.store_status[key] == "true") XBS.data.store_status[key] = true;
			if (XBS.data.store_status[key] == "false") XBS.data.store_status[key] = false
		};
		var store_status_text;
		var store_status_class;
		var delivery_status_text;
		var delivery_status_class;


		if (XBS.data.store_status.delivering) {
			delivery_status_text = C.DELIVERING;
			delivery_status_class = stripCSS(XSM.global.available);
		} else {
			delivery_status_text = C.PICKUP_ONLY;
			delivery_status_class = stripCSS(XSM.global.unavailable);
		}

		if (XBS.data.store_status.open) {
			store_status_text = C.OPEN;
			store_status_class = stripCSS(XSM.global.available);
		} else {
			store_status_text = C.CLOSED;
			store_status_class = ['store-closed', stripCSS(XSM.global.unavailable)].join(" ");
			delivery_status_text = null;
		}
		$(XSM.global.store_status).html(store_status_text).addClass(store_status_class);
		$(XSM.global.delivery_status).html(delivery_status_text).addClass(delivery_status_class);

//		var inspected_recently = (Date.UTC() - Date.parse( XBS.data.store_status.time ) ) > XBS.data.cfg.store_status_inspection_timeout;
//		pr(Date.UTC() - Date.parse( XBS.data.store_status.time));
//		if ( !inspected_recently || !XBS.data.store_status.reachable && 2+3 < 1) {
//			$(XSM.global.store_status).hide();
//			$(XSM.global.delivery_status).hide();
//			$(XSM.global.unknown_status).show();
//		}
	}
};