const w = 1000;
const h = 500;
const padding = 60;

let xScale;
let yScale;

let baseTemp;

let data = [];
let minYear;
let maxYear;
let numberOfYears = maxYear - minYear;

let canvas = d3.select('svg');
let tooltip = d3.select('#tooltip');

let colors = [
	'rgb(42, 78, 108)',
	'rgb(49, 91, 126)',
	'rgb(56, 104, 144)',
	'rgb(63, 117, 162)',
	'rgb(255, 253, 208)',
	'rgb(255, 204, 136)',
	'rgb(255, 173, 51)',
	'rgb(255, 153, 0)',
	'rgb(132, 22, 23)',
];

const fetchData = async () => {
	const fd = await fetch(
		'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json'
	)
		.then((res) => res.json())
		.catch((err) => console.log(err));
	baseTemp = fd['baseTemperature'];
	data = fd['monthlyVariance'];

	drawCanvas();
	generateScale();
	drawCells();
	drawAxes();
};

const drawCanvas = () => {
	canvas.attr('width', w).attr('height', h);
	generateScale();
	drawLegend();
};
const generateScale = () => {
	minYear = d3.min(data, (d) => d['year']);
	maxYear = d3.max(data, (d) => d['year']);

	xScale = d3
		.scaleLinear()
		.domain([minYear, maxYear + 1])
		.range([padding, w - padding]);
	yScale = d3
		.scaleTime()
		.domain([new Date(0, 0, 0, 0, 0, 0, 0), new Date(0, 12, 0, 0, 0, 0, 0)])
		.range([padding, h - padding]);
};
const drawCells = () => {
	canvas
		.selectAll('rect')
		.data(data)
		.enter()
		.append('rect')
		.attr('class', 'cell')
		.attr('fill', (item) => {
			let variance = item['variance'];

			if (variance <= -5.5) {
				return colors[0];
			} else if (variance <= -4.5) {
				return colors[1];
			} else if (variance <= -3.5) {
				return colors[2];
			} else if (variance <= -2.5) {
				return colors[3];
			} else if (variance <= -1.51) {
				return colors[4];
			} else if (variance <= 0) {
				return colors[5];
			} else if (variance <= 2.5) {
				return colors[6];
			} else if (variance <= 3.5) {
				return colors[7];
			} else {
				return colors[8];
			}
		})
		.attr('data-year', (item) => {
			return item['year'];
		})
		.attr('data-month', (item) => {
			return item['month'] - 1;
		})
		.attr('data-temp', (item) => {
			return baseTemp + item['vairiance'];
		})
		.attr('height', (h - 2 * padding) / 12)
		.attr('y', (item) => {
			return yScale(new Date(0, item['month'] - 1, 0, 0, 0, 0, 0));
		})
		.attr('width', (item) => {
			let numberOfYears = maxYear - minYear;
			return (w - 2 * padding) / numberOfYears;
		})
		.attr('x', (item) => {
			return xScale(item['year']);
		})
		.on('mouseover', (event, item) => {
			tooltip
				.transition()
				.duration(1)
				.style('visibility', 'visible')
				.style('opacity', 0.8)
				.attr('data-year', item['year'])
				.style('left', event.pageX + 'px')
				.style('top', event.pageY + 'px');

			let monthNames = [
				'January',
				'Febuary',
				'March',
				'April',
				'May',
				'June',
				'July',
				'August',
				'September',
				'October',
				'November',
				'December',
			];
			let variance = item['variance'].toString();
			tooltip.html(`${item['year']} - ${monthNames[item['month'] - 1]} <br/> ${(
				baseTemp + item['variance']
			).toPrecision(2)}&#x2103;
 <br/> ${variance.indexOf('-') === -1 ? '+' + variance : variance}&#x2103;`);
		})
		.on('mouseout', (item) => {
			tooltip.transition().duration(1).style('visibility', 'hidden');
		});
};

const drawAxes = () => {
	let xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));
	let yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat('%B'));

	canvas
		.append('g')
		.call(xAxis)
		.attr('id', 'x-axis')
		.attr('transform', `translate(0,${h - padding})`);
	canvas.append('g').call(yAxis).attr('id', 'y-axis').attr('transform', `translate(${padding},0)`);
};

const drawLegend = () => {
	let legend = d3.select('#legend');
	const legendPadding = 50;
	const legendWidth = 550;
	const legendHeight = 150;

	legend.attr('height', legendHeight).attr('width', legendWidth).style('backgroud-color', 'gray');

	let minVariance = d3.min(data, (item) => item['variance'] + baseTemp);
	let maxVariance = d3.max(data, (item) => item['variance'] + baseTemp);

	legendScale = d3
		.scaleLinear()
		.domain([minVariance, maxVariance])
		.range([legendPadding, legendWidth - legendPadding]);

	let axis = d3.axisBottom(legendScale);

	legend
		.append('g')
		.call(axis)
		.attr('transform', `translate(0, ${legendHeight - legendPadding})`);
};

fetchData();
