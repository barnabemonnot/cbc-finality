function hack() {

    function story() {
	console.log("activate scroll");
	let svg = d3.select("#intro-svg");

	let g = svg.append('g')

	let datat0 = ["LMD-Message-Passing-0.png"];
	let datat1 = ["LMD-Message-Passing-1A.png"];
	let datat2 = [];
	let datat3 = [];

	function update(data) {
	    let t = d3.transition().duration(250);
	    // DATA JOIN
	    // Join new data with old elements, if any.
	    let image = g.selectAll("g.image")
		.data(data, function(d) { return d})

	    let imageEnter = image.enter()
		.append('image')
		.attr('x', 0)
		.attr('y', 0)
		.attr('width', 300)
		.attr('height', 300)
		.attr('xlink:href', (d) => d);

	    
	    
	}

	let gs = d3.graphScroll()
	    .container(d3.select('.scroll-container'))
	    .sections(d3.selectAll('.scroll-container #scroll-sections > div'))
	    .on('active', function(i) {
		console.log(i);

	    })

		

		

	

	

    }



}
