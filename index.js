const fs = require("fs");
const plugin = require("tailwindcss/plugin");
const { MongoClient } = require("mongodb");
const flatten = require("flat");

module.exports = plugin.withOptions(
	({
			path = "safelist.txt",
			callback = async (client) => {
				const db = client.db("invision");
				const collection = db.collection("layouts");
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
			uri = "mongodb+srv://<username>:<password>@<your-cluster-url>/test?retryWrites=true&w=majority",
		}) =>
		async ({ theme }) => {
			const client = new MongoClient(uri);
			try {
				await client.connect();
				let value = await callback(client);
				fs.writeFileSync(path, value.join("\n"));
                await client.disconnect();
			} catch (e) {
				console.error("Tailwind Mongodb: ", e);
			} finally {
				await client.close();
			}
		}
);
