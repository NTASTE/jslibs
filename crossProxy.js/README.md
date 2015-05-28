crossProxy.js
=============

ajax跨域请求解决方案
#兼容
	IE6+, firefox, chrome, opera, Safari
	已经兼容所有主流浏览器。

# 请求代理和响应代理

	You must put this html page in your local server and the request server.
	example:

	http://a.com/proxy.html   -- response proxy page
	http://b.com/proxy.html	  -- request proxy page

	假如你当前所在页面的域名为a.com，你要请求的域名为b.com，你必须把proxy.html分别复制到两个域名的根目录下。
	crossProxy.js能自动识别它所需要的跨域代理页面。

# 使用

	在你的html页面引入crossProxy.js文件
	<script type="text/javascript" src="http://a.com/crossProxy.js"></script>
	
	发送ajax跨域请求
	crossProxy.ajax({
		url: 'http://b.com/data.json',
		type: 'GET',
		success: function(text) {
			serverData1.innerHTML = text;
		},
		error: function(e) {
			serverData1.innerHTML = e;
		}
	});
	
	更加详细的用例，请参考example.html文件
	
#傻瓜教程
	step1: 在你发ajax跨域请求的页面的域名下放置http://a.com/proxy.html文件
	step2: 在你要请求的服务器的域名下放置http://b.com/proxy.html文件
	step3: 将crossProxy.js引用到你当前的html页面
		<script type="text/javascript" src="http://cdn.yourdomain.com/js/crossProxy.js"></script>
	step4: 发请求的代码如下
		crossProxy.ajax({
			url: 'http://b.com/data.json',
			type: 'GET',
			success: function(text) {
				serverData1.innerHTML = text;
			},
			error: function(e) {
				serverData1.innerHTML = e;
			}
		});

#联系作者

	在使用过程中有任何问题或者发现BUG请联系
	QQ: 164068300
	email: 164068300@qq.com
	
	
