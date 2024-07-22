const auth_headers = {};
const auth_header_actions = {
	set: (data) => auth_headers[data.url] = data.header,
	del: (data) => delete auth_headers[data.url]
};

const auth_header = url => {
	// loop and pop segments until something is found
	let header = auth_headers[url];
	if(header) {
		return header;
	}
	return null;
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
	const options = {};

	const auth_header_value = auth_header(event.request.url);
	if(auth_header_value) {
		if(!options.headers) {
			options.headers = {};
		}
		options.headers.Authorization = auth_header_value;
	}

	const response = await fetch(event.request, options);
	console.log('fetched:', event, response);

	if (!response || response.status !== 200 || response.type !== 'basic') {
		return response;
	}

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


