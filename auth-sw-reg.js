if ('serviceWorker' in navigator) {
	window.addEventListener('load', async () => {
		try {
			const reg = await navigator.serviceWorker.register('./auth-sw.js');
			console.info('ServiceWorker registration successful:', reg);

			const set = (url, header) => {
				authSW.reg.active.postMessage({ action: 'set', url, header });
			};

			const del = (url) => {
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
