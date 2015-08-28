/**
 * Created by jono on 8/11/15.
 */
window.xtr.route_collections.orders_api = function() {
	this.finalize_order =  {
		url: { url: "finish-ordering", defer: true, data: null, type: C.POST },
		modal: C.PRIMARY,
		propagates: false,
		callbacks: {
			params_set: function() { this.url.data = $("#OrderReviewOrderForm").serialize() },
			launch: function () {
				XT.router.cake_ajax_response(this.deferral_data, {}, true, true) }
		}
	},
	this.review_order = {
		url: { url: "review-order", type: C.GET, defer: false},
		params: ["context"],
		modal: C.PRIMARY,
		callbacks: { params_set: function() { this.modal.hide() } }
	};
	this.order_accepted = {
		url: "order-accepted",
		modal: C.PRIMARY
	};
	this.splash_order = {
				params: {method: { value: null, url_fragment: false}},
				callbacks: {
					launch: function () {
						$(XSM.splash.order_delivery).removeClass(XSM.effects.slide_left);
						$(XSM.splash.order_pickup).removeClass(XSM.effects.slide_right);
					}
				}
			};
	this.payment_method = {
		params: ['context', 'action'],
		modal: C.PRIMARY,
		callbacks: {
			params_set: function () {
				switch (this.read('context')) {
					case "review_modal":
						this.modal.payment_method(this.read('action'));
						break;
				}
			}
		}
	};
	this.order_confirmation = {
		params: {
			id: {value: null, url_fragment: true},
			status: {value: null, url_fragment: true}
		},
		modal: C.PRIMARY,
		url: {url: "order-confirmation", defer: true, type: C.POST},
		callbacks: {
			params_set: function () { if (this.read('status') == "launching" ) this.url.defer = false },
			launch: function () {
				if (this.read('status') == "launching")  return;
				XT.router.cake_ajax_response(this.deferral_data, {
					callback: function(response) {
						var request;
						switch (Number(response.data) ) {
							case 1:
								request ="order_accepted";
								break;
							case 2:
								request = "order_rejected"
								break
							case 2:
								request = "order_timeout"
								break
							default:
								request = ["order_confirmation", data.id, C.PENDING].join(C.DS);
							break;
						};
						setTimeout( function() {
							$(XT.router).trigger(C.ROUTE_REQUEST, {request: request, trigger:{}})
						}, 3000);
					},
					data: {id: this.read('id')}
				}, true, true);
			}
		}
	};
	this.set_delivery_address = {
		modal: C.PRIMARY,
		url: {url: "set-address", type: C.GET, defer: false},
		params: {context: {url_fragment:true}, restore:{url_fragment:false}},
		callbacks: {
			params_set: function () {
				if (this.read('context') == 'cancel' ) {
					this.unset('url');
					this.unset('launch');
					switch (this.read('restore')) {
						case 'menu':
							this.modal.hide();
							XT.menu.unstash();
							setTimeout(function() {
							$(XT.router).trigger(C.ROUTE_REQUEST, {request:"set_order_method/menu/just_browsing", trigger:{}});
							XT.cart.set_order_method(C.JUST_BROWSING);
							}, 300);
							break;
						case 'review':
							$(XT.router).trigger(C.ROUTE_REQUEST, {request:"review_order", trigger:{}});
						default:
							this.modal.hide();
							break;
					}
				}
			}
		}
	};
	this.set_order_method = {
		modal: C.PRIMARY,
		url: {url: "order-method", type: C.POST, defer: true},
		stash: true,
		params: {
			context: {value: null, url_fragment: true},
			method: {value: null, url_fragment: true}
		},
		callbacks: {
			params_set: function() {
				if (this.read('context') == "menu" && this.read('method') != "delivery") this.stash = false;
			},
			launch: function () {
				XT.router.cake_ajax_response(this.deferral_data, {
					callback: function(response) { XT.cart.import_cart(response.data.Cart) }
				}, true, true);
			}
		}
	};
	this.set_user_address = {
		params: ['id', 'action'],
		modal: C.PRIMARY,
		callbacks: {
			params_set: function() {
				switch (this.read('action') ) {
					case 'reveal':
						this.modal.reveal_user_addresses(this.modal, this.read('id'));
						break;
					case 'set':
						this.modal.populate_address_form(this.modal, this.read('id'));
						break;
				}
			}
		}
	};
	this.clear_cart = {
		url: { url: "clear-cart", type:C.POST, defer: true},
		callbacks: { launch: function() { XT.router.cake_ajax_response(this.deferral_data) }
		}
	};
	this.edit_orb = {
		url: {url:"update", type: C.POST, defer:true},
		params: {uid: {url_fragment: true}, opt_id:{url_fragment: true}},
		modal: C.PRIMARY,
		callbacks: {
			launch: function() {
				XT.router.cake_ajax_response(this.deferral_data, {
					callback: function(response, data) {
						XT.cart.import_cart(response.data.cart);
						if ( !(XT.cart.session_data.Order.length > 0) ) {
							$(XT.router).trigger(C.ROUTE_REQUEST, {request:"orbcard_modal/view/cart", trigger: {}});
						} else {
							XT.cart.update(data.uid, data.target);
						}
					},
					data: {
						uid: this.read('uid'),
						target: this.trigger.element
					}
				}, true, true);
			}
		}
	},
	this.cart = {
				modal: C.PRIMARY,
				params: ["action", "action_arg", "data"],
				propagates: false,
				url: {url: "add-to-cart", type: C.POST, defer: true},
				callbacks: {
					params_set: function () {
						switch ( this.read("action") )  {
							case "add":
								 this.url.data = $(XSM.menu.orb_order_form).serialize();
								break;
							case "review":
								this.url =  {
									url: "review-cart",
									type: C.GET,
									defer: false
								};
								this.stash = true;
								this.unset('launch');
								break;
							default: // ie. "cancel"
								this.unset(['url', 'launch']);
								 XT.orbcard.reset_stage( true );
								break;
						}
					},
					launch: function () {
						XT.router.cake_ajax_response(this.deferral_data, {
							callback: function(response) {
								XT.cart.import_cart(response.data.Cart);
								if ( exists(response.delegate_route) ) return;
								pr(XT.orbcard.modal);
								XT.orbcard.modal.show();
							}
						}, true, true);
					}
				}
			};
	return this
};