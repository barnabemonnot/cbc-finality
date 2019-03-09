function sketch() {
    console.log("sketching cbc");

    let svg = d3.select("#svg");
    let width = "400px";
    let height = "6100px";

    svg.attr("width", width)
	.attr("height", height);

    let numSenders = 4;

    let g = svg.append('g');
    let circleColor = "lightblue";
    let validatorSpacing = 80;
    let messageSpacing = 60;
    let marginLeft = 40;
    let marginTop = 40;

    d3.json("data/4val100msg.json", (data) => {
	console.log(data);

	// DATA JOIN
	// Join new data with old elements, if any.
	let messages = g.selectAll("g.message")
	    .data(data, function(d) { return d})

	// ENTER
	// Create new elements as needed
        //let enterSelection = validators.enter();
	let messagesEnter = messages.enter()
	    .append('g')
	    .attr("class", "message");

	messagesEnter.append('circle')
	    .attr("fill", circleColor)
	    .attr("cx", (d) => marginLeft + (d.sender * validatorSpacing))
	    .attr("cy", (d) => marginTop + (d.idx * messageSpacing))
	    .attr("r", 12);

	messagesEnter.append('text')
	    .attr("x", function(d,i) {return marginLeft + d.sender * validatorSpacing})
	    .attr("y", function(d,i) { return marginTop + d.idx * messageSpacing})
	    .attr("dy", ".3em")
	    .attr("text-anchor", "middle")
	    .attr("stroke", "white")
	    .attr("fill", "white")
	    .attr("stroke-width", "1px")
	    .text((d) => d.estimate);

 
    })
}
