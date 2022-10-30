let pytania = [];

function test() {
	loadquestion();

	setTimeout(() => {
		const q = document.getElementsByClassName('tresc')[0].innerText;
		const odp = document.getElementById('odpa').innerText;
		const odpa = document.getElementById('odpb').innerText;
		const odpb = document.getElementById('odpc').innerText;
		const odpc = document.getElementById('odpd').innerText;
		let obrazek;

		if (document.getElementsByClassName('obrazek').length == 0) {
			obrazek = null;
		} else {
			obrazek = document
				.getElementsByClassName('obrazek')[0]
				.children[0].getAttribute('src')
				.replace('../', 'https://egzamin-informatyk.pl/');
		}
		let god;

		document.getElementById('odpa').click();

		setTimeout(() => {
			god = document.getElementsByClassName('odpgood')[0].children[0].innerHTML.replace('. ', '');
			pytania.push({
				pytanie: q,
				odpowiedz_a: odp,
				odpowiedz_b: odpa,
				odpowiedz_c: odpb,
				odpowiedz_d: odpc,
				prawidlowa: god,
				załacznik: obrazek,
			});
			console.log(pytania.length);
		}, 1000);

	}, 1000);
}

let internal = setInterval(() => {
	test();
}, 3000);
