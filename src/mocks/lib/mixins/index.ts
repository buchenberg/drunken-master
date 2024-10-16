const Chance = require('chance').Chance();

const mixins = [
    {
        'pet_name': function ({ prefix }) {
            let name = Chance.pickone(['fluffy', 'fido', 'spot', 'cosmo']);
            return `${prefix} ${name}`;
        }
    },
    {
        'tag_name': function () {
            return Chance.pickone(['dog', 'cat', 'rabbit', 'rock'])
        }
    },
    {
        'photo_urls': function () {
            const myArray = Chance.pickset(['alpha', 'bravo', 'charlie', 'delta', 'echo'], 3);
            return `http://petstore.io/${myArray[0]}/${myArray[1]}/${myArray[2]}.jpg`
        }
    }

];

export default mixins;