/* 
 * backbone.oauth.js v0.1
 * Copyright (C) 2012 Philipp Nolte
 * Modified by Gabriel Boucher
 * backbone.oauth.js may be freely distributed under the MIT license.
 */

(function() {
  "use strict";
  
  var _, Backbone;
  if ( typeof window === 'undefined' ) {
      _ = require( 'underscore' );
      Backbone = require( 'backbone' );
      exports = module.exports = Backbone;
  }
  else {
      _ = window._;
      Backbone = window.Backbone;
  }

  //============================================================================

  // Extend Backbone with OAuth functionality.
  Backbone.OAuth || (Backbone.OAuth = {});

  // The base OAuth class.
  Backbone.OAuth = function(options) {

    // Override any default option with the options passed to the constructor.
    _.extend(this, options);

    // Make the onRedirect function publicy available.
    window.OAuthRedirect = _.bind(this.onRedirect, this);
  };

  // Inject methods and properties.
  _.extend(Backbone.OAuth.prototype, {

    // Default for most applications.
    access_token_name: 'access_token',

    // Configures the auth dialog url.
    setupAuthUrl: function() {
      var url = this.auth_url + '?client_id=' + this.client_id
        + '&response_type=token';
      if (this.scope) url += '&scope=' + this.scope;
      if (this.state) url += '&state=' + this.state;
      url += '&redirect_uri=' + this.redirect_url
      return url;
    },

    // Open the OAuth dialog and wait for a redirect.
    auth: function() {
      if (!this.access_token_name) throw new Error('No access token name given.');
      if (!this.auth_url) throw new Error('No auth url given.');
      if (!this.redirect_url) throw new Error('No redirect url given.');

      this.dialog = window.open(this.setupAuthUrl());    
    },

    // Called on redirection inside the OAuth dialog window. This indicates,
    // that the dialog auth process has finished. It has to be checked, if
    // the auth was successful or not.
    onRedirect: function(hash) {

      var params = {},
      queryString = hash.substring(1),
      regex = /([^&=]+)=([^&]*)/g, m;
      while (m = regex.exec(queryString)) {
        params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
      }

      if (this.authSuccess(params)) {
        this.onSuccess(params);
      } else {
        this.onError(params);
      }
      
    },

    // Detect if we have a successful auth.
    authSuccess: function(params) {
      return params[this.access_token_name];
    },

    // These following methods have to be implemented by the OAuth application.
    onError: function() {},
    onSuccess: function() {}

  });

  //============================================================================

  Backbone.OAuth.configs = {
    Facebook: {
      auth_url: 'https://www.facebook.com/dialog/oauth'
    },
    Google: {
      auth_url: 'https://www.facebook.com/dialog/oauth',
      scope: 'https://www.googleapis.com/auth/userinfo.profile'
    }
  };

  //============================================================================

})();