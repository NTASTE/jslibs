(function(window) {
	var lastTime = new Date().getTime(),
		timestamp = 0,
		kernels = ['webkit', 'moz', 'ms', 'o'],
		prefix,
		i,
		len = kernels.length;
	
	for (i = 0; i < len; i++) {
		if (!window.requestAnimationFrame) { //当前浏览器不支持标准的requestAnimationFrame
			prefix = kernels[i];
			window.requestAnimationFrame = window[prefix + 'RequestAnimationFrame'];
			window.cancelAnimationFrame = window[prefix + 'CancelAnimationFrame'] ||
										  window[prefix + 'CancelRequestAnimationFrame'];
		} else { //已经支持，跳出
			break;
		}
	}
	if (!window.requestAnimationFrame) { //不是kernels中的任何一种
		window.requestAnimationFrame = function(callback) {
			var requestId = 0, currTime, timeToCall, nextTimeToPaint;

			currTime = new Date().getTime();
			timeToCall = Math.max(0, (1000 / 60) - (currTime - lastTime));
			nextTimeToPaint = currTime + timeToCall;
			timestamp += timeToCall;

			requestId = window.setTimeout(function() {
				callback(timestamp);
			}, timeToCall);

			lastTime = nextTimeToPaint;

			return requestId;
		};

		window.cancelAnimationFrame = function(requestId) {
			window.clearTimeout(requestId);
		};
	}
})(window);
