<?php
/**
 * J. Mulle, for app, 1/3/15 5:54 PM
 * www.introspectacle.net
 * Email: this.impetus@gmail.com
 * Twitter: @thisimpetus
 * About.me: about.me/thisimpetus
 */
?>


<?php echo $this->element('modal_masthead', array('header'=>"Xtreme Membership!",
                                                  "subheader" => "We will never share your infos. Ever."));?>
<div class="row text-center">
	<div class="large-12 large-centered columns">
		<div class="row">
			<div id="registration-method-bar">
				<div class="large-4 columns">
					<h4 data-route="print/fuck/right/off">LOG IN WITH</h4>
				</div>
				<div class="large-2 columns">
					<a href="#" class="register-link email" data-route="register/modal/email"><span class="icon-topbar-email"></span></a>
				</div>
				<div class="large-2 columns">
					<a href="http://development-xtreme-pizza.ca/auth/twitter" class="register-link twitter">
						<span class="icon-twitter"></span>
					</a>
				</div>
				<div class="large-2 columns">
					<a href="http://development-xtreme-pizza.ca/auth/facebook" class="register-link facebook">
						<span class="icon-facebook"></span>
					</a>
				</div>
				<div class="large-2 columns">
					<a href="http://development-xtreme-pizza.ca/auth/google" class="register-link gplus">
						<span class="icon-gplus"></span>
					</a>
				</div>
			</div>
		</div>
	</div>
</div>
<hr />
<div class="deferred-content slide-left">
	<?php echo $this->Form->create('Users', array('action' => false, 'inputDefaults' => array("div" => false)));?>
	<div id="register-by-email-form" class="row">
		<div class="row">
			<div class="large-6 columns">
				<?php echo $this->Form->input( 'User.firstname', array("label" => "First Name")); ?>
			</div>
			<div class="large-6 columns">
				<?php echo $this->Form->input( 'User.lastname', array('label' => "Last Name")); ?>
			</div>
		</div>
		<div class="row">
			<div class="large-6 columns">
				<?php echo $this->Form->input( 'User.phone', array('label' => "Phone Number")); ?>
			</div>
			<div class="large-6 columns">
				<?php echo $this->Form->input( 'User.email', array('label' => "E-Mail Address"));?>
			</div>
		</div>
		<div class="row">
			<div class="large-12 columns">
				<?php echo $this->Form->input( 'Address.address', array('label' => "Street Address Line 1")); ?>
			</div>
		</div>
		<div class="row">
			<div class="large-12 columns">
				<?php echo $this->Form->input( 'Address.address_2', array('label' => "Street Address Line 2 (optional)")); ?>
			</div>
		</div>
		<div class="row">
			<div class="large-6 columns">
				<?php echo $this->Form->input( 'Address.building_type', array( 'type'    => 'select',
				                                                       'options' => array( 'House',
				                                                                           'Apartment',
				                                                                           'Office/Other' ) )
				);
				?>
			</div>
			<div class="large-6 columns">
				<?php echo $this->Form->input( 'Address.postal_code', array('label' => 'Postal Code',)); ?>
			</div>
		</div>
		<div class="row">
			<div class="large-6 columns">
				<?php echo $this->Form->input( 'Address.details', array('type'  => 'textarea',
					                                                'label' => 'Delivery Instructions',
				                                                    'placeholder' => "Let our driver know about those hard-to-find stairs, or that pesky pet leopard in your back yard..."
					) );?>
			</div>
			<div class="large-6 columns">
				<div class="row">
					<div class="large-12 columns">
						<?php echo $this->Form->input( 'confirmation', array( 'type' => 'select',
					                                                      'label' => "I'd Prefer to Receive Order Confirmation By",
					                                                      'options' => array("E-mail", "SMS")) ); ?>

					</div>
				</div>
				<div class="row">
					<div class="large-12 columns">
						<a href="#" id="submit-order-address" class="box downward rel" data-route="register/modal/submit">
							<?php echo strtoupper( "Sign me up!" ); ?>
						</a>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div id="on-close" class="true-hidden" data-action="unstash"></div>
</div>