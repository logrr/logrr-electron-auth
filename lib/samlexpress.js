var express = require('express'),
    zlib = require('zlib'),
    saml = require('./saml').SAML;

var localOptions = {}

var samlExpress = function () {
};

samlExpress.prototype.setParams = function (options) {
  localOptions = this.initialize(options);
  this.setupExpressRoutes();
};

samlExpress.prototype.initialize = function (options) {

  if (!options) {
    options = {};
  }

  if (!options.redirectUrl) {
    options.redirectUrl = '/samlRedirect';
  }

  if (!options.responseUrl) {
    options.responseUrl = '/samlValidation';
  }

  if (!options.getNameID) {
    options.getNameID = function() {
      return '';
    };
  }

  if (!options.expressApp) {
    throw Error('Express app must be provided');
  }

  if (!options.authenticationSucceeded) {
    options.authenticationSucceeded = function(profile) {
      console.log('Authentication for nameID ' + profile.nameID + ' is successful, consider hooking to samlExpress method "authenticationSucceeded" to log your user');
    };
  }
  return options;
};

samlExpress.prototype.setupExpressRoutes = function () {
  
    var app = localOptions.expressApp;

    app.get(localOptions.redirectUrl, function (req, res) {
      var nameID = localOptions.getNameID();
      var samlrequest = saml.generateAuthorizeRequest('openfinapp', nameID, false);

      var buf = zlib.deflateRawSync(samlrequest);
      var req = buf.toString('base64');
      var args = { url: saml.getOptions().entryPoint, request: req };
      res.redirect(args.url + '?SAMLRequest=' + encodeURIComponent(args.request));
  });

    app.post(localOptions.responseUrl, function (req, res) {
      var samlResponse = req.body.SAMLResponse;
      saml.validatePostResponse(samlResponse, function(err, profile, loggedOut) {
        if (err) {
          console.log('An error parsing SAMLResponse occcured: ' + err);
        } else if (loggedOut) {
          console.log('Logout request');
        } else {
          var data = { samlToken: samlResponse, profile: profile};
          localOptions.authenticationSucceeded(profile);
        }
        var html = "<html><body style='margin: 0px'><script type='text/javascript'>parent.postMessage('verify-saml','*');;</script></body></html>";
        res.end(html);
      });
    });
};

exports.samlExpress = samlExpress;