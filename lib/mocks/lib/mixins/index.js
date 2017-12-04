const Chance = require('chance').Chance();

module.exports = [
    {
        'pet_name': function () {
            return Chance.pickone(['fluffy', 'fido', 'spot', 'cosmo'])
        }
    },
    {
        'tag_name': function () {
            return Chance.pickone(['dog', 'cat', 'rabbit', 'rock'])
        }
    },
    {
        'photo_urls': function () {
            myArray = Chance.pickset(['alpha', 'bravo', 'charlie', 'delta', 'echo'], 3);
            return `http://${myArray[0]}/${myArray[1]}/${myArray[2]}.jpg`
        }
    }

];