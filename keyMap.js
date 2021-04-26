/////////////////
// Key Mapping //
/////////////////

function kmToArray(x) {
	let y = [];
	for(let i = 0; i < x.length; i++) {y.push(x[i])}
	return y
}

function kmKeyDown(ev) {
	kmKeys.forEach(x => {
		if(ev.keyCode == x.key) {
			if(x.preventdefault === true) {ev.preventDefault()}
			if(x.target != "") {document.querySelector(x.target).click()}
		}
	})
}

var kmKeys = [];
if(document.querySelector("[data-key]")) {
	let x = kmToArray(document.querySelectorAll("[data-key]"));
	x.forEach(y => {
		let z = {"key": y.getAttribute("data-key"), "preventdefault": false, "target": ""}
		if(z.key.includes("*")) {z.key = z.key.replace("*", ""); z.preventdefault = true}
		if(y.hasAttribute("data-key-target")) {z.target = y.getAttribute("data-key-target")}
		kmKeys.push(z)
	})
}
document.addEventListener("keydown", kmKeydown);
