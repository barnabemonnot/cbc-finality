function sketch() {
    console.log("sketching cbc");

    let svg = d3.select("#svg");
    let width = "400px";
    let height = "6100px";
    let vdelay = 400;
    let vduration = 400;

    svg.attr("width", width)
	.attr("height", height);

    let numSenders = 4;

    let g = svg.append('g');
    let circleColor = "rgba(255,56,0,1.0)";
    let validatorSpacing = 80;
    let messageSpacing = 60;
    let marginLeft = 40;
    let marginTop = 40;

    d3.json("data/4val100msg.json", (data) => {
	console.log(data);

	let t = d3.transition().duration(250);
	
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

	let lines = messagesEnter.selectAll('line')
	.data((d) => d.justification)

	let linesEnter = lines.enter()
	    .append('line')
	    .attr("x1", function(d) {
		let parentData = d3.select(this.parentNode).datum();
		return marginLeft + parentData.sender * validatorSpacing;
	    })
	    .attr("x2", function(d) {
		//wrong and temporary -- correct this
		let parentData = d3.select(this.parentNode).datum();
		let sender = data.find(function (datum) {
		    return datum.idx === d });
		//console.log(sender);
		return marginLeft + sender.sender * validatorSpacing;
	    })
	    .attr("y1", function(d) {
		let parentData = d3.select(this.parentNode).datum();
		return marginTop + parentData.idx * messageSpacing;
	    })
	    .attr("y2", function(d) {
		let parentData = d3.select(this.parentNode).datum();
		let sender = data.find(function (datum) {
		    return datum.idx === d });
		return marginTop + sender.idx * messageSpacing;
	    })
	    .attr("stroke", "black")
	    .attr("stroke-width", "0.5px")
	    .attr("opacity", 0)
	    .transition(t)
	    .delay(function(d) {
		let parentData = d3.select(this.parentNode).datum();
		return parentData.idx  * vdelay
	    })
	    .duration(vduration)
	    .attr("opacity", 0.4);

	messagesEnter.append('circle')
	    .attr("fill", circleColor)
	    .attr("cx", (d) => marginLeft + (d.sender * validatorSpacing))
	    .attr("cy", (d) => marginTop + (d.idx * messageSpacing))
	    .attr("r", 12)
	    .attr("opacity", 0)
	    .transition(t)
	    .delay((d) => d.idx * vdelay)
	    .duration(vduration)
	    .attr("opacity", 1);

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
