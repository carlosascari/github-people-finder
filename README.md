# github-people-finder

[![Alt Description](http://i.imgur.com/vIigXY3.png)](http://i.imgur.com/fiYZVoJ.png)
*Click on the image to see it full size*.

* Users and Organizations are listed from those with repositories with the highest number of stars to the least
* Any public contact information is displayed and all repos that belong to each entity will be added as they are scraped.
* All links are `_blank`, they will open a new tab, so you can move around while the download progresses.

### USAGE
You need to edit `index.js`, so it includes your personal access token.

```js
var ACCESS_TOKEN = '';
```
otherwise Github will [limit your requests down to 60, instead of 5000](https://developer.github.com/v3/#rate-limiting).

Thats all, just open `index.html` on your browser and it will begin scraping.

### FYI

The search parameters are hardcoded at the bottom of `index.js`:

`https://api.github.com/search/repositories?q=created:%3E2015-12-01&sort=stars&per_page=100`

You may want to tweak it

[MIT License]()
