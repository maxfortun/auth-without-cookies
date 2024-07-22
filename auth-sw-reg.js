if ('serviceWorker' in navigator) {
	window.addEventListener('load', async () => {
		try {
			const reg = await navigator.serviceWorker.register('./auth-sw.js');
			console.info('ServiceWorker registration successful:', reg);

			const set = async (url, header) => {
				return new Promise((resolve, reject) => {
					const messageChannel = new MessageChannel();
					messageChannel.port1.onmessage = event => {
						console.log('messageChannel:', event);
						resolve(event.data);
					};
					authSW.reg.active.postMessage({ action: 'set', url, header }, [messageChannel.port2]);
				});
			};

			const del = async (url) => {
				authSW.reg.active.postMessage({ action: 'del', url });
			};

			window.authSW = {
				reg,
				set,
				del
			};
			
			window.dispatchEvent(new CustomEvent("authSWLoaded"));

		} catch(e) {
			console.info('ServiceWorker registration failed:', e);
		}
	});
}
