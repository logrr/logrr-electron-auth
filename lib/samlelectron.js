var zlib = require('zlib'),
    saml = require('./saml').SAML,
    path = require('path'),
    fs = require('fs');

var localOptions = {}
var localUserInfo = '';

var samlElectron = function () {
};

samlElectron.prototype.setParams = function (options) {
  localOptions = this.initialize(options);
};

samlElectron.prototype.initialize = function (options) {

  if (!options) {
    options = {};
  }

  if (!options.app) {
    throw Error('app object must be provided');
  }

  if (!options.ipc) {
    throw Error('ipc object must be provided');
  }

  if (!options.browserWindow) {
    throw Error('browserWindow object must be provided');
  }

  if (!options.getNameID) {
    options.getNameID = function() {
      localUserInfo = path.join(localOptions.app.getPath('userCache'), 'user.json');

      var nameID = '';
      if (fs.existsSync(localUserInfo)) {
        console.log('reading user data from "' + localUserInfo + '"')
        var data = JSON.parse(fs.readFileSync(localUserInfo, 'utf-8'));
        nameID = data.profile.nameID;
      }
      return nameID;
    };
  }

  if (!options.authenticationSucceeded) {
    options.authenticationSucceeded = function(profile) {
      console.log('Authentication for nameID ' + profile.nameID + ' is successful, consider hooking to samlElectron method "authenticationSucceeded" to log your user');
    };
  }
  return options;
};

samlElectron.prototype.openLogrrLoginWindow = function () {
  var newWin = new localOptions.browserWindow({
    width: 800,
    height: 600,
    'always-on-top': true,
    'skip-taskbar': true
  });
  newWin.setMenu(null);
  var path = __dirname.replace(new RegExp('lib$'), 'html');
  newWin.loadUrl('file://' + path + '/logrrlogin.html');
}

samlElectron.prototype.getAuthRedirect = function () {
  var nameID = localOptions.getNameID();
  var samlrequest = saml.generateAuthorizeRequest('electronapp', nameID, false);

  var buf = zlib.deflateRawSync(samlrequest);
  var req = buf.toString('base64');
  var args = { url: saml.getOptions().entryPoint, request: req };
  return args.url + '?SAMLRequest=' + encodeURIComponent(args.request);
};

samlElectron.prototype.valiteSamlResponse = function (samlResponse, successCallback) {
  var self = this;
  saml.validatePostResponse(samlResponse, function(err, profile, loggedOut) {
    if (err) {
      console.log('An error parsing SAMLResponse occcured: ' + err);
    } else if (loggedOut) {
      console.log('Logout request');
    } else {
      var data = { samlToken: samlResponse, profile: profile};
      self.saveUserInfo(samlResponse, profile);
      successCallback(profile);
      localOptions.authenticationSucceeded(profile);
    }
  });
}

samlElectron.prototype.saveUserInfo = function (samlResponse, profile) {
  var data = { samlToken: samlResponse, profile: profile};
  console.log('Saving user token in file "' + localUserInfo + '"');
  fs.writeFileSync(localUserInfo, JSON.stringify(data));
};

exports.samlElectron = samlElectron;