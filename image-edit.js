/*
 * jQuery Basic HTML5 Image Plugin 0.0.1
 * https://github.com/jimlyndon/jquery.html5image
 * Copyright (c) 2011 Jim Lyndon
 * Licensed under the MIT license:
 * http://creativecommons.org/licenses/MIT/
 *
 */

(function ($) {
    'use strict';

    $.widget('ui.html5image', {
        version: "0.0.1",

        options: {},

        widget: function () {
            return this.html5image;
        },

        _hasCanvas: function() {
            var elem = document.createElement( 'canvas' );
            return !!(elem.getContext && elem.getContext('2d'));
        },

        _create: function () {
                var options = this.options,
                element = this.element,
                html5image = (this.html5image = $("<div>")).appendTo("body"),
                canvasEl = (this._hasCanvas()) ? $("<canvas></canvas>").addClass("ui-widget ui-imageedit").appendTo(html5image) : $("<img>").appendTo(html5image),
                src = element.attr("src"),
                img = new Image();

            this.html5image.canvas = canvasEl[0];
            html5image.appendTo("body");

            if (this._hasCanvas()) {
                var self = this;
                img.onload = function () {
                    var max = 400, aspectRatio = 1;
                    if (img.width > max || img.height > max) {
                        aspectRatio = max / Math.max(img.width, img.height);
                    }

                    var canvas = self.html5image.canvas;
                    canvas.width = element.width() * aspectRatio;
                    canvas.height = element.height() * aspectRatio;
                    canvas.context = canvas.getContext("2d");
                    canvas.context.save();
                    canvas.context.scale(aspectRatio, aspectRatio);
                    canvas.context.drawImage(img, 0, 0);
                    canvas.context.restore();
                };
                img.src = src;
            } else {
                var canvas = this.html5image.canvas;
                var max = 400, aspectRatio = 1;
                if (element.width() > max || element.height() > max) {
                    aspectRatio = max / Math.max(element.width(), element.height());
                }
                canvas.width = element.width() * aspectRatio;
                canvas.height = element.height() * aspectRatio;
                canvas.src = src;
            }

            // hide original image
            element.hide();

            // create editor buttons
            this._createButtons();
        },

        _createButtons: function () {
            var element = this.element,
            editor = $("<table>")
				.addClass("ui-widget icon-collection")
                .attr({ cellpaddding: "0", cellspacing: "0"  })
                .insertBefore(this.html5image.canvas),
			tbody = $("<tbody>")
                .appendTo(editor),
            rows=$("<tr>")
                .appendTo(tbody),
            cols = '',
            button_flipVert = "ui-icon-arrowthick-2-n-s",
            button_flipHorz = "ui-icon-arrowthick-2-e-w",
            button_rotate_left = "ui-icon-arrowthick-1-w",
            button_rotate_right = "ui-icon-arrowthick-1-e",
            buttons = [button_flipVert, button_flipHorz, button_rotate_left, button_rotate_right];
            
            $.each(buttons, function(idx, value) {
                cols += '<td><div class="ui-state-default ui-corner-all" title="' + value + '"><span class="ui-icon ' + value + '"></span></div></td>';
            });

            rows.append(cols);

            var self = this;

            $('.' + button_flipVert)
            .click(function () {
				self._verticalFlip();
			}).hover(
              function () {
                $(this).addClass("ui-state-hover");
              }, 
              function () {
                $(this).removeClass("ui-state-hover");
              }
            );

            $('.' + button_flipHorz)
            .click(function () {
				self._horizontalFlip();
			}).hover(
              function () {
                $(this).addClass("ui-state-hover");
              }, 
              function () {
                $(this).removeClass("ui-state-hover");
              }
            );

            $('.' + button_rotate_left)
            .click(function () {
				self._rotate();
			}).hover(
              function () {
                $(this).addClass("ui-state-hover");
              }, 
              function () {
                $(this).removeClass("ui-state-hover");
              }
            );

            $('.' + button_rotate_right)
            .click(function () {
				self._rotate(true);
			}).hover(
              function () {
                $(this).addClass("ui-state-hover");
              }, 
              function () {
                $(this).removeClass("ui-state-hover");
              }
            );
        },

        _verticalFlip: function () {
            if (this._hasCanvas()) {
                var canvas = this.html5image.canvas;
                canvas.context.save();
                canvas.context.scale(1, -1);
                canvas.context.translate(0, -canvas.height);
                canvas.context.drawImage(canvas, 0, 0);
                canvas.context.restore();
            } else {
                var canvas = this.html5image.canvas;
                if(isNaN(canvas.flipV)) {
                    canvas.flipV = 1;
                    canvas.rotation = 2;
                } else {
                    if(canvas.flipV == 1) {
                        canvas.flipV += -1;
                        canvas.rotation += -2;
                    } else { 
                        canvas.flipV += 1;
                        canvas.rotation += 2;
                    }
                }
                    
                canvas.style.filter = "progid:DXImageTransform.Microsoft.BasicImage(rotation="+ canvas.rotation +", mirror="+ canvas.flipV +")"; //"progid:DXImageTransform.Microsoft.Matrix(M11="+canvas.costheta+",M12="+(-canvas.sintheta)+",M21="+canvas.sintheta+",M22="+canvas.costheta+",SizingMethod='auto expand')";
            }
        },

        _horizontalFlip: function () {
            if (this._hasCanvas()) {
                var canvas = this.html5image.canvas;
                canvas.context.save();
                canvas.context.scale(-1, 1);
                canvas.context.translate(-canvas.width, 0);
                canvas.context.drawImage(canvas, 0, 0);
                canvas.context.restore();
            }
            else {
                var canvas = this.html5image.canvas;
                if(isNaN(canvas.angle))
                    canvas.angle = 0;

                canvas.angle = canvas.angle += 270;

		        var rotation = Math.PI * canvas.angle / 180;
            	var costheta = Math.cos(rotation);
	            var sintheta = Math.sin(rotation);                
                canvas.style.filter = "progid:DXImageTransform.Microsoft.Matrix(M11="+costheta+",M12="+(-sintheta)+",M21="+sintheta+",M22="+costheta+",SizingMethod='auto expand')";
            }
        },

        _rotate: function (clockwise) {
            if (this._hasCanvas()) {
                var canvas = this.html5image.canvas,
                    $tmpCanvas = $("<canvas></canvas>"),
                    tmpCanvas = $tmpCanvas[0];

                tmpCanvas.width = canvas.width;
                tmpCanvas.height = canvas.height;
                tmpCanvas.style.display = "none";
                tmpCanvas.getContext("2d").drawImage(canvas, 0, 0);
                $tmpCanvas.appendTo("body");
                canvas.width = tmpCanvas.height;
                canvas.height = tmpCanvas.width;
                canvas.context.save();

                var radius = Math.PI / 2;
                if (clockwise)
                    canvas.context.translate(canvas.width, 0);            
                else {
                    canvas.context.translate(0, canvas.height);
                    radius *= -1;
                }      

                canvas.context.rotate(radius);
                canvas.context.drawImage(tmpCanvas, 0, 0);
                canvas.context.restore();
                $tmpCanvas.remove();
            }
            else {
                var canvas = this.html5image.canvas;
                if(isNaN(canvas.angle))
                    canvas.angle = 0;

                canvas.angle = (clockwise) ? canvas.angle += 90 : canvas.angle -= 90;

		        var rotation = Math.PI * canvas.angle / 180;
            	var costheta = Math.cos(rotation);
	            var sintheta = Math.sin(rotation);                
                canvas.style.filter = "progid:DXImageTransform.Microsoft.Matrix(M11="+costheta+",M12="+(-sintheta)+",M21="+sintheta+",M22="+costheta+",SizingMethod='auto expand')";
            }
        },

        destroy: function () {
            this.html5image.remove();
            this.element.show();
        }
    });

} (jQuery));