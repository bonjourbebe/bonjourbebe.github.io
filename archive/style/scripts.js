var speed=200;

$(function(){

// MENU
    $('.menu > li').mouseenter(function(){
        $(this).find('ul')
        .stop(true, true).slideDown(speed);
		$(this).find('ul').css('margin-left',-((parseInt($(this).find('ul').css('width'))-parseInt($(this).css('width')))/2));
    });

	$('.menu > li').mouseleave(function(){
		$(this).find('ul')
		.stop(true, true).slideUp(speed);
	});

// SLIDER

	$('#galeriaDane > .galeriaZdjecia').each(function() {
		$('.contentLeftWrapper').append('<div class="contentTextLeftBgG"><div class="contentTextLeftG"><div class="linkGaleria">' + $(this).attr('title') + '<div style="display:none;">' + $(this).html() + '</div></div></div></div>');
	});
	// ładuje pierwszą galerie
	$('#slider > ul').html($('.linkGaleria').find('div').html());
	$('#slider > ul > li > a').each(function() {
		$(this).html('<img src="' + $(this).attr('href') + '"  alt="" />');
	});
	$('#slider').easySlider();
	// zmiana galerii
    $('.linkGaleria').click(function(){

		$('#galeria').animate({opacity: 0},500);
		$('#slider > ul').html($(this).find('div').html());
		$('#slider > ul > li > a').each(function() {
			$(this).html('<img src="' + $(this).attr('href') + '"  alt="" />');
		});
		$('#nextBtn,#prevBtn').remove();
		$('#opis').remove();
		var temp = $('#galeria').html();
		$('#galeria').html('');
		$('#galeria').html(temp);
		$('#slider').easySlider({reset: 1});
		opis();
		$('#galeria').animate({opacity: 1},500);

    });
	opis();
	// opis
function opis() {
	$('#slider').append('<div id="opis"></div>');

	var $opis = $('#opis');
	$opis.hide();
	$('#slider').mouseleave(function(){
		$opis.stop(true, false).hide(speed,function() {
			$opis.text('');
		});

	});

    $('#slider a').each(function(){
        var $this = $(this),
			$title = this.title;
		$this.data('title', $title);
		this.title = '';

        $this.mouseenter(function(){
			if($.browser.msie)
			{
				$opis.animate({
					opacity: 0.60
				},0);
			}

			var opis = $this.data('title') + '<span style="float:right">' + $('#slider > ul > li > a').index(this) + '/' + ($('#slider > ul > li > a').size()-2) + '</span>';
			$opis.html(opis);
			$opis.stop(true, false).show(speed);
        });

		/* $this.mouseout(function(){
				this.title = $title;
		}); */
    });
}

// TLO
	var currentHeight; // for IE
	var currentWidth; // for IE
	if (($.browser.msie) && ($.browser.version <= 8.0)) {
		$('body').append('<img id="background" src="gfx/tlo.png" />');
	}

});
