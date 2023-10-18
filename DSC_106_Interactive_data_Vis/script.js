function final_project(){
    let filePath="data.csv";
    process_data(filePath);
}

let process_data=function(filePath){
    //preprocess data
    d3.csv(filePath).then(function(data){
        data.forEach(d => {
            d.Year = +d.Year;
            d.Value = +d.Value;
        })
        plot1(data);
        plot2(data);
        plot3(data);
    });
}

let plot1=function(data){

    // data cleaning for my plot # 1 
    tuition=d3.filter(data, function(d) {
        return d.Expense=="Fees/Tuition"})

    // living expense clearning for plot 1: 
    non_tuition=d3.filter(data, function(d) {
    return d.Expense !=="Fees/Tuition"})

    // living expense by year by state
    let grouped = d3.flatRollup(non_tuition, 
        v => d3.mean(v, d => d.Value), d => d.State, d => d.Year);
    let living_exp = grouped.map(([state, year, value]) => ({ state, year, value }));

    // living expense by year
    let by_year_expense = d3.flatRollup(
        living_exp, v => d3.mean(v, d => d.value), d => d.year);
    let plot_1_expense = by_year_expense.map(([year, value]) => ({year, value}));

    // tuition by year
    let by_year_tuition= d3.flatRollup(
        tuition, v => d3.mean(v, d => d.Value), d => d.Year);
    let plot_1_tuition = by_year_tuition.map(([year, value]) => ({year, value}));

    //final plot 1 data
    let plot_1_raw =plot_1_expense.concat(plot_1_tuition)
    let p1_grouped = d3.flatRollup(plot_1_raw, v => d3.sum(v, d => d.value), d => d.year);
    let plot_1_data= p1_grouped.map(([year, value]) => ({year, value}));
    
    //console.log(plot_1_data)

    const svgwidth = 550;
    const svgheight = 400;
    const padding = 60;

    let svg = d3.select("#plot1").append("svg")
                    .attr("width", svgwidth)
                    .attr("height", svgheight);

    let xScale = d3.scaleLinear()
        .domain(d3.extent(plot_1_data, d => d.year))
        .range([padding, svgwidth-padding]);

    let lower = 18000;
    let upper_padding= 3000;

    var yScale = d3.scaleLinear()
        .domain([lower, d3.max(plot_1_data, d => d.value)+upper_padding])
        .range([svgheight-padding, padding]);

    const xAxis = d3.axisBottom().scale(xScale);
    const yAxis = d3.axisLeft().scale(yScale).ticks(8);

    svg.append('g').call(xAxis).attr("class", "xAxis")
        .attr("transform", `translate(0, ${svgheight-padding})`)
        .style('stroke-width', '1.5');
            
    svg.append('g').call(yAxis).attr("class", "yAxis")
        .attr("transform", `translate(${padding}, 0)`)
        .style('stroke-width', '1.5');

    const tooltip = d3.select("#plot1").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position","absolute")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "4px")
        .style("padding", "4px")
        .style("border-color", "#0D62A4")
        .style("color", "#0D62A4");

    svg.selectAll("circle")
        .data(plot_1_data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.year))
        .attr("cy", d => yScale(d.value))
        .attr("r", 6)
        .style("fill", "#62BAFE")
        .on("mouseover", function (e, d) {
            d3.select(this)
                .style("stroke", "skyblue")
                .style("stroke-width", 10);
            tooltip.style("opacity", 1)
        })
        .on("mousemove", function (e, d) {
            tooltip
                .html(`Expense : $ ${d.value.toFixed(0)}`)
                .style("top",  (e.pageY+10) + "px")
                .style("left", (e.pageX+10) + "px") 
        })
        .on("mouseout", function (e, d) {
            d3.select(this)
                .style("stroke", "none");
            tooltip.style("opacity", 0)
        });

    let line = d3.line()
        .x(function(d) {return xScale(d.year)}) 
        .y(function(d) { return yScale(d.value)}) 
        .curve(d3.curveMonotoneX)

    // path 
        svg.append("path")
        .datum(plot_1_data) 
        .attr("d", line)
        .style("fill", "none")
        .style("stroke", "#62BAFE")
        .style("stroke-width", "5")
        .style("stroke-dasharray",("4", "3"));

    // title
    svg.append("text")
        .attr("x", svgwidth/3.5) 
        .attr("y", 20) 
        .attr("font-size", "16px") 
        .style("font-weight", "bold")
        .text("Undergrad Expensis in US by Year"); 

    // x axis
    svg.append("text")
        .attr("x", 262) 
        .attr("y", 375) 
        .attr("font-size", "14px") 
        .text("Year"); 

    // y axis
    svg.append("text")
        .attr("x", -230) 
        .attr("y", 10) 
        .attr("font-size", "14px") 
        .attr("transform", "rotate(-90)") 
        .text("Expense");

}

let plot2=function(data){

    // extract only 2021, latest data
    only_2021=d3.filter(data, function(d) {
        return d.Year==2021})
    
    //  plot # 2 2021 tuition
    tuition=d3.filter(only_2021, function(d) {
        return d.Expense=="Fees/Tuition"})

    // living expense clearning for plot 2: 
    non_tuition=d3.filter(only_2021, function(d) {
        return d.Expense !=="Fees/Tuition"})

    // living expense by state
    let grouped = d3.flatRollup(non_tuition, 
        v => d3.mean(v, d => d.Value), d => d.State);
    let living_exp = grouped.map(([state, value]) => ({ state, value }));
    //console.log(living_exp)

    // tuition overall 
    let overall_by_state= d3.flatRollup(
        tuition, v => d3.mean(v, d => d.Value), d => d.State);
    let overall_t= overall_by_state.map(([state, value]) => ({state, value}));
    //console.log(overall_t)

    // tuition 4 year
    four_year=d3.filter(tuition, function(d) {
        return d.Length=="4-year"});
    let four_yr_by_state= d3.flatRollup(
        four_year, v => d3.mean(v, d => d.Value), d => d.State);
    let four_year_t = four_yr_by_state.map(([state, value]) => ({state, value}));
    //console.log(four_year_t)

    // tuition 2 year
    two_year=d3.filter(tuition, function(d) {
        return d.Length=="2-year"});
    let two_yr_by_state= d3.flatRollup(
        two_year, v => d3.mean(v, d => d.Value), d => d.State);
    let two_year_t = two_yr_by_state.map(([state, value]) => ({state, value}));
    //console.log(two_year_t)

    //console.log(overall_t,four_year_t,two_year_t)

    //final plot 2 data
    let plot_2_raw_overall =overall_t.concat(living_exp)
    let plot_2_raw_overall_merge = d3.flatRollup(plot_2_raw_overall, v => d3.sum(v, d => d.value), d => d.state);
    let plot_2_overall= plot_2_raw_overall_merge.map(([state, value]) => ({state, value}));

    let plot_2_raw_2_year =two_year_t.concat(living_exp)
    let plot_2_raw_2_year_merge = d3.flatRollup(plot_2_raw_2_year, v => d3.sum(v, d => d.value), d => d.state);
    let plot_2_2year= plot_2_raw_2_year_merge.map(([state, value]) => ({state, value}));

    let plot_2_raw_4_year =four_year_t.concat(living_exp)
    let plot_2_raw_4_year_merge = d3.flatRollup(plot_2_raw_4_year, v => d3.sum(v, d => d.value), d => d.state);
    let plot_2_4year= plot_2_raw_4_year_merge.map(([state, value]) => ({state, value}));

    //console.log(plot_2_overall,plot_2_2year,plot_2_4year)

    let dict_overall = new Map(plot_2_overall.map(d => [d.state, d.value]));
    let dict_2year = new Map(plot_2_2year.map(d => [d.state, d.value]));
    let dict_4year = new Map(plot_2_4year.map(d => [d.state, d.value]));

    //console.log(dict_overall)
    
    // dict from assignment 6 to convert synonym 

    let stateSym = {
        AZ: 'Arizona',
        AL: 'Alabama',
        AK: 'Alaska',
        AR: 'Arkansas',
        CA: 'California',
        CO: 'Colorado',
        CT: 'Connecticut',
        DC: 'District of Columbia',
        DE: 'Delaware',
        FL: 'Florida',
        GA: 'Georgia',
        HI: 'Hawaii',
        ID: 'Idaho',
        IL: 'Illinois',
        IN: 'Indiana',
        IA: 'Iowa',
        KS: 'Kansas',
        KY: 'Kentucky',
        LA: 'Louisiana',
        ME: 'Maine',
        MD: 'Maryland',
        MA: 'Massachusetts',
        MI: 'Michigan',
        MN: 'Minnesota',
        MS: 'Mississippi',
        MO: 'Missouri',
        MT: 'Montana',
        NE: 'Nebraska',
        NV: 'Nevada',
        NH: 'New Hampshire',
        NJ: 'New Jersey',
        NM: 'New Mexico',
        NY: 'New York',
        NC: 'North Carolina',
        ND: 'North Dakota',
        OH: 'Ohio',
        OK: 'Oklahoma',
        OR: 'Oregon',
        PA: 'Pennsylvania',
        RI: 'Rhode Island',
        SC: 'South Carolina',
        SD: 'South Dakota',
        TN: 'Tennessee',
        TX: 'Texas',
        UT: 'Utah',
        VT: 'Vermont',
        VA: 'Virginia',
        WA: 'Washington',
        WV: 'West Virginia',
        WI: 'Wisconsin',
        WY: 'Wyoming'
    };

    //ok 
    // start plotttig plot 2
    const svgwidth = 750;
    const svgheight = 500;
    const padding = 50;

    let svg = d3.select("#plot2").append("svg")
                    .attr("width", svgwidth)
                    .attr("height", svgheight);

    const max_overall = d3.max(Array.from(dict_overall.values(), d => d));
    const max_2year = d3.max(Array.from(dict_2year.values(), d => d));
    const max_4year = d3.max(Array.from(dict_4year.values(), d => d));
    const max = Math.max(max_overall, max_2year, max_4year);

    const colorScale = d3
        .scaleSequential()
        .domain([0, max*0.7])
        .interpolator(d3.interpolateBlues);

    let projection = d3
        .geoAlbersUsa()
        .scale(750)
        .translate([svgwidth/2, svgheight/2]);

    let geoGenerator = d3.geoPath().projection(projection);

    let countryText = svg.append("text").attr("id", "country-name");
    countryText.style("pointer-events", "none");

    const tooltip = d3.select("#plot2").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position","absolute")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "4px")
        .style("padding", "4px")
        .style("border-color", "#0D62A4")
        .style("color", "#0D62A4");

    let countries; 

    function drawMap(geojson) {

        countries = svg.selectAll(".path").data(geojson.features);
      
        countries
        .enter()
        .append("path")
        .attr("class", "path")
        .attr("d", geoGenerator)
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .attr("fill", d => colorScale(dict_overall.get(stateSym[d.properties.name])))
        .on("mouseover", function (e, d) {
            d3.select(this)
                .style("stroke", "white")
                .style("stroke-width", 7)
            tooltip.style("opacity", 1)})
        .on("mousemove", function (e, d) {
            const state_name = stateSym[d.properties.name];
            const expense_value = dict_overall.get(state_name);
            tooltip.html(`State: ${state_name} <br> Expense: ${expense_value.toFixed(0)}`)
                .style("top",  (e.pageY+10) + "px")
                .style("left", (e.pageX+10) + "px")})
        .on("mouseout", function (e, d) {
            d3.select(this)
            .style("stroke", "white")
            .style("stroke-width", 1)
            tooltip.style("opacity", 0);
    });
        
        countryText.raise();
      }

      d3.json("us-states.json").then(function(json) {
        drawMap(json);
      });

    function update(dict) {
        countries = svg.selectAll(".path");
        countries.attr("fill", d => colorScale(dict.get(stateSym[d.properties.name])))
        .on("mouseover", function (e, d) {
            d3.select(this)
                .style("stroke", "white")
                .style("stroke-width", 7);
            tooltip.style("opacity", 1)})
        .on("mousemove", function (e, d) {
            const state_name = stateSym[d.properties.name];
            const expense_value = dict.get(state_name);
            tooltip
                .html(`State: ${state_name} <br> Expense: ${expense_value.toFixed(0)}`)
                .style("top",  (e.pageY+10) + "px")
                .style("left", (e.pageX+10) + "px")})
        .on("mouseout", function (e, d) {
            d3.select(this)
            .style("stroke", "white")
            .style("stroke-width", 1)
            tooltip.style("opacity",0);
        
        countryText.text("");
        });

    }

    d3.select("#button_overall").on("click", function() {
        update(dict_overall);
    });

    d3.select("#button_2year").on("click", function() {
        update(dict_2year);
    });

    d3.select("#button_4year").on("click", function() {
        update(dict_4year);
    });

    // ok 
    // legend
    
    let legend_x= svgwidth - 100;
    let legend_y= svgheight - 325;

    let legend= svg.append("defs")
        .append("linearGradient")
        .attr("id", "my_gradient")
        .attr("x1", "0%")
        .attr("y1", "100%")
        .attr("x2", "0%")
        .attr("y2", "0%");

    let domain = Array.from({length: 100}, (d, i) => i / 99 * max);
    let stops = domain.map(t => colorScale(t));

    legend.selectAll("stop") 
        .data(stops)                  
        .enter().append("stop")
        .attr("offset", (d,i) => i/(stops.length-1))  
        .attr("stop-color", (d) => d);  

    // add rect
    svg.append('rect')
    .attr('width', 20)
    .attr('height', 180)
    .attr('transform', `translate(${legend_x}, ${legend_y})`)
    .style('fill', 'url(#my_gradient)');

    // add ticks
    let legendScale = d3.scaleLinear()
    .domain([0, max])
    .range([180, 0]);

    let axisRight = d3.axisRight(legendScale).ticks(8);

    svg.append('g')
        .attr('transform', `translate(${legend_x + 20}, ${legend_y})`)
        .call(axisRight);

    // add legend name
    svg.append("text")
        .attr("x", legend_x) 
        .attr("y", legend_y - 10) 
        .attr("font-size", "12px") 
        .text("Expenses ($) "); 

    // title
    svg.append("text")
        .attr("x", svgwidth/3.5) 
        .attr("y", 50) 
        .attr("font-size", "16px") 
        .style("font-weight", "bold")
        .text("Undergraduate Expenses in the US by State"); 

    // okok

}

let plot3=function(data){

    // extract past 3 years
    past3 = data.filter(function(d) {
        return d.Year === 2021 || d.Year === 2020 || d.Year === 2019;});

    //plot # 3 tuition
    tuition=d3.filter(past3, function(d) {
        return d.Expense=="Fees/Tuition"})

    //plot # 3 living expense
    non_tuition=d3.filter(past3, function(d) {
        return d.Expense !=="Fees/Tuition"})
    
    //  avg living expense by state for the past 3 years
    let by_state_3year_ep = d3.flatRollup(non_tuition, 
        v => d3.mean(v, d => d.Value), d => d.State);

    //  avg tuition expense by state by type for the past 3 years 
    let by_state_3year_tu = d3.flatRollup(tuition, 
        v => d3.mean(v, d => d.Value), d => d.State, d=> d.Type);

    // combine to get avg expense by state by type for the past 3 years
    p3_data = by_state_3year_tu.map(item => {
        const same_state = by_state_3year_ep.find(data => data[0] === item[0]);
        if (same_state) { return {state: item[0], type: item[1], value: item[2] + same_state[1]}}});
    //console.log(p3_data);

    // create droop downs 
    let states = [...new Set(p3_data.map(item => item.state))];

    let dropdown1 = d3.select("#dropdown1");
    let dropdown2 = d3.select("#dropdown2");

    // add attr value let me acess in the later parts
    states.forEach(state => {
        dropdown1.append("option").text(state).attr("value", state);
        dropdown2.append("option").text(state).attr("value", state);
    });

    // create 2 svgs for the 2 drop downs
    const svgheight = 400;

    let svg1 = d3.select("#plot3_1").append("svg")
        .attr("height", svgheight);

    let svg2 = d3.select("#plot3_2").append("svg")
        .attr("height", svgheight);

    // create a scale for the size of nodes
    let sizeScale = d3.scaleLinear()
        .domain(d3.extent(p3_data, d => d.value))
        .range([10, 60]);

    // tool tip 1 and 2 
    const tooltip1 = d3.select("#plot3_1").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position","absolute")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "4px")
        .style("padding", "4px")
        .style("border-color", "#0D62A4")
        .style("color", "#0D62A4");

        const tooltip2 = d3.select("#plot3_2").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position","absolute")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "4px")
        .style("padding", "4px")
        .style("border-color", "#0D62A4")
        .style("color", "#0D62A4");

    // ok
    // wirte a function to draw the node link stuff 
    function plot_by_state(this_state,svg,tooltip) {
        let this_plot = p3_data.filter(d => d.state === this_state);
        let nodes = Array.from(new Set(this_plot.flatMap(d => [d.state, d.type]))).map(id => ({id}));
        let links = this_plot.map(d => ({ 
            source: nodes.find(node => node.id === d.type),
            target: nodes.find(node => node.id === d.state)}));

        let link = svg.selectAll("line")
            .data(links)
            .enter()
            .append("line")
            .style("stroke", "lightblue")
            .style("stroke-width", 5);

        let node = svg.append("g")
            .attr("class", "node")
            .selectAll("circle")
            .data(nodes)
            .enter()
            .append("circle")
            .attr("fill", d => d.id === this_state ? "lightblue" : "#5499CD")
            .attr("r", d => {
                const matched_node = this_plot.find(p => p.type === d.id);
                return matched_node ? sizeScale(matched_node.value) : 20 })
            .on("mouseover", function (e, d) {
                d3.select(this)
                    .style("stroke", "#156CAF")
                    .style("stroke-width", 7);
                tooltip.style("opacity", 1)})
            .on("mousemove", function (e, d) {
                const matched_node = this_plot.find(p => p.type === d.id);
                const val = matched_node ? `Expense: ${matched_node.value.toFixed(0)}`: `State: ${this_state}`;
                tooltip
                    .html(`${val}`)
                    .style("top",  (e.pageY+10) + "px")
                    .style("left", (e.pageX+10) + "px")})
            .on("mouseout", function (e, d) {
                d3.select(this)
                .style("stroke", "none")
                tooltip.style("opacity",0)});
        
        let label = svg.append("g")
            .attr("class", "labels")
            .selectAll("text")
            .data(nodes)
            .join("text")
            .attr("class", "label")
            .text(d => d.id)
            .attr("font-size", "15px");

        let simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).distance(100))
            .force("charge", d3.forceManyBody().strength(-200))
            .force("center", d3.forceCenter(svgheight/3, svgheight/2.5));

        simulation.on("tick", function() {

        node.attr("cx", function(d) { return d.x})
            .attr("cy", function(d) { return d.y});
    
        link.attr("x1", function(d) { return d.source.x})
            .attr("y1", function(d) { return d.source.y})
            .attr("x2", function(d) { return d.target.x})
            .attr("y2", function(d) { return d.target.y});
    
        label.attr("x", function(d) { return d.x})
             .attr("y", function(d) { return d.y});
            
        });
    }

    // okok

    // call this so that when the website is first opened it shows cali and NY
    plot_by_state(states[4],svg1,tooltip1)
    plot_by_state(states[32],svg2,tooltip2)
    dropdown1.property("value", "California");
    dropdown2.property("value", "New York");

    // initial plot title 
    let title_state1 = dropdown1.property("value");
    let title_state2 = dropdown2.property("value"); 

    const title_svgwidth = 550;
    const title_svgheight = 80;

    let svg_title = d3.select("#plot3_title").append("svg")
                    .attr("width", title_svgwidth)
                    .attr("height", title_svgheight);

    //ok 
    let update_title=svg_title.append("g")

    update_title.append("text")
        .attr("x", title_svgwidth/5) 
        .attr("y", 60) 
        .attr("font-size", "18px") 
        .style("font-weight", "bold")
        .text(`${title_state1} vs ${title_state2}`); 

    // add dropdown.ons 
    dropdown1.on("change", function() {
        title_state1 = d3.select(this).property("value");
        svg1.selectAll("line").remove();
        svg1.selectAll("circle").remove();
        svg1.selectAll(".labels").remove();
        let select = this.value; 
        update_title.select("text").text(`${title_state1} vs ${title_state2}`); 
        plot_by_state(select, svg1,tooltip1);
      });
      
    dropdown2.on("change", function() {
        title_state2 = d3.select(this).property("value");
        svg2.selectAll("line").remove();
        svg2.selectAll("circle").remove();
        svg2.selectAll(".labels").remove();
        let select = this.value;
        update_title.select("text").text(`${title_state1} vs ${title_state2}`); 
        plot_by_state(select, svg2,tooltip2); 
    });
    // okok!!!
}
