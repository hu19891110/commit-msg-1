'use strict';

// To run these tests you need to enter the Basic auth token
// in the Config below.

var assert = require('assert');
var Intervals = require('../../lib/references/intervals');
var Config = require('../../lib/config');

var cfg = Config({
    references: {
        intervals: {
            auth: ''
        }
    }
});

describe('references/intervals', function() {

    it('should stringify correctly', function() {
        var i = new Intervals(1);
        assert.equal(i.toString(), '#1');
    });

    it('should parse correctly', function() {
        var refs = new Intervals.parse('Commit with task references\n\n' +
        'Resolve #1, #2, no task #11abc and\n\ntask #11-3, task #9999999\n' +
        'and task #-2');

        assert.equal(refs[0].match, '#1');
        assert.equal(refs[1].task, 2);
        assert.equal(refs[2].match, '#11');
        assert.equal(refs[2].task, 11);
        assert.equal(refs[3].task, 9999999);
        assert.equal(refs[4].task, -2);
    });

    it('should validate correctly using the API', function(done) {
        this.timeout(3000); // allow enough time

        var refs = new Intervals.parse('Validate issue references using APIs\n\n' +
        'Resolve #1, #634, no task #11abc and\n\ntask #12312312324 with task #0.', cfg);
        var ct = 0;
        var isDone = function() {
            ct++;
            if (ct == refs.length) done();
        };
        var results = [false, true, false, false];

        results.forEach(function(val, idx) {
            refs[idx].isValid(function(err, valid) {
                assert.equal(valid, val, refs[idx].toString());
                isDone();
            });
        });
    });

});
