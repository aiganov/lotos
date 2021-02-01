$(document).ready(function(){
    
    $('.b-header_webcam').click(function(){
        citymall.popUpOpen(window.scrollY, $(this).attr('href'));
        return false;
    });
    
    var shopArray = [];

    if ($('.b-floors_layers').attr('class') === 'b-floors_layers') {

        $.ajax({
            type: 'get',
            url: '/usel/getShops/.json',
            dataType: 'json',
            async:true,
            success: function(data) {
               
                $.each(data['page'], function(i, val) {
                    shopArray[val.id] = [];
                    shopArray[val.id]['link'] = val.link;
                    shopArray[val.id]['name'] = val.name;
                });
                
                $('.b-floors_tabs').each(function() {

                    var svg = $(this).find('.floor_svg');

                    svg.find('> g').each(function() {

                        var area = $(this).find('> polygon'),
                            type = $(this).attr('data-type'),

                            fill, hover;

                        if (type === '') {

                            fill = 'transparent';
                            hover = 'transparent';
                            area.hide();

                        } else {

                            fill = $('.b-floors_layers').find('[data-points="'+type+'"]').prev('.area').attr('data-color');
                            hover = colorLuminance(fill, -0.1);

                        }

                        area.attr('data-hover', hover).attr('data-fill', fill).attr('fill', fill);

                        var points = area.attr('points');
                        var pointsArr = points.split(/[\s,]+/);
                        
                        var pointsArrSort = [];

                            pointsArrSort['x'] = [];
                            pointsArrSort['y'] = [];

                        var j = 0; var k = 0;

                        $.each(pointsArr, function(i, val) {

                            if (val !== '') {
                                if (i % 2 === 0) {
                                    pointsArrSort['x'][j] = Math.round(Number(val));
                                    j++;
                                }
                                else {
                                    pointsArrSort['y'][k] = Math.round(Number(val));
                                    k++;
                                }
                            }

                        });

                        var array = getCoordArray(pointsArrSort); // Для теста Number($(this).attr('shop-id')) === 223

                        if ($.isNumeric(array[0]) && $.isNumeric(array[1])) {

                            var minY = array[1] + 10;
                            var maxX = array[0] + 7;

                            var link = shopArray[Number($(this).attr('shop-id'))] !== undefined ? shopArray[Number($(this).attr('shop-id'))]['link'] : "#";

                            if (shopArray[$(this).attr('shop-id')] !== undefined) {

                                svg.parent().prepend('<span class="b-floors_layer_point close" style="left: '+maxX+'px; top: '+minY+'px; z-index: 26;" data-point="'+$(this).attr('data-type')+'" shop-id="'+$(this).attr('shop-id')+'"><a id="'+$(this).attr('shop-id')+'" class="b-floors_layer_point_baloon " href="'+link+'">'+shopArray[$(this).attr('shop-id')]['name']+'</a></span>');

                            }

                        }

                    });
                });
                
                var getParams = parseGetParams();

                if (getParams['shop'] !== undefined) {

                    var id = getParams['shop'];
                    var popup = $('#'+id+'.b-floors_layer_point_baloon').parents('.b-floors_layer_point');console.log($('#'+id).attr('id'));

                    popup.addClass('show');
                    //popup.attr('shop-id', id);

                }

            }

        });

        $('g').on('click',function() {
            window.location.href = shopArray[$(this).attr('shop-id')]['link'];
        });

    }
    
    function parseGetParams(){

        var $_GET = {};
        var __GET = window.location.search.substring(1).split("&");

        for (var i = 0; i < __GET.length; i++) {

            var getVar = __GET[i].split("=");
            $_GET[getVar[0]] = typeof(getVar[1]) === "undefined" ? "" : getVar[1];

        }

        return $_GET;

    }
    
    function getCoordArray(arr, test) {

        var arrLenY = arr['y'].length;
        var arrLenX = arr['x'].length;

        var minElY = arr['y'][0];
        var minElX = arr['x'][0];

        /*
        var a = 0;
        var b = 0;

        for (var i = 0; i < arrLenY; i++) {
            if (minElY === arr['y'][i] || minElY === arr['y'][i] + 1 || minElY === arr['y'][i] - 1) {
                b = i;
            }
            if (minElY > arr['y'][i]) {
                minElY = arr['y'][i];
                a = i;
            }
        }

        if (arr['x'][a] > arr['x'][b]){
            minElX = arr['x'][a];
        }
        else {
            if (arr['x'][0] === arr['x'][b]) {
                minElX = arr['x'][1];
            } else {
                minElX = arr['x'][b];
            }
        }*/

        // Ищу самую правую точку
        /*
        minElX = getMaxOfArray(arr['x']);

        var equalYArray = [],
            idx = arr['x'].indexOf(minElX);

        while (idx !== -1) {
            equalYArray.push(arr['y'][idx]);
            idx = arr['x'].indexOf(minElX, idx + 1);
        }

        minElY = getMinOfArray(equalYArray);*/

        // Ищу самую верхнюю и самую правую точку
        minElY = getMinOfArray(arr['y']);

        var equalXArray = [],
            idx = arr['y'].indexOf(minElY);

        while (idx !== -1) {
            equalXArray.push(arr['x'][idx]);
            idx = arr['y'].indexOf(minElY, idx + 1);
        }

        minElX = getMaxOfArray(equalXArray);

        /*
        if (!!test) {

            console.log( arr['x'] );
            //console.log( minElX );

            console.log( arr['y'] );
            //console.log( minElY );

            console.log( equalXArray );
            console.log( minElX, minElY );

        }*/
        
        var array = [];

        array[0] = Number(minElX);
        array[1] = Number(minElY);
        
        return array;
    }

    function getMaxOfArray(numArray) {

        return Math.max.apply(null, numArray);

    }

    function getMinOfArray(numArray) {

        return Math.min.apply(null, numArray);

    }

    function getIndexOfMax(numArray) {

        return numArray.indexOf(getMaxOfArray(numArray));

    }

    function colorLuminance(hex, lum) {

        // validate hex string
        hex = String(hex).replace(/[^0-9a-f]/gi, '');
        if (hex.length < 6) {
            hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
        }
        lum = lum || 0;

        // convert to decimal and change luminosity
        var rgb = "#", c, i;
        for (i = 0; i < 3; i++) {
            c = parseInt(hex.substr(i*2,2), 16);
            c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
            rgb += ("00"+c).substr(c.length);
        }

        return rgb;

    }

    $('.b-floors_layer').each(function() {

        var svg = $(this).find('.floor_svg');

        svg.find('> g').each(function(){

            var area = $(this).find('> polygon'),
                type = $(this).attr('data-type'),

                fill, hover;

            if (type === ''){
                fill = 'transparent';
                hover = 'transparent';
                area.hide();
            } else {
                fill = $('.b-floors_layers').find('[data-points="'+type+'"]').prev('.area').attr('data-color');
                hover = colorLuminance(fill, -0.1);
            }

            area.attr('data-hover', hover).attr('data-fill', fill).attr('fill', fill);
        });

    });

    $('.b-floors_layer g polygon').on('mouseenter',function() {

        var color = $(this).attr('data-hover');
        $(this).attr('fill', color);

    }).on('mouseleave', function() {

        var color = $(this).attr('data-fill');
        $(this).attr('fill', color);

    });

    $(document)
        .on('mouseenter','[shop-id]', function() {

            var id = $(this).attr('shop-id');
            var popup = $('#'+id+'.b-floors_layer_point_baloon').parents('.b-floors_layer_point');
            popup.addClass('show');
            //popup.attr('shop-id', id)

        })
        .on('mouseleave', '[shop-id]', function() {

            var id = $(this).attr('shop-id');
            var popup = $('#'+id+'.b-floors_layer_point_baloon').parents('.b-floors_layer_point');
            popup.removeClass('show');

        });

    $(document)
        .on('click','[shop-id]', function() {

            var id = $(this).attr('shop-id');
            var popup = $('#'+id+'.b-floors_layer_point_baloon');

            window.location.href = popup.attr('href');

        });
    
    if ($('#calendar').length > 0) {

        var selDate = window.location.href.split('?date=');

        if (selDate[1]) {
            var date = selDate[1].split('.');
            var month = date[0];
            var  day = date[1];
            var year = date[2];
            var initial = year+'.'+day+'.'+month;
            rome(calendar, { time: false, initialValue: initial, weekStart: 1 });
        } else {
            rome(calendar, { time: false, weekStart: 1});
        }

    }

    $('body').on('click','.rd-day-body', function(){
        var day = $(this).text();
        var ym = ($(this).parents('.rd-month').find('.rd-month-label').text()).split(' ');
        var year = ym[1];
        var month = ym[0];
        var months = ['Январь','Февраль','Март','Апрель','Май','Июнь', 'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
        indexMonth = $.inArray(month, months);
        var inM = indexMonth+1;
        if (inM.toString().length < 2){
            inM = '0'+inM;
        }
        var href = ''+day+'.'+inM+'.'+year+'';
        window.location.href = '?date='+href;
    });

    $('.menu ul li').mouseenter(function() {
        $(this).siblings('li').find('ul').hide();
        $(this).siblings('li').find('ul').removeClass('blocked');
        $(this).find('a').addClass('active');
        var child_menu = $(this).children('ul');
        if (!child_menu.hasClass('blocked')) {
            child_menu.addClass('blocked');
            child_menu.fadeIn(200);
            child_menu.removeClass('blocked');
        }
    }).mouseleave(function() {
        $(this).find('a').removeClass('active');
        var child_menu = $(this).children('ul');
        if (!child_menu.hasClass('blocked')) {
            child_menu.addClass('blocked');
            child_menu.hide();
            child_menu.removeClass('blocked');
        }
    });

    msg = { required: 'Это поле обязательно для заполнения',  email: 'Введите корректный e-mail' };

    citymall.cbox();
    citymall.uniForm('select, input[type="radio"], input[type="checkbox"]');
    citymall.validateForm('form');

    citymall.poll('[data-poll]');

    citymall.gallery('[data-gallery]');
    citymall.album();

    citymall.floors.init();
    
    if ($("#flipbook").length > 0){
        var flip  = $("#flipbook").turn({
            width: 780,
            height: 554,
            autoCenter: true,
            duration: 1200
            // display: 'single'
        });
    }
    /*$("#flip-prev").click(function(e){
        e.preventDefault();
        flip.turn("previous");
    });

    $("#flip-next").click(function(e){
        e.preventDefault();
        flip.turn("next");
    });*/

});

var citymall = new function() {
    
    this.popUpOpen = function(scroll, link) {
        $('.mainPage').css({ marginTop: -scroll });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;

        webCams = '<div class="b-light">';
        webCams += '<div class="b-light-box"><h3>Веб-камеры</h3><span class="b-close"></span><div class="b-light-box-content">';
        webCams += '<ul class="b-webcams" data-cams>';

        webCams += '<li><div id="camera_4"></div></li>';
        webCams += '<li><div id="camera_5"></div></li>';
        webCams += '<li><div id="camera_6"></div></li>';
        webCams += '<li><div id="camera_9"></div></li>';
        webCams += '<li><div id="camera_10"></div></li>';

        webCams += '</ul><button data-cams-arrow="prev"></button><button data-cams-arrow="next"></button></div></div>';
        webCams += '<div class="h-mask"></div>';
        webCams += '</div>';

        $('body').addClass('h-page-on').append(webCams).on('click', '.b-light .b-close', function() { citymall.popUpClose(scroll); });
        $('head').append('<script src="http://media.sampo.ru/js/sigma_all.js" charset="UTF-8"></script>');
        citymall.webCams();

        $('.b-light').fadeIn(400);
        $('.h-mask').click(function(){ citymall.popUpClose(scroll); });
    };
    
    this.popUpClose = function(scroll) {
        $('.b-light').fadeOut(400, function(){
            $('.mainPage').css({ marginTop: 0 });
            $('.b-light').remove();
            $('body').removeClass('h-page-on');
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
            window.scrollBy(0,scroll);
        });
    };

    this.webCams = function() {
        cam = 0;
        camsLength = $('[data-cams] li').length;

        $('[data-cams] li').hide();
        $('[data-cams] li:first').show();

        $('[data-cams-arrow]').click(function(){

            switch($(this).attr('data-cams-arrow')) {
                case 'prev':
                    cam = (cam == 0) ? camsLength - 1 : cam - 1;
                    break;
                case 'next':
                    cam = (cam == camsLength - 1) ? 0 : cam + 1;
                    break;
            }

            $('[data-cams] li').fadeOut(300);
            $('[data-cams] li:eq('+ cam +')').fadeIn(300);

        });
    };

    
    this.cbox = function() {
        $cbox = $('.js-cbox');
        if ($.isFunction($.fn.colorbox) && $cbox.length > 0) {
            $cbox.colorbox({
                maxWidth: 940,
                maxHeight: '85%',
                opacity: 0.8,
                returnFocus: false
            });
        }
    };

    this.uniForm = function(selector) {

        if ($.isFunction($.fn.uniform)) {
            $(selector).uniform();
        }

    };

    this.validateForm = function(form) {

        $form = $(form);

        if ($.isFunction($.fn.validate) && $form.length != 0) {

            $form.validate({
                onKeyup: true,
                onChange: true,
                eachValidField: function() {
                    $(this).closest('.b-form_field').removeClass('g-error');
                    $(this).closest('.b-form_field').find('.b-form_field_box_error').remove();
		    $(this).closest('.formBlock').removeClass('g-error');
                    $(this).closest('.formBlock').find('.b-form_field_box_error').remove();
                },
                eachInvalidField: function(status, options) {
                    $(this).closest('.b-form_field').addClass('g-error');
                    $(this).closest('.b-form_field').find('.b-form_field_box_error').remove();
		    $(this).closest('.formBlock').addClass('g-error');
                    $(this).closest('.formBlock').find('.b-form_field_box_error').remove();

                    if(options.required) {
                        if(!options.pattern) {
                            $(this).closest('.b-form_field_box').append('<span class="b-form_field_box_error">' + msg.email + '</span>');
			    $(this).closest('.formBlock').append('<span class="b-form_field_box_error">' + msg.email + '</span>');
                        }
                    } else {
                        $(this).closest('.b-form_field_box').append('<span class="b-form_field_box_error">' + msg.required + '</span>');
			$(this).closest('.formBlock').append('<span class="b-form_field_box_error">' + msg.required + '</span>');
                    }

                }
            });

        }

    };

    this.poll = function(selector) {

        $(selector).each(function(){

            total = 0;

            $poll = $(this);
            $poll.find('[data-poll-quantity]').each(function(){
                total += parseInt($(this).attr('data-poll-quantity'));
            });

            $poll.find('[data-poll-quantity]').each(function(){

                var onePercent = total/100;
                var percents = (onePercent != 0) ? Number((parseInt($(this).attr('data-poll-quantity')) / onePercent)).toFixed(1) : 0;
                var range = Math.ceil(percents / 20);

                $(this).append('<span data-color="color-' + range + '"></span>');
                $(this).find('[data-color]').animate({ 'width': (percents * 340) / 100 }, 600);

                $(this).parent().find('.b-poll_cell_percents').animateNumber({
                    number: percents,
                    numberStep: function(now, tween) {
                        $(tween.elem)
                            .prop('number', now)
                            .text(now.toFixed(1).replace('.0', '') + ' %');
                    }
                }, 600);

                $poll.find('[data-poll-total]').text(total);

            });

        });

    };

    this.map = function() {

        var map, geocoder, myPlacemark;

        ymaps.ready(function() {
            var map = new ymaps.Map('map', {
                center: [0, 0]
            });

            map.controls

                .add('zoomControl', { left: 5, top: 5 })
                .add('typeSelector')
                .add('mapTools', { left: 35, top: 5 });

            var placemark = new ymaps.Placemark([61.774487, 34.307480], {}, {
                //preset: 'twirl#darkorangeDotIcon'
                iconImageHref: '/img/marker.png',
                iconImageSize: [124, 116],
                iconImageOffset: [-62, -116]
            });

            map.geoObjects.add(placemark);
            map.setCenter([61.774887 + 0.0005, 34.307280 + 0.005], 15);

        });

    };

    this.gallery = function(selector) {

        $galleryBlock = $(selector);

        if($galleryBlock.length != 0) {

            $(window).load(function(){

                $galleryBlock.each(function(){

                    var itemsLength = $(this).find('li').length;
                    switch (itemsLength) {
                        case 1:
                            $(this).find('li:eq(0)').css({ width: 886, height: 500 });
                            break;
                        case 2:
                            $(this).find('li:eq(0)').css({ width: 466, height: 400 });
                            $(this).find('li:eq(1)').css({ width: 466, height: 400 });
                            break;
                        case 3:
                            $(this).find('li').css({ width: 223, height: 240 });
                            $(this).find('li:eq(0)').css({ width: 649, height: 500 });
                            break;
                        default:
                            $(this).find('li').css({ width: 223, height: 153 });
                            $(this).find('li:eq(0)').css({ width: 649, height: 499 });
                            break;
                    }

                    $(this).find('li').each(function(){
                        imageCrop($(this));
                    });

                });

            });

        }

        function imageCrop(container) {

            var newWidth = 0;
            metrica = { width: container.width(), height: container.height() };
            img = { pic: container.find('img'), width: container.find('img').width(), height: container.find('img').height() }

            if (img.width >= img.height) {
                newWidth = (img.width / img.height) * metrica.height;
                if (metrica.width >= newWidth) {
                    img.pic.css({ display: 'block', width: metrica.width, height: 'auto', margin: (metrica.height - (img.height/img.width*metrica.width))/2 + 'px 0' });
                } else {
                    img.pic.css({ display: 'block', height: metrica.height, width: 'auto', margin: '0 '+ (metrica.width - (img.width/img.height*metrica.height))/2 + 'px' });
                }
            }
            else if (img.width < img.height) {
                newWidth = (img.width / img.height) * metrica.height;
                if (newWidth > metrica.width) {
                    img.pic.css({ display: 'block', height: metrica.height, width: 'auto', margin: '0 '+ (metrica.width - (img.width/img.height*metrica.height))/2 + 'px' });
                } else {
                    img.pic.css({ display: 'block', width: metrica.width, height: 'auto', margin: (metrica.height - (img.height/img.width*metrica.width))/2 + 'px 0' });
                }
            }

            container.css({ display: 'inline-block', textAlign: 'center', overflow: 'hidden' });
            container.find('img').fadeTo(500, 1);

        }

        this.album = function() {
            $(window).load(function(){
                var text = $('.galleryItemPlate p');
                var img = $('.galleryItem img');

                text.each(function(){
                    if ($(this).width() > 160) {
                        $(this).parent().addClass('marquee');
                    }
                });

                img.each(function(){
                   $(this).parent().find('.imgDesc').wrap('<div class="textWrap"></div>');
                });

            });
        }

    };

    this.floors = new function() {

        this.init = function() {

            citymall.floors.points();

        };

        this.points = function() {

            $('[data-point] img').click(function(e) {

                e.preventDefault();

                var $targetLink = $('[data-points="' + $(this).parent().data('point') + '"]');

                $(this).parent().toggleClass('close'); 
                $(this).parent().toggleClass('active');

                if($(this).parent().hasClass('active')) {
                    $targetLink.addClass('current');
                }

                //return false;

            });

            $('[data-points]').click(function(e) {

                e.preventDefault();

                var $links = $('[data-points]'),
                    $allPoints = $('[data-point]'),
                    $targetPoints = $('[data-point="' + $(this).data('points') + '"]'),
                    targetStateClose = true;

                $targetPoints.each(function(){
                    return targetStateClose = !$(this).hasClass('active');
                });

                $allPoints.addClass('close').removeClass('active');
                $links.removeClass('current');

                if (targetStateClose) {

                    $(this).addClass('current');
                    $targetPoints.removeClass('close').addClass('active');

                }

                //return false;

            });

            $(document).bind('click', function(e) {

                if ($(e.target).closest('.b-floors_layer_point').length === 0 && $(e.target).closest('.b-floors_layers').length === 0 && $(e.target).closest('.b-floors_switcher').length === 0) {

                    $('[data-point]').addClass('close').removeClass('active');
                    $('[data-points]').removeClass('current');

                }

            });

        };

    };

};

// 08.08.18

$(document).ready(function () {

    $(".form__file input[type=file]").change(function () {
        var filename = $(this).val().replace(/.*\\/, "");
        $(".form__file-name").val(filename);
    });


    if ($(window).width() > 992) {
        $(window).scroll(function() {
            if($(this).scrollTop() >= 220/*280*/) {
                $('header .menu').addClass('stickytop');
            }
            else{
                $('header .menu').removeClass('stickytop');
            }
        });
    }

    $(function(){
        $(window).scroll(function(){
            if($(document).scrollTop()>$(window).height()){
                $('.scrolltotop').show();
            }else{
                $('.scrolltotop').hide();
            }
        });
        $('.scrolltotop').click(function(){
            $('html,body').animate({scrollTop: 0}, 1000);
        });
    });


});

// Prototypes
if (!Array.prototype.indexOf) {

    Array.prototype.indexOf = function(elt) {

        var len = this.length >>> 0,
            from = Number(arguments[1]) || 0;

        from = (from < 0) ? Math.ceil(from) : Math.floor(from);

        if (from < 0)
            from += len;

        for (; from < len; from++) {
            if (from in this &&
                this[from] === elt)
                return from;
        }

        return -1;

    };

}
