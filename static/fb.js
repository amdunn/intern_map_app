var FB_APP_ID = "481764471874933";

function fbInit(callback) {
    window.fbAsyncInit = function() {
        // init the FB JS SDK
        FB.init({
            appId      : FB_APP_ID, // Intern Map app
            channelUrl : '/channel.html', // Channel File for x-domain communication
            status     : true, // check the login status upon init?
            cookie     : true, // set sessions cookies to allow your server to access the session?
            xfbml      : true  // parse XFBML tags on this page?
        });
    
        // Additional initialization code such as adding Event Listeners goes here

        callback();
    };

    // Load the SDK's source Asynchronously
    // Note that the debug version is being actively developed and might 
    // contain some type checks that are overly strict. 
    // Please report such bugs using the bugs tool.
    (function(d, debug){
        var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement('script'); js.id = id; js.async = true;
        js.src = "https://connect.facebook.net/en_US/all" + (debug ? "/debug" : "") + ".js";
        ref.parentNode.insertBefore(js, ref);
    }(document, /*debug*/ false));
}

function decodeParameters(param_string) {
    var result = {};
    param_string = decodeURI(param_string);
    param_string.split('&').forEach(function(kv_pair) {
        var kv = kv_pair.split('=');
        if (kv.length != 2)
            throw "Malformed get parameters";
        result[kv[0]] = kv[1];
    });
    return result;
}

// Worth returning somehow that this is a frag/get param?
function handleResponseParameters(uri) {
    // Try to decode as URI frag
    var param_pos = uri.indexOf('#');
    if (param_pos == -1) {
        // Try to decode as get parameters
        param_pos = uri.indexOf('?');
        if (param_pos == -1) {
            // Neither
            return undefined;
        }
    }
    return decodeParameters(uri.substring(param_pos+1));
}

// XXX: This could be updated to use FB.ui (or even FB.login), but it
// seems that the "page" method has been removed there and I like the
// way this looks better.
//
// Could perhaps also handle URL frag on server side to reduce
// redirects
function fbWindowLogin(perms, callback, error_callback) {
    var params = handleResponseParameters(window.location.href);

    if (params === undefined) {
        // XXX: NOT implementing state right now, as for the current
        // application it seems the CSRF risk is low (logging in with
        // attacker credentials is useless, won't be able to retrieve
        // access token from iframe without additional XSS attack, which
        // is unlikely)
        var dialog_uri = "https://www.facebook.com/dialog/oauth/?" +
            "client_id=" + FB_APP_ID +
            "&redirect_uri=" + window.location.href +
            "&scope=" + perms +
            "&response_type=token";

        window.location.href = dialog_uri;
    } else if ("error" in params) {
        error_callback();
    } else if ("access_token" in params) {
        callback(params["access_token"]);
    } else {
        throw "Unexpected response parameters";
    }
}
