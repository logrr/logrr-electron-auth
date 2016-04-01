// Saml module singleton.
var samlInstance = require('./saml').SAML;
exports.saml = samlInstance;

// SamlExpress module singleton only if Express if found.
try {
	var express = require('express');
	var samlEx = require('./samlexpress').samlExpress;
	var samlExpressInstance = new samlEx();
	exports.samlExpress = samlExpressInstance;
}
catch(e) { }

// samlEletron singleton.
var samlEl = require('./samlelectron').samlElectron;
var samlElectronInstance = new samlEl();
exports.samlElectron = samlElectronInstance;