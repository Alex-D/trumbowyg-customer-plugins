;(function ($) {
    'use strict';

    // Plugin default options
    const defaultOptions = {};

    const BASE_64_URL_PLACEHOLDER = '(Base64)';

    function capitalizeFirstLetter(string) {
        if (string === undefined || string.length === 0) {
            return '';
        }

        return string[0].toUpperCase() + string.slice(1);
    }

    // Factorize insert and edit modals
    function openAdvancedImageModal(trumbowyg, $img) {
        const fieldValues = {
            // Image fields
            src: '',
            alt: '',
            width: '',
            height: '',
            preserveAspectRatio: 'checked',
            horizontalMargin: '',
            verticalMargin: '',
            align: 'default',

            // Link fields
            href: '',
            target: trumbowyg.o.linkTargets[0]
        }

        // Load all field values from existing image
        let $imgLink
        if ($img !== undefined) {
            // Image attributes
            fieldValues.src = $img.attr('src') ?? '';

            if (fieldValues.src.indexOf('data:image') === 0) {
                fieldValues.src = BASE_64_URL_PLACEHOLDER;
            }

            fieldValues.alt = $img.attr('alt');
            fieldValues.width = $img.attr('width') ?? $img[0].style.width?.replace('px', '') ?? '';
            fieldValues.height = $img.attr('height') ?? $img[0].style.height?.replace('px', '') ?? '';
            const imgMarginTop = $img[0].style.marginTop
            const imgMarginLeft = $img[0].style.marginLeft
            fieldValues.horizontalMargin = imgMarginLeft === 'auto' ? '' : imgMarginLeft?.replace('px', '') ?? '';
            fieldValues.verticalMargin = imgMarginTop?.replace('px', '') ?? '';
            fieldValues.align = imgMarginLeft === 'auto' ? 'center' : $img[0].style.float ?? '';

            // Link attributes
            $imgLink = $img.closest('a', trumbowyg.$ed[0]);
            if ($imgLink.length === 1) {
                fieldValues.href = $imgLink.attr('href');
                fieldValues.target = $imgLink.attr('target');
            }
        }

        const targetOptions = trumbowyg.o.linkTargets.reduce(function (options, optionValue) {
            options[optionValue] = trumbowyg.lang[optionValue];

            return options;
        }, {});

        const options = {
            // Image
            dooAdvancedImageSrc: {
                value: fieldValues.src,
                required: true
            },
            dooAdvancedImageAlt: {
                value: fieldValues.alt
            },
            dooAdvancedImageWidth: {
                value: fieldValues.width
            },
            dooAdvancedImageHeight: {
                value: fieldValues.height
            },
            dooAdvancedImagePreserveAspectRatio: {
                type: 'checkbox',
                value: fieldValues.preserveAspectRatio
            },
            dooAdvancedImageHorizontalMargin: {
                value: fieldValues.horizontalMargin,
            },
            dooAdvancedImageVerticalMargin: {
                value: fieldValues.verticalMargin,
            },
            dooAdvancedImageAlign: {
                value: fieldValues.align,
                options: [
                    'default',
                    'left',
                    'center',
                    'right',
                ].reduce(function (options, optionValue) {
                    options[optionValue] = trumbowyg.lang['dooAdvancedImageAlign' + capitalizeFirstLetter(optionValue)];
                    return options;
                }, {})
            },

            // Link
            dooAdvancedImageLinkHref: {
                value: fieldValues.href
            },
            dooAdvancedImageLinkTarget: {
                value: fieldValues.target,
                options: targetOptions
            },
        };

        trumbowyg.openModalInsert(trumbowyg.lang.dooAdvancedImage, options, function (v) { // v are values
            // If $img is undefined, we are inserting a new image
            if ($img === undefined) {
                trumbowyg.execCmd('insertImage', v.dooAdvancedImageSrc, false, true);
                $img = $('img[src="' + v.dooAdvancedImageSrc + '"]:not([alt])', trumbowyg.$box);
            }

            // Update image attributes
            $img.attr({
                src: v.dooAdvancedImageSrc,
                alt: v.dooAdvancedImageAlt,
            });
            $img.attr('width', v.dooAdvancedImageWidth.trim() || null);
            $img.attr('height', v.dooAdvancedImageHeight.trim() || null);
            let imgHorizontalMargin = v.dooAdvancedImageHorizontalMargin ? v.dooAdvancedImageHorizontalMargin + 'px' : 0;
            let imgVerticalMargin = v.dooAdvancedImageVerticalMargin ? v.dooAdvancedImageVerticalMargin + 'px' : 0;
            let imgFloat = '';
            let imgDisplay = '';
            switch (v.dooAdvancedImageAlign) {
                case 'left':
                case 'right':
                    imgFloat = v.dooAdvancedImageAlign;
                    break;
                case 'center':
                    imgDisplay = 'block';
                    imgHorizontalMargin = 'auto';
                    break;
                default:
            }
            $img.css('display', imgDisplay);
            $img.css('float', imgFloat);
            $img.css(
                'margin',
                imgHorizontalMargin || imgVerticalMargin
                    ? `${imgVerticalMargin} ${imgHorizontalMargin}`
                    : ''
            );

            // Remove width & height from style attribute since we use the width and height attributes
            $img.css('width', '');
            $img.css('height', '');

            // If $imgLink does not exist, and we have a href, we need to wrap with a link
            const hasHref = v.dooAdvancedImageLinkHref.trim().length > 0;
            if ($imgLink.length === 0 && hasHref) {
                $img.wrap('<a/>');
                $imgLink = $img.parent();
            }

            // Update link attributes
            if ($imgLink.length === 1) {
                ;(() => {
                    if (!hasHref) {
                        $imgLink.after($img);

                        if ($imgLink.html().trim().length === 0) {
                            $imgLink.remove();
                        }

                        return;
                    }

                    $imgLink.attr('href', v.dooAdvancedImageLinkHref.trim() || null);

                    let linkTarget = v.dooAdvancedImageLinkTarget.trim() ?? '_self';
                    if (linkTarget === '_self') {
                        linkTarget = null;
                    }
                    $imgLink.attr('target', linkTarget);
                })();
            }

            // Remove image style attribute if empty
            if ($img.attr('style')?.trim().length === 0) {
                $img.removeAttr('style');
            }

            trumbowyg.syncCode();
            trumbowyg.$c.trigger('tbwchange');

            return true;
        });
    }

    function buildButtonDef(trumbowyg) {
        // noinspection JSUnusedGlobalSymbols
        return {
            fn: function () {
                trumbowyg.saveRange();

                openAdvancedImageModal(trumbowyg);
            },
            ico: 'insertImage'
        };
    }

    // noinspection JSUnusedGlobalSymbols
    $.extend(true, $.trumbowyg, {
        // Add some translations
        langs: {
            en: {
                dooAdvancedImage: 'Insert Image',

                // Image
                dooAdvancedImageSrc: 'Image URL',
                dooAdvancedImageAlt: 'Alternative Text',
                dooAdvancedImageWidth: 'Width',
                dooAdvancedImageHeight: 'Height',
                dooAdvancedImagePreserveAspectRatio: 'Preserve ratio',

                // Image margins
                dooAdvancedImageHorizontalMargin: 'Horizontal Margin',
                dooAdvancedImageVerticalMargin: 'Vertical Margin',

                // Image Align
                dooAdvancedImageAlign: 'Align',
                dooAdvancedImageAlignDefault: 'Default',
                dooAdvancedImageAlignLeft: 'Left',
                dooAdvancedImageAlignCenter: 'Center',
                dooAdvancedImageAlignRight: 'Right',

                // Link
                dooAdvancedImageLinkHref: 'Link URL',
                dooAdvancedImageLinkTitle: 'Link title',
                dooAdvancedImageLinkTarget: 'Link Target',
            }
        },

        // Register plugin in Trumbowyg
        plugins: {
            dooAdvancedImage: {
                // Code called by Trumbowyg core to register the plugin
                init: function (trumbowyg) {
                    // Fill current Trumbowyg instance with the plugin default options
                    trumbowyg.o.plugins.dooAdvancedImage = $.extend(true, {},
                        defaultOptions,
                        trumbowyg.o.plugins.dooAdvancedImage || {}
                    );

                    // Force custom image double click handler
                    trumbowyg.o.imgDblClickHandler = function () {
                        const $img = $(this);

                        openAdvancedImageModal(trumbowyg, $img);
                    };

                    // Register the button definition
                    trumbowyg.addBtnDef('dooAdvancedImage', buildButtonDef(trumbowyg));
                }
            }
        }
    });
})(jQuery);
