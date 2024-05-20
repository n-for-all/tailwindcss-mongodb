# Tailwindcss Mongodb
Retreive css classes from the database and add them to safelist so that tailwind can detect those classes.

## Basic Usage
Add the plugin and the path to the safelist file in `tailwind.config.js`
```js
module.exports = {
    content: [
        ".safelist"
    ],
    plugins: [
        require("tailwindcss-mongodb")({
            callback: async (client) => {
                // return an array of strings (classnames)
                return [
                "md-1", "text-white/70" //...
                ];
            }, 
            // Path to save the safelist file, the same must be added in the content so that tailwind can parse the file
            path: ".safelist",
            // Mongodb connection string
            uri: "mongodb+srv://<username>:<password>@<your-cluster-url>/test?retryWrites=true&w=majority",
            debug: false
        })
    ]
};
```

## Basic usage
Sample Callback function:

```js
async (client) => {
    // Select database `test`
    const db = client.db("test");
    // Select collection `page`
    const collection = db.collection("page");

    // Get all records
    const findResult = await collection.find({}).toArray();

    // Flatten the JSON  `findResult
    // flat library is required
    // const flatten = require("flat")
    const arr = flatten(findResult);

    // Find all values where key includes class and split the value by space
    let classes = [];
    Object.keys(arr)
        .filter((key) => key.includes("class"))
        .map((key) => arr[key])
        .map((item) => {
            if (item.trim() != "") {
                classes = classes.concat(item.trim().split(" "));
            }
        });
    // Ensure classes are unique
    return classes.filter((cls, index, cls_array) => cls_array.indexOf(cls) === index);
}
```
### Full Example

```js
const flatten = require("flat")

module.exports = {
    content: [
        ".safelist",
    ],
    plugins: [
        require("tailwindcss-mongodb")({
            callback: async (client) => {
                const db = client.db("test");
                const collection = db.collection("page");
                const findResult = await collection.find({}).toArray();
                const arr = flatten(findResult);
                let classes = [];
                Object.keys(arr)
                    .filter((key) => key.includes("class"))
                    .map((key) => arr[key])
                    .map((item) => {
                        if (item.trim() != "") {
                            classes = classes.concat(item.trim().split(" "));
                        }
                    });
                return classes.filter((cls, index, cls_array) => cls_array.indexOf(cls) === index);
            }, 
            path: ".safelist",
            uri: "mongodb://localhost:27017",
        })
    ]
};
```