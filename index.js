const fs = require('fs')
const plugin = require('tailwindcss/plugin')
const { MongoClient } = require('mongodb')

module.exports = plugin.withOptions(
  ({
      path = 'safelist.txt',
      callback = null,
      uri = 'mongodb+srv://<username>:<password>@<your-cluster-url>/test?retryWrites=true&w=majority',
    }) =>
    async ({ theme }) => {
      if (!callback) {
        console.warn(
          'Tailwind Mongodb Plugin: Callback must be set to parse the classes from the database'
        )
        return
      }
      const client = new MongoClient(uri)
      try {
        await client.connect()
        let value = await callback(client)
        fs.writeFileSync(path, value.join('\n'))
        await client.disconnect()
      } catch (e) {
        console.error('Tailwind Mongodb Plugin: ', e)
      } finally {
        await client.close()
      }
    }
)
