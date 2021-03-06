'use strict';

var crypto = require('crypto');
var memdown = require('memdown');
var LevelDBStorageAdapter = require('../../../lib/storage/adapters/level');
var LevelDBFileStore = require('../../../lib/storage/adapters/level/filestore');
var StorageItem = require('../../../lib/storage/item');
var expect = require('chai').expect;
var utils = require('../../../lib/utils');
var Contract = require('../../../lib/contract');
var Audit = require('../../../lib/audit');
var sinon = require('sinon');

function tmpdir() {
  return require('os').tmpdir() + '/test-' + Date.now() + '.db';
}

describe('LevelDBStorageAdapter', function() {

  var store = new LevelDBStorageAdapter(tmpdir(), memdown);
  var hash = utils.rmd160('test');
  var audit = new Audit({ shard: new Buffer('test'), audit: 12 });
  var contract = new Contract();
  var item = new StorageItem({
    hash: hash,
    shard: new Buffer('test')
  });

  describe('@constructor', function() {

    it('should create instance without the new keyword', function() {
      expect(
        LevelDBStorageAdapter(tmpdir(), memdown)
      ).to.be.instanceOf(LevelDBStorageAdapter);
    });

  });

  describe('#_put', function() {

    it('should store the item', function(done) {
      item.contracts[hash] = contract;
      item.challenges[hash] = audit.getPrivateRecord();
      item.trees[hash] = audit.getPublicRecord();
      store._put(hash, item, function(err) {
        expect(err).equal(null);
        done();
      });
    });

    it('should bubble error if the underlying db#put fails', function(done) {
      var _put = sinon.stub(store._db, 'put').callsArgWith(
        3,
        new Error('Failed')
      );
      store._put(hash, item, function(err) {
        expect(err.message).equal('Failed');
        _put.restore();
        done();
      });
    });

  });

  describe('#_get', function() {

    it('should return the stored item', function(done) {
      store._get(hash, function(err, item) {
        expect(err).to.equal(null);
        expect(item).to.be.instanceOf(StorageItem);
        done();
      });
    });

    it('should return error if the data is not found', function(done) {
      var _dbget = sinon.stub(store._db, 'get').callsArgWith(
        2,
        new Error('Not found')
      );
      store._get(hash, function(err) {
        expect(err.message).to.equal('Not found');
        _dbget.restore();
        done();
      });
    });

  });

  describe('#_keys', function() {

    it('should return all of the keys', function(done) {
      store._keys(function(err, keys) {
        expect(keys[0]).to.equal('5e52fee47e6b070565f74372468cdc699de89107');
        done();
      });
    });

  });

  describe('#_del', function() {

    it('should return error if del fails', function(done) {
      var _dbdel = sinon.stub(store._db, 'del').callsArgWith(
        1,
        new Error('Failed to delete')
      );
      store._del(hash, function(err) {
        expect(err.message).to.equal('Failed to delete');
        _dbdel.restore();
        done();
      });
    });

    it('should return error if reset fails', function(done) {
      var _storereset = sinon.stub(store._fs, 'reset').callsArgWith(
        1,
        new Error('Failed to delete')
      );
      store._del(hash, function(err) {
        expect(err.message).to.equal('Failed to delete');
        _storereset.restore();
        done();
      });
    });

    it('should delete the shard if it exists', function(done) {
      store._del(hash, function(err) {
        expect(err).to.equal(null);
        done();
      });
    });

  });

});

describe('LevelDBFileStore', function() {

  var store = new LevelDBStorageAdapter('filestore', memdown)._db;
  var sample = crypto.randomBytes(8);

  describe('@constructor', function() {

    it('should create instance without the new keyword', function() {
      expect(LevelDBFileStore(store)).to.be.instanceOf(LevelDBFileStore);
    });

    it('should create instance with the new keyword', function() {
      expect(new LevelDBFileStore(store)).to.be.instanceOf(LevelDBFileStore);
    });

  });

  describe('#createReadStream/#createWriteStream', function() {

    it('should work with hex encoding', function(done) {
      var data = Buffer(sample.toString('hex'), 'hex');
      var fs = new LevelDBFileStore(store);
      var ws = fs.createWriteStream('hex');
      ws.on('finish', function() {
        var result = Buffer([]);
        var rs = fs.createReadStream('hex');
        rs.on('data', function(data) {
          result = Buffer.concat([result, data]);
        }).on('end', function() {
          expect(Buffer.compare(sample, result)).to.equal(0);
          done();
        });
      }).end(data);
    });

    it('should work with base64 encoding', function(done) {
      var data = Buffer(sample.toString('base64'), 'base64');
      var fs = new LevelDBFileStore(store);
      var ws = fs.createWriteStream('base64');
      ws.on('finish', function() {
        var result = Buffer([]);
        var rs = fs.createReadStream('base64');
        rs.on('data', function(data) {
          result = Buffer.concat([result, data]);
        }).on('end', function() {
          expect(Buffer.compare(sample, result)).to.equal(0);
          done();
        });
      }).end(data);
    });

    it('should work with utf8 encoding', function(done) {
      var data = Buffer(sample);
      var fs = new LevelDBFileStore(store);
      var ws = fs.createWriteStream('utf8');
      ws.on('finish', function() {
        var result = Buffer([]);
        var rs = fs.createReadStream('utf8');
        rs.on('data', function(data) {
          result = Buffer.concat([result, data]);
        }).on('end', function() {
          expect(Buffer.compare(sample, result)).to.equal(0);
          done();
        });
      }).end(data);
    });

    it('should work with binary encoding', function(done) {
      var data = Buffer(sample.toString('binary'), 'binary');
      var fs = new LevelDBFileStore(store);
      var ws = fs.createWriteStream('binary');
      ws.on('finish', function() {
        var result = Buffer([]);
        var rs = fs.createReadStream('binary');
        rs.on('data', function(data) {
          result = Buffer.concat([result, data]);
        }).on('end', function() {
          expect(Buffer.compare(sample, result)).to.equal(0);
          done();
        });
      }).end(data);
    });

    it('should work with utf16le encoding', function(done) {
      var data = Buffer(sample.toString('utf16le'), 'utf16le');
      var fs = new LevelDBFileStore(store);
      var ws = fs.createWriteStream('utf16le');
      ws.on('finish', function() {
        var result = Buffer([]);
        var rs = fs.createReadStream('utf16le');
        rs.on('data', function(data) {
          result = Buffer.concat([result, data]);
        }).on('end', function() {
          expect(Buffer.compare(sample, result)).to.equal(0);
          done();
        });
      }).end(data);
    });

  });

});
