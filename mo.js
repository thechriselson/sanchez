/////////////////
// MEDIA MODAL //
/////////////////

if(!String.prototype.includes) {
	String.prototype.includes = (search, start) => {
		"use strict";
		if(search instanceof RegExp) {
			throw TypeError("first argument must not be a RegExp")}
		if(start === undefined) {start = 0}
		return this.indexOf(search, start) !== -1
	}
}

function moSnap(mo, x) {/*
	if(mo === undefined) {return}
	if(x === false) {
		mo.cont.style.transition = "all " + mo.zspeed;
		console.log(mo.cont.style.transition);
		//mo.cont.style.transitionDuration = mo.zspeed
	}
	let xh = Number(getComputedStyle(mo.media).height.replace("px", "")) * mo.scale;
	let xw = Number(getComputedStyle(mo.media).width.replace("px", "")) * mo.scale;
	let yh = Number(getComputedStyle(mo.mo).height.replace("px", ""));
	let yw = Number(getComputedStyle(mo.mo).width.replace("px", ""));
	console.log("xh: " + xh + " & xw: " + xw);
	console.log("yh: " + yh + " & yw: " + yw);
	if(xh <= yh && xw <= yw) {
		//mo.cont.style.top = "0px";
		//mo.cont.style.left = "0px";
		mo.cont.style.removeProperty("top");
		mo.cont.style.removeProperty("left");
	}
*/}

function moDrag(mo) {/*
	if(mo === undefined) {return}
	let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
	mo.cont.addEventListener("pointerdown", moDragDown);
	//
	function moDragDown(ev) {
		ev = ev || window.event;
		ev.preventDefault();
		pos3 = ev.clientX;
		pos4 = ev.clientY;
		document.onpointerup = moDragUp;
		document.onpointermove = moDragMove;
	}
	//
	function moDragMove(ev) {
		ev = ev || window.event;
		ev.preventDefault();
		pos1 = pos3 - ev.clientX;
		pos2 = pos4 - ev.clientY;
		pos3 = ev.clientX;
		pos4 = ev.clientY;
		mo.cont.style.top = (mo.cont.offsetTop - pos2) + "px";
		mo.cont.style.left = (mo.cont.offsetLeft - pos1) + "px"
	}
	//
	function moDragUp(ev) {
		moSnap(mo, true);
		document.onpointerup = null;
		document.onpointermove = null
	}
*/}

function moTransform(mo, zm, pt, tr) {
	if(mo === undefined) {return}
	let sc = -1;
	if(zm === undefined) {
		zm = (mo.scale - mo.scales[0]) / (mo.scales[mo.scales.length - 1] - mo.scales[0]); tr = true}
	else if(tr === undefined) {tr = false}
	// scale
	if(!isNaN(zm)) {
		zm = Number(zm);
		sc = ((mo.scales[mo.scales.length - 1] - mo.scales[0]) * zm) + mo.scales[0]
	}
	else {
		let prev = mo.scales[0], next = mo.scales[mo.scales.length - 1];
		mo.scales.every((x, i) => {
			if(x < mo.scale) {return true}
			else if(x > mo.scale) {
				if(i - 1 > 0) {prev = mo.scales[i - 1]}
				if(i < mo.scales.length - 1) {next = mo.scales[i]}
				return false
			}
			else if(x == mo.scale) {
				if(i - 1 > 0) {prev = mo.scales[i - 1]}
				if(i + 1 < mo.scales.length - 1) {next = mo.scales[i + 1]}
				return false
			}
			return true
		});
		if(zm == "+") {sc = next}
		else if(zm == "-") {sc = prev}
		tr = true
	}
	if(sc < mo.scales[0]) {sc = mo.scales[0]}
	else if(sc > mo.scales[mo.scales.length - 1]) {sc = mo.scales[mo.scales.length - 1]}
	// center
	let a = mo.viewport.getBoundingClientRect(), b = [a.width, a.height], c = [a.width / 2, a.height / 2];
	if(Array.isArray(pt)) {
		if(Array.isArray(pt[0]) && Array.isArray(pt[1])) {
			pt = [(pt[0][0] - pt[1][0]) / 2 + pt[1][0], (pt[0][1] - pt[1][1]) / 2 + pt[1][1]]
		}
		pt.forEach((x, i) => {pt[i] = Math.round((pt[i] / b[i]) * 100)});
	}
	else {pt = mo.center}
	// transform
	if(tr) {
		mo.cont.style.transitionDuration = mo.zspeed;
		mo.controls.sliders.forEach(sl => {
			sl.value = (sc - mo.scales[0]) / (mo.scales[mo.scales.length - 1] - mo.scales[0])})
	}
	mo.cont.style.transformOrigin = "" + pt[0] + "% " + pt[1] + "%";
	mo.cont.style.transform = "scale(" + sc + ")";
	mo.center = pt; mo.scale = sc;
	setTimeout(() => {mo.cont.style.removeProperty("transitionDuration")}, mo.zspeed)
}

function moGestureSetup(mo) {
	if(mo === undefined) {return}
	// scroll
	mo.cont.addEventListener("wheel", (ev) => {
		if(mo.throttle.active !== true) {
			mo.throttle.active = true;
			if(ev.deltaY > 0) {moTransform(mo, "-", undefined, true)}
			if(ev.deltaY < 0) {moTransform(mo, "+", [ev.clientX, ev.clientY], true)}
			setTimeout(() => {mo.throttle.active = false}, mo.throttle.scroll)
		}
		ev.preventDefault()
	});
	// gestures
	mo.cont.addEventListener("gesturestart", (ev) => {ev.preventDefault()});
	mo.cont.addEventListener("gesturechange", (ev) => {
		if(mo.throttle.active !== true) {
			mo.throttle.active = true;
			if(ev.scale > 1) {moTransform(mo, "+", [ev.clientX, ev.clientY], true)}
			if(ev.scale < 1) {moTransform(mo, "-", undefined, true)}
			setTimeout(() => {mo.throttle.active = false}, mo.throttle.gesture)
		}
		ev.preventDefault()
	});
	mo.cont.addEventListener("gestureend", (ev) => {ev.preventDefault()});
	// touch
	mo.cont.addEventListener("touchstart", (ev) => {
		if(ev.targetTouches.length == 2) {
			ev.preventDefault();
			for(let i = 0; i < ev.targetTouches.length; i++) {
				mo.evcache.push(ev.targetTouches[i])
			}
		}
	});
	mo.cont.addEventListener("touchmove", (ev) => {
		if(mo.throttle.active !== true && ev.targetTouches.length == 2 && ev.changedTouches.length == 2) {
			ev.preventDefault();
			let pt1 = -1, pt2 = -1;
			mo.evcache.forEach((x, i) => {
				if(x.identifier == ev.targetTouches[0].identifier) {pt1 = i}
				if(x.identifier == ev.targetTouches[1].identifier) {pt2 = i}
			});
			if(pt1 >= 0 && pt2 >= 0) {
				let d1 = Math.abs(mo.evcache[pt1].clientX - mo.evcache[pt2].clientX);
				let d2 = Math.abs(ev.targetTouches[0].clientX - ev.targetTouches[1].clientX);
				if(d2 > d1) {moTransform(mo, "+", [
					[ev.targetTouches[0].clientX, ev.targetTouches[0].clientY],
					[ev.targetTouches[1].clientX, ev.targetTouches[1].clientY]], true)}
				if(d2 < d1) {moTransform(mo, "-", undefined, true)}
				mo.evcache[pt1] = ev.targetTouches[0];
				mo.evcache[pt2] = ev.targetTouches[1];
				setTimeout(() => {mo.throttle.active = false}, mo.throttle.touch)
			}
			else {mo.evcache = []}
		}
	});
	mo.cont.addEventListener("touchend", touchEndHandler);
	mo.cont.addEventListener("touchcancel", touchEndHandler);
	//
	function touchEndHandler(ev) {
		if(mo.evcache[0] != undefined) {
			mo.evcache.forEach((x, i) => {
				if(x.identifier == ev.identifier) {mo.evcache.splice(i, 1)}})
		}
	}
}

function moActions(mo) {
	let x = moToArray(mo.mo.querySelectorAll("[data-mo-action]"));
	x.forEach(y => {
		let tr, ac = y.getAttribute("data-mo-action"), ta;
		if(ac.includes("=")) {tr = ac.split("=")[0]; ac = ac.split("=")[1]}
		if(y.hasAttribute("data-mo-target")) {
			ta = mo.mo.querySelector(y.getAttribute("data-mo-target"))}
		if(tr !== undefined) {
			// remote click
			if(ac == "click" && ta !== undefined) {
				y.addEventListener(tr, () => {ta.click()})
			}
			// minmax
			else if(ac == "minmax") {
				y.addEventListener(tr, (ev) => {
					let z = 1; if(mo.scale == mo.scales[mo.scales.length - 1]) {z = 0}
					moTransform(mo, z, [ev.clientX, ev.clientY], true)
				})
			}
		}
	})
}

function moKeydown(ev) {
	moRef.forEach(mo => {
		if(mo.active === true && mo.hasOwnProperty("keys")) {
			mo.keys.forEach(x => {
				if(ev.keyCode == x.key) {
					if(x.preventdefault === true) {ev.preventDefault()}
					if(x.target != "") {mo.mo.querySelector(x.target).click()}
				}
			})
		}
	})
}

function moUIFade(mo) {
	if(mo !== undefined && mo.hasOwnProperty("ui")) {
		mo.ui.t = new Date();
		mo.mo.addEventListener("pointermove", () => {
			if(mo.active === true) {
				mo.ui.t = new Date();
				mo.ui.els.forEach(el => {el.style.removeProperty("opacity")})
			}
		});
		setInterval(() => {
			if(mo.active === true) {
				let x = new Date();
				if(mo.ui.t.getTime() + 1000 < x.getTime()) {
					mo.ui.els.forEach(el => {el.style.opacity = "0"})
				}
			}
		}, 1000)
	}
}

function moToArray(x) {
	let y = [];
	for(let i = 0; i < x.length; i++) {y.push(x[i])}
	return y
}

// Setup
let moRef = [];
let modals = document.querySelectorAll("[data-mo='modal']");
for(let i = 0; i < modals.length; i++) {
	// defaults
	moRef.push({
		"mo": modals[i],
		"id": i,
		"active": true,
		"scale": 0,
		"scales": [0.9, 1, 1.2, 1.6, 2.2, 3],
		"defaultscale": 0.9,
		"center": [50, 50],
		"zspeed": 200,
		"throttle": {"scroll": 0, "gesture": 0, "touch": 0, "active": false},
		"evcache": [],
		"controls": {}
	})
}
moRef.forEach(mo => {
	// scales
	if(mo.mo.hasAttribute("data-mo-scales")) {
		let x = [], y = mo.mo.getAttribute("data-mo-scales").split(",");
		y.forEach(z => {if(!isNaN(z)) {x.push(Number(z))}});
		if(x.length >= 2) {mo.scales = x}
	}
	// default scale
	if(mo.mo.hasAttribute("data-mo-defaultscale")) {
		let x = mo.mo.getAttribute("data-mo-defaultscale");
		if(!isNaN(x)) {
			mo.defaultscale = Number(x);
			mo.scale = (mo.defaultscale - mo.scales[0]) / (mo.scales[mo.scales.length - 1] - mo.scales[0])
		}
	}
	// zoom speed
	if(mo.mo.hasAttribute("data-mo-zoomspeed")) {
		let x = mo.mo.getAttribute("data-mo-zoomspeed");
		if(!isNaN(x)) {x = x + "ms"}
		mo.zspeed = x
	}
	// throttle
	if(mo.mo.hasAttribute("data-mo-throttle")) {
		let x = mo.mo.getAttribute("data-mo-throttle").split(",");
		x.forEach(y => {
			y = y.split("=");
			if(!isNaN(y[1])) {mo.throttle[y[0]] = Number(y[1])}
		})
	}
	// viewport
	if(mo.mo.querySelector("[data-mo='viewport']")) {
		mo.viewport = mo.mo.querySelector("[data-mo='viewport']");
	}
	// container
	if(mo.mo.querySelector("[data-mo='container']")) {
		mo.cont = mo.mo.querySelector("[data-mo='container']");
		if(mo.cont.querySelector("[data-mo='media']")) {
			mo.media = mo.cont.querySelector("[data-mo='media']")
		}
	}
	// ui
	if(mo.mo.querySelector("[data-mo='ui']")) {
		mo.ui = {"t": 0, "els": moToArray(mo.mo.querySelectorAll("[data-mo='ui']"))}
	}
	// controls
	if(mo.mo.querySelector("[data-mo='-']")) {
		mo.controls.minus = moToArray(mo.mo.querySelectorAll("[data-mo='-']"));
		mo.controls.minus.forEach(x => {x.addEventListener("click", () => {moTransform(mo, "-")})})
	}
	if(mo.mo.querySelector("[data-mo='+']")) {
		mo.controls.plus = moToArray(mo.mo.querySelectorAll("[data-mo='+']"));
		mo.controls.plus.forEach(x => {x.addEventListener("click", () => {moTransform(mo, "+")})})
	}
	if(mo.mo.querySelector("[data-mo='slider']")) {
		mo.controls.sliders = moToArray(mo.mo.querySelectorAll("[data-mo='slider']"));
		mo.controls.sliders.forEach(x => {x.addEventListener("input", () => {moTransform(mo, x.value)})})
	}
	// keys
	if(mo.mo.querySelector("[data-mo-key]")) {
		mo.keys = [];
		let x = moToArray(mo.mo.querySelectorAll("[data-mo-key]"));
		x.forEach(y => {
			let z = {"key": y.getAttribute("data-mo-key"), "preventdefault": false, "target": ""}
			if(z.key.includes("*")) {z.key = z.key.replace("*", ""); z.preventdefault = true}
			if(y.hasAttribute("data-mo-target")) {z.target = y.getAttribute("data-mo-target")}
			mo.keys.push(z)
		})
	}
	// setup
	if(mo.hasOwnProperty("cont")) {
		moTransform(mo);
		moGestureSetup(mo);
		moDrag(mo)
	}
	if(mo.hasOwnProperty("ui")) {moUIFade(mo)}
	if(mo.mo.querySelector("[data-mo-action]")) {moActions(mo)}
});
document.addEventListener("keydown", moKeydown);

console.log(moRef);
