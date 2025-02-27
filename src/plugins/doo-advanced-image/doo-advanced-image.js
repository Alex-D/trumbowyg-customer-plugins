(function ($) {
    'use strict';

    // Plugin default options
    const defaultOptions = {};

    const BASE_64_URL_PLACEHOLDER = '(Base64)';

    // Factorize insert and edit modals
    function openAdvancedImageModal(trumbowyg, $img) {
        const fieldValues = {
            // Image fields
            src: '',
            alt: '',
            width: '',
            height: '',

            // Link fields
            href: '',
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
            fieldValues.width = $img.attr('width');
            fieldValues.height = $img.attr('height');

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
            src: {
                value: fieldValues.src,
                required: true
            },
            alt: {
                label: trumbowyg.lang.description,
                value: fieldValues.alt
            },
            width: {
                value: fieldValues.width
            },
            height: {
                value: fieldValues.width
            },

            // Link
            href: {
                value: fieldValues.href
            },
            target: {
                value: fieldValues.target,
                options: targetOptions
            },
        };

        trumbowyg.openModalInsert(trumbowyg.lang.dooAdvancedImage, options, function (v) { // v are values
            // If $img is undefined, we are inserting a new image
            if ($img === undefined) {
                trumbowyg.execCmd('insertImage', v.src, false, true);
                $img = $('img[src="' + v.src + '"]:not([alt])', trumbowyg.$box);
            }

            $img.attr({
                src: v.src,
                alt: v.alt,
            });
            if (v.width.trim().length > 0) {
                $img.attr('width', v.width);
            }
            if (v.height.trim().length > 0) {
                $img.attr('height', v.height);
            }

            if ($imgLink.length === 1) {
                ;(() => {
                    if (v.href.trim().length === 0) {
                        $imgLink.after($img);

                        if ($imgLink.html().trim().length === 0) {
                            $imgLink.remove();
                        }

                        return
                    }

                    $imgLink.attr({
                        href: v.href,
                    });
                })()
            }

            trumbowyg.syncCode();
            trumbowyg.$c.trigger('tbwchange');

            return true;
        });
    }

    // If the plugin is a button
    function buildButtonDef(trumbowyg) {
        return {
            fn: function () {
                trumbowyg.saveRange();

                openAdvancedImageModal(trumbowyg)
            },
            ico: 'insertImage'
        }
    }

    $.extend(true, $.trumbowyg, {
        // Add some translations
        langs: {
            en: {
                dooAdvancedImage: 'Insert Image',
                alt: 'Alternative Text',
                height: 'Height',
                src: 'Image URL',
                href: 'Link URL',
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
                    }

                    // If the plugin is a button
                    trumbowyg.addBtnDef('dooAdvancedImage', buildButtonDef(trumbowyg));
                }
            }
        }
    })
})(jQuery);
