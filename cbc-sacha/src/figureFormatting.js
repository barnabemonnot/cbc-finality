let figureLength = document.getElementsByClassName('image-number').length;
let figureNumbers = d3.select("body")
.selectAll(".image-number")
.data(d3.range(1, figureLength+1));
figureNumbers.text(d => " " + d);
