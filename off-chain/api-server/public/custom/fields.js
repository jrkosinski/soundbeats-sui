!function(e,t){if("function"==typeof define&&define.amd)define(["module","exports"],t);else if("undefined"!=typeof exports)t(module,exports);else{var n={exports:{}};t(n,n.exports),e.autosize=n.exports}}(this,function(e,t){"use strict";var n,o,p="function"==typeof Map?new Map:(n=[],o=[],{has:function(e){return-1<n.indexOf(e)},get:function(e){return o[n.indexOf(e)]},set:function(e,t){-1===n.indexOf(e)&&(n.push(e),o.push(t))},delete:function(e){var t=n.indexOf(e);-1<t&&(n.splice(t,1),o.splice(t,1))}}),c=function(e){return new Event(e,{bubbles:!0})};try{new Event("test")}catch(e){c=function(e){var t=document.createEvent("Event");return t.initEvent(e,!0,!1),t}}function r(r){if(r&&r.nodeName&&"TEXTAREA"===r.nodeName&&!p.has(r)){var e,n=null,o=null,i=null,d=function(){r.clientWidth!==o&&a()},l=function(t){window.removeEventListener("resize",d,!1),r.removeEventListener("input",a,!1),r.removeEventListener("keyup",a,!1),r.removeEventListener("autosize:destroy",l,!1),r.removeEventListener("autosize:update",a,!1),Object.keys(t).forEach(function(e){r.style[e]=t[e]}),p.delete(r)}.bind(r,{height:r.style.height,resize:r.style.resize,overflowY:r.style.overflowY,overflowX:r.style.overflowX,wordWrap:r.style.wordWrap});r.addEventListener("autosize:destroy",l,!1),"onpropertychange"in r&&"oninput"in r&&r.addEventListener("keyup",a,!1),window.addEventListener("resize",d,!1),r.addEventListener("input",a,!1),r.addEventListener("autosize:update",a,!1),r.style.overflowX="hidden",r.style.wordWrap="break-word",p.set(r,{destroy:l,update:a}),"vertical"===(e=window.getComputedStyle(r,null)).resize?r.style.resize="none":"both"===e.resize&&(r.style.resize="horizontal"),n="content-box"===e.boxSizing?-(parseFloat(e.paddingTop)+parseFloat(e.paddingBottom)):parseFloat(e.borderTopWidth)+parseFloat(e.borderBottomWidth),isNaN(n)&&(n=0),a()}function s(e){var t=r.style.width;r.style.width="0px",r.offsetWidth,r.style.width=t,r.style.overflowY=e}function u(){if(0!==r.scrollHeight){var e=function(e){for(var t=[];e&&e.parentNode&&e.parentNode instanceof Element;)e.parentNode.scrollTop&&t.push({node:e.parentNode,scrollTop:e.parentNode.scrollTop}),e=e.parentNode;return t}(r),t=document.documentElement&&document.documentElement.scrollTop;r.style.height="",r.style.height=r.scrollHeight+n+"px",o=r.clientWidth,e.forEach(function(e){e.node.scrollTop=e.scrollTop}),t&&(document.documentElement.scrollTop=t)}}function a(){u();var e=Math.round(parseFloat(r.style.height)),t=window.getComputedStyle(r,null),n="content-box"===t.boxSizing?Math.round(parseFloat(t.height)):r.offsetHeight;if(n<e?"hidden"===t.overflowY&&(s("scroll"),u(),n="content-box"===t.boxSizing?Math.round(parseFloat(window.getComputedStyle(r,null).height)):r.offsetHeight):"hidden"!==t.overflowY&&(s("hidden"),u(),n="content-box"===t.boxSizing?Math.round(parseFloat(window.getComputedStyle(r,null).height)):r.offsetHeight),i!==n){i=n;var o=c("autosize:resized");try{r.dispatchEvent(o)}catch(e){}}}}function i(e){var t=p.get(e);t&&t.destroy()}function d(e){var t=p.get(e);t&&t.update()}var l=null;"undefined"==typeof window||"function"!=typeof window.getComputedStyle?((l=function(e){return e}).destroy=function(e){return e},l.update=function(e){return e}):((l=function(e,t){return e&&Array.prototype.forEach.call(e.length?e:[e],function(e){return r(e)}),e}).destroy=function(e){return e&&Array.prototype.forEach.call(e.length?e:[e],i),e},l.update=function(e){return e&&Array.prototype.forEach.call(e.length?e:[e],d),e}),t.default=l,e.exports=t.default});

$(function () {


    $('.slider').slider();

    $('.select2').select2({
        width: '100%'
    });
    $('.select2bs4').select2({
        theme: 'bootstrap4',
        width: '100%'
    });

    //Colorpicker
    $('.my-colorpicker1').colorpicker()
    //color picker with addon
    // $('.my-colorpicker2').colorpicker({
    //     horizontal: true
    // })
    //
    // $('.my-colorpicker2').on('colorpickerChange', function(event) {
    //     $('.my-colorpicker2 .fa-square').css('color', event.color.toString());
    // });

    bsCustomFileInput.init();

    $(".localized_file").change(function(event, params) {
        $('.file_bl[data-val^="'+ $(this).attr('title') +'"]').hide();
        $('.file_bl[data-val="'+ $(this).attr('title') +'['+$(this).val()+']"]').show();
    });
    $(".localized_text").change(function(event, params) {
        $('input[name^="'+ $(this).attr('title') +'"]').hide();
        $('input[name="'+ $(this).attr('title') +'['+$(this).val()+']"]').show();
    });
    $(".localized_textarea").change(function(event, params) {
        $('textarea[name^="'+ $(this).attr('title') +'"]').hide();
        $('textarea[name="'+ $(this).attr('title') +'['+$(this).val()+']"]').show();
        $.each($('textarea[data-autoresize]:visible'), function() {
            var offset = this.offsetHeight - this.clientHeight;

            var resizeTextarea = function(el) {
                $(el).css('height', 'auto').css('height', el.scrollHeight + offset);
            };
            resizeTextarea(this);
            $(this).on('keyup input', function() { resizeTextarea(this); }).removeAttr('data-autoresize');
        });
    });

     $(".localized_editor").change(function(event, params) {
         $('textarea[name^="'+ $(this).attr('title') +'"]').parent().hide();
         $('textarea[name="'+ $(this).attr('title') +'['+$(this).val()+']"]').parent().show();
     });

    autosize(document.getElementsByClassName("localized_textarea"));

    $('.add-options-item').click(function () {
        $('options-root').append('')
    });

    $('.options-plus').click(function () {

        var $langauge = $(this).data('language');
        var $name = $(this).data('name');

        var $clonedObj = $('#cloneable-option').clone().appendTo($(this).parent().parent().find('.cloned-options')).removeAttr('id').show(400);
        var $key = Math.random().toString(36).substring(7);
        $clonedObj.find('.option-name').attr('name', $name+'['+$langauge+']'+'['+ $key +'][name]');
        $clonedObj.find('.option-value').attr('name', $name+'['+$langauge+']'+'['+$key+'][value]');
        $clonedObj.find('.option-link').attr('name', $name+'['+$langauge+']'+'['+$key+'][link]');

    });


    $('.datepicker').datepicker({
        autoclose: true
    })
});

jQuery.each(jQuery('textarea[data-autoresize]:visible'), function() {
    var offset = this.offsetHeight - this.clientHeight;

    var resizeTextarea = function(el) {
        jQuery(el).css('height', 'auto').css('height', el.scrollHeight + offset);
    };
    resizeTextarea(this);
    jQuery(this).on('keyup input', function() { resizeTextarea(this); }).removeAttr('data-autoresize');
});


//lumiere

(function ( $ ) {

    $.fn.imagePicker = function( options ) {

        // Define plugin options
        var settings = $.extend({
            // Input name attribute
            name: "",
            // Classes for styling the input
            class: "form-control btn btn-default btn-block",
            // Icon which displays in center of input
            icon: "glyphicon glyphicon-plus"
        }, options );

        // Create an input inside each matched element
        return this.each(function() {
            $(this).html(create_btn(this, settings));
        });

    };

    // Private function for creating the input element
    function create_btn(that, settings) {
        // The input icon element
        var picker_btn_icon = $('<i class="'+settings.icon+'"></i>');

        // The actual file input which stays hidden
        var picker_btn_input = $('<input type="file" name="'+settings.name+'" />');

        // The actual element displayed
        var picker_btn = $('<div class="'+settings.class+' img-upload-btn"></div>')
            .append(picker_btn_icon)
            .append(picker_btn_input);

        // File load listener
        picker_btn_input.change(function() {
            if ($(this).prop('files')[0]) {
                // Use FileReader to get file
                var reader = new FileReader();

                // Create a preview once image has loaded
                reader.onload = function(e) {
                    var preview = create_preview(that, e.target.result, settings);
                    $(that).html(preview);
                }

                // Load image
                reader.readAsDataURL(picker_btn_input.prop('files')[0]);
            }
        });

        return picker_btn
    };

    // Private function for creating a preview element
    function create_preview(that, src, settings) {

        // The preview image
        var picker_preview_image = $('<img src="'+src+'" class="img-responsive img-rounded" />');

        // The remove image button
        var picker_preview_remove = $('<button class="btn btn-link"><small>Remove</small></button>');

        // The preview element
        var picker_preview = $('<div class="text-center"></div>')
            .append(picker_preview_image)
            .append(picker_preview_remove);

        // Remove image listener
        picker_preview_remove.click(function() {
            var btn = create_btn(that, settings);
            $(that).html(btn);
        });

        return picker_preview;
    };

}( jQuery ));

$(document).ready(function() {
    $('.img-picker-0').imagePicker({name: 'images[0]'});
    $('.img-picker-1').imagePicker({name: 'images[1]'});
    $('.img-picker-2').imagePicker({name: 'images[2]'});
    $('.img-picker-3').imagePicker({name: 'images[3]'});
    $('.img-picker-4').imagePicker({name: 'images[4]'});
})
