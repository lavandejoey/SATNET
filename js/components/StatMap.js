// js/components/StatMap.js

// In this 2D statistic graph
// We get data from 
// Our graph design is inspired by https://rocketlaunch.org/rocket-launch-recap/2023
// Plan: (也可以全部做成toggle的，不分区了)
// On the top: several barchart graphs which can be swithed between launched_site, owner and so on. (dynamic)
// On the bottom left: pie chart
// On the bottom right: a line graph（折线图） to show the launched number every year (static)
import * as d3 from "d3";
import * as Cesium from "cesium";
import {ctx} from "/js/utils/config";
import {getFlagSvg} from "/js/utils/data.js";

// Define constants for styling
const BUTTON_PADDING = {left: 10, right: 10, top: 5, bottom: 5};
const SQUARE_SIZE = 20; // Size of the color square
const BUTTON_SPACING = 15; // Space between buttons
const TEXT_OFFSET_X = SQUARE_SIZE + 10; // Space between square and text
const TEXT_FONT_SIZE = 16; // Font size for labels

const margin = {top: 20, right: 60, bottom: 40, left: 80};
const COLOURS = {
    BUTTON_BG: "lightgray",
    BUTTON_ACTIVE: "steelblue",
    BAR_FILL: "steelblue",
    LINE_STROKE: "steelblue",
    countryColorMap: {"US": "#27296d", "CN": "#99CCFF", "GB": "#a393eb", "RU": "#0066CC", "FR": "#996699"},
    starrySkyColorsArray: ["#112d4e", "#1f3b6e", "#2f4a8a", "#3f72af", "#4e80b5", "#5f98d2", "#6faee0", "#7db9e7", "#8cc3ec", "#9bcef1"]


      
};

const filter_buttons = [
    {id: "CN", label: "China"},
    {id: "FR", label: "France"},
    {id: "RU", label: "Russia"},
    {id: "GB", label: "United Kingdom"},
    {id: "US", label: "United States"},
];

/** Using `ctx.COUNTRY_MAP[d.key]` to get the fullName / iso2Code of the country */

const colorScale = d3.scaleOrdinal(COLOURS.starrySkyColorsArray);

let svgBar, xBar, yBar, plotType = "Country";
let svgLine, xLine, yLine;
const buttonWidth = 120;
const buttonHeight = 30;
const buttonSpacing = 30;
let nonselectedCountry = [];

// Utility function to debounce events
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function updateBarPlot(data, currentDate) {
    try {
        const currentDiv = document.getElementById("vmagHist");
        const oneYearAgo = new Date(currentDate.getTime() - 365 * 24 * 60 * 60 * 1000);
        // let filteredData = data.filter(d => d.Launch_Date >= oneYearAgo && d.Launch_Date <= currentDate);
        // filteredData = filteredData.filter(d => !selectedCountry.includes(d.SatState));
        let filteredData = data.filter(d =>
            d.Launch_Date >= oneYearAgo &&
            d.Launch_Date <= currentDate &&
            !nonselectedCountry.includes(d.SatState)
        ).map(d => {
            return {
                ...d,
                stateCode: ctx.COUNTRY_MAP[d.SatState]?.iso2Code || "xx",
                stateFullname: ctx.COUNTRY_MAP[d.SatState]?.fullName || "Unknown"
            }
        });

        let currentYear = currentDate.getFullYear();
        let totalCount = filteredData.length;

        let stateCount;
        if (plotType === "Country") {
            stateCount = Array.from(d3.group(filteredData, d => d.stateCode), ([key, values]) => ({
                key: key,
                value: values.length,
                satStates: Array.from(new Set(values.map(v => v.SatState))),
                code: key,
                fullName: values[0].stateFullname
            }));
        } else if (plotType === "Agent") {
            stateCount = Array.from(d3.group(filteredData, d => d.SatOwner), ([key, values]) => ({
                key,
                value: values.length,
                satStates: Array.from(new Set(values.map(v => v.SatState))),
                code: values[0].stateCode,
                fullName: values[0].stateFullname
            }));
        }

        stateCount.sort((a, b) => b.value - a.value);
        stateCount = stateCount.slice(0, 15);
        // console.log(stateCount)

        const valueExtent = d3.extent(stateCount, d => d.value);
        const logScale = d3.scaleLog().base(2).domain([0.5, valueExtent[1]]);

        // add log value for stateCount
        stateCount = stateCount.map(d => ({
            ...d,
            logValue: logScale(d.value)
        }));


        /*Update scales*/
        xBar.domain([0, d3.max(stateCount, d => d.logValue)]).nice();
        yBar.domain(stateCount.map(d => d.key));

        // Update axes
        svgBar.select(".x-axis")
            .transition().duration(500)
            .call(d3.axisBottom(xBar).ticks(5))
            .selectAll("text")
            .style("fill", "white") // Set axis label text color to white
            .style("font-size", "12px");

        svgBar.select(".y-axis")
            .transition().duration(500)
            .call(d3.axisLeft(yBar))
            .selectAll("text")
            .style("fill", "white") // Set axis label text color to white
            .style("font-size", "12px");

        svgBar.selectAll(".x-axis path, .x-axis line, .y-axis path, .y-axis line")
            .style("stroke", "white");

        /*Bind and update data*/
        const bars = svgBar.selectAll(".bar")
            .data(stateCount, d => d.key);

        // Update existing bars
        bars.transition().duration(500)
            .attr("y", d => yBar(d.key))
            .attr("height", yBar.bandwidth())
            .attr("width", d => xBar(d.logValue));

        // Enter new bars
        bars.enter()
            .append("rect")
            .attr("class", "bar")
            .attr("y", d => yBar(d.key))
            .attr("height", yBar.bandwidth())
            .attr("x", 0)
            .attr("width", 0)
            .style("fill", d => COLOURS.countryColorMap[d.code] || colorScale(d.code))
            .on("mouseover", function (event, d) {
                d3.select(this)
                    .append("title")
                    .text(() => d.fullName);
            })
            .transition().duration(500)
            .attr("width", d => xBar(d.logValue));


        // Remove exiting bars
        bars.exit()
            .transition().duration(500)
            .attr("width", 0)
            .remove();

        /*Update labels*/
        // Add labels to each bar
        const labels = svgBar.selectAll(".label")
            .data(stateCount, d => d.key);

        // Update existing labels
        labels.transition().duration(500)
            .attr("x", d => xBar(d.logValue) / 2 - 5) // Position slightly to the right of the bar
            .attr("y", d => yBar(d.key) + yBar.bandwidth() / 2) // Vertically center the label
            .text(d => d.value); // Update the text with the current value

        // Enter new labels
        labels.enter()
            .append("text")
            .attr("class", "label")
            .attr("x", d => xBar(d.logValue) / 2 - 5) // Position slightly to the right of the bar
            .attr("y", d => yBar(d.key) + yBar.bandwidth() / 2) // Vertically center the label
            .attr("dy", "0.35em") // Offset to align vertically with the bar
            .style("font-size", "12px")
            .style("fill", "#fff")
            .text(d => d.value); // Set the text to the bar's value

        labels.exit()
            .remove();


        const imgs = svgBar.selectAll(".countryImg")
            .data(stateCount, d => d.key);
        if (plotType === "Country") {

            /* Update right-bottom display */
            svgBar.selectAll(".dynamic-text").remove();

            //  (currentYear)
            svgBar.append("text")
                .attr("class", "dynamic-text year-text")
                .attr("x", currentDiv.offsetWidth - margin.right * 4)
                .attr("y", currentDiv.offsetHeight - margin.bottom * 8)
                .attr("text-anchor", "end")
                .style("fill", "lightgray")
                .style("font-size", "55px")
                .style("font-weight", "bold")
                .text(`${currentYear}`);

            //  (totalCount)
            svgBar.append("text")
                .attr("class", "dynamic-text count-text")
                .attr("x", currentDiv.offsetWidth - margin.right * 4)
                .attr("y", currentDiv.offsetHeight - margin.bottom * 7)
                .attr("text-anchor", "end")
                .style("fill", "lightgray")
                .style("font-size", "30px")
                .text(`Total: ${totalCount}`);

            // Update existing images
            imgs.transition().duration(500)
                .attr("x", d => xBar(d.logValue) + 10) // Adjust position slightly to the right of the bar
                .attr("y", d => yBar(d.key) + 5) // Vertically center the flag image
                .attr("width", yBar.bandwidth()) // Set the flag width
                .attr("height", yBar.bandwidth()); // Set the flag height

            // Enter new images
            imgs.enter()
                .append("foreignObject")
                .attr("class", "countryImg")
                .attr("x", d => xBar(d.logValue) + 10)
                .attr("y", d => yBar(d.key) + 5)
                .attr("width", yBar.bandwidth())
                .attr("height", yBar.bandwidth())
                .append("xhtml:div")
                .style("text-align", "center")
                .each(async function (d) {
                    const flagSvg = await getFlagSvg(d.code);
                    d3.select(this).html(`<img src="${flagSvg}" width="24px" alt="">`);
                });

            // Remove exiting images
            imgs.exit().remove();
        } else {
            imgs.exit().remove();
            svgBar.selectAll(".dynamic-text").remove();


        }
    } catch (error) {
        console.error("Error updating bar plot:", error);
    }


}

function initBarPlot() {
    try {
        const vmagHistDiv = document.getElementById('vmagHist');
        const {clientWidth: currentWidth, clientHeight: currentHeight} = vmagHistDiv;

        const width = currentWidth - margin.left - margin.right;
        const height = currentHeight - margin.top * 2 - margin.bottom * 2;

        // Create SVG container
        const svgContainer = d3.select("#vmagHist")
            .append("svg")
            .attr("id", "mySvgContainer")
            .attr("width", currentWidth)
            .attr("height", currentHeight);

        svgBar = svgContainer.append("g")
            .attr("transform", `translate(${margin.left},${margin.top * 2})`);

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
            .attr("transform", `translate(${margin.left},${margin.top - 20})`);

        const buttons = [
            {id: "button-country", label: "Country"},
            {id: "button-agent", label: "Agent"}
        ];


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
            .style("cursor", "pointer")
            .style("fill", "white");

        // // Create filter buttons
        // const filterBar = svgContainer.append("g")
        //     .attr("transform", `translate(${margin.left},${currentHeight - buttonHeight - 20})`);

        function computeButtonPosition(currentData) {
            const index = filter_buttons.findIndex(btn => btn.id === currentData.id);
            let position = 0;
            for (let i = 0; i < index; i++) {
                const btn = filter_buttons[i];
                const btnGroup = filterGroups.filter(d => d.id === btn.id);
                const textWidth = btnGroup.select(".button-label").node().getComputedTextLength();
                position += BUTTON_PADDING.left + SQUARE_SIZE + 10 + textWidth + BUTTON_PADDING.right + BUTTON_SPACING;
            }
            return position;
        }

        // Create a group for the filter bar
        const filterBar = svgContainer.append("g")
            .attr("transform", `translate(${margin.left}, ${currentHeight - buttonHeight - 20})`);

        // Create filter groups for each button
        const filterGroups = filterBar.selectAll(".filter-group")
            .data(filter_buttons)
            .enter()
            .append("g")
            .attr("class", "filter-group")
            .attr("cursor", "pointer") // Change cursor to pointer on hover
            .on("click", function (event, d) {
                // Toggle selection
                const index = nonselectedCountry.indexOf(d.id);
                if (index > -1) {
                    nonselectedCountry.splice(index, 1);
                } else {
                    nonselectedCountry.push(d.id);
                }

                // Update button styles based on selection
                filterGroups.each(function (btn) {
                    const isSelected = !nonselectedCountry.includes(btn.id);
                    d3.select(this)
                        .select(".color-square")
                        .style("opacity", isSelected ? 1 : 0.5);

                    d3.select(this)
                        .select(".button-label")
                        .style("opacity", isSelected ? 1 : 0.5);
                });

                // Filter data (replace with your actual update function)
                updateBarPlot(ctx.LAUNCHLOG.DATA, Cesium.JulianDate.toDate(ctx.view3D.clock.currentTime));
            });

        // Append color squares to each filter group
        filterGroups.append("rect")
            .attr("class", "color-square")
            .attr("width", SQUARE_SIZE)
            .attr("height", SQUARE_SIZE)
            .attr("rx", 3)
            .attr("ry", 3)
            .style("fill", d => COLOURS.countryColorMap[d.id])
            .style("opacity", d => !nonselectedCountry.includes(d.id) ? 1 : 0.5);

        // Append labels to each filter group
        filterGroups.append("text")
            .attr("class", "button-label")
            .attr("x", TEXT_OFFSET_X)
            .attr("y", SQUARE_SIZE / 2)
            .attr("dy", "0.35em") // Vertically center the text
            .text(d => d.label)
            .style("font-size", `${TEXT_FONT_SIZE}px`)
            .style("fill", "white")
            .style("opacity", d => !nonselectedCountry.includes(d.id) ? 1 : 0.5);

        // Dynamically calculate the width of each button based on the text length
        filterGroups.each(function (d) {
            // Set the size of the group
            d3.select(this)
                .attr("transform", `translate(${computeButtonPosition(d)}, 0)`);
        });

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

        const logScale = d3.scaleLog()
            .base(10)
            .domain([1, d3.max(yearCount, d => d.value)])

        const cumulativeYearCount = [];
        let cumulativeValue = 0;

        yearCount.forEach(d => {
            cumulativeValue += d.value;

            const logCumulativeValue = cumulativeValue > 0 ? logScale(cumulativeValue) : 0;

            cumulativeYearCount.push({
                year: d.year,
                cumulativeValue: cumulativeValue
            });
        });

        // console.log(cumulativeYearCount);


        // Define scales
        xLine = d3.scaleLinear()
            .domain(d3.extent(cumulativeYearCount, d => d.year))
            .range([0, width]);

        yLine = d3.scaleLinear()
            .domain([0, d3.max(cumulativeYearCount, d => d.cumulativeValue)])
            .range([height, 0]);

        // Append axes
        svgLine.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xLine).tickFormat(d3.format("d")))
            .selectAll("text")
            .style("fill", "white")
            .style("font-size", "10px");

        svgLine.append("g")
            .call(d3.axisLeft(yLine).ticks(4))
            .selectAll("text")
            .style("fill", "white")
            .style("font-size", "10px");

        svgLine.selectAll(".domain, .tick line")
            .style("stroke", "white");

        // Define line generator
        const line = d3.line()
            .x(d => xLine(d.year))
            .y(d => yLine(d.cumulativeValue));

        // Append line path
        svgLine.append("path")
            .datum(cumulativeYearCount)
            .attr("fill", "none")
            .attr("stroke", "white")
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
            height: `${currentHeight / 3 * 2}px`,
            backgroundColor: "black",
            padding: "10px",
            borderRadius: "5px"
        });

        const linePlotDiv = document.getElementById("linePlot");
        Object.assign(linePlotDiv.style, {
            width: `${currentWidth - 20}px`,
            height: `${currentHeight - vmagHistDiv.offsetHeight - 20}px`,
            backgroundColor: "black",
            padding: "10px",
            borderRadius: "5px",
            position: "relative",
            // marginTop: "2px"
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

        // Update while Cesium clock changes
        let updateInterval = () => updateBarPlot(ctx.LAUNCHLOG.DATA, Cesium.JulianDate.toDate(ctx.view3D.clock.currentTime));
        ctx.view3D.clock.onTick.addEventListener(updateInterval);

        console.log("Finished creating statistical graphs");
    } catch (error) {
        console.error("Error creating statistical visualization:", error);
    }
}