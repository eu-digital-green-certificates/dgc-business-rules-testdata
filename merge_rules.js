#!/usr/bin/env node

'use strict';

const fs = require('fs');

let input = fs.readFileSync('verificationRulesMaster.json');
let rules = JSON.parse(input);
for (const rule of rules.rules) {
  console.log(rule.identifier);

  let dir = 'CH/' + rule.identifier;
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }
  let testdir = dir + '/tests'
  if (!fs.existsSync(testdir)){
    fs.mkdirSync(testdir);
  }
  let converted_rule = {}
  for (const prop in rule){
    converted_rule[prop.charAt(0).toUpperCase() + prop.slice(1)] = rule[prop];
  }
  converted_rule.Engine = 'CERTLOGIC';
  let outfile = dir + '/rule.json';
  if (!fs.existsSync(outfile)) {
    fs.writeFileSync(outfile, JSON.stringify(converted_rule));
  }
}
