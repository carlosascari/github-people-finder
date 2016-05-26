var UNIQUE_USERS = {}, TOTAL = 0, COUNT = 0, DISABLE_USER_LOOKUP = false, HALT = false;
var ACCESS_TOKEN = ''
var MAX = ACCESS_TOKEN ? Infinity : 200;

// -----------------------------------------------------------------------------

function nolimit(x) {
	if (!ACCESS_TOKEN) return '';
	return (x||'') + 'access_token=' + ACCESS_TOKEN;
}

function contactElement(key, value, link) {
	if (link) {
		var hasProtocol = value.indexOf('http') === 0;
		return $('<dl>')
		.append(
			$('<dt>').text(key),
			$('<dd>').append(
				$('<a>').attr({'href': hasProtocol ? value : 'http://' + value, target: '_blank'}).text(value)
			)
		);		
	}

	return $('<dl>')
	.append(
		$('<dt>').text(key),
		$('<dd>').text(value)
	);
}

function userElement(owner) {
	var entity = $('.entity-container.template').clone().removeClass('template');
	entity.find('.avatar img').attr('src', owner.avatar_url);
	entity.find('.username a').text(owner.login).attr('href', owner.html_ur);
	entity.find('.template').remove();
	return entity;
}

function repoElement(repo) {
	var repo_element = $('.template .persona.repo.template').clone().removeClass('template');
	repo_element.find('.title a').text(repo.name).attr('href', repo.html_url);
	repo_element.find('p').text(repo.description);
	repo_element.find('.stat.stars b').text(repo.stargazers_count);
	repo_element.find('.stat.watchers b').text(repo.watchers_count);
	repo_element.find('.stat.forks b').text(repo.forks);
	repo_element.find('.stat.size b').text(repo.size);
	return repo_element;
}

function pump(url) {
	if (!url || (TOTAL && COUNT >= TOTAL) || HALT) return;

	if (COUNT >= MAX) return console.warn('MAX reached!');

	var $res = $('#res');
	
	$
	.get(url)
	.done(function(result, status, req){
		$('.total').text(TOTAL = result.total_count);
		var headers = req.getAllResponseHeaders();

		COUNT += result.items.length;
		var percent = COUNT/TOTAL;
		$('.count').text(COUNT);
		$('.percent').text(percent.toFixed(6) + '%');
		$('.progress .bar').css('width'. percent + '%');

		var tmp_count = result.items.length;
		var tmp_elements = [];
		result.items.forEach(function(item){
			var owner_username = item.owner.login;
			var owner_type = item.owner.type;

			if (!UNIQUE_USERS[owner_username]) {
				var user_element = userElement(item.owner);
				tmp_elements.push(user_element);
				UNIQUE_USERS[owner_username] = {
					owner: item.owner,
					element: user_element,
					repos: []
				};
			}
			var existingRepos = UNIQUE_USERS[owner_username].repos;
			var matches = existingRepos.filter(function(repo) {return repo.id === item.id});
			if (!matches.length) {
				var repo_element = repoElement(item);
				UNIQUE_USERS[owner_username].repos.push(item);
				UNIQUE_USERS[owner_username].element.find('.entity').append(repo_element);
			}

			if (UNIQUE_USERS[owner_username].user || DISABLE_USER_LOOKUP || HALT) {
				tmp_count--;
				if (tmp_count <= 0) next();
				return;
			}

			$
			.get(owner_type === 'User' ? 'https://api.github.com/users/' + owner_username + nolimit('?') : 'https://api.github.com/orgs/' + owner_username + nolimit('?'))
			.done(function(result, status, req){
				UNIQUE_USERS[owner_username].user = result;
				var contactContainerElement = UNIQUE_USERS[owner_username].element.find('.contact');
				UNIQUE_USERS[owner_username].element.find('.name').text(result.name);
				if (result.company) contactContainerElement.append(contactElement('Company', result.company));
				if (result.email) contactContainerElement.append(contactElement('Email', result.email));
				if (result.blog) contactContainerElement.append(contactElement('Blog', result.blog, true));
				if (result.location) contactContainerElement.append(contactElement('Location', result.location));
				if (result.bio) contactContainerElement.append(contactElement('Bio', result.bio));
				if (result.followers) contactContainerElement.append(contactElement('Followers', result.followers));
				tmp_count--;

				if (tmp_count <= 0) next();
			})
			.fail(function (res) {
				next(res.responseJSON);
			});
		});

		function next(error) {
			if (tmp_elements.length) $res.append.apply($res, tmp_elements);

			if (error) {
				DISABLE_USER_LOOKUP = true;
				$('#error').show().text(error.message + '\nContact information fetching has been disabled.');
			}

			var match = /<(.*)>/.exec(headers || '');
			if (match && match[1]) {
				if (HALT) return;
				pump(match[1] + nolimit('&'));
			}
		}
	})
	.fail(function(res) {
		HALT = true;
		$('#error').show().text(res.responseJSON.message + '\nFetching has stopped.');
	});
}

// -----------------------------------------------------------------------------

$(function start() {
	pump('https://api.github.com/search/repositories?q=created:%3E2015-12-01&sort=stars&per_page=100' + nolimit('&'));
});
