'use strict';

var https = require('https');
var util = require('util');

function Intervals(task, match, config) {
    this.task = task;
    this.match = match;
    this._config = config;
}

Intervals.prototype.toString = function() {
    return '#' + this.task;
}

Intervals.prototype.isValid = function(cb) {
    var cfg = this._config ? this._config.references.intervals : undefined;
    var auth;
    if (cfg) {
        if (cfg.auth) {
            auth = cfg.auth;
        } else {
            auth = new Buffer(cfg.token+':'+cfg.password).toString('base64');
        }
    }
    var options = {
        hostname: 'api.myintervals.com',
        path: util.format('/task/?localid=%d', this.task),
        headers: {
            'User-Agent': 'node-commit-msg',
            'Accept': 'application/json',
            'Authorization': 'Basic ' + auth
        }
    };
    https.get(options, function(res) {
        var body = '';
        res.on('data', function(chunk) {
            body += chunk.toString();
        });

        res.on('end', function () {
            var response = body ? JSON.parse(body) : false;

            if (res.statusCode < 300 && response && response.listcount > 0) {
                return cb(null, true); // valid
            }

            if (res.statusCode === 404 || res.statusCode >= 500 || response && response.listcount == 0) {
                return cb(null, false); // invalid
            }

            console.log('warning: Intervals reference check failed with status %d %s%s',
                res.statusCode, res.statusMessage,
                response && response.error && response.error.message ?
                    ('; reason: ' + response.error.message + (' ('+response.error.verbose.join(' ')+')')) :
                    '');

            cb(null, true); // consider valid
        });
    });
}

// Returns an array of instances parsed according to '#<number>'
Intervals.parse = function(text, config) {
    var data = [];
    var cb = function(match, task) {
        data.push( new Intervals(task, match, config) );
    };
    text.replace(/#(\d+)\b/gi, cb);
    return data;
}

module.exports = Intervals;
