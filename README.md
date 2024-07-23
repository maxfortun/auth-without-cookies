# auth-without-cookies
Google finally saw the light and decided to [keep the 3rd party cookies](https://privacysandbox.com/intl/en_us/news/privacy-sandbox-update).  
Way to tease and not deliver, Google!  
It's ok, Google, we totally understand that killing the very mechanism that powers your ad revenue is rather silly. We are just surprised it too you this long to accept that.  

Google aside, we still have browsers like Safari that [dropped 3rd part cookies a while back](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/).  

If we want to do [SSO](https://en.wikipedia.org/wiki/Single_sign-on) without the 3rd party cookies, we can achieve that using [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API).  
This project is a POC on how to leverage the Service Workers to add the [Authorization header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization) to protected resources.  

Buckle up, and enjoy the ride.  

### First stop: Why are we even here?  
The answer is, SSO is currently supported by the [3rd party cookies](https://en.wikipedia.org/wiki/Third-party_cookies). Different app domains redirect to the same identity provider domain, which is a 3rd party and also sets cookies to remember the authenticated session. Without cookies, we'd have to come up with a different mechanism to remember the authenticated session. Passing an access token is the go-to solution. While dynamic requests initiated by [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) and [XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) can add the Authorization header on the fly, static requests initiated by the likes of the '<script>` and `<img>` cannot. There are a number of hacky ways of getting around this, but the simplest one is at the next stop.  

### Second stop: What is a Service Worker?  
For our purposes we can think of a Service Worker as a proxy for ALL the network calls. We can intercept these requests and alter them as we see fit. For our needs we will need to add the Authorization header if it is missing and is needed for the requested resource. A Service Worker consists of 2 parts: `app side` and `service worker side`. `App side` registers the service worker, and `service worker` is the actual proxy that resides in its own separate file and runs in a separate thread. The app and the service worker talk to one another asynchronously via [postMessage](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorker/postMessage). App can tell the service worker Authorizations headers needed for different domains, and when the proxy talks to those domains it can add the headers on the fly. In our case the app will maintain the access token, and every time the token changes the app will tell the service worker that out domain `https://example.com` now has a new authorization header. Service worker in turn will add that header to every request heading to `https://example.com`. We'll look under the hood of the service worker at the next stop.


### Third stop: How does the service worker proxy?
We define a `fetch event` listener in a separate file `auth-sw.js`, which will intercept the fetch request, add Authroization where needed, and return the response.   
```javascript
addEventListener('fetch', async event => {

	// If we already have the Authorization header, no need to do anything else.
	if(event.request.headers.Authorization) {
		return fetch(event.request);
	}

        // If the url does not have an Authorization header at any segment level, no need to do anything else.
	const auth_header_value = auth_header(event.request.url);
	if(!auth_header_value) {
		return fetch(event.request);
	}

        // We are here because we need to add Authorization header. Let's clone the original request, ad dthe header, and send it on its merry way!
	const request = new Request(event.request, {
		method: event.request.method,
		headers: Object.assign({}, event.request.headers, {
			Authorization: auth_header_value
		}),
		mode: 'cors',
		credentials: event.request.credentials
	});

	return fetch(request);
});
```
That's pretty much all there is to it. We'll plug this nifty service worker into our app at the next stop.  

### Fourth stop: How do we start using this proxy?
This is the simple part. We register the service worker file with th navigator:
```javascript
cont registration = await navigator.serviceWorker.register('./auth-sw.js');
```
That's all there is to it. This will load the service worker. We could do it in an inline `<script>` tag, but if we want it to be reusable, let's put our code in a separate file `auth-sw-reg.js` and load it via:
```html
<script src="auth-sw-reg.js" />
```
Just registering the service worker is enough to run it, but how do we tell the service worker which tokens to use? Find out at the next stop.

### Fifth stop: How does service worker know which tokens to add to which requests?


