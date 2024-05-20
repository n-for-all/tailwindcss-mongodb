const fs = require('fs')
const plugin = require('tailwindcss/plugin')
const { MongoClient } = require('mongodb')

const connector = ({ client, uri, options, callback }) => {
    return new Promise((resolve, reject) => {
        try {
            client = client ? client : new MongoClient(uri, options);
            client
                .connect()
                .then((result) => {
                    try {
                        let exec = callback(result)
                        if (exec instanceof Promise) {
                            exec
                                .then((value) => {
                                    resolve(value)
                                })
                                .catch((e) => {
                                    reject(new Error('Tailwind Mongodb Plugin Callback Return Error: ' + e.message))
                                })
                                .finally(() => {
                                    client.close()
                                })
                        } else {
                            resolve(exec)
                        }
                    } catch (err) {
                        reject(new Error('Tailwind Mongodb Plugin Callback Error: ' + err.message));
                    }
                })
                .catch((e) => {
                    reject(new Error('Tailwind Mongodb Plugin: ' + e.message))
                })
        } catch (err) {
            console.error(uri, options);
            reject(new Error('Tailwind Mongodb Plugin Client Error: ' + err.message));
        }
    })
}

const fiberConnect = ({ client, uri, options, callback }) => {
    var fiber = Fiber.current, error, value;
    Promise.resolve(connector({ client, uri, options, callback })).then(v => {
        error = false;
        value = v;
        fiber.run();
    }, e => {
        error = true;
        value = e;
        fiber.run();
    });
    Fiber.yield();
    if (error) {
        throw value;
    } else {
        return value;
    }
}

module.exports = plugin.withOptions(
    ({
        path = 'safelist.txt',
        callback = null,
        client = null,
        uri = 'mongodb+srv://<username>:<password>@<your-cluster-url>/test?retryWrites=true&w=majority',
        options = {},
    }) =>
        ({ theme }) => {
            if (!callback) {
                console.warn(
                    'Tailwind Mongodb Plugin: Callback must be set to parse the classes from the database'
                )
                return
            }

            if (options) {
                options.appName = 'Tailwind Mongodb Plugin'
            }
            try {
                const result = connector({ client, uri, options, callback }).then((value) => {
                    fs.writeFileSync(path, value.join('\n'));
                }).catch((e) => {
                    console.error('Tailwind Mongodb Plugin: ' + e);
                });
                
            } catch (e) {
                console.error('Tailwind Mongodb Plugin: ' + e);
            }
        }
)
