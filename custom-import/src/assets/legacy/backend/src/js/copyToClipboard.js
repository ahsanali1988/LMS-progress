(function ($){
	$(document).ready(function () {
		UO_ceu.init();
	});

	var UO_ceu = {
		init: function(){
			this.copy_to_clipboard();
		},

		copy_to_clipboard: function(){
			var button = $('.uo-admin-copy-to-clipboard-input');
			button.click(function(){
				var container = $(this).closest('.uo-admin-copy-to-clipboard'),
					tooltip = $( container.find('.uo-admin-ctc-tooltip') );

				$(this).select();
				document.execCommand( 'Copy' );

				// Show copied
				var actual_value = tooltip.text();
				tooltip.text( 'Copied!' );
				setTimeout(function(){
					tooltip.text( actual_value );
				}, 3000);
			});
		}
	}
})(jQuery);
