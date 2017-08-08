const nano = require('nano')('http://localhost:5984');
const alice = nano.db.use('alice');


// alice.insert({ happy: true }, 'rabbit', function (err, body, header) {
//     if (err) {
//         console.log('[alice.insert] ', err.message);
//         return;
//     }
//     console.log('you have inserted the rabbit.');
//     console.log(body);
// });


alice.update = function (obj, key, callback) {
    var alice = this;
    alice.get(key, function (error, existing) {
        if (!error) obj._rev = existing._rev;
        alice.insert(obj, key, callback);
    });
};


alice.update({ happy: true, foo: 'bar' }, 'rabbit', function (err, res) {
    if (err) return console.log('No update!');
    console.log('Updated!', res);
});