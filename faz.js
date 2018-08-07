/* 
	To use this script, copy the entirety of this file's contents to your computer's clipboard and
		paste it into your browser's debug (JavaScript) console.
	ECMAScript 6 or later is required (i.e. every major browser except for Internet Explorer and
		Opera Mini is supported).
*/

const getRowsByClassName = (k) =>
	Array.prototype.slice.call(document.getElementsByClassName(k), 0).filter(c => c.textContent.indexOf("B") > -1 || c.textContent.indexOf("A") > -1).map(e => e.parentNode);

const hide = a => a.forEach(e => e.style.display = "none");

const hsdc = () => {
	let table = document.querySelectorAll("table.standard")[5];
	let row = table.rows[1];
	let cells = row.cells;
	let interactions = {};
	for(let i = 0; i < cells.length; i++) {
		let cell = cells[i];
		let t = cell.children[0];
		if(t.rows !== undefined) {
			let header = t.rows[0];
			let name = header.children[0].children[0].textContent;
			var type = null;
			if(name.indexOf("Salt") != -1) {
				type = "s";
			} else if(name.indexOf("Disulfide") != -1) {
				type = "d";
			} else if(name.indexOf("Covalent") != -1) {
				type = "c";
			} else {
				type = "h";
			}
			if(interactions[type] === undefined) {
				interactions[type] = [];
			}
			let content = t.rows[1];
			let rows = content.cells[0].children[0].rows;
			for(let j = 1; j < rows.length; j++) {
				let r = rows[j];
				let _s1 = r.cells[1].children[0].innerText.split(/\s/);
				let s1 = {
					chain: _s1[1].split(":")[0],
					residue: _s1[1].split(":")[1],
					location: parseInt(_s1[2].replace("[", "").replace("]", "")),
					atom: _s1[3].replace("[", "").replace("]", "")
				};
				let d = parseFloat(r.cells[2].children[0].innerText.trim());
				let _s2 = r.cells[3].children[0].innerText.split(/\s/);
				let s2 = {
					chain: _s2[1].split(":")[0],
					residue: _s2[1].split(":")[1],
					location: parseInt(_s2[2].replace("[", "").replace("]", "")),
					atom: _s2[3].replace("[", "").replace("]", "")
				};
				interactions[type].push({
					structure1: s1,
					structure2: s2,
					distance: d
				});
			}
		}
	}
	return interactions;
}


const getRelevantInteractionsOfType = (interactions, type, location, chain) => {
	if(interactions[type]) {
		let relevant = interactions[type].filter(i => {
			return (i.structure1.chain == chain && i.structure1.location == location)
				|| (i.structure2.chain == chain && i.structure2.location == location);
		});
		let one = relevant.map(r => r.structure1).reduce((s, n) => {
			s += `${n.chain}:${n.residue} ${n.location} - ${n.atom}\n`;
			return s;
		}, "");
		let two = relevant.map(r => r.structure2).reduce((s, n) => {
			s += `${n.chain}:${n.residue} ${n.location} - ${n.atom}\n`;
			return s;
		}, "");
		return [one, two];
	}
	return [null, null];
}

const summarize = rows => {
	let interactions = hsdc();
	return rows.map(row => {
		let children = row.childNodes;
		let id = parseInt(row.childNodes[1].textContent.trim());
		let spec = row.childNodes[3].textContent; // " B:CYS  79    "
		let regex = /(A|B)\:([A-Z]{3})\s+(\d+)/;
		let matches = regex.exec(spec);
		let chain = matches[1];
		let residue = matches[2];
		let location = parseInt(matches[3]);
		let _hdsc = row.childNodes[5].textContent;
		let h = _hdsc.indexOf("H") > -1;
		let d = _hdsc.indexOf("D") > -1;
		let s = _hdsc.indexOf("S") > -1;
		let c = _hdsc.indexOf("C") > -1;
		let [h1, h2] = getRelevantInteractionsOfType(interactions, "h", location, chain);
		let [d1, d2] = getRelevantInteractionsOfType(interactions, "d", location, chain);
		let [s1, s2] = getRelevantInteractionsOfType(interactions, "s", location, chain);
		let [c1, c2] = getRelevantInteractionsOfType(interactions, "c", location, chain);
		let asa = parseFloat(row.childNodes[7].textContent.trim());
		let bsa = parseFloat(row.childNodes[9].textContent.replace("|", "").trim());
		let bars = row.childNodes[9].textContent.split("|").length - 1;
		let dG = parseFloat(row.childNodes[11].textContent.trim());
		return {
			id: id,
			chain: chain,
			residue: residue,
			location: location,
			h: h,
			h1: h1,
			h2: h2,
			d: d,
			d1: d1,
			d2: d2,
			s: s,
			s1: s1,
			s2: s2,
			c: c,
			c1: c1,
			c2: c2,
			asa: asa,
			bsa: bsa,
			bars: `${bars * 10}%`,
			dG: dG
		}
	});
}

const summaryToCSV = a => {
	let s = 'data:text/csv;charset=utf-8,"ID","Chain","Residue","Location","Hydrogen Bond?","1","2","Disulphide bond?","1","2","Salt bridge?","1","2","Covalent bond?","1","2","Accessible surface area (A^2)","Buried surface area (A^2)","Buried area percentage (rounded)","∆G (kcal/mol)"\r\n';
	return a.reduce((s, n) => {
		s += `${Object.values(n).map(v => {
			if (v === true) { return "x"; }
			if (v === false || v === null) { return ""; }
			return `"${v}"`;
		}).join(",")}` + '\r\n';
		return s;
	}, s);
}

let interfacial = getRowsByClassName("data-interf");
let accessible = getRowsByClassName("data-access");
let inaccessible = getRowsByClassName("data-inaccess");

hide(accessible);
hide(inaccessible);

let results = summarize(interfacial);

let a = results.filter(r => r.chain == "A");
let b = results.filter(r => r.chain == "B");

let c = a.concat(b);

window.open(encodeURI(summaryToCSV(c)));
// window.open(encodeURI(summaryToCSV(a)));
// window.open(encodeURI(summaryToCSV(b)));
