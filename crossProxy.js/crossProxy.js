window.crossProxy = (function(window, document, undefined) {
    var version = '1.0.0',
        prefix = 'cross-proxy-iframe-',
        crossProxy = {},
        count = 0,
        ajaxHelper = null;


    crossProxy.version = version;
    crossProxy.prefix = prefix;

    crossProxy.ajaxProxySuccess = {};
    crossProxy.ajaxProxyError = {};
    crossProxy.ajaxProxyComplete = {};

    /*
     * 判断当前页面和指定URL是否在同一个域名
     */

    function isCrossDomain(url) {
        return url.indexOf('http') !== -1 && url.split('/')[2] !== document.location.host;
    }

    /*
     * 创建一个DOM
     */

    function createElement(tagName) {
        return document.createElement(tagName);
    }

    /*
     * 从页面删除一个DOM
     */

    function removeElement(elem) {
        var parent = elem.parentNode;
        if (parent) {
            parent.removeChild(elem);
        }
    }

    /*
     * 向页面添加DOM
     */

    function addElement(parent, child) {
        if (parent) {
            parent.appendChild(child);
        }
    }

    /*
     * 用第二个对象的属性值覆盖第一个对象的属性值，返回一个新的对象
     */

    function merge(obj1, obj2) {
        var pro, newObj = {};
        for (pro in obj1) {
            if (obj1.hasOwnProperty(pro)) {
                newObj[pro] = (obj2[pro] === undefined) ? obj1[pro] : obj2[pro];
            }
        }
        return newObj;
    }

    /*
     * 扩展一个对象
     */

    function extend(des, source) {
        var key;
        for (key in source) {
            if (source.hasOwnProperty(key)) {
                des[key] = source[key];
            }
        }
        return des;
    }

    /*
     * 浅复制一个对象
     */

    function clone(obj) {
        var o, newObj = {};
        if (typeof obj !== 'object') {
            return null;
        }
        for (o in obj) {
            if (obj.hasOwnProperty(o)) {
                newObj[o] = obj[o];
            }
        }
        return newObj;
    }

    /*
     * 创建一个不显示的iframe 
     */

    function createIframeDOM() {
        var iframe = createElement('iframe');
        iframe.height = 0;
        iframe.width = 0;
        iframe.frameborder = 0;
        iframe.style.display = 'none';
        return iframe;
    }

    /*
     * 生成回调函数Key
     */

    function getCBK() {
        ++count;
        return String(new Date().getTime() + count);
    }

    /*
     * 对象转换成查询字符串
     */

    function objToStr(obj) {
        if (!obj) return '';
        if (typeof obj !== 'object') return obj;
        var s = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                s.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]));
            }
        }
        return s.join('&');
    }

    /*
     * 查询字符串转换成对象
     */

    function strToObj(str) {
        var pairs = str.split("&"),
            len = pairs.length,
            values = null;
        if (len > 1) {
            values = {};
            for (var i = 0; i < len; i++) {
                var p = pairs[i].split("=");
                values[p[0]] = decodeURIComponent(p[1]);
            }
        } else {
            return str;
        }
        return values;
    }

    /*
     * 去掉字符串两端的空白
     */

    function trim(str) {
        return str.replace(/^\s+/, '').replace(/\s+$/, '');
    }

    /*
     * JSON字符串转换成对象
     */

    function parseJSON(data) {
        if (typeof data !== 'string' || !data) return null;
        return eval('(' + trim(data) + ')');
    }

    /*
     * 将对象字符串型的"true","false"值转换成Boolean
     */

    function dealStrBool(obj, prop) {
        if (obj[prop] === 'false') {
            obj[prop] = false;
        } else if (obj[prop] === 'true') {
            obj[prop] = true;
        }
        return obj;
    }

    /*
     * 判断是否为函数
     */

    function isFunction(obj) {
        return Object.prototype.toString.call(obj) === '[object Function]';
    }

    /*
     * 解析一个URL
     */

    function parseUrl(url) {
        var a, path, port;
        a = document.createElement('a');
        a.href = url;
        path = a.pathname, port = a.port;
        return {
            hostname: a.hostname,
            pathname: path.indexOf('/') === 0 ? path : ('/' + path),
            search: a.search,
            hash: a.hash,
            port: (a.port === '' || a.port === '0') ? '80' : a.port,
            protocol: a.protocol
        };
    }

    /*
     * 设置一个定时器
     */

    function timer(method, delay, context) {
        context = context || this;
        if (isFunction(method)) {
            window.setTimeout(function() {
                method.apply(context);
            }, delay);
        }
    }

    ajaxHelper = {
        xhr: null,
        settings: {
            url: '',
            type: 'GET',
            dataType: 'text',
            // text, html, json or xml
            async: true,
            cache: true,
            data: null,
            contentType: 'application/x-www-form-urlencoded',
            success: null,
            error: null,
            complete: null,
            accepts: {
                text: 'text/plain',
                html: 'text/html',
                xml: 'application/xml, text/xml',
                json: 'application/json, text/javascript'
            }
        },
        ajax: function(options) {
            var self = this,
                xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP'),
                opts = merge(this.settings, options),
                ready = function() {
                    if (xhr.readyState == 4) {
                        if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
                            // set data
                            var data = (opts.dataType == 'xml') ? xhr.responseXML : xhr.responseText;
                            // parse json data
                            // if (opts.dataType == 'json') data = parseJSON(data);
                            // success callback
                            if (isFunction(opts.success)) opts.success.call(opts, data, xhr.status, xhr);
                        } else {
                            // error callback
                            if (isFunction(opts.error)) opts.error.call(opts, xhr, xhr.status);
                        }
                        // complete callback
                        if (isFunction(opts.complete)) opts.complete.call(opts, xhr, xhr.status);
                    }
                };
            this.xhr = xhr;
            // prepare options
            if (!opts.cache) opts.url += ((opts.url.indexOf('?') > -1) ? '&' : '?') + '_t=' + getCBK();
            if (opts.data) {
                if (opts.type == 'GET') {
                    opts.url += ((opts.url.indexOf('?') > -1) ? '&' : '?') + objToStr(opts.data);
                    opts.data = null;
                } else {
                    opts.data = objToStr(opts.data);
                }
            }
            // set request
            xhr.open(opts.type, opts.url, opts.async);
            xhr.setRequestHeader('Content-type', opts.contentType);
            if (opts.dataType && opts.accepts[opts.dataType]) xhr.setRequestHeader('Accept', opts.accepts[opts.dataType]);
            if (opts.async) {
                xhr.onreadystatechange = ready;
                xhr.send(opts.data);
            } else {
                xhr.send(opts.data);
                ready();
            }
            return this;
        }
    };
    /*
     * 配置项
     */
    crossProxy.cfg = {
        url: '',
        data: null,
        type: 'GET',
        dataType: 'text',
        async: true,
        cache: true,
        success: null,
        error: null,
        requestProxy: '',
        responseProxy: ''
    };
    /*
     * crossProxy API
     */
    crossProxy.ajax = function(obj) {
        var cbk = getCBK(),
            reqIframe, url,
			idstr = prefix + cbk,
            urlObj = null,
            linkOpts = {},
            ajaxOpts = {};

        /*
         * 删除其他无效的opts配置
         */
        for (var o in obj) {
            if (typeof crossProxy.cfg[o] !== 'undefined') {
                ajaxOpts[o] = obj[o];
            }
        }

        if (typeof ajaxOpts.url === 'undefined' || ajaxOpts.url === '') {
            throw new Error('url param is needed.');
        }

        if (!ajaxOpts.requestProxy) {
            urlObj = parseUrl(ajaxOpts.url);
            ajaxOpts.requestProxy = urlObj['protocol'] + '//' + urlObj['hostname'] + '/proxy.html';
        } else { //检查请求代理页设置是否正确
            if (!isCrossDomain(ajaxOpts.requestProxy)) { //请求代理页不能设置到本域
                throw new Error('requestProxy page URL can not set in domain: ' + document.location.host);
            }
        }

        if (!ajaxOpts.responseProxy) {
            urlObj = parseUrl(document.location);
            ajaxOpts.responseProxy = urlObj['protocol'] + '//' + urlObj['hostname'] + '/proxy.html';
        } else {
            if (isCrossDomain(ajaxOpts.responseProxy)) { //响应代理页必须设置到本域
                throw new Error('responseProxy page URL must be set in domain: ' + document.location.host);
            }
        }

        ajaxOpts.key = cbk;
        linkOpts = clone(ajaxOpts);
        delete linkOpts['success'];
        delete linkOpts['error'];
        delete linkOpts['data'];

        //判断是否是跨域请求
        if (isCrossDomain(ajaxOpts.url)) {
            reqIframe = createIframeDOM();
            reqIframe.id = idstr;
            reqIframe.src = ajaxOpts.requestProxy + '?' + objToStr(linkOpts) + '#' + objToStr(ajaxOpts.data);

            //绑定ajax请求成功的回调函数
            crossProxy.ajaxProxySuccess[cbk] = function(data) {
                if (isFunction(obj.success)) {
                    obj.success(data);
                }

                timer(function() {
                    removeElement(reqIframe);
                    reqIframe = null;
                }, 20);
            };

            //绑定ajax请求失败的回调函数
            crossProxy.ajaxProxyError[cbk] = function(data) {
                if (isFunction(obj.error)) {
                    obj.error(data);
                }
                timer(function() {
                    removeElement(reqIframe);
                    reqIframe = null;
                }, 20);
            };

            addElement(document.body, reqIframe);
        } else {
            ajaxHelper.ajax(ajaxOpts);
        }
    };

    /*
     * 代理请求页requestProxy.html把数据传递到代理响应页responseProxy.html
     */
    crossProxy.ajaxProxyResponder = function(linkOpts, data) {
        var respIframe = createIframeDOM('iframe'),
            responseProxy = linkOpts.responseProxy;

        respIframe.id = prefix + linkOpts.key;
        respIframe.src = responseProxy + '?' + objToStr(linkOpts) + '#' + data;
        addElement(document.body, respIframe);
    };

    /*
     * requestProxy.html执行此函数进行代理ajax请求
     */
    crossProxy.request = function(linkOpts, hashData) {
        var opt = extend({
            data: hashData,
            success: function(data, status, xhr) {
                linkOpts.success = true;
                linkOpts.status = status;
                crossProxy.ajaxProxyResponder(linkOpts, data);
            },
            error: function(xhr, status) {
                linkOpts.success = false;
                linkOpts.status = status;
                crossProxy.ajaxProxyResponder(linkOpts, status);
            }
        }, linkOpts);

        ajaxHelper.ajax(opt);
    };

    /*
     * responseProxy.html执行此函数进行代理响应
     */
    crossProxy.response = function(linkOpts, hashData) {
        var key = linkOpts.key,
            cp = window.parent.parent.crossProxy,
            callback;

        if (linkOpts.success) {
            callback = cp.ajaxProxySuccess[key];
            if (isFunction(callback)) {
                callback.call(linkOpts, hashData);
            }
        } else {
            callback = cp.ajaxProxyError[key];
            if (isFunction(callback)) {
                callback.call(linkOpts, hashData);
            }
        }
    };

    //获取代理页URL传递的参数
    crossProxy.listenHash = function() {
        var loc = document.location,
            hash = loc.hash.replace('#', ''),
            param = loc.search.replace('?', ''),
            linkOpts = null,
            hashData = null,
            proxyRole, proxyTag, curHost, reqHost, respHost;

        linkOpts = strToObj(param);
        dealStrBool(linkOpts, 'cache');
        dealStrBool(linkOpts, 'async');
        dealStrBool(linkOpts, 'success');

        proxyTag = document.getElementById('cross-domain-proxy');
        if (proxyTag) {
            proxyRole = proxyTag.getAttribute('data-role');
        }

        //没有配置data-role
        if (!proxyRole || proxyRole == '') {

            if (!linkOpts.responseProxy && !linkOpts.requestProxy) return;

            curHost = parseUrl(document.location)['hostname'];
            reqHost = parseUrl(linkOpts.requestProxy)['hostname'];
            respHost = parseUrl(linkOpts.responseProxy)['hostname'];

            if (curHost === respHost) {
                proxyRole = 'response';
            } else if (curHost === reqHost) {
                proxyRole = 'request';
            }
        }

        if (proxyRole === 'request') { //请求代理页
            hashData = strToObj(hash);
            //发送真正的ajax请求
            crossProxy.request(linkOpts, hashData);
        } else if (proxyRole === 'response') { //响应代理页
            if (linkOpts.dataType === 'json') {
                hashData = parseJSON(hash);
            } else {
                hashData = hash;
            }

            crossProxy.response(linkOpts, hashData);
        } else {
            return;
        }
    };

    return crossProxy;
})(this, this.document);

crossProxy.listenHash();