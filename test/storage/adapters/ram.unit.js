'use strict';

var expect = require('chai').expect;
var ReadableStream = require('readable-stream');
var WritableStream = ReadableStream.Writable;
var RAMStorageAdapter = require('../../../lib/storage/adapters/ram');

describe('RAMStorageAdapter', function() {

  describe('#_get', function() {

    it('should return an error if shard data not found', function(done) {
      var store = new RAMStorageAdapter();
      store.get('c527900223f9d08e0776d695f13a95cd6ac0e471', function(err) {
        expect(err.message).to.equal('Shard data not found');
        done();
      });
    });

    it('should return a readable stream if shard exists', function(done) {
      var store = new RAMStorageAdapter();
      store._items.c527900223f9d08e0776d695f13a95cd6ac0e471 = {};
      store._shards.c527900223f9d08e0776d695f13a95cd6ac0e471 = new Buffer(
        'hello ram store'
      );
      store._get(
        'c527900223f9d08e0776d695f13a95cd6ac0e471',
        function(err, result) {
          expect(result.shard).to.be.instanceOf(ReadableStream);
          expect(result.shard.read().toString()).to.equal('hello ram store');
          done();
        }
      );
    });

    it('should return a writable stream if shard not found', function(done) {
      var store = new RAMStorageAdapter();
      store._items.c527900223f9d08e0776d695f13a95cd6ac0e471 = {};
      store._get(
        'c527900223f9d08e0776d695f13a95cd6ac0e471',
        function(err, result) {
          expect(result.shard).to.be.instanceOf(WritableStream);
          expect(result.shard.write('hello ram store')).to.equal(true);
          done();
        }
      );
    });

  });

});
