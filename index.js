require('dotenv').config();
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const Sheet = require('./sheet');

async function scrapePage(i) {
	const res = await fetch(
		`https://explodingtopics.com/featured-topics-this-month?page=${i}`
	);
	const text = await res.text();
	const $ = cheerio.load(text);
	const containers = $('.topicInfoContainer').toArray();
	const trends = containers.map((c) => {
		const active = $(c);
		const keyword = active.find('.tileKeyword').text();
		const description = active.find('.tileDescription').text();
		const searchesPerMonth = active
			.find('.scoreTag')
			.first()
			.text()
			.split('growth')[1];

		return { keyword, description, searchesPerMonth };
	});

	return trends;
}

(async function () {
	let i = 1;
	let rows = [];

	// loop through all pages
	while (true) {
		const newRows = await scrapePage(i);

		if (newRows.length === 0) break;
		rows = rows.concat(newRows);

		i++;
	}

	const sheet = new Sheet();
	await sheet.load();
	await sheet.addRows(rows);
})();
