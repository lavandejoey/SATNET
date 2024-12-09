// In this 2D statistic graph
// We get data from 
// Our graph design is inspired by https://rocketlaunch.org/rocket-launch-recap/2023
// Plan: (也可以全部做成toggle的，不分区了)
// On the top: several barchart graphs which can be swithed between launched_site, owner and so on. (dynamic)
// On the bottom left: pie chart
// On the bottom right: a line graph（折线图） to show the launched number every year (static)




import * as Cesium from 'cesium';
import { ctx } from "../utils/config";
import * as d3 from 'd3';
let svg, x, y, plot_type;
const margin = { top: 20, right: 30, bottom: 40, left: 80 };


function loadData() {
    let inputDate = Cesium.JulianDate.toDate(ctx.view3D.clock.currentTime)
    const formattedDate = inputDate.toISOString();
    console.log(formattedDate)
    let res = [];
    d3.tsv("/data/launchlog.tsv").then(function (data) {
        data.forEach(function (d) {
            if (!d["#Launch_Tag"].startsWith("#")) {
                let parseDate = d3.timeParse("%Y %b %d %H%M:%S");
                let formatted_date = d3.utcFormat("%Y-%m-%d")(parseDate(d["Launch_Date"]));
                let dateOBJ = new Date(formatted_date);
                let data_formatted = {
                    Launch_Date: dateOBJ,
                    SatOwner: d["SatOwner"],
                    SatState: d["SatState"],
                    Launch_Site: d["Launch_Site"]
                }
                res.push(data_formatted)
            }
        })
        initBarPlot();
        initLineChart(res);
        setInterval(() => changeTime(res), 1000);
    }).catch(function (error) { console.log(error) })
}

function changeTime(data) {
    const inputDate = Cesium.JulianDate.toDate(ctx.view3D.clock.currentTime);
    updateBarPlot(data, inputDate);
}

function updateBarPlot(data, currentDate) {
    console.log(currentDate);
    const oneYearAgo = new Date(currentDate.getTime() - 365 * 24 * 60 * 60 * 1000);
    const filteredData = data.filter(d => d.Launch_Date >= oneYearAgo && d.Launch_Date <= currentDate);

    let stateCount;
    if (plot_type === "Country") {
        stateCount = Array.from(d3.group(filteredData, d => d.SatState), ([key, values]) => ({
            key: key,
            value: values.length
        }));
    } else if (plot_type === "Agent") {
        stateCount = Array.from(d3.group(filteredData, d => d.SatOwner), ([key, values]) => ({
            key: key,
            value: values.length
        }));
    }

    stateCount.sort((a, b) => b.value - a.value);
    stateCount = stateCount.slice(0, 5);

    // scale domain
    x.domain([0, d3.max(stateCount, d => d.value)]).nice();
    y.domain(stateCount.map(d => d.key));

    // x and y axis
    svg.select(".x-axis").transition().duration(500).call(d3.axisBottom(x).ticks(5));
    svg.select(".y-axis").transition().duration(500).call(d3.axisLeft(y));

    // binds data
    const bars = svg.selectAll(".bar").data(stateCount, d => d.key);

    // update existing countries' data
    bars
        .transition().duration(500)
        .attr("y", d => y(d.key))
        .attr("height", y.bandwidth())
        .attr("x", 0)
        .attr("width", d => x(d.value));

    // add new data
    bars
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("y", d => y(d.key))
        .attr("height", y.bandwidth())
        .attr("x", 0)
        .attr("width", 0)
        .style("fill", "steelblue")
        .transition().duration(500)
        .attr("width", d => x(d.value));

    // remove data
    bars
        .exit()
        .transition().duration(500)
        .attr("width", 0)
        .remove();
}

function initBarPlot() {
    // get the width and height of vmagHistDiv
    const vmagHistDiv = document.getElementById('vmagHist');
    const currentWidth = vmagHistDiv.clientWidth;
    const currentHeight = vmagHistDiv.clientHeight;

    // set height and width of the plot
    const width = currentWidth - margin.left - margin.right;
    const height = currentHeight - margin.top - margin.bottom;

    // The large graph
    const svgContainer = d3.select("#vmagHist")
        .append("svg")
        .attr("width", currentWidth)
        .attr("height", currentHeight)


    svg = svgContainer.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // scale
    x = d3.scaleLinear().range([0, width]);
    y = d3.scaleBand().range([0, height]).padding(0.1);

    // x, y scale
    svg.append("g").attr("class", "x-axis").attr("transform", `translate(0,${height})`);
    svg.append("g").attr("class", "y-axis");

    // toggle bar
    plot_type = "Country" // initial plot the top-5 country
    const toggleBar = svgContainer.append("g")
        .attr("transform", `translate(0,${margin.top})`);

    const buttons = [
        { id: "bottom1", label: "Country" },
        { id: "bottom2", label: "Agent" },
        // { id: "bottom3", label: "Year" }
    ]
    const buttonWidth = margin.left / 2
    const buttonHeight = margin.top / 2
    const buttonSpacing = buttonHeight / 4

    toggleBar.selectAll(".buttom-group")
        .data(buttons)
        .enter()
        .append("g")
        .attr("class", "button-group")
        .attr("transform", (d, i) => `translate(0, ${i * (buttonHeight + buttonSpacing)})`)
        .each(function (d, i) {
            const group = d3.select(this);

            group.append("rect")
                .attr("class", "button-bg")
                .attr("width", buttonWidth)
                .attr("height", buttonHeight)
                .attr("rx", buttonSpacing)
                .attr("ry", buttonSpacing)
                .style("fill", "lightgray")
                .style("cursor", "pointer")
                .on("click", function () {
                    d3.selectAll(".button-bg").style("fill", "lightgray");
                    d3.select(this).style("fill", "steelblue");
                    console.log(`${d.label} clicked!`);
                    plot_type = d.label;
                })

            group.append("text")
                .attr("x", buttonWidth / 2)
                .attr("y", buttonHeight / 2)
                .attr("dy", "0.35em")
                .attr("text-anchor", "middle")
                .text(d.label)
                .style("font-size", "8px")
                .style("cursor", "pointer");
        })


}

function initLineChart(data) {
    console.log(data)
    const linePlotDiv = document.getElementById("linePlot");
    const currentWidth = linePlotDiv.clientWidth;
    const currentHeight = linePlotDiv.clientHeight;

    const width = currentWidth - margin.left - margin.right;
    const height = currentHeight - margin.top - margin.bottom;

    const linePlot = d3.select("#linePlot")
        .append("svg")
        .attr("width", currentWidth)
        .attr("height", currentHeight)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const yearCount = Array.from(d3.group(data, d => {
        // console.log(d.Launch_Date.getFullYear());
        return d.Launch_Date.getFullYear()}), 
        ([key, values]) => ({
        year: key,
        value: values.length
    }));

    yearCount.sort((a, b) => a.year - b.year)

    console.log(yearCount)

    const x_year = d3.scaleLinear().domain(d3.extent(yearCount, d => d.year)).range([0, width]);
    const y_year = d3.scaleLinear().domain([0, d3.max(yearCount, d => d.value)]).range([height, 0]);

    linePlot.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x_year).tickFormat(d3.format("d")))
        .selectAll("text")
        .style("font-size", "8px");

    linePlot.append("g")
        .call(d3.axisLeft(y_year))
        .selectAll("text")
        .style("font-size", "8px");

    const line = d3.line()
        .x((d) => x_year(d.year))
        .y((d) => y_year(d.value));

    linePlot.append("path")
        .datum(yearCount)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", line);

}


export let createStatViz = function () {
    console.log("start to create statastic graph")
    const statsDiv = document.getElementById("stats");
    statsDiv.style.backgroundColor = "blue";
    let currentWidth = statsDiv.offsetWidth;
    let currentHeight = statsDiv.offsetHeight;
    console.log(currentHeight, currentWidth);
    const vmagHistDiv = document.getElementById("vmagHist");
    vmagHistDiv.style.width = (currentWidth - 20) + 'px';
    vmagHistDiv.style.height = (currentHeight - 150) + 'px';
    vmagHistDiv.style.backgroundColor = "white"
    vmagHistDiv.style.padding = "10px";  // padding
    vmagHistDiv.style.borderRadius = "5px";  // round corners
    const linePlot = document.getElementById("linePlot");
    linePlot.style.width = (currentWidth - 20) + 'px';
    linePlot.style.height = (currentHeight - vmagHistDiv.offsetHeight - 22) + 'px';
    console.log(currentHeight, vmagHistDiv.offsetHeight, linePlot.offsetHeight);

    linePlot.style.backgroundColor = "white"
    linePlot.style.padding = "10px";  // padding
    linePlot.style.borderRadius = "5px";  // round corners
    linePlot.style.position = "relative";
    linePlot.style.marginTop = "2px";
    loadData();
}