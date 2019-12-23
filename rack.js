var weights = [100, 55, 45, 35, 25, 15, 10, 5, 2.5, 1.25, 1, .75, .5, .25];
var metricWeights = [50, 25, 20, 15, 10, 5, 2.5, 1.25, 1, .75, .50, .25];
var weightType;
var defaultUnchecked = [100, 55, 1.25];
var metricDefaultUnchecked = [50, 25];

// returns array of weights
function howToRack(weight, barWeight, weights) {
    var toRack = [];
    var left = weight - barWeight;
    var time = 0;
    while (left > 0) {
        // find largest possible weight to add
        var found = false;
        for (var i = 0; i < weights.length; i++) {
            var amt = weights[i] * 2;
            if (amt <= left) {
                left -= amt;
                toRack[time] = weights[i];
                time++;
                found = true;
                break;
            }
        }
        if (!found) {
            toRack = []
            break;
        }
    }
    return toRack;
}

function outputResultTable() {
    var form = document.forms[0];
    var res = howToRack(
        Number(form.weight.value),
        Number(form.barweight.value));
    var out = document.getElementById('result');
    var outStr = '<table><tr><th>Weights Required</th></tr>';
    for (var i = 0; i < res.length; i++) {
        outStr += '<tr><td>' + res[i] + '</td></tr>';
    }
    outStr += '</table>';
    out.innerHTML = outStr;
}

function outputResultList() {
    var form = document.forms[0];
    var res = howToRack(
        Number(form.weight.value),
        Number(form.barweight.value),
        convertFormChecks(form.weightsInc));
    var out = document.getElementById('result');
    var outStr = '<dl><dt>Weights Required</dt></dl><ul>';
    for (i = 0; i < res.length; i++) {
        outStr += '<li>' + res[i] + '</li>';
    }
    outStr += '</ul>';
    out.innerHTML = outStr;
}


function outputResultPre() {
    var form = document.forms[0];
    var res = howToRack(
        Number(form.weight.value),
        Number(form.barweight.value),
        convertFormChecks(form.weightsInc));
    res = res.reverse();
    var out = document.getElementById('result');
    var outStr = '<h3>Weights Required</h3><pre>';

    var outA = []
    for (i = 0; i < res.length; i++) {
        outA[i] = txtWeight(res[i]);
    }

    var arrMax = 0;
    for (var i = 0; i < outA.length; i++) {
        if (outA[i].length > arrMax) {
            arrMax = outA[i].length;
        }
    }

    for (var i = 0; i < outA.length; i++) {
        var space = repeat(' ', (arrMax - outA[i].length) / 2);
        outStr += space + outA[i] + '\n';
    }
    outStr += '</pre>';
    out.innerHTML = outStr;
}

function outputResultSVG() {
    var form = document.forms[0];
    var res = howToRack(
        Number(form.weight.value),
        Number(form.barweight.value),
        convertFormChecks(form.weightsInc));
    res = res.reverse();
    var justBar = false;

    if (Number(form.weight.value) === Number(form.barweight.value)) {
        justBar = true;
    }

    d3.select("#svgresult").remove();

    var svg = d3.select("#result")
        .append("svg")
        .attr("id", "svgresult")
        .attr("width", 200)
        .attr("height", 650);

    if (!justBar && res.length === 0) {
        /* Not Rackable */
        svg.append("text")
            .attr("x", 10)
            .attr("y", 200)
            .text("You may need to find a lighter");

    } else {
        console.log(res);

        var barTop = 50;
        var barLeft = 0; //New
        var barRight = 100; //New
        var barBottom = 650;
        var barWidth = 10;
        var barHorizCenter = 100 + barWidth / 2;

        svg.append("rect")
        .attr("id", "thebar")
        .attr("width", barRight) // barWidth
        .attr("height", barWidth) //  barBottom - barTop
        .attr("x", barLeft) //barHorizCenter - barWidth / 2
        .attr("y", barTop);

        /*
        svg.append("rect")
            .attr("id", "thebar")
            .attr("width", barWidth)
            .attr("height", barBottom - barTop)
            .attr("x", barHorizCenter - barWidth / 2)
            .attr("y", barTop);
*/
        var scaleWidth = d3.scaleLinear().domain([.25, 5]).range([50, 300]);
        var plateHeight = 1;
        var plateWidth = 20;

        function drawPlate(svg, y, weight) {
            var plateHeight = scaleWidth(weight)
            var fillColor = getPlateInfo(weight);
            

            svg.append("rect")
                .attr("class", "plate")
                .attr("width", plateWidth)
                .attr("height", plateHeight)
                .attr("fill", fillColor[0])
                .attr("stroke", fillColor[1])
                .attr("stroke-width", 1)
                .attr("y", barHorizCenter - (plateWidth / 2))
                .attr("X", y);
        }

        function drawPlateLabel(svg, x, y, label) {
            var fillColor = getPlateInfo(weight);
            svg.append("text")
                .attr("class", fillColor[2])
                .attr("x", x)
                .attr("y", y)
                .text(label);
        }

        function getPlateInfo(weight){
            console.log(weightType);
            var strokeColor ;
            var plateClass = "plateLabel";

            if(weight == 45 || weight == 20){
                fillColor = "Blue"
            } else if (weight == 35 || weight == 15){
                fillColor = "Yellow"
                plateClass = "plateLabelDark"
            } else if (weight == 55 || (weightType == 'M' && weight == 25)){
                fillColor = "Red"
            } else if (weight == 25 || (weightType == 'M' && weight == 10)){
                fillColor = "green"
            }  else if ( (weightType == 'I' && weight == 10) || (weightType == 'M' && weight == 5)){
                fillColor = "white"
                strokeColor = "black"
                plateClass = "plateLabelDark"
            }  else if ((weightType == 'I' && weight == 5) || weight == 2.5){
                fillColor = "black"
            } else {
                fillColor = "silver"
                plateClass = "plateLabelDark"
            }

            return [fillColor,strokeColor,plateClass];
        
        }

        var numPlates = res.length;
        for (var plate = 0; plate < numPlates; plate++) {
            var weight = res[plate];
            drawPlate(svg, 5 + barLeft + plate * 25, weight);
            drawPlateLabel(svg, barHorizCenter, 5 + barLeft + plate * 25 + plateHeight - 2, weight);

            drawPlate(svg, barRight - (1 + plate) * 25, weight);
            drawPlateLabel(svg, barHorizCenter, barRight - (1 + plate) * 25 + plateHeight - 2, weight);

        }
    }
}


function repeat(str, num) {
    var out = '';
    for (var i = 0; i < num; i++) {
        out += str;
    }
    return out;
}

function txtWeight(weight) {
    var size = Math.min(weight / 3, 50 / 3) - (String(weight).length + 1 / 2);
    var out = '';
    for (var c = 0; c < size; c++) {
        out += ' ';
    }
    return '[' + out + weight + out + ']';
}

function convertFormChecks(frm) {
    var a = [];
    var ai = 0;
    for (i = 0; i < frm.length; i++) {
        if (frm[i].checked) {
            a[ai] = Number(frm[i].value);
            ai++;
        }
    }
    return a;
}

function matchValue(matchMe, textElem) {
    document.getElementById(textElem).value = matchMe.value;
}

function loadValues(weights, defaultUnchecked, defaultBarWeight, defaultWeight) {
    var checksDiv = document.getElementById('weightChecks');
    var checkTemplate = '<div class="small-4 cell"><input type="checkbox" name="weightsInc" value="{0}" {1}><label>{0}</label></div>';
    var outStr = '<div class="grid-x grid-margin-x">';

    for (i = 0; i < weights.length; i++) {

        if (window.localStorage.getItem('checked_' + weights[i]) === "true") {
            checked = true;
        } else if (window.localStorage.getItem('checked_' + weights[i]) == null) {
            // use defaults
            checked = true;
            for (j = 0; j < defaultUnchecked.length; j++) {
                if (weights[i] == defaultUnchecked[j]) {
                    checked = false;
                }
            }
        } else {
            checked = false;
        }

        outStr += checkTemplate.replace(/\{0\}/g, weights[i]).replace(/\{1\}/g, checked ? 'checked' : '');
    }
    outStr += '</div>';
    checksDiv.innerHTML = outStr;

    // load saved weight values
    var form = document.forms[0];
    var barWeight = Number(window.localStorage.getItem('barWeight'));
    form.barweight.value = barWeight === 0 ? defaultBarWeight : barWeight;
    var weight = Number(window.localStorage.getItem('weight'));
    form.weight.value = weight === 0 ? defaultWeight : weight;
}

function saveValues() {
    var form = document.forms[0];
    var weightChecks = form.weightsInc;
    for (i = 0; i < weightChecks.length; i++) {
        window.localStorage.setItem('checked_' + weightChecks[i].value, weightChecks[i].checked);
    }

    window.localStorage.setItem('barWeight', form.barweight.value);
    window.localStorage.setItem('weight', form.weight.value);
}



window.onload = function () {
    if (document.URL.endsWith("metric.html")) {
        loadValues(metricWeights, metricDefaultUnchecked, 20, 60);
       var weightType = 'M'
        
    } else {
        loadValues(weights, defaultUnchecked, 45, 135);
       weightType = 'I';
        
    }

   
};

if (document.URL.endsWith("metric.html")) {
   
   var weightType = 'M'
    
} else {
    
   weightType = 'I';
    
}



