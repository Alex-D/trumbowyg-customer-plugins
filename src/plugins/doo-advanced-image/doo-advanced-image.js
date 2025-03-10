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

            // Borders
            borderWidth: '',
            borderColor: '',

            // Margins
            horizontalMargin: '',
            verticalMargin: '',

            // Align
            align: 'default',

            // Link fields
            href: '',
            title: '',
            target: trumbowyg.o.linkTargets[0]
        }

        // Load all field values from existing image
        let $imgLink
        if ($img !== undefined) {
            // Image Attributes
            fieldValues.src = $img.attr('src') ?? '';

            if (fieldValues.src.indexOf('data:image') === 0) {
                fieldValues.src = BASE_64_URL_PLACEHOLDER;
            }

            fieldValues.alt = $img.attr('alt');
            fieldValues.width = $img.attr('width') ?? $img[0].style.width?.replace('px', '') ?? '';
            fieldValues.height = $img.attr('height') ?? $img[0].style.height?.replace('px', '') ?? '';

            // Aspect ratio
            const naturalAspectRatio = $img[0].naturalWidth / $img[0].naturalHeight;
            const currentAspectRatio = $img[0].width / $img[0].height;
            const hasSameAspectRatio = naturalAspectRatio === currentAspectRatio;
            fieldValues.preserveAspectRatio = hasSameAspectRatio ? 'checked' : '';

            // Image Borders
            fieldValues.borderWidth = $img[0].style.borderWidth?.replace('px', '') ?? '';
            fieldValues.borderColor = $img[0].style.borderColor ?? '';

            // Image Margins
            const imgMarginTop = $img[0].style.marginTop
            const imgMarginLeft = $img[0].style.marginLeft
            fieldValues.horizontalMargin = imgMarginLeft === 'auto' ? '' : imgMarginLeft?.replace('px', '') ?? '';
            fieldValues.verticalMargin = imgMarginTop?.replace('px', '') ?? '';

            // Image Align
            fieldValues.align = imgMarginLeft === 'auto' ? 'center' : $img[0].style.float ?? '';

            // Link Attributes
            $imgLink = $img.closest('a', trumbowyg.$ed[0]);
            if ($imgLink.length === 1) {
                fieldValues.href = $imgLink.attr('href');
                fieldValues.title = $imgLink.attr('title');
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

            // Image Borders
            dooAdvancedImageBorderWidth: {
                value: fieldValues.borderWidth,
            },
            dooAdvancedImageBorderColor: {
                value: fieldValues.borderColor,
            },

            // Image Margins
            dooAdvancedImageHorizontalMargin: {
                value: fieldValues.horizontalMargin,
            },
            dooAdvancedImageVerticalMargin: {
                value: fieldValues.verticalMargin,
            },

            // Image Align
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
            dooAdvancedImageLinkTitle: {
                value: fieldValues.title
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
            const width = v.dooAdvancedImageWidth.trim() || '';
            $img.css('width', width ? `${width}px` : '');
            let height = v.dooAdvancedImageHeight.trim() || '';
            if (width && v.dooAdvancedImagePreserveAspectRatio) {
                const aspectRatio = $img[0].naturalWidth / $img[0].naturalHeight;
                height = parseInt(width) * (1 / aspectRatio);
            }
            $img.css('height', height ? `${height}px` : '');

            // Remove width & height attributes since we use the width and height style
            $img.removeAttr('width');
            $img.removeAttr('height');

            // Image Borders
            let borderWidth = v.dooAdvancedImageBorderWidth;
            let borderStyle = 'solid';
            let borderColor = v.dooAdvancedImageBorderColor;
            let border = '';
            if (borderWidth && borderColor) {
                border = `${borderWidth}px ${borderStyle} ${borderColor}`;
            }
            $img.css('borderWidth', '');
            $img.css('borderStyle', '');
            $img.css('borderColor', '');
            $img.css('border', border);

            // Image Align & Margins
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
                    $imgLink.attr('title', v.dooAdvancedImageLinkTitle.trim() || null);

                    let linkTarget = v.dooAdvancedImageLinkTarget.trim();
                    if (linkTarget === '_self') {
                        linkTarget = null; // Remove the useless target attribute
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

                // Image Borders
                dooAdvancedImageBorderWidth: 'Border Width',
                dooAdvancedImageBorderColor: 'Border Color',

                // Image Margins
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
