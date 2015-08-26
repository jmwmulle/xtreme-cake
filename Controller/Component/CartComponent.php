<?php

	class CartComponent extends Component {
		public $portion_pricing = array( 'F' => 1, 'L' => 0.5, 'R' => 0.5, 'D' => 2 );
		public $components = array( 'Session' );
		public $Controller;
		private $invoice_template = [ 'subtotal'     => 0,
		                              'total'        => 0,
		                              'item_count'   => 0,
		                              'invoice_rows' => 0,
		                              'hst'          => 0 ];
		private $maxQuantity = 99;
		private $hst_rate = 0.15;
		private $bottle_deposit = 0.1;
		private $delivery_min = 10;


		public function __construct(ComponentCollection $collection, $settings = array()) {
			$this->Controller = $collection->getController();
			parent::__construct( $collection, array_merge( $this->settings, (array)$settings ) );
		}

		public function startup(Controller $controller) {
		}


		/**
		 * returns array of orbopt model records from values of orbopt_ids array
		 *
		 * @param $orbopt_ids
		 *
		 * @return array
		 */
		private function fetch_orbopts_from_ids($orbopt_ids) {
			$this->Controller->Orbopt->Behaviors->load( 'Containable' );
			foreach ( $orbopt_ids as $opt_id => $coverage ) {
				if ( $coverage != -1 ) {
					$conditions                                      = array( 'recursive'  => 1,
					                                                          'conditions' => array( 'Orbopt.id' => $opt_id ),
					                                                          'contain'    => array( 'Pricelist',
					                                                                                 'Optflag' => array(
						                                                                                 'conditions' => array( 'price_factor' => 1 )
					                                                                                 ) ) );
					$orbopt_ids[ $opt_id ]                           = $this->Controller->Orbopt->find( 'first', $conditions );
					$orbopt_ids[ $opt_id ][ 'Orbopt' ][ 'coverage' ] = $coverage;
				}
				else {
					unset( $orbopt_ids[ $opt_id ] );
				}
			}

			return array_filter( $orbopt_ids );
		}


		/**
		 * @param $orbopts
		 * @param $price_rank
		 * @param $included
		 *
		 * @return int
		 */
		private function price_orbopts($orbopts, $price_rank, $included) {
			$price_map = [ 'sauce'   => [ 'count'    => 0,
			                              'included' => 1,
			                              'price'    => 0 ],
			               'cheese'  => [ 'count'    => 0,
			                              'included' => $included[ 'cheese_count' ],
			                              'price'    => 0 ],
			               'premium' => [ 'count'    => 0,
			                              'included' => $included[ 'premium_count' ],
			                              'price'    => 0 ],
			               'opt'     => [ 'count'    => 0,
			                              'included' => $included[ 'opt_count' ],
			                              'price'    => 0 ],
			];

			foreach ( $orbopts as $id => $orbopt ) {
				$price = $orbopt[ 'Pricelist' ][ "p$price_rank" ];

				// if optflags are empty, add a null value so that in the loop below it defaults to 'opt'
				if ( empty( $orbopt[ 'Optflag' ] ) ) {
					array_push( $orbopt[ 'Optflag' ], null );
				}

				foreach ( $orbopt[ 'Optflag' ] as $fl ) {
					$index = array_key_exists( $fl[ 'title' ], $price_map ) ? $fl[ 'title' ] : "opt";
					$price_map [ $index ][ 'count' ]++;
					if ( $price_map[ $index ][ 'price' ] == 0 ) {
						$price_map[ $index ][ 'price' ] = $price;
					}
				}
			}

			$price = 0;
			foreach ( $price_map as $flag ) {
				$qty_diff = $flag[ 'count' ] - $flag[ 'included' ];
				if ( $qty_diff > 0 ) {
					$price += ( $qty_diff * $flag[ 'price' ] );
				}
			}

			return $price;
		}

		/**
		 * @param $candidate
		 *
		 * @return bool
		 */
		private function update_quantity($candidate) {
			foreach ( $this->Session->read( 'Cart.Order' ) as $uid => $oi ) {
				// slices orbs & opts for comparison
				if ( array_slice( $oi, 0, 2 ) == array_slice( $candidate, 0, 2 )) {
					$candidate[ 'pricing' ][ 'quantity' ] += $oi[ 'pricing' ][ 'quantity' ];
					if ( $candidate[ 'pricing' ][ 'quantity' ] > $this->maxQuantity ) {
						$candidate[ 'pricing' ][ 'quantity' ] = $this->maxQuantity;
					}
					$candidate[ 'pricing' ][ 'net' ] = $candidate[ 'pricing' ][ 'quantity' ] * $candidate[ 'pricing' ][ 'configured_unit_price' ];
					$this->Session->write("Cart.Order.$uid", $candidate);
					return true;
				}
			}
			return false;
		}


		/**
		 * @param $orb_cfg
		 *
		 * @return mixed|null
		 */
		public function add($orb_cfg) {
			// $orb_cfg = [orb_id, uid, quantity, price_rank, orbopts]
			$orb_id            = $orb_cfg[ 'id' ];
			$uid               = $orb_cfg[ 'uid' ];
			$quantity          = $orb_cfg[ 'quantity' ];
			$price_rank        = $orb_cfg[ 'price_rank' ] + 1; // table columns are p1...p5, indices are 0...4
			$orbopts           = array_key_exists('Orbopt', $orb_cfg) ? $orb_cfg[ 'Orbopt' ] : [];

			$quantity = !is_numeric( $quantity ) ? 1 : abs( $quantity );
			if ( $quantity == 0 ) {
				return null;
			}
			if ( $quantity > $this->maxQuantity ) {
				$quantity = $this->maxQuantity;
			}

			// get orb details from id
			$orb = $this->Controller->Orb->find( 'first', array( 'recursive'  => 0,
			                                                     'conditions' => array( 'Orb.id' => $orb_id ) )
			);
			$orb['Orb']['note'] = $orb_cfg[ 'orb_note' ];

			if ( empty( $orb ) ) return null; // if bad orb_id passed, exit quietly

			// get orbopt data
			$orbopts = $this->fetch_orbopts_from_ids( $orbopts );

			// get the pricing info for each opt
			$opt_price = $this->price_orbopts( $orbopts, $price_rank, [ 'opt_count'     => $orb[ 'Orb' ][ 'opt_count' ],
			                                                            'cheese_count'  => $orb[ 'Orb' ][ 'cheese_count' ],
			                                                            'premium_count' => $orb[ 'Orb' ][ 'premium_count' ] ]
			);
			$pricing   = [ 'rank'                  => $price_rank,
			               'label'                 => $orb[ 'Pricedict' ][ "l$price_rank" ],
			               'quantity'              => $quantity,
			               'unit_base_price'       => 1 * $orb[ 'Pricelist' ][ "p$price_rank" ],
			               'opt_price'             => $opt_price,
			               'configured_unit_price' => 1 * $orb[ 'Pricelist' ][ "p$price_rank" ] + $opt_price,
			               'net'                   => $quantity * ( $orb[ 'Pricelist' ][ "p$price_rank" ] + $opt_price ) ];
			// walk current cart (if it exists); if item of identical configuration found, update it's quantity
			$candidate = compact( "orb", 'orbopts', 'pricing' );

			if ($this->update_quantity( $candidate ) ) return true;

			return $this->Session->write("Cart.Order.$uid", $candidate);
		}

		/**
		 * @param $uid
		 *
		 * @return bool
		 */
		public function find_by_uid($uid) {
			foreach ($this->Session->read('Cart.Order') as $oi) {
				if ($oi['uid'] == $uid) return $uid;
			}
			return false;
		}

		/**
		 * @param        $uid
		 * @param string $quantity
		 *
		 * @return int
		 */
		public function remove( $uid, $quantity ) {
			if ( $this->Session->check( "Cart.Order.$uid" ) ) {
				$quantity = $this->Session->read("Cart.Order.$uid.pricing.quantity") - $quantity;
				$conf_unit_price = $this->Session->read("Cart.Order.$uid.pricing.configured_unit_price");

				// if deleting some but not all of them item, reduce quantity
				if ($quantity > 0) {
					$this->Session->write( "Cart.Order.$uid.pricing.quantity", $quantity );
					$this->Session->write("Cart.Order.$uid.pricing.configured_unit_price", $quantity * $conf_unit_price);
				} else {
					$this->Session->delete( "Cart.Order.$uid" );
				}
			}

			$this->update_invoice();
		}


		/**
		 * update_invoice()
		 *
		 * @return bool
		 */
		public function update_invoice() {
			if ( !empty( $cart[ 'Order' ] ) ) return;

			$invoice = $this->invoice_template;
			foreach ( $this->Session->read("Cart.Order") as $uid => $oi ) {
				$invoice[ 'subtotal' ] += $oi[ 'pricing' ][ 'net' ];
				$invoice[ 'item_count' ] += $oi[ 'pricing' ][ 'quantity' ];
				$invoice[ 'invoice_rows' ]++;
			}
			$invoice[ 'hst' ]   = $invoice[ 'subtotal' ] * $this->hst_rate;
			$invoice[ 'total' ] = $invoice[ 'subtotal' ] + $invoice[ 'hst' ];
			$this->Session->write( 'Cart.Invoice', $invoice );
			$this->Session->write( 'Cart.Service.deliverable', $this->Session->read( 'Cart.Invoice.total' ) >= $this->delivery_min);

		}


		public function clear() {
			$this->Session->delete( 'Cart' );
		}

		public function beforeFilter() {
			parent::beforeFilter();
			$this->Auth->allow( 'add', 'clear', 'remove', 'startup' );
		}
	}
