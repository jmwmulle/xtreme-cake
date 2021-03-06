/**
 * Created by jono on 8/22/14.
 * (X)treme(S)elector(M)anifest
 *
 */

var XSM = {
	global:{
		activizing_list: "ul.activizing li",
		active_list_item: "li.active",
		ajaxLink:".ajax-link",
		available: ".available",
		unavailable: ".unavailable",
		footer: "footer",
		imageQueue: "#image-loading-queue",
		loadingScreen: "#loadingScreen",
		loading: "#topbar h4.loading",
		multi_activizing: ".multi-activizing",
		page_content: "#page-content",
		preserve_aspect_ratio: ".preserve-aspect-ratio",
		route: "*[data-route]",
		onchange_route: "*[data-changeroute]",
		store_status: "#store-status",
		delivery_status: "#delivery-status",
		unknown_status: "#delivery-status",
	},
	effects: {
		active: "active",
		activizing: "activizing",
		active_by_default: "default",
		active_plus: "active-plus",
		breakout: ".breakout",
		checked: "icon-checked",
		cancel: "cancel",
		condensed: "condensed",
		detach: "detach",
		default: "default",
		disabled: "disabled",
		enabled: "enabled",
		error: "error",
		expanded: "expanded",
		exposed: "exposed",
		fade_out: "fade-out",
		fastened: "fastened",
		filter: "filter",
		fill_parent: ".fill-parent",
		flipped_x: "flipped-x",
		flipped_y: "flipped-y",
		float_label: "float-labeled",
		hidden: "hidden",
		inactive: "inactive",
		incomplete: "incomplete",
		inelligible: "inelligible",
		launching: "launching",
		loading: "loading",
		lr_only: "lr-only",
		max_of_type: "max-of-type",
		overlay: "overlay",
		pressed: "pressed",
		slide_right: "slide-right",
		register_icon: "icon-orb-card-register",
		register_reveal: "icon-orb-card-register-reveal",
		salient: "salient",
		secondary:"secondary",
		share_icon: "icon-orb-card-share",
		share_icon_reveal: "icon-orb-card-share-reveal",
		slide_down: "slide-down",
		slide_left: "slide-left",
		slide_up: "slide-up",
		solidify: "solidify",
		stash: "stash",
		success: "success",
		swap_width: "swap-width",
		transitioning: "transitioning",
		true_hidden: "true-hidden",
		unchecked: "icon-unchecked"
	},
	forms: {
		orb_order_form: "#orderOrbForm",
		order_address_form: "#orderAddressForm",
		order_information_form: "#orderInformationForm",
		users_form: "#UsersForm"
	},
	load: {
		dismissLSButton: "#dismiss-loading-screen",
		pizzaLoaderGIF: "#pizza-loader-gif",
		loadingMessage: "#loading-message",
		readyMessage: "#ready-message"
	},
	menu: {
		active_orb_name_3d_context: "#active-orb-name-3d-context",
		active_orb_name_front_face: "#active-orb-name-front-face",
		active_orb_name_back_face: "#active-orb-name-back-face",
		active_orbcat_menu_header: "#active-orbcat-menu-header",
		active_orb: ".active-orbcat-item.active",
		active_orbcat_item: ".active-orbcat-item",
		active_orbs_menu_item: "#active-orbs-menu li a",
		add_to_cart:".add-to-cart",
		cancel_order_button: "#cancel-order-button",
		confirm_order_button: "#confirm-order-button",
		double: ".double",
		full: ".full",
		left_side: ".left-side",
		right_side: ".right-side",
		float_label: "#float-label",
		inactive_sauce: ".orb-opt.sauce.inactive",
		sauce: ".orb-opt.sauce",
		monthly_content_wrapper:"#monthly-content-wrapper",
		orb_card_back: "#orb-card-back",
		ord_card_back_face: ".ord-card-back-face",
		orb_card_content_box: ".orb-card-content-box",
		orb_card_overlay: "#orb-card-overlay",
		orb_card_row: ".orb-card-row",
		orb_card_row_1: "#orb-card-row-1",
		orb_card_row_2: "#orb-card-row-2",
		orb_card_row_3: "#orb-card-row-3",
		orb_card_stage: "#orb-card-stage",
		orb_card_stage_menu_orb: "#orb-card-stage-menu-orb",
		orb_card_stage_menu_opt: "#orb-card-stage-menu-opt",
		orb_card_stage_menu_wrapper: "#orb-card-stage-menu-wrapper",
		orb_card_3d_context: "#orb-card-3d-context",
		orb_card_wrapper: "#orb-card-wrapper",
		orb_order_form: "#orderOrbForm",
		orb_order_form_orb_id: "#OrderOrbId",
		orb_order_form_orb_uid: "#OrderOrbUid",
		orb_order_form_inputs: "#orderOrbForm input",
		orb_order_form_orb_opts: "#orderOrbForm input.orb-opt-weight",
		orb_order_form_price_rank: "#OrderOrbPriceRank",
		orb_order_form_note: "#OrderOrbNote",
		orb_order_form_quantity: "#OrderOrbQuantity",
		orb_size_button: ".orb-size-button",
		orbcat_menu_title_header: "#orbcat-menu-title h1",
//		orbcat_menu_title_subtitle: "#orbcat-menu-title h1 span",
		orbcat_menu: "#orbcat-menu",
		orb_opt: ".orb-opt",
		orb_opt_no_filter: ".orb-opt.no-filter",
		orb_opt_active: ".orb-opt.active",
		orb_opt_container: "#orb-opts-container",
		orb_opt_icon: ".orb-opt-coverage",
		orb_opt_icon_active: ".orb-opt-coverage.active",
		orb_opt_filter: ".orb-opt-filter",
		orb_opt_filters: "#orb-opt-filters",  // marked for deletion
		optflag_filter_header: "#optflag-filter-header",
		orb_opt_filter_span: ".orb-opt-filter span",
		orb_opt_filter_span_checked: ".orb-opt-filter span.icon-checked",
		orb_opt_filter_span_unchecked: ".orb-opt-filter span.icon-unchecked",
		orb_opt_filter_all: ".orb-opt-filter-all",
		orb_opt_weight: ".orb-opt-weight",
		orb_opts_menu_header: "#orb-opts-menu-header",
		portionable: "portionable",
		registration_panel: "#orb-card-register-panel",
		register_button: "#register.orb-card-button",
		share_button: "#like.orb-card-button",
		self:"main#menu",
		social_panel: "#orb-card-social-panel",
		tiny_orb_opts_list: "#tiny-orb-opts-list",
		tiny_orb_opts_list_wrapper:"#tiny-orb-opts-list-wrapper",
		tiny_orb_opts_list_item: ".tiny-orb-opts-list-item",
		user_activity_panel: "#user-activity-panel",
		user_activity_panel_items: "#user-activity-panel li"
	},
	modal: {
		button: ".modal-button",
		close_modal: "#close-modal",
		confirm_address_login_panel: "#confirm-address-login-panel",
		default_content: ".default-content",
		deferred_content: ".deferred-content",
		flash: "#flash-modal",
		finalize_order_button: "#finalize-order-button",
		on_close: "#on-close",
		orb_card:"#orbcard-modal",
		overlay: "#modal-overlay-container",
		payment_method_input: "#OrderPaymentMethod",
		primary: "#primary-modal",
		primary_content: "#primary-modal-content",
		primary_deferred_content: "#primary-modal-content .deferred-content",
		social: "#social-modal",
		splash: "#splash-modal",
		submit_order_address: "#submit-order-address",
		submit_order_button_wrapper: "#submit-order-button-wrapper"
	},
	splash:{
		self:"#splash",
		bar_contents: "#splash-bar-content",
		content:"#splash > .content",
		circle:"#splash-circle",
		circleWrap:"#splash-circle-wrapper",
		detached: "#splash .detach",
		fastened:"#splash .fastened",
		logo:"#splash-logo",
		logo_wrapper:"#splash-logo-wrapper",
		logoClone:"#splash-logo_fasten-clone",
		menu:"#menu",
		menu_wrapper:"#menu-wrapper",
		menu_spacer:"#menu-wrapper .spacer",
		modal:"#splash-modal",
		modalWrap:"#splash-modal-wrapper",
		modalContent:"#splash-modal .content",
		openingDeal:"grand-opening-deal",
		order:"#order",
		order_delivery: "#splash-order-delivery",
		order_delivery_wrapper: "order-delivery-wrapper",
		order_pickup_wrapper: "order-pickup-wrapper",
		order_pickup: "#splash-order-pickup",
		order_spacer:"#order-wrapper .spacer",
		preserve_aspect_ratio: "#splash *.preserve-aspect-ratio",
		splash_bar:"#splash-bar",
		splash_bar_wrapper:"#splash-bar-wrapper",
		splash_link: ".splash-link"
	},
	topbar: {
		self: "#topbar",
		social_loading: "#social-loading",
		icon_row: "#topbar .icon-row",
		topbar_cart_button: "#top-bar-view-cart",
		hover_text_link: ".topbar-social  a",
		hover_text_label: "#topbar-hover-text-label",
		hover_text_label_incoming: "#topbar-hover-text-label span.incoming",
		hover_text_label_outgoing: "#topbar-hover-text-label span.outgoing"
	},
	pos: {
		self: "body#pos",
		back_splash: "#back-splash",
		customer_name: "#customer-name",
		error_pane: "#error-pane",
		food_list: "#food-list",
		next_order: "#next-order",
		new_order_tone: "files/new_order_tone.mp3",
		accept_acknowledge: "#accept-acknowledge",
		order_accept_button: "#order-accept-button",
		order_accept_button_pressed: "#order-accept-button.pressed",
		order_content: "#order-content",
		order_address: "td#address",
		order_customer: "td#customer",
		order_food: "td#food",
		order_count: "#order-count",
		order_count_bubble: "#pending-orders-count",
		order_reject_confirmation: "#order-reject-confirmation",
		pending_orders_list: "#pending-orders-list"
	},
	vendor_ui: {
		add_orbopt_form: "#OrboptVendorUiForm",
		menu_table: "#menu-table",
		menu_options_tab: "#menu-options-tab",
		menu_tab: "#menu-tab",
		orbopts_table: "#menu-options-table",
		orb_attr_display: "div.orb-attr.display",
		orb_attr_edit: "div.orb-attr.edit",
		orbopt_attr_display: "div.orbopt-attr.display",
		orbopt_attr_edit: "div.orbopt-attr.edit",
		orbopt_add_breakout: "#orbopt-add-breakout",
		orbopt_pricelist_add_breakout: "#orbopt-pricelist-add-breakout",
		orbopt_pricelist_add: "#orbopt-pricelist-add",
		orb_add_form: "#OrbAddForm",
		orbopt_config_form_wrapper: ".orbopt-config-form",
		orbopt_optgroup_config_form: "#orbopt-optgroup-config-form",
		orbopt_selection_template: "#orbopt-selection-template",
		price_dict_update_form: ".price-dict-update-form",
		specials_tab: "#specials-tab",
		specials_table: "#specials-table",
		specials_attr_display: "div.specials-attr.display",
		specials_attr_edit: "div.specials-attr.edit",
		ui_tabs: "#ui-tabs"
	},
	footer: {
		self:"footer#footer"
	},
	generated: {
		vendor_ui_opts_input: function(orb_id) { return "#orb-" + orb_id + "-orbopts"; },
		vendor_ui_opts_config_id: function(orb_id) { return "#orb-" + orb_id + "-orbopts-config" },
		vendor_orb_title: function(size, title) {
		},
		order_form_opt_id: function(opt_id) {
			opt_id = opt_id.split("-")[2]
			return as_id("OrderOrbOrbopt" + opt_id)
		},
		orb_card_row_content: function(row) { return "#orb-card-row-" + row + " div.orb-card-content" },
		orb_opt_id: function(opt_id) { return as_id("orb-opt-coverage-" + opt_id); },
		order_address_button: function(context) {
			var classes;
			var route = "confirm_address/submit" + C.DS + context;
			var message;
			var wrapper = '<a href="#" id="submit-order-address" class="'
			var cancel = '<a href="#" class="modal-button lrg bisecting cancel left""';
				cancel += ' data-route="confirm_address/cancel' + C.DS + context +'">';
				cancel += '<span class="icon-circle-arrow-l"></span><span class="text">Cancel</span></a>';

			if (context == "menu") {
				classes = ["modal-button", "lrg", "bisecting", "confirm", "right"];
				message = '<span class="text">OK!</span><span class="icon-circle-arrow-r"></span></a>';
			}
			if (context == "review") {
				cancel = "";
				classes= ["modal-button", "lrg", "full-width", "confirm"];
				message = '<span class="text">BACK TO CHECKOUT!</span><span class="icon-circle-arrow-r"></span></a>';
			}
			wrapper += classes.join(" ") + '" data-route="' + route + '">';
			return cancel + wrapper + message;
		}
	},
	page_name: {
		vendor_ui: "Vendor Interface",
		splash: "Splash Page",
		menu: "Xtreme Menu"
	}
};

var FX = XSM.effects;
