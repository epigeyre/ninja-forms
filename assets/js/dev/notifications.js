// We don't want to use the default <% %> tags because of PHP servers using ASP-like tags.
// Instead, we will use <# #> in our templates.
_.templateSettings = {
  evaluate    : /<#([\s\S]+?)#>/g,
  interpolate : /<#=([\s\S]+?)#>/g
};

jQuery(document).ready(function($) {

	// Backbone View for all our key field pairs
	var KeyFieldPairsView = Backbone.View.extend( {
		el: $( '#nf_key_field_pairs' ), // attaches `this.el` to an existing element.
		
		// Get our view up and running.
		initialize: function() {
			_.bindAll(this, 'render'); // fixes loss of context for 'this' within methods
			this.render();
		},

		render: function() {
			var that = this;
			_.each( nf_keyfieldpairs, function( pair, object_id ) {
				var singleview = new KeyFieldPairView( { el: that.el } );
				singleview.render( pair, object_id );
			} );
			
		},

		events: {
			'click .add': 'test'
		},

		test: function( e ) {
			e.preventDefault();
			console.log( 'hi' );
		}

	} );

	// Backbone View for our key field pair
	var KeyFieldPairView = Backbone.View.extend( {
		
		// Get our view up and running.
		initialize: function() {
			_.bindAll(this, 'render'); // fixes loss of context for 'this' within methods
		},

		render: function( pair, object_id ) {
			var tmp = _.template( $( '#tmpl-nf-key-field-pairs' ).html(), { pair: pair, object_id: object_id } );
			$( this.el ).append( tmp );
		}

	} );

	var keyFieldPairsView = new KeyFieldPairsView();

	$( '#settings-type' ).change( function() {
		var val = this.value;
		$( '.notification-type' ).hide();
		$( '#notification-' + val ).show();
	});

	$( document ).on( 'click', '.notification-delete', function(e) {
		e.preventDefault();
		var answer = confirm( commonL10n.warnDelete );
		var tr = $( this ).parent().parent().parent().parent();
		var n_id = $( this ).data( 'n_id' );
		console.log( n_id );
		if(answer){
			$.post( ajaxurl, { n_id: n_id, action: 'nf_delete_notification', nf_ajax_nonce:ninja_forms_settings.nf_ajax_nonce }, function( response ) {
				$( tr ).css( 'background-color', '#FF0000' ).fadeOut( 'slow', function() {
					$(this).remove();
				} );
			});
		}
	});

	$( document ).on( 'click', '.notification-activate', function(e) {
		e.preventDefault();
		var tr = $( this ).parent().parent().parent().parent();
		var activate_action = $( this ).data( 'action' );
		var n_id = $( this ).data( 'n_id' );
		var that = this;
		$.post( ajaxurl, { n_id: n_id, activate_action: activate_action, action: 'nf_' + activate_action + '_notification', nf_ajax_nonce:ninja_forms_settings.nf_ajax_nonce }, function( response ) {
			$( tr ).removeClass( 'nf-notification-active' );
			$( tr ).removeClass( 'nf-notification-inactive' );

			if ( activate_action == 'activate' ) {
				$( tr ).addClass( 'nf-notification-active' );
				$( that ).html( nf_notifications.deactivate );
				$( that ).data( 'action', 'deactivate' );
			} else {
				$( tr ).addClass( 'nf-notification-inactive' );
				$( that ).html( nf_notifications.activate );
				$( that ).data( 'action', 'activate' );
			}
		});
	});

	$( '.nf-tokenize' ).each( function() {
		var limit = $( this ).data( 'token-limit' );
		var key = $( this ).data( 'key' );
		var type = $( this ).data( 'type' );
		$( this ).tokenfield({
			autocomplete: {
				source: nf_notifications.search_fields[ type ],
				delay: 100,
			},
			tokens: nf_notifications.tokens[ key ],
			delimiter: [ '`' ],
			showAutocompleteOnFocus: true,
			beautify: false,
			limit: limit,
			createTokensOnBlur: true
		});
	});

	$( document ).on( 'click', '.nf-insert-field', function(e) {
		e.preventDefault();
		var field_id = $( this ).prev().prev( '.nf-fields-combobox' ).val();
		if ( field_id != '' && field_id != null ) {
			var shortcode = '[ninja_forms_field id=' + field_id + ']';
			window.parent.send_to_editor( shortcode );			
		}
	});

	$( document ).on( 'click', '.nf-insert-all-fields', function(e) {
		e.preventDefault();
		var shortcode = '[ninja_forms_all_fields]';	
		window.parent.send_to_editor( shortcode );
	});

	$( '.nf-fields-combobox' ).combobox();

	$( '.ui-combobox-input' ).focus( function(e) {
		var selected = $( this ).parent().prev( '.nf-fields-combobox' ).val();
		if ( selected == '' || selected == null ) {
			this.value = '';
		} else {
			$( this ).select();
		}
	});

	$( '.ui-combobox-input' ).mouseup(function(e){
		e.preventDefault();
	});

	$( '.ui-combobox-input' ).blur( function(e) {
		if ( this.value == '' ) {
			this.value = $( this ).parent().prev( '.nf-fields-combobox' ).data( 'first-option' );
		}
	});

	$( '#filter-type' ).change( function(e) {
		if ( this.value == '' ) {
			var url = nf_notifications.filter_type;
		} else {
			var url = nf_notifications.filter_type + '&type=' + this.value
		}
		$( '.spinner' ).show();
		document.location.href = url;
	});

	$( '#toggle_email_advanced' ).click( function(e) {
		e.preventDefault();
		$( '#email_advanced' ).toggle();
	});

});