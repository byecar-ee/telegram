require('dotenv').config;
const axios = require('axios');

class Position {
    constructor(location) {
        this.location = location;
    }
    parse() {
        const latitude = this.location.latitude;
        const longitude = this.location.longitude;

        return new Promise((resolve, reject) => {
            axios.get('http://api.positionstack.com/v1/reverse', {
                params: {
                    'access_key': process.env.POSITIONSTACK_TOKEN,
                    'query': `${latitude},${longitude}`
                }
            }).then((response) => {
                const position = response.data.data[0];
                resolve(position);
            }).catch(() => {
                reject();
            })
        })
    }
}

module.exports = {
    Position
}