'use strict';

var assert = require('assert');
var merkle = require('merkle');
var utils = require('../utils');

/**
 * Provides interface for proving possession of a file for an {@link Audit}
 * @constructor
 * @param {Array} leaves - List of SHA-256 bottom leaves of the merkle tree
 */
function Proof(leaves) {
  if (!(this instanceof Proof)) {
    return new Proof(leaves);
  }

  assert(Array.isArray(leaves), 'Merkle leaves must be an array');

  this._tree = merkle('sha256').sync(leaves.map(function(leaf) {
    return leaf.toLowerCase();
  }));
}

/**
 * Calculate audit response
 * @param {String} challenge
 * @param {Buffer} shard
 * @returns {Array} result
 */
Proof.prototype.prove = function(challenge, shard) {
  var input = challenge + shard.toString('hex');
  var resp = utils.sha256(input);
  var hash = utils.sha256(resp);
  var leaves = this._tree.level(this._tree.levels() - 1);
  var index = leaves.indexOf(hash.toUpperCase());
  var branches = [resp];

  if (index === -1) {
    return [];
  }

  for (var i = (this._tree.levels() - 1); i > 0; i--) {
    var level = this._tree.level(i).map(function(leaf) {
      return leaf.toLowerCase();
    });

    if (index % 2 === 0) {
      branches = [branches, level[index + 1]];
    } else {
      branches = [level[index - 1], branches];
    }

    index = Math.floor(index / 2);
  }

  return branches;
};

module.exports = Proof;