( function ( $ ){
	$( document ).ready( function (){
		// Init filters
		Filters.init();

	} );

	var Filters = {
		init: function (){
			this.dateRange.init();
		},

		dateRange: {
			$elements: {},

			init: function (){

				// Get element
				this.$elements.dateRange = $( '#utclfm-date-range' );

				// Hidden fields
				this.$elements.customRangeStart = $( '#utclfm-date-range-custom-start' );
				this.$elements.customRangeEnd   = $( '#utclfm-date-range-custom-end' );

				// Check if the required element exists
				if (this.$elements.dateRange.length > 0) {
					// Init select2
					this.select2();

					// Check the Custom Date Range option
					this.bindDateRange();
				}
			},

			bindDateRange: function (){
				// Reference
				let _this = this;

				// Check if the user is selecting
				this.$elements.dateRange.on( 'select2:selecting', function ( event ){
					// Check if the selected option is "custom"
					if (event.params.args.data.id == 'custom') {
						// Prevent default, we don't want to close the select
						event.preventDefault();
					}
					// Check if it's clicking another option
					else {
						// Get datapicker
						let $dataPicker = $( '#ui-datepicker-div' );

						// Hide datepicker
						$dataPicker.hide();
					}
				} );

				// Check click outside
				this.$elements.dateRange.on( 'select2:closing', function ( event ){
					// Get datapicker
					let $dataPicker = $( '#ui-datepicker-div' );

					// Check if there is a datapicker open,
					// if there is then prevent the closing
					if ($dataPicker.length > 0 && $dataPicker.is( ':visible' )) {
						event.preventDefault();
					}

					// If the selected option is custom then update the value of the date fields
					if (_this.$elements.dateRange.val() == 'custom') {
						_this.updateDates();
					} else {
						_this.cleanDates();
					}
				} );
			},

			formatOptions: function ( option ){
				let output;

				// Check if the option is the custom one
				if (option.id == 'custom') {
					// Create HTML for the custom option

					// Get original text
					// We're going to use this because we want to be able to translate this string with PHP
					let originalText = option.text;

					// Create main container
					let container = $( '<span/>', {
						class: 'utclfm-report-filter-custom-range'
					} );

					// Top
					let contentTop = $( '<span/>', {
						class: 'utclfm-report-filter-custom-range__top',
						text: originalText
					} );

					container.append( contentTop );

					// Bottom
					let contentFields = $( '<span/>', {
						class: 'utclfm-report-filter-custom-range__fields',
					} );

					// Start field
					let startField = $( '<input/>', {
						class: 'utclfm-report-filter-custom-range__field utclfm-report-filter-custom-range__start-date',
						name: 'utclfm-report-start-date',
						id: 'utclfm-report-start-date',
						placeholder: 'Start',
					} );

					// Check for default value
					let startFieldValue = Filters.dateRange.$elements.customRangeStart.val();

					if (startFieldValue != '') {
						startField.val( startFieldValue );
					}

					// Start date picker
					startField.datepicker( {
						dateFormat: 'd M, y'
					} );

					// Append Start field
					contentFields.append( startField );

					// End field
					let endField = $( '<input/>', {
						class: 'utclfm-report-filter-custom-range__field utclfm-report-filter-custom-range__end-date',
						name: 'utclfm-report-end-date',
						id: 'utclfm-report-end-date',
						placeholder: 'End'
					} );

					// Check for default value
					let endFieldValue = Filters.dateRange.$elements.customRangeEnd.val();

					if (endFieldValue != '') {
						endField.val( endFieldValue );
					}

					// Start date picker
					endField.datepicker( {
						dateFormat: 'd M, y'
					} );

					// Append End field
					contentFields.append( endField );

					// Save button
					let saveButton = $( '<div/>', {
						class: 'utclfm-report-filter-custom-range__save',
						text: 'Set range'
					} );

					contentFields.append( saveButton );

					// Bind Save
					saveButton.on( 'click', function (){
						// Select "custom"
						Filters.dateRange.$elements.dateRange.val( 'custom' );

						// Close Select2
						Filters.dateRange.$elements.dateRange.select2( 'close' );
					} );

					// Append fields to the container
					container.append( contentFields );

					// Set output
					output = container;
				} else {
					output = option.text;
				}

				return output;
			},

			updateDates: function (){
				// Get values
				let values = {
					start: $( '#utclfm-report-start-date' ).val(),
					end: $( '#utclfm-report-end-date' ).val()
				}

				// Set values
				Filters.dateRange.$elements.customRangeStart.val( values.start );
				Filters.dateRange.$elements.customRangeEnd.val( values.end );

				// Set "Custom" value
				Filters.dateRange.$elements.dateRange.trigger( 'change.select2' );
			},

			cleanDates: function (){
				// Set values
				Filters.dateRange.$elements.customRangeStart.val( '' );
				Filters.dateRange.$elements.customRangeEnd.val( '' );
			},

			formatSelectedOption: function ( option ){
				let output;

				// Check if the option is the custom one
				if (option.id == 'custom') {
					// Get date values
					let values = {
						start: Filters.dateRange.$elements.customRangeStart.val(),
						end: Filters.dateRange.$elements.customRangeEnd.val()
					}

					// Create text
					let label = '%1$s - %2$s';

					// Replace variables
					label = label.replace( /%1\$s/, values.start != '' ? values.start : '∞' );
					label = label.replace( /%2\$s/, values.end != '' ? values.end : '∞' );

					// Set value
					output = label;
				} else {
					output = option.text;
				}

				return output;
			},

			select2: function (){
				// Reference main object
				let _this = this;

				$.each( this.$elements.dateRange, ( index, field ) => {
					// Get the field
					const $field = $( field );

					this.$elements.dateRange.select2( {
						theme: 'default utclfm-select2',
						templateResult: _this.formatOptions,
						templateSelection: _this.formatSelectedOption,
						minimumResultsForSearch: -1,
						escapeMarkup: ( markup ) => {
							return markup
						},
						dropdownParent: $field.parent(),
					});
				});
			},
		},
	}

} )( jQuery );