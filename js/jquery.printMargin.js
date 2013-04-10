/*
 * jQuery vertical margin rule plugin
 *
 * Author: Tom Faris
 *
 * Use the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 */

;
(function ($) {
    $.PrintMargin = function(element){
        var pmObj = this,
            marginSurface, marginContainer, marginRule, marginLine;

        this.init = function(element){
            var e = element.each(function(){
                var surface = $(this),
                    container, rule, ruleLine;
                if (!surface.hasClass("printMarginSurface")){
                    // New surface. Create required elements and modify the existing HTML.
                    surface.addClass("printMarginSurface");

                    container = $("<div class='printMarginContainer'></div>");
                    rule      = $("<div class='printMarginRule'></div>");
                    ruleLine  = $("<div class='printMarginLine'></div>");

                    surface.replaceWith(container);
                    container.append(rule.append(ruleLine));
                    container.append(surface);
                }
                else{
                    container = surface.parents("div.printMarginContainer");
                    rule = container.find("div.printMarginRule");
                    ruleLine = container.find("div.printMarginLine");
                }
                if ($("#printMarginMeasurer").length == 0){
                    $("body").append("<div id='printMarginMeasurer'></div>");
                }

                marginSurface = surface;
                marginContainer = container;
                marginRule = rule;
                marginLine = ruleLine;
                pmObj.fitRuler();
            });

            // On surface scroll, reposition the margin line
            marginSurface.scroll(function(e){
                var h = marginSurface.scrollLeft();
                marginRule.css("left",-h);
                pmObj.fitRuler();
            });

            marginSurface.keyup(function(){
                pmObj.fitRuler();
            });

            // On surface mouse move events, measure if the size of the surface is different than the last
            // time it was read. If it is different, the surface has been resized - fit the ruler again.
            var txW = marginSurface.width(),
                txH = marginSurface.height();
            marginSurface.mousemove(function(){
                if (txW != marginSurface.width() || txH != marginSurface.height()){
                    pmObj.fitRuler();
                    txW = marginSurface.width();
                    txH = marginSurface.height();
                }
            });

            $(window).resize(function(){
                // Re-fit the ruler on window resize
               pmObj.fitRuler();
            });
        };

        /*
        Get the width and height occupied by the current text of the surface.
        */
        this.getSize = function (s){
            // Measure text size by copying the surfaces' text into a hidden div with the
            // same font properties and reading out width and height
            var measDiv = $("#printMarginMeasurer")
                    .css({"font-size": marginSurface.css("font-size"),
                        "font-family": marginSurface.css("font-family")})
                    .text(s),
                w = measDiv.width(),
                h = measDiv.height();
            return [w,h];
        };

        /*
        Position the ruler at the specified character column.
        */
        this.positionRuler = function (columns){

            var s = "";
            for (var i=0; i < columns; i++){
                s += "A";
            }
            var size = this.getSize(s);
            marginLine.css("left",size[0]+"px");
        };

        /*
        Fit the ruler container and its associated objects.
        */
        this.fitRuler = function(){
            /*
            TODO: The fit does not take into account padding, margins, etc.
            */

            var css = {width: marginSurface.width(),
                       height: marginSurface.height()};
//            marginContainer.css({
//                width: css.width+15,
//                height: css.height+15
//            });
            marginRule.css(css);
            marginLine.css("height", css.height);

            var surfaceLeft = parseInt(marginSurface.css("left")),
                lineLeft = parseInt(marginLine.css("left")),
                scrollLeft = marginSurface.scrollLeft();

            if (lineLeft >= surfaceLeft && lineLeft - scrollLeft <= css.width)
            {
                marginLine.css("display","block");
            }
            else{
                marginLine.css("display","none");
            }
        };

        this.init(element);
    };

    $.fn.printMargin = function(options){

        var settings = $.extend( {
            column: 80
        }, options);

        return this.each(function(){
            var p = new $.PrintMargin($(this));
            p.positionRuler(settings.column);
            p.fitRuler();
        });
    };
})(jQuery);