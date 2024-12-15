// js/components/StatMap.js

// In this 2D statistic graph
// We get data from 
// Our graph design is inspired by https://rocketlaunch.org/rocket-launch-recap/2023
// Plan: (也可以全部做成toggle的，不分区了)
// On the top: several barchart graphs which can be swithed between launched_site, owner and so on. (dynamic)
// On the bottom left: pie chart
// On the bottom right: a line graph（折线图） to show the launched number every year (static)
import * as Cesium from "cesium";
import {ctx} from "/js/utils/config";
import * as d3 from "d3";

const margin = {top: 20, right: 30, bottom: 40, left: 80};
const COLOURS = {
    BUTTON_BG: "lightgray",
    BUTTON_ACTIVE: "steelblue",
    BAR_FILL: "steelblue",
    LINE_STROKE: "steelblue"
};

let svgBar, xBar, yBar, plotType = "Country";
let svgLine, xLine, yLine;

// Utility function to debounce events
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function changeTime(data) {
    const inputDate = Cesium.JulianDate.toDate(ctx.view3D.clock.currentTime);
    updateBarPlot(data, inputDate);
}

function updateBarPlot(data, currentDate) {
    try {
        const oneYearAgo = new Date(currentDate.getTime() - 365 * 24 * 60 * 60 * 1000);
        const filteredData = data.filter(d => d.Launch_Date >= oneYearAgo && d.Launch_Date <= currentDate);

        let stateCount;
        if (plotType === "Country") {
            stateCount = Array.from(d3.group(filteredData, d => d.SatState), ([key, values]) => ({
                key,
                value: values.length
            }));
        } else if (plotType === "Agent") {
            stateCount = Array.from(d3.group(filteredData, d => d.SatOwner), ([key, values]) => ({
                key,
                value: values.length
            }));
        }

        stateCount.sort((a, b) => b.value - a.value);
        stateCount = stateCount.slice(0, 5);

        // Update scales
        xBar.domain([0, d3.max(stateCount, d => d.value)]).nice();
        yBar.domain(stateCount.map(d => d.key));

        // Update axes
        svgBar.select(".x-axis")
            .transition().duration(500)
            .call(d3.axisBottom(xBar).ticks(5));

        svgBar.select(".y-axis")
            .transition().duration(500)
            .call(d3.axisLeft(yBar));

        // Bind data
        const bars = svgBar.selectAll(".bar")
            .data(stateCount, d => d.key);

        // Update existing bars
        bars.transition().duration(500)
            .attr("y", d => yBar(d.key))
            .attr("height", yBar.bandwidth())
            .attr("width", d => xBar(d.value));

        // Enter new bars
        bars.enter()
            .append("rect")
            .attr("class", "bar")
            .attr("y", d => yBar(d.key))
            .attr("height", yBar.bandwidth())
            .attr("x", 0)
            .attr("width", 0)
            .style("fill", COLOURS.BAR_FILL)
            .transition().duration(500)
            .attr("width", d => xBar(d.value));

        // Remove exiting bars
        bars.exit()
            .transition().duration(500)
            .attr("width", 0)
            .remove();
    } catch (error) {
        console.error("Error updating bar plot:", error);
    }
}

function initBarPlot() {
    try {
        const vmagHistDiv = document.getElementById('vmagHist');
        const {clientWidth: currentWidth, clientHeight: currentHeight} = vmagHistDiv;

        const width = currentWidth - margin.left - margin.right;
        const height = currentHeight - margin.top - margin.bottom;

        // Create SVG container
        const svgContainer = d3.select("#vmagHist")
            .append("svg")
            .attr("width", currentWidth)
            .attr("height", currentHeight);

        svgBar = svgContainer.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Define scales
        xBar = d3.scaleLinear().range([0, width]);
        yBar = d3.scaleBand().range([0, height]).padding(0.1);

        // Append axes groups
        svgBar.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${height})`);

        svgBar.append("g")
            .attr("class", "y-axis");

        // Create toggle buttons
        const toggleBar = svgContainer.append("g")
            .attr("transform", `translate(${margin.left},${margin.top - 30})`);

        const buttons = [
            {id: "button-country", label: "Country"},
            {id: "button-agent", label: "Agent"}
        ];

        const buttonWidth = 80;
        const buttonHeight = 25;
        const buttonSpacing = 10;

        const buttonGroups = toggleBar.selectAll(".button-group")
            .data(buttons)
            .enter()
            .append("g")
            .attr("class", "button-group")
            .attr("transform", (d, i) => `translate(${i * (buttonWidth + buttonSpacing)}, 0)`);

        buttonGroups.append("rect")
            .attr("class", "button-bg")
            .attr("width", buttonWidth)
            .attr("height", buttonHeight)
            .attr("rx", 5)
            .attr("ry", 5)
            .style("fill", d => d.label === plotType ? COLOURS.BUTTON_ACTIVE : COLOURS.BUTTON_BG)
            .style("cursor", "pointer")
            .on("click", function (event, d) {
                plotType = d.label;
                d3.selectAll(".button-bg").style("fill", COLOURS.BUTTON_BG);
                d3.select(this).style("fill", COLOURS.BUTTON_ACTIVE);
                updateBarPlot(ctx.LAUNCHLOG.DATA, Cesium.JulianDate.toDate(ctx.view3D.clock.currentTime));
            });

        buttonGroups.append("text")
            .attr("x", buttonWidth / 2)
            .attr("y", buttonHeight / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .text(d => d.label)
            .style("font-size", "12px")
            .style("cursor", "pointer");
    } catch (error) {
        console.error("Error initializing bar plot:", error);
    }
}

function initLineChart() {
    try {
        const linePlotDiv = document.getElementById("linePlot");
        const {clientWidth: currentWidth, clientHeight: currentHeight} = linePlotDiv;

        const width = currentWidth - margin.left - margin.right;
        const height = currentHeight - margin.top - margin.bottom;

        // Create SVG container
        const svgContainer = d3.select("#linePlot")
            .append("svg")
            .attr("width", currentWidth)
            .attr("height", currentHeight);

        svgLine = svgContainer.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Process data
        const launchData = ctx.LAUNCHLOG.DATA;
        if (!Array.isArray(launchData)) {
            console.error("LaunchLog data is not an array.");
            return;
        }

        const yearCount = Array.from(d3.group(launchData, d => d.Launch_Date.getFullYear()), ([key, values]) => ({
            year: key,
            value: values.length
        })).sort((a, b) => a.year - b.year);

        // Define scales
        xLine = d3.scaleLinear()
            .domain(d3.extent(yearCount, d => d.year))
            .range([0, width]);

        yLine = d3.scaleLinear()
            .domain([0, d3.max(yearCount, d => d.value)])
            .range([height, 0]);

        // Append axes
        svgLine.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xLine).tickFormat(d3.format("d")))
            .selectAll("text")
            .style("font-size", "10px");

        svgLine.append("g")
            .call(d3.axisLeft(yLine))
            .selectAll("text")
            .style("font-size", "10px");

        // Define line generator
        const line = d3.line()
            .x(d => xLine(d.year))
            .y(d => yLine(d.value));

        // Append line path
        svgLine.append("path")
            .datum(yearCount)
            .attr("fill", "none")
            .attr("stroke", COLOURS.LINE_STROKE)
            .attr("stroke-width", 2)
            .attr("d", line);
    } catch (error) {
        console.error("Error initializing line chart:", error);
    }
}

export function createStatViz() {
    try {
        // console.log("Start creating statistical graphs");

        const statsDiv = document.getElementById("stats");
        statsDiv.style.backgroundColor = "blue";
        const {offsetWidth: currentWidth, offsetHeight: currentHeight} = statsDiv;
        // console.log(currentHeight, currentWidth);

        const vmagHistDiv = document.getElementById("vmagHist");
        Object.assign(vmagHistDiv.style, {
            width: `${currentWidth - 20}px`,
            height: `${currentHeight - 150}px`,
            backgroundColor: "white",
            padding: "10px",
            borderRadius: "5px"
        });

        const linePlotDiv = document.getElementById("linePlot");
        Object.assign(linePlotDiv.style, {
            width: `${currentWidth - 20}px`,
            height: `${currentHeight - vmagHistDiv.offsetHeight - 22}px`,
            backgroundColor: "white",
            padding: "10px",
            borderRadius: "5px",
            position: "relative",
            marginTop: "2px"
        });

        initBarPlot();
        initLineChart();
        updateBarPlot(ctx.LAUNCHLOG.DATA, Cesium.JulianDate.toDate(ctx.view3D.clock.currentTime));

        // Handle window resize for responsiveness
        window.addEventListener('resize', debounce(() => {
            console.log("Window resized, updating charts");
            // Clear existing SVGs
            d3.select("#vmagHist").select("svg").remove();
            d3.select("#linePlot").select("svg").remove();

            // Reinitialize plots
            initBarPlot();
            initLineChart();
            updateBarPlot(ctx.LAUNCHLOG.DATA, Cesium.JulianDate.toDate(ctx.view3D.clock.currentTime));
        }, 300));

        // Update time every second
        setInterval(() => changeTime(ctx.LAUNCHLOG.DATA), 1000);
        console.log("Finished creating statistical graphs");
    } catch (error) {
        console.error("Error creating statistical visualization:", error);
    }
}