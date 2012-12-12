/* Hmm... it looks like Bing Maps provides no good way of limiting use
 * of an API key, say, to a domain.  So here we put the key in
 * plaintext and hope that no-one (should only be gettable by an app
 * user or someone hacking Heroku...) uses up this key.
 *
 * I've read that places like FB work around this by proxying access
 * to key, but for now we won't do this.
 */
function get_credentials() {
    throw "No Bing maps API key";
}
