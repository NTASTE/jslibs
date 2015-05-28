function onDomReady(doReady) {
    var win = window,
        doc = document,
        isDomReady = false,
        docReadyProcId = -1,
        TIME_INTERVAL = 10,
        READY_REG = /loaded|complete/,
        EVT_CONTENT = 'DOMContentLoaded',
        EVT_STATE = 'onreadystatechange',
        EVT_LOAD = 'onload';

    var fireDocReady = function() {
            if (isDomReady === false) { /*fire only one times*/
                isDomReady = true;
                doReady();
            }
            win.clearInterval(docReadyProcId);
        };

    var checkDoScroll = function() {
            docReadyProcId = win.setInterval(function() {
                try {
                    doc.documentElement.doScroll('left'); /*DOMContentLoaded*/
                    fireDocReady();
                } catch (ex) {}
            }, TIME_INTERVAL);
        };

    var checkDocState = function() {
            docReadyProcId = win.setInterval(function() {
                if (READY_REG.test(doc.readyState)) { /*DOMContentLoaded*/
                    fireDocReady();
                }
            }, TIME_INTERVAL);
        };
    //DOM has loaded before bind onDomReady Function
    if (READY_REG.test(doc.readyState)) {
        isDomReady = true;
        return false;
    }
    // Mozilla, Opera and webkit nightlies currently support DOMContentLoaded event, but Webkit version >= 525
    if (doc.addEventListener) {
        //support the DOMContentLoaded Event
        doc.addEventListener(EVT_CONTENT, function() {
            doc.removeEventListener(EVT_CONTENT, arguments.callee, false); /*DOMContentLoaded*/
            fireDocReady();
        }, false);
        //if webkit version < 525 or do not support DOMContentLoaded event.
        checkDocState();
    } else if (doc.attachEvent) { /*If IE event model is used*/
        doc.attachEvent(EVT_STATE, function() {
            if (READY_REG.test(doc.readyState)) { /*DOMContentLoaded*/
                doc.detachEvent(EVT_STATE, arguments.callee);
                fireDocReady();
            }
        });
        win.attachEvent(EVT_LOAD, function() {
            win.detachEvent(EVT_LOAD, arguments.callee); /*DOMContentLoaded*/
            fireDocReady();
        });
        /*
         * If IE and not an iframe, if true, win is top-level.
         * frameElement is the element which the win is embedded into, or null if the win is top-level.
         * http://javascript.nwbox.com/IEContentLoaded/
         */
        if (doc.documentElement.doScroll && (win.frameElement === null || typeof win.frameElement === 'undefined')) {
            checkDoScroll();
        }
    } else {
        win[EVT_LOAD] = function() { /*DOMContentLoaded*/
            fireDocReady();
        };
    }
    return true;
}
