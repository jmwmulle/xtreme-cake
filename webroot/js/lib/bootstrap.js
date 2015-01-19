/**
 * J. Mulle, for XtremePizza, 9/5/14 1:03 AM
 * www.introspectacle.net
 * Email: this.impetus@gmail.com
 * Twitter: @thisimpetus
 * About.me: about.me/thisimpetus
 */
window.XBS = {
	data: {
		host_root_dirs: {
			xDev: "",
			xProd: "",
			xLoc: "xtreme"
		},
		orb_card_out_face: C.FRONT_FACE,
		orb_card_animation_queue: {
			animating: false,
			queued: 0
		},
		orb_opts: {
		},
		orb_opt_filters: {
		},
		order: {
			method: C.JUST_BROWSING,
			address: {
				address_1: null,
				address_2: null,
				postal_code: null,
				instructions: null
			},
			payment: null
		},
		current_orb_card: null,
		delays: {
			global_transition: 300,
			default_js_refresh: 30,
			orb_card_row_toggle: 800,
			menu_stash_delay: 900,
			fold_splash: 3000,
			splash_set_order_method: 3900
		},
		partial_orb_configs: {
		},
		user: {
			name: {
				first: null,
				last: null
			},
			address: {
				address_1: null,
				address_2: null,
				postal_code: null,
				instructions: null
			}
		}
	},
	cfg: {
		root: null,
		developmentMode: true,
		minLoadTime: 1
	},
	evnt: {
		wakeFromSleep: eCustom("wakeFromSleep"),
		assetsLoaded: eCustom("assetsLoaded"),
		route_launched: eCustom("route_launched"),
		orb_card_refresh: eCustom(C.ORB_CARD_REFRESH),
		order_form_update: eCustom(C.ORDER_FORM_UPDATE),
		order_ui_update: eCustom(C.ORDER_UI_UPDATE),
		route_request: eCustom(C.ROUTE_REQUEST),
		orb_row_animation_complete: eCustom(C.ORB_ROW_ANIMATION_COMPLETE)
	},
	routing: {
		init: function () {
			// From the DOM
			$(C.BODY).on(C.CLK, XSM.global.route, null, function (e) {
				if ( !$(e.currentTarget).hasClass(XSM.effects.disabled) ) {
					$(XBS.routing).trigger(C.ROUTE_REQUEST, {request: $(e.currentTarget).data('route'), trigger: e});
				}
			});

			// Manual requests
			$(this).on(C.ROUTE_REQUEST, function (e, data) {
				var route = this.route(data.request, data.trigger);
				if (route) this.launch(route, e);
			});
		},
		/**
		 * launch() creates and runs an instance of the class from passed param array
		 * @param params
		 * @param event
		 * @returns {boolean}
		 */
		launch: function (route) {
			var debug_this = 0;
			if (debug_this > 0) pr([parent_route, params], "XBS.routing.launch(parent_route, params, event)", 2);
			var launch_delay = 0
			var hide_class = false;
			if (route.stash) {
				launch_delay = 900;
				if (XBS.data.orb_card_out_face == C.BACK_FACE) launch_delay += 960;
			}
			if (route.overlay) launch_delay = 300;
			if (in_array(route.modal, [XSM.modal.primary, XSM.modal.splash]))  hide_class = XSM.effects.slide_up;
			if (hide_class && !$(route.modal).hasClass(hide_class) && route.url.defer == false) {
				launch_delay += 300;
				XBS.layout.dismiss_modal(route.modal, false);
			}
			// >>> RESIZE & POSITION PRIMARY IF NEEDED <<<
			XBS.layout.resize_modal(route.modal)

			// >>> LAUNCH MODALS IF REQUIRED<<<
			if (route.url.url) {
				var launch_triggered = false;
				try {
					$(XSM.global.loading).removeClass(XSM.effects.fade_out);
					$.ajax({
						type: route.url.type ? route.url.type : C.POST,
						url: route.url.url,
						data: "data" in route.url ? route.url.data : null,
						statusCode: {
							403: function () {
								XBS.routing.launch("flash/fail");
								if (!launch_triggered) {
									launch_triggered = true;
									$(route).trigger("route_launched", "403_FORBIDDEN")
								}
							}
						},
						success: function (data) {
							// >>> DO PRE-LAUNCH EFFECTS <<<
							$(XSM.global.loading).addClass(XSM.effects.fade_out);
							if (route.stash) XBS.menu.stash_menu();
							if (route.overlay) $(XSM.modal.overlay).show().removeClass(XSM.effects.fade_out);
							setTimeout(function () {
								if (debug_this > 2) pr([route, data], route.__debug("launch/success"));
								if (route.url.defer) {
									route.set_deferal_data(data);
								} else {
									$(route.modal_content).html(data)
									if (hide_class) $(route.modal).removeClass(hide_class);
								}
								$(route).trigger(C.ROUTE_LAUNCHED, {launch_msg: "TRIGGERED_POST_SUCCESS"});
							}, launch_delay);
						},
						fail: function () {
							$(XSM.global.loading).addClass(XSM.effects.fade_out);
							if ("fail_callback" in route) {
								route.fail_callback();
							} else {
								XBS.layout.launch_route(XBS.routes.fail_flash);
							}
							if (!launch_triggered) {
								launch_triggered = true;
								$(route).trigger(C.ROUTE_LAUNCHED, {launch_msg: "FAIL_TRIGGER"})
							}
						},
						always: function () {
							$(XSM.global.loading).addClass(XSM.effects.fade_out);
							if (!launch_triggered) {
								$(route).trigger(C.ROUTE_LAUNCHED, {launch_msg: "FALLBACK_TRIGGER"})
							}
						}
					});
				} catch (e) {
					if (!launch_triggered) {
						launch_triggered = true;
						$(route).trigger(C.ROUTE_LAUNCHED, {launch_msg: "CAUGHT_EXCEPTION"})
					}
					$(XBS.routes).trigger(C.ROUTE_REQUEST, {request: "flash"});
				}
			} else {
				$(route).trigger(C.ROUTE_LAUNCHED, {launch_msg: "NO_AJAX"});
			}
			delete route;
			return true;
		},
		route: function (request, event) {
			var routes = {
				confirm_address: new XtremeRoute("confirm_address", {
					modal: XSM.modal.primary,
					url: {url: "confirm-address", type: C.GET, defer: true},
					params: ['context', 'restore'],
					callbacks: {
						params_set: function () {
							var on_close = "<div id='on-close' class='true-hidden' data-action='unstash'></div>";
							switch (this.read('context')) {
								case "review":
									this.set_callback("launch", function (e) {
										var data = this.deferal_data;
										var modal = this.modal;
										var modal_content = this.modal_content;
										XBS.layout.dismiss_modal(modal, false);
										setTimeout(function () {
											$(modal_content).html(data);
											$(XSM.modal.on_close).replaceWith(on_close);
											$(XSM.modal.submit_order_address).replaceWith(
												XSM.generated.order_address_button('review')
											);
											setTimeout(function () { $(modal).removeClass(XSM.effects.slide_up);}, 30);
										}, 600);
									});
									break;
								case "splash":
									this.set_callback("launch", function (e) {
										var data = this.deferal_data;
										var modal = this.modal;
										var modal_content = this.modal_content;
										XBS.layout.dismiss_modal(modal, false);
										setTimeout(function () {
											$(modal_content).html(data);
											$(XSM.modal.submit_order_address).replaceWith(
												XSM.generated.order_address_button('menu')
											);
											$(XSM.modal.on_close).replaceWith(on_close);
											setTimeout(function () { $(modal).removeClass(XSM.effects.slide_up);}, 30);
										}, 600);
									});
									break;
								case "menu":
									this.url.defer = false;
									break;
								case "submit":
									this.unset('url');
									this.unset('modal');
									var secondary_launch = false;
									if (this.read('restore') == "review") secondary_launch = "order/review";
									if (this.read('context') == "menu") secondary_launch = "menu";
									this.set_callback("launch", function () {
											XBS.validation.submit_address(this, secondary_launch);
										}
									);
							}
						}
					}
				}),
				close_modal: new XtremeRoute("close_modal", {
					params: ["modal", "on_close"],
					callbacks: {
						launch: function () {
							var action = $(XSM.modal[this.read("modal")]).find(XSM.modal.on_close)[0];
							if (action) {
								XBS.layout.dismiss_modal(this.read("modal"), $(action).data('action'));
							} else {
								XBS.layout.dismiss_modal(this.read("modal"), false);
							}
						}
					}
				}),
				continue_ordering: new XtremeRoute("continue_ordering", {
					callbacks: {
						launch: function () {
							XBS.menu.show_orb_card_front_face()
							setTimeout(function () {
								XBS.layout.dismiss_modal();
								XBS.menu.reset_orb_card_stage();
							}, 900);
						}
					}
				}),
				flash: new XtremeRoute("flash", {
					params: {type: { url_fragment: false}},
					modal: XSM.modal.flash,
					behavior: C.OL,
					callbacks: {
						launch: function () {
							$(this.modal_content).html("<h5>Oh Noes!</h5><p>Something went awry there. Let us know so we can fix it!</p>");
							$(this.modal).removeClass(XSM.effects.slide_up);
						}
					}
				}),
				favorite: new XtremeRoute("favorite", {
					params: {context: {value: null, url_fragment: false}},
					url: {url: "favorite"},
					data: false,
					callbacks: {
						modal: XSM.modal.flash,
						params: function () { this.data = $(XSM.menu.orb_order_form).serialize(); },
						launch: function (e, resp) { pr(resp);}
					}
				}),
				finish_ordering: new XtremeRoute("finish_ordering", {
					modal: XSM.modal.primary,
					url: {url: "review-order"},
					behavior: C.STASH_STOP
				}),
				footer: new XtremeRoute("footer", {
					params: ["method"],
					callbacks: {
						launch: function () {
							if ($(XSM.global.footer).hasClass('reveal')) {
								$(XSM.global.footer).addClass('stow');
								setTimeout(function () {
									$(XSM.global.footer).removeClass('reveal');
									setTimeout(function () {
										$(XSM.global.footer).removeClass('stow');
									}, 30);
								}, 30);
							}
							if (!$(XSM.global.footer).hasClass('reveal')) {
								$(XSM.global.footer).addClass('reveal');
							}
						}
					}
				}),
				login: new XtremeRoute("login", {
					url: {url: false, type: C.POST},
					modal: XSM.modal.primary,
					params: {
						context: {},
						channel: {url_fragment: true},
						restore: {}
					},
					callbacks: {
						params_set: function () {
							var context = this.read('context');
							var channel = this.read('channel');
							var restore = this.read('restore');
							pr(this.params, "login::params");
							switch (context) {
								case "confirm-address":
									switch (channel) {
										case "email":
											this.unset("url");
											this.set_callback('launch', function () {
												$(XBS.routing).trigger(C.ROUTE_REQUEST, {
													request: "login/modal/email/confirm-address",
													trigger: this.trigger
												});
											});
											break;
										default:
											this.unset('url');
											this.unset('modal');
											this.set_callback('launch', function () {
												$(XSM.modal.confirm_address_login_panel).hide().removeClass(XSM.effects.true_hidden);
												setTimeout(function () {
													$(XSM.modal.confirm_address_login_panel).show('clip');
												}, 30);
											})
									}
								break;
								case "modal":
									this.url = {url:"login/email", defer:false, type: C.GET};
									if (restore) {
										this.set_callback('launch', function() {
											pr("got here");
											$("#on-close").replaceWith(
												'<div id="on-close" class="true-hidden" data-action="restore/confirm_address"></div>');
										});
									}
									break;
								default:
									if (channel == "email") {
										this.url.url = "login/email";
										this.url.type = C.GET;
//											this.url.defer = true;
										this.set_callback("launch", function () {
											pr("login/email");
											pr(this.deferal_data);
										})
									}
								}
						},
						launch: function () {
							window.location = "http://development-xtreme-pizza.ca/auth/" + this.read('channel');
						}
					}
				}),
				menu: new XtremeRoute("menu", {
					params: ['reveal_method'],
					modal: false,
					url: {url: "menu"},
					callbacks: {
						params_set: function() {
							if (this.read('reveal_method') == 'unstash') {
								this.unset('url');
								this.unset('launch_callback');
								XBS.layout.dismiss_modal(XSM.modal.primary);
								setTimeout(function() { XBS.menu.unstash_menu();}, XBS.data.delays.global_transition);
							}
						},
						launch: function () { XBS.splash.fold();}
					}
				}),
				menuitem: new XtremeRoute("menuitem", {
					url: {url: "menuitem"},
					params: {orb_id: {value: null, url_fragment: true}}
				}),
				orbcat: new XtremeRoute("orbcat", {
					params: {
						id: {value: null},
						name: { value: null}
					},
					callbacks: {
						params_set: function () {
							XBS.menu.refresh_active_orbcat_menu(this.params.id.value, this.params.name.value);
						}
					}
				}),
				orb: new XtremeRoute("orb", {
					params: { id: {value: null} },
					callbacks: { params_set: function () { XBS.menu.refresh_orb_card_stage(this.params.id.value); } }
				}),
				orb_opt: new XtremeRoute("orb_opt", {
					params: ["layer", "element", "title", "weight"],
					behavior: C.STOP,
					callbacks: {
						params_set: function () {
							switch (this.read('layer')) {
								case 'weight':
									if ($(this.trigger.element).hasClass(XSM.effects.enabled)) {
										this.trigger.event.stopPropagation();
										XBS.menu.toggle_orb_opt_icon(this.trigger.element, false);
									}
									break;
								case "opt":
									XBS.menu.toggle_orb_opt(this.read('element'), false);
									break;
							}
						}
					}
				}),
				orb_card: new XtremeRoute("orb_card", {
					params: ["method", "channel", "data"],
					stop_propagation: true,
					callbacks: {
						params_set: function () {
							var launch = false;
							if (in_array(this.read('method'), ['share', 'register'])) {
								launch = function () { XBS.menu.toggle_orb_card_row_menu(this.read('method'), null);}
							};
							if (this.read('method') == 'configure') {
								XBS.menu.configure_orb(this.read('channel'), this.read('data'));
							}
							if (this.read('method') == 'add_to_cart') {
								if (this.read('channel') == 'confirm') {
									launch = function () {XBS.menu.add_to_cart();}
								}
								if (this.read('channel') == 'cancel') {
									launch = XBS.menu.reset_orb_card_stage();
								}
							}
							if (launch) this.set_callback("launch", launch)
						}
					}
				}),
				order: new XtremeRoute("order", {
					params: ["method", "context"],
					url: { url: "review-order", type: C.GET, defer: false},
					modal: XSM.modal.primary,
					callbacks: {
						params_set: function () {
							switch (this.read('method')) {
								case "clear":
									this.url = { url: "clear-cart", type: C.GET, defer: true};
									this.set_callback("launch", function () {
										if (this.deferal_data) {
											// todo: handle cart-clearance verification
										}
										XBS.menu.clear_cart();
										XBS.layout.dismiss_modal(XSM.modal.primary);
									});
									break;
								case "view":
									this.url.url = "cart";
									this.url.defer = false;
									this.change_behavior(C.STASH_STOP);
									this.unset("launch");
									break;
								case "finalize":
									this.url.url = "order-confirmation";
									this.url.type = C.POST;
									this.url.defer = false;
									this.unset('launch');
									this.set_callback("launch", function() {
										var data = this.deferal_data;
										if (!data.error) {
											$(XBS.routing).trigger(C.ROUTE_REQUEST, {
												request:"/pending_order"+ C.DS + data.order_id + C.DS + "launching",
												trigger:this.trigger.event
											});
										}
									});
									break;
								case "review":
									if (this.read('context') == 'orb_card') {
										this.__set_behavior(C.STASH_STOP);
									}
									break;
							}
						},
						launch: function (e, fired_from) {
							if (this.deferal_data) {
								var data = $.parseHTML(this.deferal_data);
								$(XSM.modal.primary).addClass(XSM.effects.slide_down);
								setTimeout(function () {
									var default_content = $(XSM.modal.primary).find(XSM.modal.default_content)[0];
									$(default_content).replaceWith(data);
									$(XSM.modal.primary).hide()
										.removeClass(XSM.effects.slide_down)
										.addClass(XSM.effects.slide_up).show();
									setTimeout(function () {
										$(XSM.modal.primary).removeClass(XSM.effects.slide_up);
									}, 30);
								}, 300);
							} else {
								XBS.cart.validate_order_review();
							}
						}
					}
				}),
				order_method: new XtremeRoute("order_method", {
					modal: XSM.modal.primary,
					modal: false,
					url: {url: "order-method", type: C.POST, defer: true},
					params: {
						context: {value: null, url_fragment: false},
						method: {value: null, url_fragment: true}
					},
					callbacks: {
						launch: function () {
							var route = "flash/We weren't able to reach the store to place a delivery request. But you can always try calling!"
					        var response = $.parseJSON(this.deferal_data);
							var trigger = this.trigger.event;
							if ("success" in response && response.success === true) {
								XBS.data.order.order_method = this.read('method');
								if (this.read('method') == "delivery") {
									route = "confirm_address/" + this.read('context')
								} else {
									switch (this.read('context')) {
										case "splash":
											route = "menu";
											break;
										case "review":
											route = "order/review";
											break;
										case "menu":
											return true;
									}
								}
							} else if ("error" in response) {
								route = "flash/" + response.error;
							}
							$(XBS.routing).trigger(C.ROUTE_REQUEST, {request: route, trigger: trigger});
						}
					}
				}),
				payment_method: new XtremeRoute("payment_method", {
					params: ['context', 'method'],
					callbacks: {
						params_set: function() {
							switch (this.read('context') ) {
								case "review_modal":
									XBS.data.order.payment = this.read('method');
									$(XSM.modal.payment_method_input).val(this.read('method'));
									break;
							}
						}
					}
				}),
				pending_order: new XtremeRoute("pending_order", {
					params:{
						order_id: {value:null, url_fragment:true},
						status: {value:null, url_fragment:false}
					},
					modal: XSM.modal.primary,
					url: {url:"order-confirmation", defer: true, type: C.POST},
					callbacks: {
						params_set: function() {
							switch (this.read('status') ) {
								case "launching":
									this.url.defer = false;
									this.set_callback("launch", function() {
										$(XBS.routing).trigger(C.ROUTE_REQUEST, {
											request: "pending_order"+ C.DS + this.read('order_id' + C.DS + 'check'),
											trigger:this.trigger.event
										});
									});
									break;
							}
						},
						launch: function() {
							var data = this.deferal_data;
							if (data.status = "pending") {
								setTimeout(function() {
									$(XBS.routing).trigger(C.ROUTE_REQUEST, {
										request: "pending_order"+ C.DS + this.read('order_id' + C.DS + 'check'),
										trigger:this.trigger.event
									});
								}, 3000);
							}
						}
					}
				}),
				print: new XtremeRoute("print", {
					params: ["print_str", "font_id", "alignment", "line_space", "size_w", "size_h", "x_pos", "bold", "underline"],
					callbacks: {
						launch: function () {
							$(C.BODY).append($("<div />").attr('id', 'js_temp_out').css({position: "fixed", top: 200 + C.PX, left: 0, zIndex: 100000, width: 400 + C.PX, backgroundColor: "rgb(45,45,45)", color: "white"}));
							try {
								print_response = window.JSInterface.printText(
									this.read('print_str'),
									this.read('font_id'),
									this.read('alignment'),
									this.read('line_space'),
									this.read('size_w'),
									this.read('size_h'),
									this.read('x_pos'),
									this.read('bold'),
									this.read('underline'));
								$("#js_temp_out").html(print_response);
								console.log(print_response);
							} catch (e) {
								console.log(e);
							}
						}
					}
				}),
				register: new XtremeRoute("register", {
					modal: XSM.modal.primary,
					url: {url: "sign-up", type: C.POST, defer: true},
					params: {
						context: {},
						channel: {value: null, url_fragment: false},
						restore: {},
						hide_reg: {value: false}
					},
					callbacks: {
						params_set: function () {
							var channel = this.read('channel');
							switch (this.read('context')) {
								case "modal":
									this.url.defer = true;
									if (in_array(channel, ['email', "submit"])) this.url.url = false;
									if (in_array(channel, ["twitter", "facebook", "google"])) {
										this.add_param("hide-reg", true, false);
										this.url.url = "auth/" + channel;
									}
									if (channel == 'submit') {
										this.set_callback("launch", function () { XBS.validation.submit_register(this);})
									}
									break;
								case "topbar":
									this.url.defer = false;
									this.unset('launch');
									break;
								case "orb_card":
									this.set_callback("launch", function () {
										var data = this.deferal_data;
										$(XSM.modal.primary_content).html(data);
										$($(XSM.modal.primary).find(".register-link.email")[0]).addClass(XSM.effects.active);
										XBS.menu.toggle_orb_card_row_menu("register", C.HIDE);
										setTimeout(function () {
											$(XSM.modal.primary).removeClass(XSM.effects.slide_up);
											setTimeout(function () {
												$("#registration-method-bar").addClass("diminish");
												setTimeout(function () {
													$(XSM.modal.primary_deferred_content).removeClass(XSM.effects.slide_left);
												}, XBS.data.delays.global_transition);
											}, XBS.data.delays.global_transition);
										}, XBS.data.delays.orb_card_row_toggle);
									});
									break;
							}
						},
						launch: function () {
							pr("launch callback firing", this.__debug("calbacks/launch"), 2);
							var container = $(this.modal).find(XSM.modal.deferred_content)[0];
							var load_time = 30;
							$("#registration-method-bar").addClass("diminish");
							setTimeout(function () {
								$(".register-link.email").addClass(XSM.effects.active);
								if (this.deferal_data) {
									$(container).replaceWith(
										$("<div/>").addClass([XSM.modal.deferred_content, XSM.effects.slide_left].join(" "))
											.html(this.deferal_data)
									);
								}
								setTimeout(function () { $(container).removeClass(XSM.effects.slide_left);}, load_time);
							}, 300);
						}
					}
				}),
				splash_order: new XtremeRoute("splash_order", {
					params: {method: { value: null, url_fragment: false}},
					callbacks: {
						launch: function () {
							$(XSM.splash.order_delivery).removeClass(XSM.effects.slide_left);
							$(XSM.splash.order_pickup).removeClass(XSM.effects.slide_right);
						}
					}
				}),
				submit_registration: new XtremeRoute("submit_registration", {
					modal: XSM.modal.primary,
					url: {url: false, type: C.POST, defer: true},
					params: {channel: {value: false, url_fragment: false}},
					callbacks: {
						launch: function () {
							if (this.read('channel') == "email") {
								XBS.validation.submit_register(this);
							} else {
								this.url.url = "auth" + C.DS + this.read('channel');
							}
						}
					}
				}),
				submit_order_address: new XtremeRoute("submit_order_address", {
					params: { is_splash: {value: null, url_fragment: false}},
					url: {url: "confirm-address/session", type: C.GET, defer: false},
					callbacks: {
						launch: function () { XBS.validation.submit_address(this);}
					}
				}),
				view_order: new XtremeRoute("view_order", {
					params: {context: {value: "default", url_fragment: false}},
					modal: XSM.modal.primary,
					url: {url: "cart"},
					behavior: C.STASH_STOP
				})
			}
			var request = request.split(C.DS);
			if (request[0] in routes) {
				var route = routes[request[0]];
				route.__init(request[0], event);
				route.init(request.slice(1));
				return route;
			}
			return false;
		}
	},

	/*******************************************************************************************************************
	 *                                                                                                                 *
	 *                                                     INIT                                                        *
	 *                                                                                                                 *
	 *******************************************************************************************************************/
	init: function (is_splash, page_name, host, cart) {
		XBS.cfg.page_name = page_name;
		XBS.cfg.is_splash = is_splash === true;
		XBS.fn.setHost(host);
		var init_status = {
			cart: XBS.cart.init(cart),
			layout: XBS.layout.init(),
			splash: XBS.splash.init(),
			menu: XBS.menu.init(),
			routing: XBS.routing.init()
		};
		if (XBS.data.debug) pr(init_status, "init status");
	},
	layout: {
		init: function () {
			var sit_rep = XBS.fn.execInitSequence({"XBS.layout.jq_binds": XBS.layout.jq_binds});
			if (XBS.cfg.is_splash) XBS.layout.detachAnimationTargets();
			var page_content_height = window.innerHeight - ($(XSM.global.topbar).innerHeight() + 3 * C.REM) + C.PX;
			$(XSM.global.page_content).css({minHeight: page_content_height});
			setTimeout(function () {
				$(XSM.topbar.social_loading).addClass(XSM.effects.fade_out);
				setTimeout(function () {
					$(XSM.topbar.social_loading).hide(XSM.effects.fade_out);
					setTimeout(function () {
						$(XSM.topbar.icon_row).removeClass(XSM.effects.true_hidden)
						setTimeout(function () {
							$(XSM.topbar.icon_row).removeClass(XSM.effects.fade_out);
						}, 30);
					}, 0);
				}, 0);
			}, 0);

			return sit_rep;
		},
		detachAnimationTargets: function () {
			$(XSM.global.detachable).each(function () { XBS.layout.detach(this);});
		},
		jq_binds: {
			has_init_sequence: true,
			bind_orb_card_config_archiving: function () {
				$(C.BODY).on(XBS.evnt.orb_card_refresh, null, null, function (e) {
					XBS.menu.archive_orb_card_config(e.data);
				});

				return true;
			},
			init_modals: function () {
				/** initially hide overlay & bind dismiss-on-click */
				$(XSM.modal.overlay).addClass(XSM.effects.fade_out).hide().removeClass(XSM.effects.true_hidden);
//				$(C.BODY).on(C.CLK, XSM.modal.overlay, null, XBS.layout.dismiss_modal);
			},
			bind_activizing_lists: function () {
				$("body").on(C.CLK, XSM.global.activizing_list, function (e) {
					XBS.layout.activize(e.currentTarget);
				});

				return true
			},
			bind_multi_activizing_siblings: function () {
				$(C.BODY).on(C.CLK, XSM.global.multi_activizing, function (e) {
					XBS.layout.multi_activize(e.currentTarget);
				});

				return true
			},
			bind_float_labels: function () {
				$(C.BODY).on(C.MOUSEENTER, asClass(XSM.effects.float_label), null, function (e) {
					XBS.layout.toggle_float_label($(e.currentTarget).data('float-label'), C.SHOW);
				});
				$(C.BODY).on(C.MOUSEOUT, asClass(XSM.effects.float_label), null, function (e) {
					XBS.layout.toggle_float_label($(e.currentTarget).data('float-label'), C.HIDE);
				});

				return true;
			},
			bind_splash_links: function () {
				$(C.BODY).on(C.CLK, XSM.splash.splash_link, null, function (e) {
					XBS.splash.redirect($(e.currentTarget).data('url'));
				});
				return true;
			},
			bind_topbar_hover_links: function () {
				var debug_this = false;
				/** show hover-text */
				$(C.BODY).on(C.MOUSEENTER, XSM.topbar.hover_text_link, null, function (e) {
					if (!$(e.currentTarget).hasClass(XSM.effects.disabled)) {
						if (debug_this) pr("firing!");
						XBS.layout.toggle_topbar_hover_text($(e.currentTarget).data('hover_text'));
					}
				});
				$(C.BODY).on(C.MOUSEOUT, XSM.topbar.hover_text_link, null, function (e) {
					if (!$(e.currentTarget).hasClass(XSM.effects.disabled)) XBS.layout.decay_topbar_hover();
				});
			},
			window_resize_listener: function () {
				if (XBS.cfg.is_splash) {
					$(window).on("resize", XBS.splash.render);
				}
				return true;
			}
		},
		assert_aspect_ratio: function (targets) {
			$(targets).each(function () {
				$(this).removeAttr("style");
				var data = $(this).data("aspectRatio");
				var ratio = Number(data.x) / Number(data.y);
				var respect = data.respect;

				/* make sure the ratio is indeed a ratio */
				if (!isInt(ratio) && !isFloat(ratio)) {
					var ratioVals = ratio.split("/");
					if (ratioVals.length !== 2) throw "Invalid value for argument 'ratio'; must be int, float or string matching n/m";
					ratio = Number(ratioVals[0]) / Number(ratioVals[1]);
				}

				var dimensions = {width: $(this).innerWidth(), height: $(this).innerHeight()};
				if (respect != "y") {
					dimensions.height = dimensions.width / ratio;
				} else {
					dimensions.width = dimensions.height * ratio;
				}
				$(this).css(dimensions);
			});
			return true;
		},
		activize: function (element) {
			if (isEvent(arguments[0])) element = element.currentTarget;
			if ($(element).hasClass(XSM.effects.inactive)) {
				$(element).removeClass(XSM.effects.inactive)
					.addClass(XSM.effects.active)
					.siblings(XSM.global.active_list_item)
					.each(function () {
						$(this).removeClass(XSM.effects.active).addClass(XSM.effects.inactive);
					});
			}
		},
		detach: function (element) {
			var isStatic = $(element).data('static');
			var height = $(element).innerHeight();
			$(element).css({height: height});
			if (isStatic) XBS.layout.fasten(element);
			return $(element);
		},
		dismiss_modal: function (modal, action) {
			var debug_this = 0;
			if (debug_this > 0) pr([modal, action], "XBS.layout.dismiss_modal(modal, action)", 2);
			$(XSM.modal.primary).addClass(XSM.effects.slide_up);
			$(XSM.modal.flash).addClass(XSM.effects.slide_up);
			$(XSM.modal.splash).addClass(XSM.effects.slide_up);
			$(XSM.modal.orb_card).hide('clip');
			setTimeout(function () {
				$(XSM.modal.overlay).addClass(XSM.effects.fade_out);
				setTimeout(function () { $(XSM.modal.overlay).hide(); }, 300);
			}, 300);
			if (action) {
				switch (action) {
					case "reset-user-activity":
						$(XSM.menu.user_activity_panel).children().each(function () {
							if ($(this).hasClass(XSM.effects.active)) {
								$(this).removeClass(XSM.effects.active).addClass(XSM.effects.inactive);
							}
							if ($(this).hasClass(XSM.effects.active_by_default)) $(this).addClass(XSM.effects.active);
						});
						break;
					case "unstash":
						XBS.menu.init();
						XBS.menu.unstash_menu();
						break;
				}
			}
			return true;
		},
		fasten: function (selector) {
			var debug_this = false;
			//todo: error handling & logic for objects vs arrays
			var selectors = ( isArray(selector) ) ? selector : [selector];
			for (var i in selectors) {
				var sel = selectors[i];
				var offset = $(sel).offset();

				var dims = {width: Math.floor($(sel).outerWidth() + px_to_int($(sel).css("padding-left"))),
					height: Math.floor($(sel).outerHeight() + px_to_int($(sel).css("padding-top")))};
				var styles = {position: "fixed", top: offset.top, left: offset.left, height: dims.height, width: dims.width};
				if (debug_this) pr(styles);
				$(sel).css(styles).addClass("fastened");
			}
			return  (isArray(selector) ) ? selector : $(selector);
		},
		multi_activize: function (element) {
			if ($(element).hasClass('active')) {
				$(element).removeClass('active').addClass('inactive')
					.children(asClass(XSM.effects.checked)).each(function () {
						$(this).removeClass(XSM.effects.checked).addClass(XSM.effects.unchecked);
					});
			} else if ($(element).hasClass('inactive')) {
				$(element).removeClass('inactive').addClass('active')
					.children(asClass(XSM.effects.unchecked)).each(function () {
						$(this).removeClass(XSM.effects.unchecked).addClass(XSM.effects.checked);
					});
			}
		},
		resize_modal: function (modal) {
			if (!modal) return;
			var modal_width;
			var modal_max_height;
			var modal_left;
			var modal_top;
			if (modal == XSM.modal.primary) {
				modal_width = 1200 / 12 * 8;
				modal_max_height = 0.8 * $(window).innerHeight();
				modal_top = 0.1 * $(window).innerHeight();
				var pm_width = 0.8 * $(window).innerWidth();
				if (pm_width > modal_width) {
					modal_left = ($(window).innerWidth() - modal_width) / 2;
				} else {
					modal_left = 0.1 * $(window).innerWidth();
				}
				if (pm_width < modal_width) modal_width = pm_width;
			}
			if (modal == XSM.modal.flash) {
				modal_width = 40 * C.REM;
				modal_left = (window.innerWidth / 2) - ( modal_width / 2);
				modal_max_height = "default";
				modal_top = 2 * C.REM;
			}

			$(modal).css({
				top: modal_top,
				left: modal_left,
				width: modal_width,
				maxHeight: modal_max_height
			});
		},
		toggle_float_label: function (label, state) {
			if (state == C.SHOW) $(XSM.menu.float_label).html(str_to_upper(label)).addClass(XSM.effects.exposed);
			if (state == C.HIDE) $(XSM.menu.float_label).removeClass(XSM.effects.exposed).html('');

			return true;
		},
		toggle_loading_screen: function () { $(XSM.global.loadingScreen).fadeToggle(); },
		toggle_topbar_hover_text: function (hover_text, state) {
			var debug_this = false;
			if ($(XSM.topbar.hover_text_label_outgoing).html() == hover_text) return;
			if (debug_this) pr([hover_text, state], "toggle_topbar_hover_text(hover_text, state)");
			$(XSM.topbar.hover_text_label_outgoing).removeClass("decay").addClass(XSM.effects.slide_right);
			$(XSM.topbar.hover_text_label_incoming).html(hover_text).removeClass(XSM.effects.true_hidden);
			setTimeout(function () {
				$(XSM.topbar.hover_text_label_incoming).removeClass(XSM.effects.slide_left);
				setTimeout(function () {
					setTimeout(function () {
						$(XSM.topbar.hover_text_label_outgoing).remove();
						setTimeout(function () {
							$(XSM.topbar.hover_text_label_incoming).removeClass("incoming").addClass("outgoing")
							$(XSM.topbar.hover_text_label).append("<span class='incoming slide-left true-hidden'></span>");
						}, 10);
					}, 280);
				}, 10);
			}, 10);
		},
		decay_topbar_hover: function () {
			var id = (new Date).getTime();
			$(XSM.topbar.hover_text_label_outgoing).addClass("decay " + id);
			setTimeout(function () {
				$(XSM.topbar.hover_text_label_outgoing + ".decay." + id).addClass(XSM.effects.fade_out);
				setTimeout(function () {
					$(XSM.topbar.hover_text_label_outgoing + ".decay." + id).replaceWith(
						"<span class='outgoing'>Halifax loves pizza and we love halifax!</span>");
				}, 300);
			}, 1000);
			return true;
		}
	},
	menu: {
		init: function () {
			var init_ok = true;
			if (XBS.cfg.page_name == C.MENU) {
				init_ok = XBS.fn.execInitSequence({"XBS.menu.jq_binds": XBS.menu.jq_binds});
				try {
					if (!XBS.data.current_orb_card) XBS.menu.load_from_cart($(XSM.menu.active_orb).data('orb'));
				} catch (e) {
					init_ok.state = false;
					init_ok.message = "current_orb_card not set; nothing loaded from cart";
				}
				XBS.menu.update_orb_opt_filters_list(C.CHECK);

				if (!is_mobile()) {
					$(XSM.global.footer).css({top: $(XSM.global.page_content).innerHeight()});
					XBS.layout.fasten(XSM.menu.self).css({overflow: "hidden"});
				}
			}
			XBS.menu.set_order_method();
			return  init_ok
		},
		jq_binds: {
			has_init_sequence: true,
			hide_orb_card_back_face_elements: function () {
				$(XSM.menu.orb_opt).hide();
				$(XSM.menu.orb_opts_menu_header).hide().removeClass(XSM.effects.hidden);
				return true;
			},
			bind_orbsize_update: function () {
				$(C.BODY).on(C.CLK, XSM.menu.orb_size_button, null, function (e) {
					XBS.menu.price_rank_update($(e.currentTarget).data('priceRank'));
				});

				return true;
			},
			bind_topping_methods: function () {
				/** orb_opt filtering (check all) */
				$(C.BODY).on(C.CLK, XSM.menu.orb_opt_filter_all, null, function (e) {
					e.stopPropagation();
					XBS.menu.filter_orb_opts(false, $(e.currentTarget).data('all'));
				});

				/** orb_opt filtering (individual) */
				$(C.BODY).on(C.CLK, XSM.menu.orb_opt_filter, null, function (e) {
					e.stopPropagation();
					XBS.menu.filter_orb_opts(e.currentTarget);
				});

				return true;
			},
			order_update_listeners: function () {
				/** order form manual change */
				$(C.BODY).on("change", XSM.menu.orb_order_form, null, XBS.cart.configure);

				/** order form update */
				$(C.BODY).on(C.ORDER_FORM_UPDATE, null, null, XBS.menu.update_orb_configuration_ui);

				/** order UI update */
				$(C.BODY).on(C.ORDER_UI_UPDATE, null, null, XBS.menu.update_orb_form);

				return true;
			}
		},
		add_to_cart: function () {
			// todo: ajax fallbacks
			$.ajax({
				type: C.POST,
				url: "orders/add_to_cart",
				data: $(XSM.menu.orb_order_form).serialize(),
				success: function (data) {
					data = JSON.parse(data);
					if (data.success == true) {
						XBS.cart.add_to_cart();
						$(XSM.modal.orb_card).show('clip');
						$(XSM.topbar.topbar_cart_button).show()
						setTimeout(function () {
							$(XSM.topbar.topbar_cart_button).removeClass(XSM.effects.fade_out);
						}, 300);
					}
				}
			});
		},
		clear_cart: function () {
			XBS.data.cart = {};
			$(XSM.topbar.topbar_cart_button).addClass(XSM.effects.fade_out);
			setTimeout(function () {
				$(XSM.topbar.topbar_cart_button).hide();
				XBS.menu.unstash_menu();
			}, 300);
			return true;
		},
		configure_orb: function (orb_id, price_rank) {
			var debug_this = 0;
			if (debug_this > 1) pr([orb_id, price_rank], "XBS.menu.configure_orb(orb_id, price_rank)", 2);
			$(XSM.menu.orb_size_button).each(function () {
				if ($(this).data('priceRank') == price_rank) XBS.layout.activize(this);
			});
			XBS.menu.show_orb_card_back_face()
		},
		reset_orb_opt_filters: function () {
			$(XSM.menu.orb_opt_filter).removeClass(XSM.effects.inactive).addClass(XSM.effects.active);
			$(XSM.menu.orb_opt_filter_span).removeClass(XSM.effects.unchecked).addClass(XSM.effects.checked);
			XBS.menu.update_orb_opt_filters_list(C.CHECK);
			return true;
		},
		filter_orb_opts: function (target, all) {
			pr([target, all], "filter_orb_opts(target, all)");
			if (all == C.CHECK) {
				$(XSM.menu.orb_opt_filter).removeClass(XSM.effects.inactive).addClass(XSM.effects.active);
				$(XSM.menu.orb_opt_filter_span).removeClass(XSM.effects.unchecked).addClass(XSM.effects.checked);
				XBS.menu.update_orb_opt_filters_list(C.CHECK);
			}

			if (all == C.UNCHECK) {
				$(XSM.menu.orb_opt_filter).removeClass(XSM.effects.active).addClass(XSM.effects.inactive);
				$(XSM.menu.orb_opt_filter_span).removeClass(XSM.effects.checked).addClass(XSM.effects.unchecked);
				XBS.menu.update_orb_opt_filters_list(C.UNCHECK);
				pr(XBS.data.orb_opt_filters, "filters post uncheck all");
			}

			if (target) {
				var filter = $(target).data('filter');
				if (XBS.data.orb_opt_filters[filter] == C.CHECK) {
					XBS.data.orb_opt_filters[filter] = C.UNCHECK;
				} else {
					XBS.data.orb_opt_filters[filter] = C.CHECK;
				}
				var checkbox = $(target).children(XSM.menu.orb_opt_filter_span)[0];
				if ($(target).hasClass(XSM.effects.active)) {
					$(target).removeClass(XSM.effects.active).addClass(XSM.effects.inactive);
					$(checkbox).removeClass(XSM.effects.checked).addClass(XSM.effects.unchecked);
				} else {
					$(target).removeClass(XSM.effects.inactive).addClass(XSM.effects.active);
					$(checkbox).removeClass(XSM.effects.unchecked).addClass(XSM.effects.checked);
				}
			}
			$(XSM.menu.orb_opt).addClass(XSM.effects.fade_out);
			setTimeout(function () {
				$(XSM.menu.orb_opt).show();
				$.map($(XSM.menu.orb_opt), function (orb_opt, index) {
					$.map($(orb_opt).data('flags'), function (flag) {
						if (flag in XBS.data.orb_opt_filters) {
							if (XBS.data.orb_opt_filters[flag] == C.UNCHECK) {
								$(orb_opt).hide();
							}
						}
					});
				});
				setTimeout(function () { $(XSM.menu.orb_opt).removeClass(XSM.effects.fade_out); }, 30);
			}, 300);

			return true;
		},
		/**
		 *
		 * @param orb_id
		 * @returns {boolean}
		 */
		load_from_cart: function (orb_id) {
			if (!XBS.cart.initialized) return false;

			if (XBS.cart.has_configuration_started(orb_id)) {
				$(XSM.menu.orb_order_form_inputs).each(function () {
					$(this).val(XBS.cart.orb_attr(orb_id, $(this).attr('id'), true));
				});
				$(C.BODY).trigger(C.ORDER_FORM_UPDATE);
			}

			return true;
		},
		price_rank_update: function (price_rank) {
			$(XSM.menu.orb_order_form_price_rank).val(price_rank);
			return true;
		},
		/**
		 * Updates bottom menu to reflect choices of clicked orbcat in top menu.
		 *
		 * @param orbcat_id
		 * @param orbcat_name
		 */
		refresh_active_orbcat_menu: function (orbcat_id, orbcat_name) {
			pr([orbcat_id, orbcat_name], "refresh_active_orbcat_menu()");
			// todo: fallback on ajax fail
			var url = "menu" + C.DS + orbcat_id
			if (XBS.cfg.root.length != 0) url = C.DS + XBS.cfg.root + C.DS + url;


			$.get(url,function (data) {
				var active_orbcat_menu = $.parseHTML(data)[1];
				var orb_route = $($(data).find(XSM.menu.active_orbcat_item)[0]).data('route');
				var active_orb_id = orb_route.split(C.DS)[1];

				// >>> TOGGLE MENU HEADER; alternates rotating front-to-back or back-to-front <<<
				if ($(XSM.menu.active_orb_name_3d_context).hasClass(XSM.effects.flipped_x)) {
					$(XSM.menu.active_orb_name_front_face).html(orbcat_name);
					$(XSM.menu.active_orb_name_3d_context).removeClass(XSM.effects.flipped_x);
				} else {
					$(XSM.menu.active_orb_name_back_face).html(orbcat_name);
					$(XSM.menu.active_orb_name_3d_context).addClass(XSM.effects.flipped_x);
				}

				// >>> HIDE INCOMING ORBCATS; hide new data so they fade-in when shown <<<
				$(active_orbcat_menu).find(XSM.menu.active_orbcat_item).each(function () {
					$(this).addClass(XSM.effects.fade_out);
				});
				// >>> HIDE OUTGOING ORBCATS; hide all active orbcats in orb card stage menu before replacing them <<<
				$(XSM.menu.active_orbcat_item).addClass(XSM.effects.fade_out);
				$(XSM.menu.orbcat_menu_title_subtitle).addClass(XSM.effects.fade_out);

				XBS.menu.refresh_orb_card_stage(active_orb_id);

				setTimeout(function () {
					$(XSM.menu.active_orbcat_item).remove()
					setTimeout(function () {
						$(XSM.menu.orbcat_menu_title_subtitle).html(orbcat_name).removeClass(XSM.effects.fade_out);
						$(active_orbcat_menu).find(XSM.menu.active_orbcat_item).each(function () {
							$(this).appendTo(XSM.menu.orb_card_stage_menu);
						});
						setTimeout(function () {$(XSM.menu.active_orbcat_item).removeClass(XSM.effects.fade_out);}, 30);
					}, 300);
				}, 300);
			}).then(function () { $(C.BODY).trigger(C.ORB_CARD_REFRESH); });
		},
		/**
		 * Updates orb card when an orb is clicked in the bottom menu.
		 *
		 * @param orb_card_id
		 */
		refresh_orb_card_stage: function (orb_card_id) {
			pr(orb_card_id, "refresh_orb_card_stage");
			// todo: fallback on ajax fail
			XBS.data.current_orb_card = orb_card_id;
			var url = "menuitem" + C.DS + orb_card_id
			if (XBS.cfg.root.length != 0) url = C.DS + XBS.cfg.root + C.DS + url

			$.get(url, function (data) {
				var orb_card_stage = $.parseHTML(data)[0];

				// >>> EXTRACT ORB OPTS <<<
				var orb_opts = $($(orb_card_stage).find(XSM.menu.orb_opt_container)[0]).find(XSM.menu.orb_opt);
				var filters = $(orb_card_stage).find(XSM.menu.orb_opt_filters)[0];
				var replace_time = 0;

				// >>> REMOVE ORB OPTS BEFORE EXTRACTION <<<
				$(orb_card_stage).find(XSM.menu.orb_opt_container)[0].remove();

				// >>> HIDE INCOMING ORBOPTS <<<
				$(orb_opts).each(function () { $(this).hide().addClass(XSM.effects.fade_out);});

				// >>> HIDE INCOMING ORBCARD SPECIFICS & ORB OPTS <<<
				$(orb_card_stage).find(XSM.menu.orb_card_content_container).each(function () {
					$(this).addClass(XSM.effects.fade_out);
				});
				$($(orb_card_stage).find(XSM.menu.orb_opt_container)[0]).find(XSM.menu.orb_opt).each(function () {
					$(this).addClass([XSM.effects.fadeOut, XSM.effects.true_hidden].join(" "));
				});
				// >>> UNFLIP ORBCARD IF FLIPPED <<<
				if ($(XSM.menu.orb_card_3d_context).hasClass(XSM.effects.flipped_y)) {
					replace_time = 950;
					XBS.menu.show_orb_card_front_face();
				}
				$(asClass(XSM.effects.swap_width)).each(function () {
					replace_time = 800;
					XBS.menu.toggle_orb_card_row_menu($($(this).children(".orb-card-button")[0]).attr('id'), C.HIDE)
				});
				setTimeout(function () {
					// >>> FADE OUT OUTGOING ORBCARD CONTENT <<<
					$(XSM.menu.orb_card_content_container).addClass(XSM.effects.fade_out);
					setTimeout(function () {
						// >>> REPLACE ORBCARD <<<
						$(XSM.menu.orb_card_stage).replaceWith(orb_card_stage);
						setTimeout(function () { $(XSM.menu.orb_card_content_container).removeClass(XSM.effects.fade_out);}, 30);
						// >>> REPLACE ORBOPTS (REMAIN HIDDEN/ FADED) <<<
						$(XSM.menu.orb_opt).remove();
						$(XSM.menu.orb_opt_filters).replaceWith(filters);
						XBS.menu.update_orb_opt_filters_list(C.CHECK);
						$(orb_opts).each(function () { $(this).appendTo(XSM.menu.orb_card_stage_menu); });
						XBS.menu.load_from_cart(orb_card_id);
					}, 300);
				}, replace_time);
			});
		},
		reset_orb_card_stage: function () {
			pr("<no args>", "reset_orb_card_stage()");
			$(XSM.menu.orb_order_form_price_rank).val(0);
			$(XSM.menu.orb_size_button).each(function () {
				$(this).removeClass(XSM.effects.active).addClass(XSM.effects.inactive);
			});
			$(XSM.menu.orb_order_form_quantity).val(1);
			$(XSM.menu.orb_order_form_prep_instrux).val("");
			XBS.cart.cancel_config($(XSM.menu.orb_order_form_orb_id).val());
			XBS.menu.show_orb_card_front_face();
			$(C.BODY).trigger(C.ORDER_FORM_UPDATE);
			$(C.BODY).trigger(C.ORDER_UI_UPDATE);
		},
		toggle_orb_card_row_menu: function (menu, state) {
			var row;
			var button;
			var panel;
			if (menu == "register") {
				row = XSM.menu.orb_card_row_1;
				button = XSM.menu.register_button;
				panel = XSM.menu.registration_panel;
			} else {
				row = XSM.menu.orb_card_row_3;
				button = XSM.menu.share_button;
				panel = XSM.menu.social_panel;
			}

			if ($(panel).hasClass(XSM.effects.true_hidden)) $(panel).removeClass(XSM.effects.true_hidden);
			if (!state) state = $(row).hasClass(XSM.effects.swap_width) ? C.HIDE : C.SHOW;

			if (state == C.HIDE) {
				var wait_for_complete = 0;
				if (!(XBS.data.orb_card_animation_queue.animating === false)) {
					if (XBS.data.orb_card_animation_queue.queued > 1) {
						return;
					}
					XBS.data.orb_card_animation_queue.queued += 1;
					wait_for_complete = new Date().getTime() - XBS.data.orb_card_animation_queue.start;
				}
				setTimeout(function () {
					XBS.data.orb_card_animation_queue.start = new Date().getTime();
					if (!$(row).hasClass(XSM.effects.swap_width)) return;
					$(panel).addClass(XSM.effects.fade_out);
					setTimeout(function () {
						$(panel).hide();
						$(button).addClass(XSM.effects.stash);
						setTimeout(function () {
							$(row).removeClass(XSM.effects.swap_width);
							setTimeout(function () { $(button).removeClass(XSM.effects.stash);}, 300);
							$(XBS).trigger(C.ORB_ROW_ANIMATION_COMPLETE, {menu: menu, finished: C.SHOW});
						}, 500)
					}, 300);
				}, wait_for_complete);
			}

			if (state == C.SHOW) {
				var wait_for_complete = 0;
				if (!(XBS.data.orb_card_animation_queue.animating === false)) {
					if (XBS.data.orb_card_animation_queue.queued > 1) {
						return;
					}
					XBS.data.orb_card_animation_queue.queued += 1;
					wait_for_complete = new Date().getTime() - XBS.data.orb_card_animation_queue.start;
				}
				setTimeout(function () {
					XBS.data.orb_card_animation_queue.start = new Date().getTime();
					if ($(row).hasClass(XSM.effects.swap_width)) return;
					$(row).addClass(XSM.effects.swap_width);
					if (!$(panel).hasClass(XSM.effects.fade_out)) $(panel).addClass(XSM.effects.fade_out);
					$(panel).show();
					setTimeout(function () {
						setTimeout(function () {
							$(panel).removeClass(XSM.effects.fade_out);
						}, 300);
						$(XBS).trigger(C.ORB_ROW_ANIMATION_COMPLETE, {menu: menu, finished: C.HIDE});
					}, 300)
				}, wait_for_complete);
			}

			return true;
		},
		set_order_method: function (method) {
			if (method)  {
				XBS.data.order.order_method = method;
			} else {
				method = XBS.data.order.order_method;
			}

			$(XSM.menu.user_activity_panel_items).each(function () {
				var route = $($(this).children()[0]).data('route');
				if (route) {
					if (route.split(C.DS)[2] == method) {
						$(this).removeClass(XSM.effects.inactive).addClass(XSM.effects.active);
					} else {
						$(this).removeClass(XSM.effects.active).addClass(XSM.effects.inactive);
					}
				}
			});

		},
		show_orb_card_front_face: function () {
			var debug_this = 0;
			if (debug_this > 0) pr("<no args>", "XBS.menu.show_orb_card_front_face()", 2);
			XBS.data.orb_card_out_face = C.FRONT_FACE;
			// >>> START FLIP & FADE OUT ORBOPTS TOGETHER <<<
			$(XSM.menu.orb_card_3d_context).removeClass(XSM.effects.flipped_y);
			$(XSM.menu.orb_opt).addClass(XSM.effects.fade_out);
			setTimeout(function () {
				// >>> SLIDE OUT FILTER HEADER, HIDE ORBOPTS <<<
				$(XSM.menu.orb_opts_menu_header).addClass(XSM.effects.slide_right);
				$(XSM.menu.orb_opt).hide();
				setTimeout(function () {
					// >>> RESET FILTERS & SHOW ORBCAT ITEMS <<<
					XBS.menu.reset_orb_opt_filters();
					$(XSM.menu.active_orbcat_item).show()
					setTimeout(function () { $(XSM.menu.active_orbcat_item).removeClass(XSM.effects.fade_out);}, 30);
					setTimeout(function () {
						// >>> SLIDE IN ORBCAT ITEMS HEADER; RESTORE 'ACTIVIZING' <<<
						$(XSM.menu.orb_opts_menu_header).hide()
						$(XSM.menu.active_orbcat_menu_header).show();
						setTimeout(function () { $(XSM.menu.active_orbcat_menu_header).removeClass(XSM.effects.slide_left);}, 30);
						$(XSM.menu.orb_card_stage_menu).addClass(XSM.effects.activizing);
					}, 300);
				}, 300);
			}, 300);

			return true;
		},
		show_orb_card_back_face: function () {
			XBS.data.orb_card_out_face = C.BACK_FACE;
			var row_menu_hide_time = 0;
			$(asClass(XSM.effects.swap_width)).each(function () {
				row_menu_hide_time = 800;
				XBS.menu.toggle_orb_card_row_menu($($(this).children(".orb-card-button")[0]).attr('id'), C.HIDE)
			});
			setTimeout(function () {
				// >>> START FLIP & FADE OUT ORBOPTS TOGETHER <<<
				$(XSM.menu.orb_card_3d_context).addClass(XSM.effects.flipped_y);
				$(XSM.menu.active_orbcat_item).addClass(XSM.effects.fade_out);
				setTimeout(function () {
					// >>> SLIDE OUT ORBCAT ITEMS HEADER, HIDE ORBCAT ITEMS <<<
					$(XSM.menu.active_orbcat_menu_header).addClass(XSM.effects.slide_left);
					$(XSM.menu.active_orbcat_item).hide();
					setTimeout(function () {
						// >>> SHOW & FADE IN ORBOPTS<<<
						$(XSM.menu.orb_opt).show()
						setTimeout(function () {$(XSM.menu.orb_opt).removeClass(XSM.effects.fade_out);}, 30);
						setTimeout(function () {
							// >>> SLIDE IN FILTER HEADER; REMOVE 'ACTIVIZING' <<<
							$(XSM.menu.active_orbcat_menu_header).hide();
							$(XSM.menu.orb_opts_menu_header).show();
							setTimeout(function () { $(XSM.menu.orb_opts_menu_header).removeClass(XSM.effects.slide_right);}, 30);
							$(XSM.menu.orb_card_stage_menu).removeClass(XSM.effects.activizing);
						}, 300);
					}, 300);
				}, 300);
			}, row_menu_hide_time);
		},
		stash_menu: function () {
			var orb_card_timeout = 0;
			if (XBS.data.orb_card_out_face == C.BACK_FACE) {
				orb_card_timeout = 960;
				XBS.menu.show_orb_card_front_face();
			}
			setTimeout(function () {
				$(XSM.menu.user_activity_panel).addClass(XSM.effects.slide_up);
				setTimeout(function () {
					$(XSM.menu.orb_card_wrapper).addClass([XSM.effects.slide_left, XSM.effects.fade_out].join(" "));
					setTimeout(function () {
						$(XSM.menu.orbcat_menu).addClass([XSM.effects.slide_right, XSM.effects.fade_out].join(" "));
					}, 300);
				}, 300);
			}, orb_card_timeout);
		},
		unstash_menu: function () {
			$(XSM.menu.orbcat_menu).removeClass([XSM.effects.slide_right, XSM.effects.fade_out].join(" "));
			// todo: this is a bit of a hack; the over-all logic should preclude this next line, but,
			// todo: "activizing" gets toggled during the orbcard flip, and if it's in the wrong state, toggles inversely
			// todo: making orb-opts unselectable
			$(XSM.menu.orb_card_stage_menu).addClass(XSM.effects.activizing);
			setTimeout(function () {
				$(XSM.menu.orb_card_wrapper).removeClass([XSM.effects.slide_left, XSM.effects.fade_out].join(" "));
				setTimeout(function () {
					$(XSM.menu.user_activity_panel).removeClass(XSM.effects.slide_up);
				}, 300);
			}, 300);
			XBS.menu.set_order_method();
		},
		toggle_orb_opt: function (element, trigger_update) {
			var debug_this = 1;
			if (debug_this > 0) pr([element, trigger_update], "XBS.menu.toggle_orb_opt(element, trigger_update)", 2);
			if ($(element).hasClass(XSM.effects.active)) {
				$(element).removeClass(XSM.effects.active).addClass(XSM.effects.inactive);
				$(element).find(XSM.menu.orb_opt_icon).each(function () {
					$(this).removeClass(XSM.effects.enabled).addClass(XSM.effects.disabled);
				});
			} else {
				$(element).removeClass(XSM.effects.inactive).addClass(XSM.effects.active);
				$(element).find(XSM.menu.orb_opt_icon).each(function () {
					$(this).removeClass(XSM.effects.disabled).addClass(XSM.effects.enabled);
				});
			}
			// let animations complete before walking DOM for smoothness
			if (trigger_update === true) setTimeout(function () { $(C.BODY).trigger(C.ORDER_UI_UPDATE);}, 300);
			return true;
		},
		toggle_orb_opt_icon: function (element, trigger_update) {
			var debug_this = 1;
			if (debug_this > 0) pr([element, trigger_update], "XBS.menu.toggle_orb_opt_icon(element, trigger_update)", 2);
			XBS.layout.activize(element); // wraps activize so event propagation can be stopped
			if (trigger_update === true) $(C.BODY).trigger(C.ORDER_UI_UPDATE);
			return true;
		},
		update_orb_form: function () {
			var tiny_toppings_list = $("<ul/>").addClass(selToStr(XSM.menu.tiny_orb_opts_list));

			//$(XSM.menu.orb_opt_weight).each(function () { $(this).val(-1);});
			$(XSM.menu.orb_opt).each(function () {
				var topping_name = $(this).data("name");
				var weight = -1;
				if ($(this).hasClass(XSM.effects.active)) {
					weight = $($(this).find(XSM.menu.orb_opt_icon_active)[0]).data(C.WEIGHT);
					$("<li/>").addClass(stripCSS(XSM.menu.tiny_orb_opts_list_item))
						.append("<span class='tiny-opt-label'>" + topping_name + "</span>")
						.append(C[weight])
						.appendTo(tiny_toppings_list);
				}

				$(XSM.generated.order_form_order_opt($(this).data('id'))).val(weight);
			});

			$(XSM.menu.tiny_orb_opts_list_wrapper).html(tiny_toppings_list);
			XBS.cart.configure();
		},

		/**
		 *  updates visual state of orb card toppings & icons
		 *  to respect current state of the underlying form
		 */
		update_orb_configuration_ui: function () {
			$(XSM.menu.orb_order_form_orb_opts).each(function () {
				var weight_dict = {D: true, F: true, L: true, R: true};
				var weight = $(this).val();
				var opt_id = XSM.generated.orb_opt_id(XBS.cart.from_attribute_id_str($(this).attr('id')).opt_id);
				if (weight in weight_dict) {
					XBS.menu.toggle_orb_opt(opt_id, false);
					var icon = XSM.generated.orb_opt_icon(opt_id, weight);
					XBS.menu.toggle_orb_opt_icon(icon, false);
				}
			});
			var price_rank = $(XSM.menu.orb_order_form_price_rank).val()
			XBS.layout.activize($(XSM.menu.orb_size_button + "[data-price-rank=" + price_rank + "]"));
			return true;
		},
		update_orb_opt_filters_list: function (target_state) {
			if (target_state != C.CHECK && target_state != C.UNCHECK) target_state = C.CHECK;
			XBS.data.orb_opt_filters = {}
			$(XSM.menu.orb_opt_filter).each(function () {
				XBS.data.orb_opt_filters[$(this).data('filter')] = target_state;
			});
			return true;
		}
	},
	cart: {
		orbs: {}, // CONFIRMED BY SERVER
		configuring: {orbopts: {}}, // ORB_ID: {CONFIG}
		initialized: false,
		empty_config: {
			quantity: null,
			orbopts: {},
			preparation_instructions: null,
			price_rank: null
		},
		attributes_object: {
			str: null,
			is_id: false,
			is_quanity: false,
			is_prep_instrux: false,
			is_orbopt: false,
			opt_id: null
		},

		init: function (cart_from_session) {
			var debug_this = 1;
			if (debug_this > 0 ) pr(cart_from_session, "XBS.cart.init(cart details)", 2);
			XBS.data.order = cart_from_session.Order;
			XBS.cart.orbs = Object.keys(cart_from_session.OrderItem).length > 0 ? cart_from_session.OrderItem : {};
			XBS.cart.initialized = true;
			XBS.cart.configuring = {};
			return true;
		},
		tally: function () {},
		cancel_config: function (orb_id) { XBS.cart.configuring[orb_id] = jQuery.extend({}, XBS.cart.empty_config); },
		has_configuration_started: function (orb_id) { return XBS.cart.has_orb(orb_id, true); },
		has_orb: function (orb_id, in_configuring) {
			return in_configuring ? orb_id in XBS.cart.configuring : orb_id in XBS.cart.orbs;
		},
		from_attribute_id_str: function (attribute_str) {
			var attr_ob = jQuery.extend({}, XBS.cart.attributes_object);
			attribute_str = camelcase_to_pep8(attribute_str.replace("OrderOrb", ""));
			if (attribute_str == "id") {
				attr_ob.is_id = true;
				attr_ob.str = "id";
			}
			if (attribute_str == "quantity") {
				attr_ob.is_quantity = true;
				attr_ob.str = "quantity";
			}
			if (attribute_str == "preparation_instructions") {
				attr_ob.is_prep_instrux = true;
				attr_ob.str = "preparation_instructions";
			}
			if (attribute_str.substr(0, 6) == "orbopt") {
				attr_ob.is_orbopt = true;
				attr_ob.opt_id = attribute_str.split("_")[1];
				attr_ob.str = "orbopt";
			}
			return attr_ob;
		},
		add_to_cart: function (orb_id) {
			if (!XBS.cart.has_orb(orb_id, true)) {
				XBS.cart.configuring[orb_id] = jQuery.extend({}, XBS.cart.empty_config);
			}
			return true;
		},
		orb_attr: function (orb_id, attribute, in_configuration) {
			if (!XBS.cart.has_orb(orb_id, in_configuration)) return false;
			if (!attribute) return false;
			attribute = XBS.cart.from_attribute_id_str(attribute)
			if (attribute.is_id) return orb_id;
			var context = in_configuration ? XBS.cart.configuring : XBS.cart.orbs;
			if (attribute.str in context[orb_id]) return context[orb_id][attribute.str]

			if (attribute.is_orbopt) {
				if (attribute.opt_id in context[orb_id]["orbopts"]) {
					try {
						if ('weight' in  context[orb_id].orbopts[attribute.opt_id]) {
							return context[orb_id].orbopts[attribute.opt_id]['weight']; // orbs
						}
					} catch (e) {
						return context[orb_id].orbopts[attribute.opt_id]; // configuring
					}
				} else {
					return -1;
				}
			}
			return false;
		},
		configure: function () {
			var debug_this = 0;
			if (debug_this > 0) pr("<no args>", "XBS.cart.configure()", 2);
			var orb_id = $(XSM.menu.orb_order_form_orb_id).val();
			if (!(orb_id in XBS.cart.configuring)) XBS.cart.configuring[orb_id] = jQuery.extend({}, XBS.cart.empty_config);
			XBS.cart.configuring[orb_id].quantity = $(XSM.menu.orb_order_form_quantity).val();
			XBS.cart.configuring[orb_id].price_rank = $(XSM.menu.orb_order_form_price_rank).val();
			XBS.cart.configuring[orb_id].preparation_instructions = $(XSM.menu.orb_order_form_prep_instrux).val();
			$(XSM.menu.orb_order_form_orb_opts).each(function () {
				var opt_id = XBS.cart.from_attribute_id_str($(this).attr('id')).opt_id;
				XBS.cart.configuring[orb_id].orbopts[opt_id] = $(this).val();
			});
			return true;
		},
		validate_order_review: function() {
			pr(XBS.data.order);
			var valid = true;
			XBS.data.order.payment = $(XSM.modal.payment_method_input).val();
			if (XBS.data.order.order_method == C.JUST_BROWSING) valid = false;
			if (XBS.data.order.order_method == C.DELIVERY ) {
				if ( !XBS.data.order.address) valid = false;
				if ( !XBS.data.order.payment) valid = false;
			}
			if (valid) {
				$(XSM.modal.finalize_order_button).removeClass(XSM.effects.disabled);
			}

		}
	},
	splash: {
		init: function () {
			if (!XBS.cfg.is_splash) return true;
			XBS.splash.render();
			return true;
		},
		render: function () {
			$(".fastened").attr('style', '').removeClass('fastened');
			$(".detach").attr('style', '');
			$(XSM.splash.order_spacer).css({height: $(XSM.splash.menu_wrapper).innerHeight() * C.ORDER_SPACER_FACTOR});
			$(XSM.splash.menu_spacer).css({height: $(XSM.splash.menu_wrapper).innerHeight() * C.MENU_SPACER_FACTOR});
			XBS.layout.assert_aspect_ratio(XSM.splash.preserve_aspect_ratio);


			var logo_width = $(XSM.splash.logo).innerWidth();
			var height = $(XSM.splash.order_delivery).innerHeight();
			var line_height = 1.25 * (height - 2 * 15) + C.PX;
			var max_height = $(XSM.splash.logo_wrapper).innerHeight();
			$(XSM.splash.order_delivery).css({width: logo_width, lineHeight: line_height});
			$(XSM.splash.order_pickup).css({width: logo_width, lineHeight: line_height});
			$("#splash-order-delivery-wrapper").css({maxHeight: max_height});
			$("#splash-order-pickup-wrapper").css({maxHeight: max_height});
			return true;
		},
		fold: function (route) {
			$.get("launch-menu", function (data) {
				$(XSM.splash.self).addClass(XSM.effects.stash);
				data = $.parseHTML(data);
				$($(data).find(XSM.menu.self)[0]).addClass(XSM.effects.true_hidden);
				$(data).appendTo(XSM.global.page_content);
				XBS.cfg.page_name = C.MENU;
				XBS.menu.stash_menu();
				$(XSM.menu.self).removeClass(XSM.effects.true_hidden);
				setTimeout(function () {
					$(XSM.splash.self).remove();
					XBS.menu.init();
					XBS.menu.unstash_menu();
				}, 1600);
			});

			return true;
		}
	},
	validation: {
		init: function () { return true;},
		submit_address: function (route, secondary_route) {
			var debug_this = 2;
			if (debug_this > 0) pr(route, "XBS.validation.submit_address(route)", 2);
			var context = route.read("content");
			var method = route.read("method");
			$("#orderAddressForm").validate({
				debug: false,
				rules: {
					"data[orderAddress][firstname]": "required",
					"data[orderAddress][phone]": {required: true, phoneUS: true},
					"data[orderAddress][address]": "required",
					"data[orderAddress][email]": {required: true, email:true},
					"data[orderAddress][postal_code]": {required: true, minlength: 6, maxlength: 7}
				},
				messages: {
					"data[orderAddress][firstname]": "Well we have to call you <em>something!</em>",
					"data[orderAddress][email]": "No spam, promise—just for sending receipts!",
					"data[orderAddress][phone]": {
						required: "We'll need route in case there's a problem with your order.",
						phoneUS: "Jusst ten little digits, separated by hyphens if you like..."},
					"data[orderAddress][address]": "It's, err, <em>delivery</em> after all...",
					"data[orderAddress][postal_code]": {
						required: "This is how we check if you're in our delivery area!",
						minlength: "Prooooobably something like \"A0A 0A0\"...",
						maxlength: "Prooooobably something like \"A0A 0A0\"..."
					}
				},
				submitHandler: function () {
					$.ajax({
						type: C.POST,
						url: "confirm-address/session",
						data: $("#orderAddressForm").serialize(),
						success: function (data) {
							pr(data, 'confirm_address_validation');
							try {
								data = $.parseJSON(data);
								XBS.data.user.address = data.address;
							} catch (e) {
							}
							XBS.layout.dismiss_modal(XSM.modal.primary);
							if (secondary_route) {
								setTimeout(function () {
									$(XBS.routing).trigger(C.ROUTE_REQUEST, {request: secondary_route, trigger: route.trigger.event});
								}, 300);
							}
						}
					});
				}
			});
			$("#orderAddressForm").submit();
		},
		submit_register: function (route) {
			var debug_route = 0;
			if (debug_route > 0) pr(route, "XBS.validation.submit_address(route)", 2);
			$("#UsersForm").validate({
				debug: true,
				rules: {
					"data[Users][firstname]": "required",
					"data[Users][email]": {required: true, email: true},
					"data[Users][phone]": {required: true, phoneUS: true},
					"data[Users][address]": "required",
					"data[Users][postal_code]": {required: true, minlength: 6, maxlength: 7}
				},
				messages: {
					"data[Users][firstname]": "Well we have to call you <em>something!</em>",
					"data[Users][email]": "This will be your 'username'. Don't worry, we won't share it or spam you!",
					"data[Users][phone]": {
						required: "We'll need route in case there's a problem with your order.",
						phoneUS: "Jusst ten little digits, separated by hyphens if you like..."},
					"data[Users][address]": "It's, err, <em>delivery</em> after all...",
					"data[Users][postal_code]": {
						required: "This is how we check if you're in our delivery area!",
						minlength: "Prooooobably something like \"A0A 0A0\"...",
						maxlength: "Prooooobably something like \"A0A 0A0\"..."
					}
				},
				submitHandler: function () {
					$.ajax({
						type: route.url.type,
						url: "users/add",
						data: $("#UsersForm").serialize(),
						success: function (data) {
							//todo: handle... this?
						},
						fail: function () {},
						always: function () {}
					});
				}
			});
			$("#UsersForm").submit();
		}
	},
	fn: {
		execInitSequence: function (init_list) {
			var meta_sit_rep = {state: true, report: {}};
			for (init_ob_name in init_list) {
				meta_sit_rep.report[init_ob_name] = {};
				var init_ob = init_list[init_ob_name];
				if (!exists(init_ob.has_init_sequence)) {
					throw new TypeError("Object passed to XBS.fn.execInitSequence() does not contain 'has_init_sequence' property.");
				}
				for (fn in init_ob) {
					if (fn != "has_init_sequence") {
						meta_sit_rep.report[init_ob_name][fn] = init_ob[fn]();
						if (meta_sit_rep.report[init_ob_name][fn] !== true) meta_sit_rep.state = false;
					}
				}
			}
			return meta_sit_rep;
		},
		route: function (controller, action) {
			if (controller in XBS.routes) {
				if (action in XBS.routes[controller]) {
					var url = XBS.routes[controller][action] + C.DS + orb_card_id
					if (XBS.cfg.root.length != 0) url = C.DS + XBS.cfg.root + C.DS + url
					return url;
				}
			}
			return false;
		},

		/**
		 * setHost method
		 * @desc  Sets the root directory for AJAX references given <host>
		 * @host <str> string key for host in XBS.data.host_root_dirs
		 * @throws
		 * @returns <boolean>
		 */
		setHost: function (host) {
			if (XBS.data.host_root_dirs[host] == C.UNDEF) {
				throw new ReferenceError("Error: host '{0}' not found in XBS.data.host_root_dirs.".format(host));
			} else {
				XBS.cfg.root = XBS.data.host_root_dirs[host];
			}
			return true;
		},

		/**
		 * sleep method
		 *
		 * @period {integer} duration (ms) for which program should wait
		 * @wakeEvent {mixed} Either an event object or a string name of standard event
		 * @onWake {function} Function to be executed after sleep period has elapsed
		 * @target {mixed} CSS selector string or DOM element to be target of wakeEvent
		 * @returns {boolean}
		 */
		sleep: function (period, wakeEvent, onWake, target) {
			if (wakeEvent == C.UNDEF) wakeEvent = XBS.evnt.wakeFromSleep;
			if (isFunction(onWake)) {
				// confirmed code reaches these lines and all vars are as expected
				if (target == C.UNDEF) target = window;
				$(target).on(wakeEvent.type, onWake);
			}
			setTimeout(function () {$(target).trigger(wakeEvent) }, period);

			return target;
		}
	}
};