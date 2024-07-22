const auth_header_map = {};

const auth_header = url => {
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
});


