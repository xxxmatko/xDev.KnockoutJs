(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module.
        define(["jquery", "knockout"], factory);
    } 
    else if (typeof module === "object" && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node.
        module.exports = factory(require("jquery"), require("knockout"));
    } 
    else {
        // Browser globals (root is window)
        factory(root.jQuery, root.ko);
    }
}(this, function ($, ko) {
    //#region [ Fields ]

    var placeholders = [];
    var placeholdersIdx = 0;
    var timeout = null;
    var lastCharTimeout = null;
    var charIndex = 0;
    var domNode = null;
    var lastChar = null;
    var blinkCounter = 0;

    //#endregion


    //#region [ Methods : Private ]

    /**
     * Animates blinking of the last character.
     */
    var _blinkLastChar = function () {
        if (lastCharTimeout) {
            clearTimeout(lastCharTimeout);
            lastCharTimeout = null;
        }

        // Get the actual placeholder
        var plc = $(domNode).attr("placeholder");
        if (plc[plc.length - 1] === lastChar) {
            plc = plc.substring(0, plc.length - 1);
        }
        else {
            plc = plc + lastChar;
        }
        $(domNode).attr("placeholder", plc);
        blinkCounter++;

        if (blinkCounter < 8) {
            lastCharTimeout = setTimeout(_blinkLastChar, 500);
        }
    };


    /**
     * Animates typing in in the textbox.
     */
    var _typeIn = function () {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }

        // Get next character
        charIndex++;

        // Get actual placeholder text
        var txt = placeholders[placeholdersIdx];

        // Get the the displaying part of the current placeholder text
        var type = txt.substring(0, charIndex);
        if (charIndex < txt.length) {
            type = type + lastChar;
        }

        // Set the placeholder text
        $(domNode).attr("placeholder", type);

        // Get next timeout length
        var t = Math.round(Math.random() * (200 - 30)) + 30;

        // If we hit the last char of the placeholder get the next one
        if (charIndex == txt.length) {
            t = 5000;
            charIndex = 0;
            placeholdersIdx = (placeholdersIdx < (placeholders.length - 1)) ? placeholdersIdx + 1 : 0;

            // Animation for the last char blink
            blinkCounter = 0;
            lastCharTimeout = setTimeout(_blinkLastChar, 500);
        }

        timeout = setTimeout(_typeIn, t);
    };

    //#endregion


    //#region [ Event Handlers ]

    /**
     * Event handler for the domNode focus event.
     *
     * @param {object} e Event arguments.
     */
    var _domNode_onFocus = function (e) {
        if (lastCharTimeout) {
            clearTimeout(lastCharTimeout);
            lastCharTimeout = null;
        }
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }

        $(domNode).attr("placeholder", "");
        charIndex = 0;
        blinkCounter = 0;
    };


    /**
     * Event handler for the domNode blur event.
     *
     * @param {object} e Event arguments.
     */
    var _domNode_onBlur = function (e) {
        if ($(domNode).val()) {
            return;
        }

        // Start typing
        timeout = setTimeout(_typeIn, 1000);
    };

    //#endregion


    //#region [ Knockout ]

    /**
     * Placeholder binding.
     */
    ko.bindingHandlers.placeholder = {
        init: function (element, valueAccessor, allBindings) {
            domNode = element;
            var text = ko.unwrap(valueAccessor());

            if (text instanceof Array) {
                placeholders = text.filter(function (t) {
                    return (t || "").length > 0;
                });
            }

            if (typeof (text) === "string") {
                placeholders.push(text);
            }

            // Grab some more data from another binding property
            lastChar = allBindings.get("lastChar") || "|";

            // Stop typing in focues and restart on focus out
            $(domNode)
                .focus(_domNode_onFocus)
                .blur(_domNode_onBlur);

            // Clear placeholder
            $(domNode).attr("placeholder", "");

            // Start typing
            timeout = setTimeout(_typeIn, 1000);
        },
        update: function (element, valueAccessor, allBindings) {
            if (lastCharTimeout) {
                clearTimeout(lastCharTimeout);
                lastCharTimeout = null;
            }
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }

            placeholders = [];
            placeholdersIdx = 0;
            charIndex = 0;
            blinkCounter = 0;

            var text = ko.unwrap(valueAccessor());

            if (text instanceof Array) {
                placeholders = text.filter(function (t) {
                    return (t || "").length > 0;
                });
            }

            if (typeof (text) === "string") {
                placeholders.push(text);
            }

            // Grab some more data from another binding property
            lastChar = allBindings.get("lastChar") || "|";

            // Clear placeholder
            $(domNode).attr("placeholder", "");

            // Start typing
            timeout = setTimeout(_typeIn, 1000);
        }
    };

    //#endregion
}));