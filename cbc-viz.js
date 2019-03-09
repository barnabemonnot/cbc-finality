function sketch() {
    console.log("sketching cbc");

    let svg = d3.select("#svg");
    let width = "400px";
    let height = "3200px";

    svg.attr("width", width)
	.attr("height", height);

    let numSenders = 4;

    let g = svg.append('g');
    let circleColor = "lightblue";
    let validatorSpacing = 80;
    let messageSpacing = 30;

    d3.json("data/4val100msg.json", (data) => {
	console.log(data);

	
	let messages = g.selectAll("circle.message")
	    .data(data, function(d) { return d.idx})

	let messagesEnter = messages.enter()
	    .append('circle')
	    .attr("fill", circleColor)
	    .attr("cx", (d) => 40 + (d.sender) * validatorSpacing)
	    .attr("cy", (d) => 40 + d.idx * messageSpacing)
	    .attr("r", 10);
 
    })
}
