const auth_headers = {};
const auth_header_actions = {
	set: (data) => auth_headers[data.url] = data.header,
	del: (data) => delete auth_headers[data.url]
};

const auth_header = url => {
	const segments = url.split('/');
	do {
		const key = segments.join('/');
		let header = auth_headers[key];
		console.log('auth_header:', key);
		if(header) {
			return header;
		}
		segments.pop();
	} while(segments.length);
	return auth_headers[''];
};

addEventListener('install', event => {
  console.log('install:', event);
  event.waitUntil(skipWaiting());
});

addEventListener('activate', event => {
  console.log('activate:', event);
  event.waitUntil(clients.claim());
});

addEventListener('fetch', event => {
	console.log('fetch:', event);

	event.respondWith((async () => {
		if(event.request.headers.Authorization) {
			const response = fetch(event.request);
			console.log('fetched existing auth:', event.request, response);
			return response;
		}
	
		const auth_header_value = auth_header(event.request.url);
		console.log('auth_header_value:', auth_header_value);
		if(!auth_header_value) {
			const response = fetch(event.request);
			console.log('fetched no auth:', event.request, response);
			return response;
		}
	
		const request = new Request(event.request, {
			mode: 'cors',
			credentials: 'include',
			headers: {
				Authorization: auth_header_value
			}
		});
	
		const response = await fetch(request);
		console.log('fetched auth:', request, response);
		return response;
	})());
});

addEventListener("message", event => {
	console.log('message:', event);
	const messagePort = event.ports?.[0];
	const action = auth_header_actions[event.data.action];
	if(!action) {
		messagePort.postMessage({status: 'unhandled', data: event.data});
		return;
	}
	action(event.data);
	messagePort.postMessage({status: 'handled', data: event.data});
});


