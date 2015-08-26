XtremeCart = function( cart_id ) {
	this.init(cart_id);
	return this;
}
XtremeCart.prototype = {
	constructor: this.XtremeCart,
	configured: [], // CONFIRMED BY SERVER
	configuring: [],
	cart_id: undefined,
	initialized: false,
	session_data: undefined,

	init: function (cart_id) {
		var debug_this = 0
		if (debug_this > 0 ) pr(cart_id, "XtremeCart.init(cart_id)", 2);
		this.cart_id = cart_id;
		this.import_cart(false);
	},
	import_cart: function(session_data) {
		var self = this;
		if ( !session_data ) {
			$.get(["cart", this.cart_id].join(C.DS), function(response) { self.import_cart($.parseJSON(response).data)});
			return;
		}

		if ( session_data && !this.cart_id) this.cart_id = session_data.cart_id;

		this.session_data = session_data;
		for (var uid in this.session_data.Order) {
			var orb =  new Orb(uid);
			orb.import_from_cart(session_data.Order[uid]);
			if ( this.find_by_uid(uid) ) this.delete(uid, C.CONFIGURING);
			this.configured.push( orb );
		}

		this.configuring = [];
		this.set_order_method();
	},

	/**
	 * Infers whether identifier string is a Orb model id or Orb UID
	 * @param identifier
	 * @returns {boolean}
	 */
	is_uid: function(identifier) { return String(identifier).split("_").length > 1},

	/**
	 * Generates a unique id from Orb model id and current time
	 * @param orb_id
	 * @returns {*|string}
	 */
	generate_uid: function(orb_id) { return [orb_id, now()].join("_");},

//	/**
//	 * Gets Orb model id from UID str
//	 * @param uid
//	 * @returns {*}
//	 */
//	id_from_uid: function(uid) { return uid.split("_")[0] },

//	/**
//	 * Uhhhh... I don't think this current;y works
//	 * @param orb_id
//	 */
//	cancel_config: function (orb_id) {
//		var uid = this.generate_uid(orb_id);
//		this.configuring[uid] = new Orb(uid);
//	},
//
//	/**
//	 * Removes an Orb object from cart.configur(ed/ing) and reindexes array
//	 *
//	 * @param uid
//	 * @param source
//	 * @returns {boolean}
//	 */
//	delete: function(uid, source) {
//		var search_in = source == C.CONFIGURED ? this.configured : this.configuring;
//		for (var i = 0; i < search_in.length; i++) {
//			if (search_in[i].uid == uid) {
//				array_remove(search_in, i);
//				return true;
//			}
//		}
//		return false;
//	},

	/**
	 * Searches cart.configuring for open configurations by either uid or id
	 * @param identifier
	 * @returns {*}
	 */
	find_configuration: function (identifier) {
		var orb_config =  this.is_uid(identifier) ? this.find_by_uid(identifier) : this.find_by_id(identifier, true);
		return orb_config ? orb_config[0] : false;
	},

//	// DEPRECATED I THINK....
//	has_orb: function (identifier, in_configuring, as_int) {
//		var found = 0;
//		var context = in_configuring ? this.configuring : this.orbs;
//		if ( this.is_uid(identifier) ) {
//			found = identifier in context
//		} else {
//			as_int === false; // ie. if not otherwise specified, as_int should be true for searching by ids
//			for (var uid in context) { if (context[uid].id == identifier) found += 1 }
//		}
//		if (as_int === false) return found > 1 || found === true;
//		if ( found === true  ) return 1;
//		return found === false ?  0 : found;
//	},

	add_to_cart: function (orb_id) {
		var uid = this.generate_uid(orb_id);
		if (!this.has_orb(uid, true)) {
			this.configuring.push( new Orb(uid) );
		}
		return true;
	},

//	orb_attr: function (orb_uid, attribute, in_configuration) {
//		if (!this.has_orb(orb_uid, in_configuration)) return false;
//		if (!attribute) return false;
//		attribute = this.html_id_from_attr(attribute)
//		if (attribute.is_id) return this.id_from_uid(orb_uid);
//		var context = in_configuration ? this.configuring : this.orbs;
//		if (attribute.str in context[orb_uid]) return context[orb_uid][attribute.str]
//
//		if (attribute.is_orbopt) {
//			if (attribute.opt_id in context[orb_uid]["orbopts"]) {
//				try {
//					if ('weight' in  context[orb_uid].orbopts[attribute.opt_id]) {
//						return context[orb_uid].orbopts[attribute.opt_id]['weight']; // orbs
//					}
//				} catch (e) {
//					return context[orb_uid].orbopts[attribute.opt_id]; // configuring
//				}
//			} else {
//				return -1;
//			}
//		}
//		return false;
//
//	},


	/**
	 * Returns orb with matching uid if found, else false.
	 * @param uid
	 * @returns {*}
	 */
	find_by_uid: function(uid, source) {
		var search_in = source == C.CONFIGURED ? this.configured : this.configuring;
		for (var i = 0; i < search_in.length; i++) {
			if (search_in[i].uid == uid) return [search_in[i]];
		}
		return false;
	},

	/**
	 * Returns array of Orbs in cart.configuring or first such Orb, else false.
	 * @param id
	 * @param first
	 * @returns {*}
	 */
	find_by_id: function(id, first, source) {
		var search_in = source == C.CONFIGURED ? this.configured : this.configuring;
		var found = [];
		for (var i = 0; i < search_in.length; i++) {
			if (search_in[i].id == id) {
				if (first) return [search_in[i]];
				found.push( search_in[i] );
			}
		}
		return found.length > 0 ? found : false;
	},
	/**
	 * Prepares Orbcard form for new Orb configuration or loads configuration in progress
	 * @returns Orb
	 */
	configure: function (id, price_rank) {
		var debug_this = 0;
		if (debug_this > 0) pr(id, "XT.cart.configure()", 2);
		var orb = this.find_configuration(id);
		if (!orb)  {
			orb = new Orb( id, this.generate_uid(id));
			this.configuring.push(orb);
		}

		orb.configure(price_rank);

		return orb; // for chaining
	},
	set_order_method: function (method) {
		if (method)  {
			this.session_data.Service.order_method = method;
		} else {
			method = this.session_data.Service.order_method;
		}
		if (!method) {
			this.session_data.Service.order_method = C.JUST_BROWSING;
			method = C.JUST_BROWSING;
		}
		$(XSM.menu.user_activity_panel_items).each(function () {
			var route = $($(this).children()[0]).data('route');
			if (route) {
				if (route.split(C.DS)[2] == method) {
					$(this).removeClass(FX.inactive).addClass(FX.active);
				} else {
					$(this).removeClass(FX.active).addClass(FX.inactive);
				}
			}
		});

	},
	weight_to_int: function(weight) {
		switch (weight) {
			case "-1":
				return -1;
			case "F":
				return 1;
			case "D":
				return 2;
			default:
				return 0.5;
		}
	},
//	inspect_configuration: function(uid) {
//		var orb = this.find_by_uid(uid);
//		var flags = new OptflagMap();
//
//		for (var opt_id in orb.orbopts) {
//			var opt = orb.orbopts[opt_id];
//			for (var id in opt.optflags.length) {
//				if ( opt.optflags[id] in opt_weights ) {
//					var weight_val = this.weight_to_int(opt.weight);
//					this.pricable_optflags[opt.optflags[id]] += weight_val > -1 ? weight_val : 0;
//				}
//			}
//		}
//		XT.menu.enforce_opt_rules(orb, opt_weights);
//	},
	validate_order_review: function() {
		var valid = true;
		this.session_data.Service.pay_method = $(XSM.modal.payment_method_input).val();
		if (this.session_data.Service.order_method == C.JUST_BROWSING) valid = false;
		if (this.session_data.Service.order_method == C.DELIVERY ) {
			valid = this.session_data.Service.address === true && this.session_data.Service.pay_method != undefined;
		}
		if (valid) $(XSM.modal.finalize_order_button).removeClass(XSM.effects.disabled);
	}

};

