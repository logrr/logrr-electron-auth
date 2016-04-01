// Saml module singleton.
var SAML = require('./saml').SAML;
var samlInstance = new SAML();
exports.saml = samlInstance;

// SamlExpress module singleton.
var samlEx = require('./samlexpress').samlExpress;
var samlExpressInstance = new samlEx();
exports.samlExpress = samlExpressInstance;