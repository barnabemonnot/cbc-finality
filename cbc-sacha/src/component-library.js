const e = React.createElement;

class ExplorableInput extends React.Component {
  constructor(props) {
    super(props);
    this.handleMouseMove = this.handleMouseMove.bind(this);
  }

  handleMouseMove(id,e) {
    e.preventDefault();

    if (e.type === 'mousedown') {
	    this.props.updateStartX(e.clientX);

	    // only listen for mousemove when mousedown
	    onmousemove = (event) => {
        event.preventDefault();
        this.props.updateCurrentX(event.clientX,1,id);
	    };

	    onmouseup = (event) => {
    		event.preventDefault();
    		this.props.updateCurrentX(event.clientX,0,id);
    		onmousemove = null;
    		onmouseup = null;
	    };
    }
  }

  render() {
  	const value = this.props.value;
  	const units = this.props.units ? this.props.units : '';
  	const id = this.props.id;
  	const format = d3.format(',');

    return (
      e(
        'span', {
          className: 'adjustable',
          style: {
			      fontWeight: 400,
			      cursor: 'col-resize'
			    },
          onMouseDown: (e) => this.handleMouseMove(id,e),
        },
        format(value) + " " + units
		  )
    );
  }
}

class ExplorableOutput extends React.Component {
    render() {
	const calcDisplay = this.props.calcDisplay;
	const value = this.props.value;
	return 	 e('span',
		   {
		       className: 'output',
		       style: {
			   fontWeight: 400,
			   background: calcDisplay ? 'rgb(255,56,0)' : 'none',
			   color: calcDisplay ? 'white' : 'rgb(255,56,0)',
			   cursor: 'pointer'
		       },
		       onClick: this.props.onClick
		   },
		   value
		  )
    }
}

class CalculationLine extends React.Component {
  render() {
    const left = this.props.left;
    var right = this.props.right;
  	var rightClass = 'calculations-line-right'
  	const format = (x) => d3.format(',')(d3.format('.2f')(x));

  	if (typeof right === 'number') { right = format(right) }
  	if (!left) { rightClass = 'calculations-line-right-2'}

    return (
      e(
        'span', { className: 'calculations-line' },
        e(
          'span', { className: 'calculations-line-left' },
          left
        ),
        e(
          'span', { className: rightClass },
          " = " + right
        )
      )
    );
  }
}

class CalculationLine2 extends React.Component {
  render() {
    const left = this.props.left; //::string
    const right = this.props.right; //::array
    const shift = this.props.shift ? true : false;
    var working = [];

    right.map(function(d,i) {
	    if ((!shift && (i % 2 === 0)) || (shift && (i % 2 === 1))) { // we are dealing with a word
        working.push(
          e(
            'span', { className: 'calculations-line-bubble' },
            d
          )
        );
	    }

	    if ((!shift && (i % 2 === 1)) || (shift && (i % 2 === 0))) { // we are dealing with a symbol
        working.push(
          e(
            'span', { className: 'calculations-line-symbol' },
            d
          )
        );
	    }
    });

    return (
      e(
        'span', { className: 'calculations-line' },
        e(
          'span', { className: 'calculations-line-left' },
          left
        ),
        e(
          'span', { className: 'calculations-line-right' },
          " = "
        ),
        e(
          'span', { className: 'calculations-line-right' },
          working
        )
      )
    );
  }
}

class CalculationComment extends React.Component {
  render() {
    const comment = this.props.comment;

    return e('div', {className: 'calculations-comment'}, comment);
  }
}

class CalculationSpace extends React.Component {
  render() {
    return e('div', { className: 'calculations-space' });
  }
}

class CalculationWrapper extends React.Component {
  render() {
    return (
      e(
        'div', {
          className: 'calculations-container',
          style: {
            paddingTop: '0.5rem'
          }
        },
        e(
          'div', { className: 'calculations-title-container' },
          e(
            'span', { className: 'calculations-title'},
            this.props.title
          ),
          e(
            'span', { className: 'calculation-title-comment' },
            this.props.comment ? (' ' + this.props.comment) : ''
   		    )
        ),
        e(
          'div', { className: 'calculation-analysis' },
          // e(CalculationSpace, null),
          this.props.children
        )
      )
    );
  }
}

// Data visualisations
class ExplorableSeries extends React.Component {
  constructor(props) {
    super(props);
    this.renderChart = this.renderChart.bind(this);
    this.updateChart = this.updateChart.bind(this);
  }

  componentDidMount() {
    this.renderChart();
    this.updateChart();
  }

  componentDidUpdate() {
    this.updateChart();
  }

  renderChart() {
    var that = this;

    var margin = {top: 0, right: 20, bottom: 60, left: 50},
    width = this.props.width - margin.left - margin.right,
    height = this.props.height - margin.top - margin.bottom;

    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    x.domain([0, d3.max(this.props.dataPoints)]);
    y.domain([0, d3.max(this.props.dataPoints, d => this.props.series[0].getData(d))]);

    const node = this.node;
    const svg = d3.select(node)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .attr("id", "svg-" + this.props.elementId);

    const xmin = d3.min(this.props.dataPoints);
    const xmax = d3.max(this.props.dataPoints);
    const tickNumber = this.props.xAxis.tickNumber ? this.props.xAxis.tickNumber : 5;
    const tickValues = d3.range(xmin, xmax, (xmax - xmin) / tickNumber).concat(xmax);

    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .attr("class", "x axis")
      .call(
        d3.axisBottom(x).tickValues(tickValues).tickFormat(that.props.xAxis.format)
      );

    const lineStart = function(d, i) {
      const leftMargin = 0;
      return leftMargin + i * ((width - leftMargin) / that.props.series.length);
    }

    const xLabelMargin = 35;
    const xLegendMargin = xLabelMargin + 20;

    svg.append("g")
      .attr("class", "y axis")
      .call(d3.axisLeft(y));

    svg.append("text")
  	  .attr("class", "axis-label")
      .attr("dominant-baseline", "middle")
  	  .text(this.props.xAxis.label)
  	  // .attr("text-anchor", "middle")
  	  .attr("transform", "translate(" + 0 + ","+ (height + xLabelMargin) +")");

    svg.append("text")
  	  .attr("class", "axis-label")
  	  .text(this.props.yAxis.label)
  	  // .attr("text-anchor", "middle")
  	  .attr("transform", "translate(-" + xLabelMargin+","+height+")rotate(-90)");

    svg.selectAll(".legend-line")
    .data(this.props.series.map(s => s.colour))
    .enter()
    .append("line")
    .attr("x1", (d, i) => lineStart(d, i))
    .attr("x2", (d, i) => lineStart(d, i) + 20)
    .attr("y1", height + xLegendMargin)
    .attr("y2", height + xLegendMargin)
    .style("stroke", d => d)
    .attr("class", "legend-line");

    svg.selectAll(".series-legend-text")
    .data(this.props.series.map(s => s.name))
    .enter()
    .append("text")
    .attr("x", (d, i) => lineStart(d, i) + 30)
    .attr("y", height + xLegendMargin)
    .text(d => d)
    .attr("dominant-baseline", "middle")
    .attr("class", "series-legend-text");
  }

  updateChart() {
    const svg = d3.select("#svg-" + this.props.elementId);
    const that = this;

    var margin = {top: 0, right: 20, bottom: 60, left: 50},
    width = this.props.width - margin.left - margin.right,
    height = this.props.height - margin.top - margin.bottom;

    var ymax = d3.max(this.props.series,
      series => d3.max(this.props.dataPoints, d => series.getData(d))
    )

    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    x.domain([0, d3.max(this.props.dataPoints)]);
    y.domain([0, ymax * 1.1]);

    var closeToXEnd = function(d) {
      return (0.8 * width - x(d) < 0);
    }

    var closeToYStart = function(d) {
      return (0.2 * height - y(that.props.series[0].getData(d)) > 0);
    }

    var data = this.props.series.map(
      series => {
        return {
          points: this.props.dataPoints.map(
            d => {
              return {
                x: d,
                y: series.getData(d)
              }
            }
          ),
          colour: series.colour,
          name: series.name
        };
      }
    );

    var valueline = d3.line()
        .x(function(d) { return x(d.x); })
        .y(function(d) { return y(d.y); });

    var linePath = svg.selectAll(".series-line")
      .data(data);
    linePath.attr("d", d => valueline(d.points));
    linePath.enter()
      .append("path")
      .attr("class", "series-line")
      .attr("d", d => valueline(d.points))
      .style("stroke", d => d.colour)
      .style("fill", "none")
      .style("stroke-width", 0.5);

    // var dx = function(d) {
    //   if (closeToXEnd(d)) {
    //     return -5;
    //   } else {
    //     return 5;
    //   }
    // }
    //
    // var dy = function(d) {
    //   const dx = that.props.dataPoints[1] - that.props.dataPoints[0];
    //   const dy = that.props.getData(d + dx) - that.props.getData(d);
    //   if (closeToYStart(d) || dy < 0) {
    //     return -5;
    //   } else {
    //     return 15;
    //   }
    // }
    //
    // var textAnchor = function(d) {
    //   if (width - x(d) < 0.2 * width) {
    //     return "end";
    //   } else {
    //     return "start";
    //   }
    // }
    //
    // const textWidth = svg.select(".value-point") ? svg.select(".value-point").getBBox().width : 35;
    // const rectWidth = textWidth + 5;
    // const rectHeight = 15;
    // var valueRect = svg.selectAll(".value-rect")
    //   .data([this.props.currentPoint]);
    // valueRect.exit()
    //   .remove();
    // valueRect.enter()
    //   .append("rect")
    //   .attr("class", "value-rect");
    // valueRect.attr("x", d => {
    //   if (textAnchor(d) == "start") {
    //     return x(d) + dx(d) - 3
    //   } else {
    //     return x(d) + dx(d) - (rectWidth - 3);
    //   }
    // })
    //   .attr("width", rectWidth)
    //   .attr("y", d => y(this.props.getData(d)) + dy(d) - (rectHeight - 3))
    //   .attr("height", rectHeight);
    //
    // var valuePoint = svg.selectAll(".value-point")
    //   .data([this.props.currentPoint]);
    // valuePoint.exit()
    //   .remove();
    // valuePoint.enter()
    //   .append("text")
    //   .attr("x", d => x(d))
    //   .attr("y", d => y(this.props.getData(d)))
    //   .attr("class", "value-point")
    // valuePoint.attr("x", d => x(d))
    //   .attr("y", d => y(this.props.getData(d)))
    //   .attr("text-anchor", textAnchor)
    //   .attr("dx", dx)
    //   .attr("dy", dy)
    //   .text(d => parseFloat(this.props.getData(d)).toFixed(2) + "%");

    if (this.props.currentPoint) {
      const followPointsData = this.props.series.map(
        series => {
          return {
            x: this.props.currentPoint,
            y: series.getData(this.props.currentPoint),
            colour: series.colour
          };
        }
      );

      // var followLineVert = svg.selectAll(".follow-line-vert")
      //   .data([{
      //     x: this.props.currentPoint,
      //     y: d3.max(followPointsData, d => d.y)
      //   }]);
      //
      // followLineVert.exit()
      //   .remove();
      // followLineVert.attr("x1", d => x(d.x))
      //   .attr("x2", d => x(d.x))
      //   .attr("y2", d => y(d.y));
      // followLineVert.enter()
      //   .append("line")
      //   .attr("x1", d => x(d.x))
      //   .attr("x2", d => x(d.x))
      //   .attr("y1", d => y(0))
      //   .attr("y2", d => y(d.y))
      //   .attr("class", "chart-follow follow-line follow-line-vert")
      //   .attr("stroke-dasharray", "5, 5");

      var followLineHor = svg.selectAll(".follow-line-hor")
        .data(followPointsData);
      followLineHor.exit()
        .remove();
      followLineHor.attr("x2", d => x(d.x))
        .attr("y1", d => y(d.y))
        .attr("y2", d => y(d.y));
      followLineHor.enter()
        .append("line")
        .attr("x1", d => x(0))
        .attr("x2", d => x(d.x))
        .attr("y1", d => y(d.y))
        .attr("y2", d => y(d.y))
        .attr("class", "chart-follow follow-line follow-line-hor")
        .attr("stroke-dasharray", "5, 5")
        .style("stroke", d => d.colour);

      var followPoint = svg.selectAll(".follow-point")
        .data(followPointsData);
      followPoint.exit()
        .remove();
      followPoint
        .attr("cx", d => x(d.x))
        .attr("cy", d => y(d.y));
      followPoint.enter()
        .append("circle")
        .attr("cx", d => x(d.x))
        .attr("cy", d => y(d.y))
        .attr("r", 4)
        .attr("class", "chart-follow follow-point")
        .style("fill", d => d.colour);
    }

    svg.selectAll("g.y.axis")
    	.call(d3.axisLeft(y).ticks(3).tickFormat(this.props.yAxis.format));

//      d3.selectAll("g.y.axis .tick").each(function(d,i) {
//	  if (i == 0) { d3.select(this).remove() }
//      });
  }

  render() {
    return (
      e(
        "div", {
          className: "series-container",
          id: this.props.elementId,
          style: {
            paddingTop: '1rem',
            display: this.props.noDisplay ? 'none' : 'block'
          }
        },
        e(
          FigureCaption, {
            type: "Figure",
            name: this.props.name,
            caption: this.props.caption
          }
        ),
        e(
          "svg", {
            ref: (node => this.node = node),
            width: this.props.width,
            height: this.props.height
          }
        )
      )
    );
  }
}

// Figures
class FigureCaption extends React.Component {
  render() {
    return (
      e(
        "div", { className: "figure-caption-container" },
        e(
          "div", { className: "figure-title-container" },
          e(
            "span", {
              className: "figure-title " + this.props.type.toLowerCase() + "-title"
            },
            this.props.type,
            e(
              "span", {
                className: "figure-number " + this.props.type.toLowerCase() + "-number"
              }
            ),
            ". "
          ),
          e(
            "span", { className: "figure-name" }, this.props.name
          )
        ),
        e(
          "div", { className: "figure-caption" },
          this.props.caption ? this.props.caption : e("div", null),
          this.props.children
        )
      )
    );
  }
}

class StaticLink extends React.Component {
  render() {
    return (
      e(
        'div', { className: 'static-link-container' },
        e(
          'a', {
            href: this.props.href,
            target: '_blank'
          },
          e(
            FigureCaption, {
              type: "Link",
              name: this.props.name,
              caption: this.props.caption
            },
            this.props.children
          )
        )
      )
    );
  }
}

class InteractiveFigure extends React.Component {
  render() {
    return (
      e(
        'div', { className: 'static-image-container' },
        e(
          FigureCaption, {
            type: "Image",
            name: this.props.name,
            caption: this.props.caption
          }
        ),
        e(
          "div", null,
          this.props.children
        )
      )
    )
  }
}

class StaticImage extends React.Component {
  render() {
    return (
      e(
        'div', { className: 'static-image-container' },
        e(
          FigureCaption, {
            type: "Image",
            name: this.props.name,
            caption: this.props.caption
          },
          this.props.children
        ),
        e(
          'img', {
            src: this.props.src,
            alt: this.props.name
          }
        )
      )
    )
  }
}

class Table extends React.Component {
  render() {
    return (
      e(
        'div', { className: 'static-table-container' },
        e(
          FigureCaption, {
            type: "Table",
            name: this.props.name,
            caption: this.props.caption
          },
          this.props.children
        ),
        e(
          "table", null,
          e(
            "thead", null,
            e(
              "tr", null,
              Object.keys(_.omit(this.props.data[0], "hidden")).map(
                key => e(
                  "th", null,
                  key
                )
              )
            )
          ),
          e(
            "tbody", null,
            this.props.data.map(
              d => e(
                "tr", {
                  style: {
                    color: d.hidden.highlight ? "rgba(3,136,166,1.0)" : "rgb(56,56,56,0.8)"
                  }
                },
                Object.keys(_.omit(d, "hidden")).map(
                  key => e(
                    "td", null,
                    d[key]
                  )
                )
              )
            )
          )
        )
      )
    );
  }
}

// References
class ReferenceInText extends React.Component {
  render() {
    return (
      e(
        'a', { href: "#reference-container" },
        ' [',
        this.props.refidx,
        ']'
      )
    );
  }
}

class ReferenceItem extends React.Component {
  render() {
    return (
      e(
        'div', { className: 'reference-item' },
        e(
          'a', { href: this.props.href },
          e(
            'span', { className: "reference-item-number" },
            '[',
            this.props.refidx,
            '] '
          )
        ),
        ' ',
        this.props.children
      )
    );
  }
}

class ReferenceFootnote extends React.Component {
  render() {
    return (
      e(
        ReferenceItem, {
          refidx: this.props.refidx,
          href: "#ref-" + this.props.refid
        },
        this.props.content
      )
    );
  }
}

class ReferenceBibliography extends React.Component {
  render() {
    return (
      e(
        ReferenceItem, {
          refidx: this.props.refidx,
          href: "#ref-" + this.props.refid
        },
        e(
          "span", { className: "reference-title" },
          this.props.title
        ),
        e("br"),
        this.props.author,
        ', ',
        this.props.year,
        '.'
      )
    );
  }
}

class ReferenceContainer extends React.Component {
  render() {
    return (
      e(
        'div', { className: 'reference-container' },
        e(
          'div', { className: 'reference-container-title' },
          'References'
        ),
        this.props.references.map(
          (bib, refidx) => {
            if (bib.content) {
              return e(
                ReferenceFootnote,
                _.extend(bib, { refidx: refidx + 1 })
              );
            } else {
              return e(
                ReferenceBibliography,
                _.extend(bib, { refidx: refidx + 1 })
              );
            }
          }
        )
      )
    )
  }
}

// Bimatrices
class BimatrixCell extends React.Component {
  render() {
    return e(
      "td",
      { className: "bimatrix-payoff-cell" },
      e(
        "span",
        { className: "bimatrix-payoff bimatrix-payoff-p1" },
        this.props.payoff1
      ),
      ", "
      ,
      e(
        "span",
        { className: "bimatrix-payoff bimatrix-payoff-p2" },
        this.props.payoff2
      )
    );
  }
}

class BimatrixStrategyCell extends React.Component {
  render() {
    return e(
      "td",
      { className: "bimatrix-strategy-cell bimatrix-strategy-" + this.props.player },
      this.props.strategy
    );
  }
}

class BimatrixHeaderRow extends React.Component {
  render() {
    return e(
      "tr",
      null,
      e(
        "td",
        null
      ),
      this.props.strategies.map(
        strategy => e(BimatrixStrategyCell, { strategy: strategy, player: "p2" })
      )
    );
  }
}

class BimatrixRow extends React.Component {
  render() {
    return e(
      "tr",
      null,
      e(
        BimatrixStrategyCell,
        { strategy: this.props.strategy, player: "p1" }
      ),
      this.props.payoffs.map(
        payoffs => e(
          BimatrixCell, {
            payoff1: payoffs[0],
            payoff2: payoffs[1]
          }
        )
      )
    );
  }
}

class BimatrixHelpButton extends React.Component {
  render() {
    return (
      e(
        'div', null,
        e(
          'p', {
    		    className: 'help-button',
    		    onClick: this.props.onClick
    		  },
    		  "How do I read this table?"
        )
  		)
    );
  }
}

class BimatrixHelpExplanation extends React.Component {
  render() {
    return (
      e(
        'div', {
          className: 'bimatrix-help-explanation-container',
          style: {
            display: this.props.showHelp ? 'block' : 'none'
          }
        },
        'This table shows the payoffs of two players, ',
        e(
          'span', { className: 'bimatrix-strategy-p1' }, 'Row'
        ),
        ' and ',
        e(
          'span', { className: 'bimatrix-strategy-p2' }, 'Column'
        ),
        '. Each player chooses an action, which determines a unique payoff cell. Each player receives its corresponding payoff. For instance, if ',
        e(
          'span', { className: 'bimatrix-strategy-p1' }, 'Row'
        ),
        ' chooses "' + this.props.strategies.player1[this.props.strategy1] + '" and ',
        e(
          'span', { className: 'bimatrix-strategy-p2' }, 'Column'
        ),
        ' chooses "' + this.props.strategies.player2[this.props.strategy2] + '", ',
        e(
          'span', { className: 'bimatrix-strategy-p1' }, 'Row'
        ),
        ' receives a payoff of ',
        e(
          'span', { className: 'bimatrix-payoff-p1' }, this.props.payoffs[this.props.strategy1][this.props.strategy2][0]
        ),
        '.'
      )
    );
  }
}

class BimatrixHelp extends React.Component {
  render() {
    return (
      e(
        'div', { className: 'bimatrix-help-container' },
        e(
          BimatrixHelpButton, {
            showHelp: this.props.showHelp,
            onClick: this.props.onClick
          }
        ),
        e(
          BimatrixHelpExplanation, {
            showHelp: this.props.showHelp,
            strategies: this.props.strategies,
            strategy1: this.props.strategy1,
            strategy2: this.props.strategy2,
            payoffs: this.props.payoffs
          }
        )
      )
    );
  }
}

class BimatrixGame extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showHelp: false
    }
    this.onClick = this.onClick.bind(this)
  }

  onClick(e) {
    this.setState({
      showHelp: !this.state.showHelp
    });
  }

  render() {
    return (
      e(
        "div",
        { className: "bimatrix-container" },
        e(
          FigureCaption, {
            type: "Table",
            name: this.props.name,
            caption: this.props.caption
          }
        ),
        e(
          "table",
          { className: "bimatrix" },
          e(
            "thead", null,
            e(
              BimatrixHeaderRow, {
                strategies: this.props.strategies.player2
              }
            )
          ),
          e(
            "tbody", null,
            this.props.payoffs.map(
              (payoffs, idx) => e(
                BimatrixRow, {
                  payoffs: payoffs,
                  strategy: this.props.strategies.player1[idx]
                }
              )
            )
          )
        ),
        e(
          BimatrixHelp, {
            showHelp: this.state.showHelp,
            onClick: this.onClick,
            strategies: this.props.strategies,
            strategy1: this.props.helpStrategy1,
            strategy2: this.props.helpStrategy2,
            payoffs: this.props.payoffs
          }
        )
      )
    );
  }
}

class ExplorableComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      startX: 0,
	    currentX: 0
    };
    this.inputs = {};

    this.updateStartX = this.updateStartX.bind(this);
    this.updateCurrentX = this.updateCurrentX.bind(this);
    this.registerInputs = this.registerInputs.bind(this);
  }

  registerInputs() {
    const that = this;
    Object.keys(this.inputs).forEach(
      input => {
        that.state["start"+input] = that.inputs[input].start;
        that.state[input] = that.inputs[input].start;
      }
    );
  }

  updateStartX(startX) {
    this.setState({
      startX: startX
	  });
  }

  updateCurrentX(currentX, mousemove, id) {
  	var range;
  	var lowerb;
  	var upperb;
  	var sensitivity;
  	var startValue = 'start' + id;
  	var that = this;
  	var format;

    if (this.inputs[id]) {
      const input = this.inputs[id];
      range = input.range;
	    lowerb = input.lowerb;
	    upperb = input.upperb;
	    sensitivity = input.sensitivity;
	    format = input.format;
    }

    var x = d3.scaleLinear()
	    .domain([-sensitivity,sensitivity])
	    .range([that.state[startValue] - range, that.state[startValue] + range])
	    .clamp(true);

    var newValue = x(currentX - that.state.startX);
    if (newValue < lowerb) { newValue = lowerb; }
    if (newValue > upperb) { newValue = upperb; }

    newValue = format(newValue);

    this.setState({
      currentX: currentX,
      [id]: +newValue,
      [startValue]: mousemove === 1 ? this.state[startValue] : +newValue
	  });
  }
}

class ContentListItem extends React.Component {
  render() {
    return (
      e(
        'div', { className: 'content-list-item' },
        e(
          'a', { href: this.props.content.href },
          e(
            'div', { className: 'content-list-item-title' },
            this.props.content.title
          ),
          e(
            'div', { className: 'content-list-item-date' },
            this.props.content.date
          ),
          e(
            'div', { className: 'content-list-item-abstract' },
            this.props.content.abstract
          )
        )
      )
    );
  }
}

class ContentList extends React.Component {
  render() {
    return (
      e(
        "div", { className: 'content-list-container' },
        this.props.content.map(
          content => e(
            ContentListItem, { content }
          )
        )
      )
    );
  }
}

class D3Component extends React.Component {
  constructor(props) {
    super(props);
    this.createVisual = this.createVisual.bind(this);
    this.updateVisual = this.updateVisual.bind(this);
  }

  componentDidMount() {
    this.createVisual();
    this.updateVisual();
  }

  componentDidUpdate() {
    this.updateVisual();
  }

  createVisual() {

  }

  updateVisual() {

  }

  render() {
    return (
      e(
        "div", null,
        e(
          "svg", {
            ref: (node => this.node = node),
            width: this.props.width,
            height: this.props.height
          }
        )
      )
    );
  }
}

class RadioButtons extends D3Component {
  createVisual() {
    const node = this.node;
    const svg = d3.select(node)
      .append("g")
      .attr("id", "svg-" + this.props.elementId)
      .attr("transform", "translate(5,5)");
  }

  updateVisual() {
    const that = this;

    const buttons = d3.select("#svg-" + that.props.elementId)
    .selectAll("rect")
    .data(this.props.values);
    buttons.enter()
    .append("rect")
    .attr("x", (d, i) => i*(that.props.buttonWidth+5))
    .attr("y", (d, i) => 0)
    .attr("width", that.props.buttonWidth)
    .attr("height", that.props.buttonHeight)
    .attr("stroke", (d, i) => that.props.fillColors[i])
    .attr("stroke-width", (d, i) => that.props.selectedButton == i ? 2 : 0.5)
    .attr("fill", "transparent")
    .style("cursor", "pointer")
    .on("click", (d, i) => that.props.onClick(i));
    buttons.attr("fill", "transparent")
    .attr("stroke-width", (d, i) => that.props.selectedButton == i ? 2 : 0.5);

    const texts = d3.select("#svg-" + that.props.elementId)
    .selectAll("text")
    .data(this.props.values);
    texts.enter()
    .append("text")
    .attr("x", (d, i) => i*(that.props.buttonWidth+5)+that.props.buttonWidth/2)
    .attr("y", (d, i) => that.props.buttonHeight/2)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .attr("fill", "rgb(56, 56, 56)")
    .style("cursor", "pointer")
    .text(d => d)
    .on("click", (d, i) => that.props.onClick(i));
  }

  render() {
    return (
      e(
        "div", { id: this.props.elementId },
        e(
          "div", { className: "radio-title" },
          this.props.name
        ),
        e(
          "svg", {
            ref: (node => this.node = node),
            width: (this.props.values.length + 1) * this.props.buttonWidth,
            height: this.props.buttonHeight + 10
          }
        )
      )
    );
  }
}

class TOCSection extends React.Component {
  render() {
    return (
      e(
        "div", { className: "toc-section" },
        e(
          "div", { className: "toc-section-title" },
          e(
            "a", { href: "#sec-" + this.props.secidx },
            e(
              "span", { className: "toc-section-number" },
              this.props.secidx + ". "
            ),
            this.props.section.section.name
          )
        ),
        this.props.section.subsections.map(
          (subsection, subsecidx) => e(
            TOCSubSection, {
              subsection: subsection,
              secidx: this.props.secidx,
              subsecidx: subsecidx + 1
            }
          )
        )
      )
    );
  }
}

class TOCSubSection extends React.Component {
  render() {
    return (
      e(
        "div", { className: "toc-sub-section" },
        e(
          "div", { className: "toc-sub-section-title" },
          e(
            "a", { href: "#subsec-" + this.props.secidx + "-" + this.props.subsecidx },
            e(
              "span", {
                className: "toc-sub-section-number"
              },
              this.props.secidx + "." + this.props.subsecidx + " "
            ),
            this.props.subsection.name
          )
        )
      )
    );
  }
}

class TOC extends React.Component {
  render() {
    return (
      e(
        "div", { className: "toc-container" },
        e(
          "div", { className: "toc-container-title" },
          "Table of contents"
        ),
        e(
          "div", { className: "toc-sections-container" },
          this.props.sections.map(
            (section, secidx) => e(
              TOCSection, {
                section: section,
                secidx: secidx + 1
              }
            )
          )
        )
      )
    );
  }
}

class AuthorBlock extends React.Component {
  render() {
    return (
      e(
        "div", {
          className: "author-block-container"
        },
        e(
          "div", { className: "author-block-title" },
          "Authors"
        ),
        e(
          "div", null,
          e(
            "div", {
              className: "author-block-authors"
            },
            this.props.authors.map(
              author => e(
                "div", null,
                e(
                  "div", { className: "author-block-author" },
                  author.name
                ),
                e(
                  "div", { className: "author-block-affiliation" },
                  author.affiliation
                )
              )
            )
          )
        )
      )
    );
  }
}
