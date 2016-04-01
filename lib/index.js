// Saml module singleton.
var samlInstance = require('./saml').SAML;
exports.saml = samlInstance;

// SamlExpress module singleton.
var samlEx = require('./samlexpress').samlExpress;
var samlExpressInstance = new samlEx();
exports.samlExpress = samlExpressInstance;