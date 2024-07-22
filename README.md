# auth-without-cookies
Google finally saw the light and decided to [keep the 3rd party cookies](https://privacysandbox.com/intl/en_us/news/privacy-sandbox-update).  
Way to tease and not deliver, Google!  
It's ok, Google, we totally understand that killing the very mechanism that powers your ad revenue ius rather silly. We are just surprised it too you this long to accept that.  

Google aside, we still have Apple with Safari that [dropped 3rd part cookies a while back](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/).  
If we want to do SSO without the 3rd party cookies, we can do that using [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API).  
This project is a POC on how to leverage Service Workers to add the [Authorization header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization) to protected resources.  

Buckle up, and enjoy the ride.  


