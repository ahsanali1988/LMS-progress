// Global access to all functions and variables in name space
// @namespace ulgmGroupManagement
if (typeof ceu === 'undefined') {
	// the namespace is not defined
	var ceu = {};
}

(function ($) { // Self Executing function with $ alias for jQuery

	/**
	 *  Initialization  similar to include once but since all js is loaded by the browser automatically the all
	 *   we have to do is call our functions to initialize them, his is only run in the main configuration file
	 */
	$(document).ready(function () {
		ceu.restForms.constructor();
	});

	ceu.restForms = {

		// initialize the code
		constructor: function () {

			// Add events for the group management page
			this.addFormSubmitEvents();

		},

		addFormSubmitEvents: function () {

			// Add rest call to all link with a rest call attached
			$('.submit-rest-form').on('click', this.sendRestCall);

			// Add rest call to all link with a rest call attached
			$('.change-rest-form').on('change', this.sendRestCall);

		},

		sendRestCall: function (e){
			// The form or container of the input data
			var associatedForm = $( e.currentTarget ).closest('.rest-form');

			// Submit button
			var all_submit_buttons = $('.uo-admin-form-submit');

			// Place to show errors
			var error_render = associatedForm.find('.error.rest-message');

			// Get the end point for the rest call from the clicked element
			var endPoint = $( e.currentTarget ).data('end-point');

			// Sometimes wp editor doesn't update the textarea input rigth way.
			// Let's save iFrame editors to textarea so we can serialize
			if( typeof tinymce !== 'undefined'){
				for (edId in tinyMCE.editors){
					tinyMCE.editors[edId].save();
				}

			}
			// Get the input data from the closet form or contain of user inputs to the clicked element
			var restData = associatedForm.find(':input').serializeObject();
			
			all_submit_buttons.addClass('uo-btn--loading');
			error_render.hide();

			$.ajax({

				method: "POST",
				url: UO_CEUs.api.root  + '/' + endPoint + '/',
				data: restData,

				// Attach Nonce the the header of the request
				beforeSend: function (xhr) {
					xhr.setRequestHeader('X-WP-Nonce', UO_CEUs.api.nonce);
				},

				success: function (response){
					all_submit_buttons.removeClass('uo-btn--loading');

					let url = window.location.href;

					if ( response.data.message !== undefined ){
						if ( true === response.success ){
							url = updateQueryString( 'message', encodeURIComponent(response.data.message), url );
						}

						if ( true === response.success ) {

							if ( typeof response.data.reload === 'undefined' ){

								// reload page with custom message
								window.location.href = url;

							}
						
							else if ( typeof response.data.call_function !== 'undefined'){

								if ( typeof response.data.function_vars !== 'undefined' ){
									ceuGroupManagement[response.data.call_function](response.data.function_vars);
								}
								else {
									ceuGroupManagement[response.data.call_function]();
								}

							}

						} else {
							error_render.html( response.data.message );
							error_render.show();
						}
					}
				},

				fail: function (response) {
					all_submit_buttons.removeClass('uo-btn--loading');
					error_render.html( response.data.message );
				}

			});

		}


	};

	/**
	 * Extend serialize array to create a serialized object. This is the format that the rest call expects
	 *
	 * @returns object Returns key value pairs where the key is the input name and the value is the input value
	 */
	// Extend serialize array to create an serialized object
	$.fn.serializeObject = function () {
		var o = {};
		var a = this.serializeArray();
		$.each(a, function () {
			if (o[this.name] !== undefined) {
				if (!o[this.name].push) {
					o[this.name] = [o[this.name]];
				}
				o[this.name].push(this.value || '');
			} else {
				o[this.name] = this.value || '';
			}
		});
		return o;
	};

	function updateQueryString( key, value, url ){
	    if ( ! url )
	    	url = window.location.href;

	    var re = new RegExp( "([?&])" + key + "=.*?(&|#|$)(.*)", "gi" ),
	        hash;

	    if ( re.test( url ) ){
	        if ( typeof value !== 'undefined' && value !== null )
	        	return url.replace(re, '$1' + key + "=" + value + '$2$3');
	        else {
	            hash = url.split( '#' );
	            url = hash[0].replace( re, '$1$3' ).replace( /(&|\?)$/, '' );
	            if ( typeof hash[1] !== 'undefined' && hash[1] !== null ) 
	                url += '#' + hash[1];
	            return url;
	        }
	    }
	    else {
	        if ( typeof value !== 'undefined' && value !== null ){
	            var separator = url.indexOf( '?' ) !== -1 ? '&' : '?';
	            hash = url.split( '#' );
	            url = hash[0] + separator + key + '=' + value;
	            if ( typeof hash[1] !== 'undefined' && hash[1] !== null ) 
	                url += '#' + hash[1];
	            return url;
	        }
	        else
	            return url;
	    }
	}

})(jQuery);
