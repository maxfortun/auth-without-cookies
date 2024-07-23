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

addEventListener('install', async event => {
  console.log('install:', event);
  event.waitUntil(skipWaiting());
});

addEventListener('activate', async event => {
  console.log('activate:', event);
  event.waitUntil(clients.claim());
});

addEventListener('fetch', async event => {
	console.log('fetch:', event);

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

	const headers = new Headers(event.request.headers);
	headers.set('Authorization', auth_header_value);
	console.log('headers:', Object.fromEntries(headers));

	const request = new Request(event.request, {
		headers
	});

	const response = await fetch(request);
	console.log('fetched auth:', request, response);
	return response;
});

addEventListener("message", async event => {
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


